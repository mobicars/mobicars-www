import { normalizeTaxId } from "./tax-id";

/**
 * "Pobierz dane" next to a NIP: the company name and address from the
 * Ministry of Finance VAT register ("Biała lista", wl-api.mf.gov.pl).
 *
 * - Called from the browser: no key, open CORS, and the daily limit (about
 *   100 searches) counts per client IP, so there is no proxy (user's decision).
 * - Only after a click, one request per NIP (kept in memory for the page's
 *   life), 5 s timeout. Any failure leaves the form to manual typing.
 * - The NIP is never logged or sent to analytics.
 */

const API = "https://wl-api.mf.gov.pl/api/search/nip";
const TIMEOUT_MS = 5000;

export type RegistryAddress = { street: string; postalCode: string; city: string };

export type RegistryCompany = RegistryAddress & { name: string };

export type RegistryResult =
  | { status: "found"; company: RegistryCompany }
  /** Valid NIP, but not in the register (or no address to use). */
  | { status: "notFound" }
  /** The register rejected the number (WL-115 and similar). */
  | { status: "invalid" }
  /** Too many searches from this IP today. */
  | { status: "limit" }
  /** Network error, timeout or an unexpected answer. */
  | { status: "error" };

/** Street prefixes and the like, as the register writes them in capitals. */
const ABBREVIATIONS: Record<string, string> = {
  "UL.": "ul.",
  "AL.": "al.",
  "PL.": "pl.",
  "OS.": "os.",
  "LOK.": "lok.",
  "M.": "m.",
  "BUD.": "bud.",
  "SKR.": "skr.",
  "POCZT.": "poczt.",
};
/** Lower-case inside a name ("Nowe Miasto nad Pilicą", "Kazimierz Dolny"); never as the first word. */
const SMALL_WORDS = new Set(["I", "W", "Z", "NA", "NAD", "POD", "PRZY", "DO", "KOŁO", "K."]);
/** II, III, IV… as in "Jana Pawła II". A single "I" is the conjunction above. */
const ROMAN = /^(?=[IVXLCDM]{2,}$)M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

function capitalize(part: string): string {
  const lower = part.toLocaleLowerCase("pl");
  const first = lower.search(/\p{L}/u);
  return first === -1 ? lower : lower.slice(0, first) + lower[first].toLocaleUpperCase("pl") + lower.slice(first + 1);
}

/**
 * "UL. JANA PAWŁA II 10A LOK. 5" → "ul. Jana Pawła II 10A lok. 5". Only for
 * text the register gives in capitals; anything with lower-case letters is
 * left as it is. Company names are never passed here.
 */
export function tidyCapitals(text: string): string {
  if (text !== text.toLocaleUpperCase("pl")) return text;
  return text
    .split(/(\s+)/)
    .map((word, index) => {
      if (/^\s+$/.test(word) || word === "") return word;
      if (ABBREVIATIONS[word]) return ABBREVIATIONS[word];
      if (/\d/.test(word) || ROMAN.test(word)) return word;
      if (index > 0 && SMALL_WORDS.has(word)) return word.toLocaleLowerCase("pl");
      return word.split("-").map(capitalize).join("-");
    })
    .join("");
}

/**
 * "CHEMIKÓW 7, 09-411 PŁOCK" → street, postal code, city. A village address
 * without a street ("RUDNA MAŁA 47, 36-060 GŁOGÓW MAŁOPOLSKI") keeps the
 * village and number as the street line, as the register writes it.
 */
export function parseRegistryAddress(raw: string | null | undefined): RegistryAddress | null {
  const text = raw?.replace(/\s+/g, " ").trim();
  if (!text) return null;
  const full = /^(.*?),\s*(\d{2}-\d{3})\s+(.+)$/.exec(text);
  if (full) return { street: tidyCapitals(full[1].trim()), postalCode: full[2], city: tidyCapitals(full[3].trim()) };
  const noStreet = /^(\d{2}-\d{3})\s+(.+)$/.exec(text);
  if (noStreet) return { street: "", postalCode: noStreet[1], city: tidyCapitals(noStreet[2].trim()) };
  return { street: tidyCapitals(text), postalCode: "", city: "" };
}

type RegistryBody = {
  code?: string;
  result?: { subject?: { name?: string | null; workingAddress?: string | null; residenceAddress?: string | null } | null };
};

/** Maps the HTTP status and JSON body to a result. Pure, for the tests. */
export function readRegistryResponse(httpStatus: number, body: unknown): RegistryResult {
  const data = (body && typeof body === "object" ? body : {}) as RegistryBody;
  if (httpStatus === 429) return { status: "limit" };
  if (httpStatus === 400) return data.code === "WL-115" || data.code === "WL-113" || data.code === "WL-112" ? { status: "invalid" } : { status: "error" };
  if (httpStatus !== 200 || !data.result) return { status: "error" };
  const subject = data.result.subject;
  const name = subject?.name?.trim();
  if (!subject || !name) return { status: "notFound" };
  const address = parseRegistryAddress(subject.workingAddress ?? subject.residenceAddress) ?? { street: "", postalCode: "", city: "" };
  return { status: "found", company: { name, ...address } };
}

/** Today in Poland as YYYY-MM-DD: the register is searched "as of" a date. */
function warsawDate(now: Date): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Warsaw" }).format(now);
}

const cache = new Map<string, Promise<RegistryResult>>();

/** One request per NIP; failures are not kept, so a later click tries again. */
export function lookupTaxId(raw: string, fetchImpl: typeof fetch = fetch, now = new Date()): Promise<RegistryResult> {
  const nip = normalizeTaxId(raw);
  const cached = cache.get(nip);
  if (cached) return cached;
  const request = (async (): Promise<RegistryResult> => {
    try {
      const response = await fetchImpl(`${API}/${nip}?date=${warsawDate(now)}`, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const body: unknown = await response.json().catch(() => null);
      return readRegistryResponse(response.status, body);
    } catch {
      return { status: "error" };
    }
  })();
  cache.set(nip, request);
  void request.then((result) => {
    if (result.status !== "found" && result.status !== "notFound") cache.delete(nip);
  });
  return request;
}
