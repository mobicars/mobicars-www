import { langFromPath, type Lang } from "./config";

/**
 * Public URL segments of the customer panel, in each language. Ukrainian is
 * transliterated to Latin letters, so every URL stays ASCII.
 * The app folders use the English segment (`app/[lang]/account/...`);
 * `proxy.ts` rewrites the localized URL to that folder and redirects any mix.
 */
const ACCOUNT_ROOT: Record<Lang, string> = { pl: "konto", en: "account", de: "konto", uk: "kabinet" };
const INTERNAL_ROOT = "account";

const ACCOUNT_PAGES = {
  login: { pl: "logowanie", en: "login", de: "anmelden", uk: "vkhid" },
  register: { pl: "rejestracja", en: "register", de: "registrieren", uk: "reyestratsiya" },
  forgotPassword: { pl: "odzyskaj-haslo", en: "forgot-password", de: "passwort-vergessen", uk: "vidnovyty-parol" },
  /** Route Handler that ends a session the panel can no longer serve. */
  session: { pl: "sesja", en: "session", de: "sitzung", uk: "sesiya" },
  reservations: { pl: "rezerwacje", en: "reservations", de: "buchungen", uk: "bronyuvannya" },
  payments: { pl: "platnosci", en: "payments", de: "zahlungen", uk: "platezhi" },
  details: { pl: "dane", en: "details", de: "daten", uk: "dani" },
  drivers: { pl: "kierowcy", en: "drivers", de: "fahrer", uk: "vodii" },
  security: { pl: "bezpieczenstwo", en: "security", de: "sicherheit", uk: "bezpeka" },
  contact: { pl: "kontakt", en: "contact", de: "kontakt", uk: "kontakty" },
} as const satisfies Record<string, Record<Lang, string>>;

export type AccountPage = keyof typeof ACCOUNT_PAGES;

/** Pages for signed-out visitors. A signed-in client is sent to the panel. */
const GUEST_PAGES: readonly AccountPage[] = ["login", "register", "forgotPassword"];

/** Pages that do not need a session. */
const PUBLIC_PAGES: readonly AccountPage[] = [...GUEST_PAGES, "session"];

/** Public URL of a panel page, e.g. `accountHref("pl", "reservations", "12")`. */
export function accountHref(
  lang: Lang,
  page?: AccountPage,
  ...rest: (string | number)[]
): string {
  const parts = [lang, ACCOUNT_ROOT[lang]];
  if (page) {
    parts.push(ACCOUNT_PAGES[page][lang]);
  }
  parts.push(...rest.map((part) => encodeURIComponent(String(part))));
  return `/${parts.join("/")}`;
}

export type AccountRoute = {
  /** The public URL this path should have. Redirect when it differs. */
  canonical: string;
  /** The app route that renders it. Rewrite when it differs. */
  internal: string;
  /** `null` for the overview at the panel root, or an unknown segment. */
  page: AccountPage | null;
  isPublic: boolean;
  /** Sign-in pages: a signed-in client is redirected to the panel. */
  isGuestOnly: boolean;
};

/**
 * Resolves a path inside the panel for one language.
 * Accepts the localized and the internal (English) spelling of each segment,
 * so `/pl/account/reservations` resolves with canonical `/pl/konto/rezerwacje`.
 * Returns `null` for paths outside the panel.
 */
export function resolveAccountPath(
  lang: Lang,
  pathname: string,
): AccountRoute | null {
  const [, pathLang, root, segment, ...rest] = pathname.split("/");
  if (pathLang !== lang) {
    return null;
  }
  if (root !== ACCOUNT_ROOT[lang] && root !== INTERNAL_ROOT) {
    return null;
  }

  if (segment === undefined || segment === "") {
    return {
      canonical: accountHref(lang),
      internal: `/${lang}/${INTERNAL_ROOT}`,
      page: null,
      isPublic: false,
      isGuestOnly: false,
    };
  }

  const page = (Object.keys(ACCOUNT_PAGES) as AccountPage[]).find(
    (key) => ACCOUNT_PAGES[key][lang] === segment || ACCOUNT_PAGES[key].en === segment,
  );
  const tail = rest.length > 0 ? `/${rest.join("/")}` : "";

  if (!page) {
    // Unknown segment: let the app answer 404 under the internal path.
    return {
      canonical: `/${lang}/${ACCOUNT_ROOT[lang]}/${segment}${tail}`,
      internal: `/${lang}/${INTERNAL_ROOT}/${segment}${tail}`,
      page: null,
      isPublic: false,
      isGuestOnly: false,
    };
  }

  return {
    canonical: `${accountHref(lang, page)}${tail}`,
    internal: `/${lang}/${INTERNAL_ROOT}/${ACCOUNT_PAGES[page].en}${tail}`,
    page,
    isPublic: PUBLIC_PAGES.includes(page),
    isGuestOnly: GUEST_PAGES.includes(page),
  };
}

/**
 * Public URLs of the reservation flow, one page per rental term, like the old site:
 * `/pl/rezerwacja` (daily) and `/pl/rezerwacja/dlugoterminowa` (monthly).
 * The app folders are `app/[lang]/reservation` and `app/[lang]/reservation/long-term`;
 * `proxy.ts` rewrites the localized URLs to them and redirects any mix.
 */
const RESERVATION_ROOT: Record<Lang, string> = { pl: "rezerwacja", en: "reservation", de: "buchung", uk: "bronyuvannya" };
const RESERVATION_INTERNAL = "reservation";

type ReservationTerm = "short" | "long";

/** Segment after the root. The daily page sits at the root itself. */
const RESERVATION_PAGES: Record<ReservationTerm, Record<Lang, string> | null> = {
  short: null,
  long: { pl: "dlugoterminowa", en: "long-term", de: "langzeit", uk: "dovhostrokova" },
};

/** The thank-you page after a placed reservation. Not a search page: `term` is null. */
const RESERVATION_DONE: Record<Lang, string> = { pl: "potwierdzenie", en: "confirmation", de: "bestaetigung", uk: "pidtverdzhennya" };

export function reservationDoneHref(lang: Lang): string {
  return `/${lang}/${RESERVATION_ROOT[lang]}/${RESERVATION_DONE[lang]}`;
}

/** Public URL of a reservation page, e.g. `reservationHref("pl", "long", searchToQuery(search))`. */
export function reservationHref(
  lang: Lang,
  term: ReservationTerm = "short",
  query?: URLSearchParams | string,
): string {
  const page = RESERVATION_PAGES[term];
  const path = `/${lang}/${RESERVATION_ROOT[lang]}${page ? `/${page[lang]}` : ""}`;
  const search = query ? String(query) : "";
  return search ? `${path}?${search}` : path;
}

/**
 * Resolves a reservation page for one language, like `resolveAccountPath`.
 * Accepts the localized and the internal (English) spelling of each segment.
 * Returns `null` for other paths. The query string is not part of `pathname`.
 */
export function resolveReservationPath(
  lang: Lang,
  pathname: string,
): { canonical: string; internal: string; term: ReservationTerm | null } | null {
  const [, pathLang, root, segment, ...rest] = pathname.split("/");
  if (pathLang !== lang) {
    return null;
  }
  if (root !== RESERVATION_ROOT[lang] && root !== RESERVATION_INTERNAL) {
    return null;
  }

  if ((segment === undefined || segment === "") && rest.length === 0) {
    return {
      canonical: reservationHref(lang, "short"),
      internal: `/${lang}/${RESERVATION_INTERNAL}`,
      term: "short",
    };
  }

  if ((segment === RESERVATION_DONE[lang] || segment === RESERVATION_DONE.en) && rest.length === 0) {
    return {
      canonical: reservationDoneHref(lang),
      internal: `/${lang}/${RESERVATION_INTERNAL}/${RESERVATION_DONE.en}`,
      term: null,
    };
  }

  const term = (Object.keys(RESERVATION_PAGES) as ReservationTerm[]).find((key) => {
    const page = RESERVATION_PAGES[key];
    return page !== null && (page[lang] === segment || page.en === segment);
  });
  const page = term ? RESERVATION_PAGES[term] : null;
  if (!term || !page || rest.length > 0) {
    // Unknown path: let the app answer 404 under the internal path.
    const tail = [segment, ...rest].join("/");
    return {
      canonical: `/${lang}/${RESERVATION_ROOT[lang]}/${tail}`,
      internal: `/${lang}/${RESERVATION_INTERNAL}/${tail}`,
      term: null,
    };
  }
  return {
    canonical: reservationHref(lang, term),
    internal: `/${lang}/${RESERVATION_INTERNAL}/${page.en}`,
    term,
  };
}

/**
 * Public URLs of the fleet: the list `/pl/flota` and one page per car,
 * `/pl/flota/toyota-yaris-1219`. The app folder is `app/[lang]/fleet`; `proxy.ts` rewrites the
 * localized URL to it and redirects any mix. The car slug is the same in every
 * language (see `lib/fleet/slug.ts`).
 */
const FLEET_ROOT: Record<Lang, string> = { pl: "flota", en: "fleet", de: "flotte", uk: "avtopark" };
const FLEET_INTERNAL = "fleet";

/** Public URL of the fleet list, or of one car with its slug from `carSlug`. */
export function fleetHref(lang: Lang, slug?: string): string {
  const path = `/${lang}/${FLEET_ROOT[lang]}`;
  return slug ? `${path}/${encodeURIComponent(slug)}` : path;
}

/**
 * Resolves a fleet page for one language, like `resolveReservationPath`.
 * `slug` is the raw car segment (the page itself checks it against the car).
 * Deeper paths keep their tail so the app answers 404 under the internal path.
 */
export function resolveFleetPath(
  lang: Lang,
  pathname: string,
): { canonical: string; internal: string; slug: string | null } | null {
  const [, pathLang, root, ...rest] = pathname.split("/");
  if (pathLang !== lang) {
    return null;
  }
  if (root !== FLEET_ROOT[lang] && root !== FLEET_INTERNAL) {
    return null;
  }
  const tail = rest.filter(Boolean);
  const suffix = tail.length > 0 ? `/${tail.join("/")}` : "";
  return {
    canonical: `/${lang}/${FLEET_ROOT[lang]}${suffix}`,
    internal: `/${lang}/${FLEET_INTERNAL}${suffix}`,
    slug: tail.length === 1 ? tail[0] : null,
  };
}

/**
 * The same page in another language, for the language switcher: a reservation
 * page keeps its term and search, a panel page its page and id, a fleet page
 * its car, the thank-you page stays itself. Any other path keeps everything after the language.
 * `search` is the current query string, with or without the leading `?`.
 */
export function switchLangHref(pathname: string, search: string, target: Lang): string {
  const query = search.startsWith("?") ? search.slice(1) : search;
  const withQuery = (path: string) => (query ? `${path}?${query}` : path);
  const found = langFromPath(pathname);
  if (!found) {
    return `/${target}`;
  }
  const { lang } = found;

  const reservation = resolveReservationPath(lang, pathname);
  if (reservation) {
    if (reservation.term) {
      return reservationHref(target, reservation.term, query);
    }
    return reservation.canonical === reservationDoneHref(lang) ? reservationDoneHref(target) : `/${target}`;
  }

  const fleet = resolveFleetPath(lang, pathname);
  if (fleet) {
    // The car slug does not depend on the language.
    return withQuery(fleetHref(target, fleet.slug ? decodeURIComponent(fleet.slug) : undefined));
  }

  const account = resolveAccountPath(lang, pathname);
  if (account) {
    if (account.canonical === accountHref(lang)) {
      return withQuery(accountHref(target));
    }
    if (!account.page) {
      return accountHref(target);
    }
    const tail = account.canonical.slice(accountHref(lang, account.page).length);
    return withQuery(`${accountHref(target, account.page)}${tail}`);
  }

  return withQuery(`/${target}${found.canonical.slice(lang.length + 1)}`);
}
