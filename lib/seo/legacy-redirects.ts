import { accountHref, fleetHref, reservationHref } from "@/i18n/routes";

/**
 * Permanent redirects from URLs of the old site (`mobicars-pl`, production
 * until the domain switch) that the new site serves under another URL.
 * The full map with the reasons is `redesign/redirects-map.md`.
 *
 * Only URLs whose address changes are here. Old URLs the new site answers at
 * the same address are not: CMS pages (`/pl/kontakt`), the fleet
 * (`/pl/flota/...`, old dotted slugs are redirected by the car page itself),
 * and the blog, cities and local pages, which need their own routes (WP6).
 *
 * Pure and framework-free: `legacyRedirect(pathname, search)` answers the
 * target or `null`. Not wired in yet; see "Wiring" in `redesign/redirects-map.md`.
 */

export const LEGACY_REDIRECT_STATUS = 308;

export type LegacyRedirect = {
  /** Site path with the request's query string kept, e.g. `/pl/flota/toyota-yaris-1219?utm_source=x`. */
  destination: string;
  status: typeof LEGACY_REDIRECT_STATUS;
  /** Which rule matched, for logs and tests. */
  rule: string;
};

type Rule = {
  id: string;
  /** Tested against the normalized path: decoded, lower case, no trailing slash. */
  pattern: RegExp;
  to: (match: RegExpExecArray) => string;
};

/**
 * Exact old paths, normalized like the request (lower case, decoded). Most
 * are the old site's own `redirects()` (`mobicars-pl/next.config.mjs`), with
 * each target resolved to its new URL so no request takes two hops.
 */
const EXACT: Readonly<Record<string, string>> = {
  // Old aliases of the reservation pages and the fleet.
  "/pl/reservation-1": reservationHref("pl"),
  "/pl/reservation-2": reservationHref("pl"),
  "/en/reservation-1": reservationHref("en"),
  "/en/reservation-2": reservationHref("en"),
  "/en/cars": fleetHref("en"),
  // The old site sent this one to an add-on page; add-ons have no pages here.
  "/en/fleet/i-park-my-own-car-2757": "/en/addons-and-accessories",

  // Documents and price list.
  "/pl/regulations": "/pl/dokumenty",
  "/standardowe-warunki-umowy.pdf": "/pl/dokumenty",
  "/cennik": "/pl/wynajem-na-dni",
  "/pl/cennik": "/pl/wynajem-na-dni",

  // The customer panel moved from panel.mobicars.pl into the site.
  "/panel_klienta": accountHref("pl"),

  // Car sales: the old site rewrote these spellings to the same page.
  "/samochody-na-sprzedaż": "/pl/sprzedaz-samochodow",
  "/pl/samochody-na-sprzedaż": "/pl/sprzedaz-samochodow",
  "/pl/samochody-na-sprzedaz": "/pl/sprzedaz-samochodow",

  // Cities: typos and older slugs.
  "/pl/wypozyczalnia-samochodow-lotnisko-warszawa": "/pl/wypozyczalnia-samochodow-warszawa-lotnisko-chopina",
  "/pl/wypozyczalnia-samochodow-waroclaw": "/pl/wypozyczalnia-samochodow-wroclaw",
  "/wypozyczalnia-samochodow-wroclaw/cennik": "/pl/wypozyczalnia-samochodow-wroclaw",
  "/wypozyczalnia-samochodow-gdansk/cennik": "/pl/wypozyczalnia-samochodow-gdansk",
  "/wypozyczalnia-samochodow-torun/cennik": "/pl/wypozyczalnia-samochodow-torun",
  "/wypozyczalnia-samochodow-poznan-lawica": "/pl/wypozyczalnia-samochodow-poznan-lotnisko-lawica",
  "/wypozyczalnia-samochodow-lotnisko-modlin": "/pl/wypozyczalnia-samochodow-warszawa-lotnisko-modlin",
  "/car-rental-wroclaw-airport": "/en/car-rental-wroclaw-copernicus-airport",

  // Blog: renamed posts and a post once served outside `/blog`.
  "/pl/blog/czy-wynajem-samochodow-na-lotnisku-sie-oplaca": "/pl/blog/czy-warto-wypozyczyc-samochod-na-lotnisku",
  "/pl/blog/czy-warto-wypozyczyc-samochod-na-lotniskua": "/pl/blog/czy-warto-wypozyczyc-samochod-na-lotnisku",
  "/pl/wynajem-dlugoterminowy-dla-firm-czy-to-sie-oplaca": "/pl/blog/wynajem-dlugoterminowy-dla-firm-czy-to-sie-oplaca",
  "/blog/szukaj/tagi/abs": "/pl/blog/abs-co-to-takiego",
  "/blog/szukaj/tagi/samochód elektryczny": "/pl/wynajem-samochodow-elektrycznych",

  // An add-on id the old site renumbered; add-ons have no pages here.
  "/dodatek/dodatkowy-kierowca-1262": "/pl/dodatki-i-akcesoria",
  "/pl/dodatek/dodatkowy-kierowca-1262": "/pl/dodatki-i-akcesoria",

  // Archicom hub pages: the old sitemap listed them without their parent page
  // (404 on the old site too); the CMS serves them under it.
  "/pl/modern-mokotow": "/pl/hub-mobilnosci-archicom/modern-mokotow",
  "/pl/modern-mokotow-rezerwacja": "/pl/hub-mobilnosci-archicom/modern-mokotow-rezerwacja",
  "/pl/wieza-jezyce-poznan": "/pl/hub-mobilnosci-archicom/wieza-jezyce-poznan",

  // Folders of the old app that answered under their English name too.
  "/pl/addons-and-accessories": "/pl/dodatki-i-akcesoria",
  "/pl/cargo": "/pl/wynajem-samochodow-dostawczych",
  "/pl/ev": "/pl/wynajem-samochodow-elektrycznych",
  "/en/cargo": "/en/van-vehicles-rental",
  "/en/ev": "/en/electric-vehicles-rental",
};

/** Blog posts the old site also served at the root, `/x` and `/pl/x` → `/pl/blog/x`. */
const ROOT_BLOG_POSTS = [
  "abs-co-to-takiego",
  "jakie-sa-klasy-samochodow-i-jak-je-sprawdzic",
  "jak-dziala-wypozyczalnia-samochodow",
  "wynajem-samochodow-o-tym-musisz-pamietac",
  "jakie-sa-warunki-wynajmu-samochodu-kto-moze-wynajac-auto",
  "wynajem-samochodu-na-wyjazd-sluzbowy",
  "wynajem-busa-na-wakacje-czy-to-dobry-pomysl",
  "typy-samochodow-hybrydowych",
];

const RULES: readonly Rule[] = [
  {
    id: "root-blog-post",
    pattern: new RegExp(`^(?:/pl)?/(${ROOT_BLOG_POSTS.join("|")})$`),
    to: (match) => `/pl/blog/${match[1]}`,
  },
  {
    // Old blog tag search, removed long ago.
    id: "blog-tags",
    pattern: /^(?:\/pl)?\/blog\/szukaj\/tagi(?:\/.*)?$/,
    to: () => "/pl/blog",
  },
  {
    // City pages once reachable under a wrong folder.
    id: "city-wrong-folder",
    pattern: /^\/pl\/(?:addon|auto|dodatek)\/(wypozyczalnia-samochodow-[a-z0-9-]+)$/,
    to: (match) => `/pl/${match[1]}`,
  },
  {
    // Long-term car pages (`rent-for-months/[slug]` in the old app) → the car page.
    id: "long-term-car",
    pattern: /^\/(pl|en)\/(?:wynajem-na-miesiace|rent-for-months)\/([^/]*\d)$/,
    to: (match) => carTarget(match[1] as "pl" | "en", match[2]),
  },
  {
    // Add-on pages: the new site lists add-ons in the booking, not on pages.
    id: "addon-page",
    pattern: /^\/pl\/(?:dodatki-i-akcesoria|addons-and-accessories)\/[^/]+$/,
    to: () => "/pl/dodatki-i-akcesoria",
  },
  {
    id: "addon-page",
    pattern: /^\/en\/addons-and-accessories\/[^/]+$/,
    to: () => "/en/addons-and-accessories",
  },
  {
    // Promo links (`/pl/kod-promocyjny/LATO`) open the booking with the code.
    id: "promo-code",
    pattern: /^\/(pl|en)\/(?:kod-promocyjny|promo-code)\/([^/]+)$/,
    to: (match) => reservationHref(match[1] as "pl" | "en", "short", new URLSearchParams({ promo: promoCode(match[2]) })),
  },
  // One document (`/pl/dokumenty/{slug}`) has its own route: `app/[lang]/dokumenty/[slug]` redirects to the file.
  {
    // One car for sale → the sales page.
    id: "sale",
    pattern: /^\/pl\/(?:sprzedaz-samochodow|sale)\/[^/]+$/,
    to: () => "/pl/sprzedaz-samochodow",
  },
  {
    // The old app folder name of local pages; the page keeps its slug.
    id: "local-folder",
    pattern: /^\/pl\/local-car-rental\/([^/]+)$/,
    to: (match) => `/pl/lokalna-wypozyczalnia-samochodow/${match[1]}`,
  },
];

/**
 * The redirect for an old URL, or `null` when the path is not a legacy one.
 * `pathname` is the raw request path (percent-encoded or not); `search` is the
 * query string with or without `?`, kept on the target.
 */
export function legacyRedirect(pathname: string, search = ""): LegacyRedirect | null {
  const path = normalize(pathname);
  if (path === null) {
    return null;
  }
  const exact = EXACT[path];
  if (exact) {
    return { destination: withQuery(exact, search), status: LEGACY_REDIRECT_STATUS, rule: "exact" };
  }
  for (const rule of RULES) {
    const match = rule.pattern.exec(path);
    if (!match) {
      continue;
    }
    const target = rule.to(match);
    if (!target || target === path) {
      continue;
    }
    return { destination: withQuery(target, search), status: LEGACY_REDIRECT_STATUS, rule: rule.id };
  }
  return null;
}

/** Every exact old path, for the map and the tests. */
export function legacyExactPaths(): string[] {
  return Object.keys(EXACT);
}

/** Decoded, lower case, without a trailing slash. `null` for a path that does not decode. */
function normalize(pathname: string): string | null {
  let path: string;
  try {
    path = decodeURIComponent(pathname.replace(/\+/g, "%2B"));
  } catch {
    return null;
  }
  path = path.toLowerCase();
  if (path.length > 1) {
    path = path.replace(/\/+$/, "");
  }
  return path.startsWith("/") ? path : null;
}

/**
 * The car page for an old slug. The old slugs kept dots and brackets
 * (`nissan-x-trail-7-os.-4431`); the new ones (`lib/fleet/slug.ts`) do not,
 * and the car page redirects any other name to the current one by the id.
 * Cleaning the slug here saves that second hop for the common case.
 */
function carTarget(lang: "pl" | "en", slug: string): string {
  const clean = slug
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return fleetHref(lang, clean);
}

/** Sent to RentCarSoft in lower case, like the old site did (`slugify(code, { lower: true })`). */
function promoCode(raw: string): string {
  return raw.replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}

function withQuery(target: string, search: string): string {
  const query = search.startsWith("?") ? search.slice(1) : search;
  if (!query) {
    return target;
  }
  return `${target}${target.includes("?") ? "&" : "?"}${query}`;
}
