import { langFromPath, type Lang } from "./config";

/**
 * Public URL segments of the sign-in pages, in each language. The client
 * panel itself is external (CMS `site.clientPanelUrl`). Ukrainian is
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
} as const satisfies Record<string, Record<Lang, string>>;

export type AccountPage = keyof typeof ACCOUNT_PAGES;

/** Pages for signed-out visitors. A signed-in client is sent to the home page. */
const GUEST_PAGES: readonly AccountPage[] = ["login", "register", "forgotPassword"];

/** Pages that do not need a session. */
const PUBLIC_PAGES: readonly AccountPage[] = [...GUEST_PAGES, "session"];

/** Public URL of a sign-in page, e.g. `accountHref("pl", "login")`. */
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
  /** `null` for the root (redirected to sign-in) or an unknown segment. */
  page: AccountPage | null;
  isPublic: boolean;
  /** Sign-in pages: a signed-in client is redirected to the home page. */
  isGuestOnly: boolean;
};

/**
 * Resolves a path below the account root for one language.
 * Accepts the localized and the internal (English) spelling of each segment,
 * so `/pl/account/login` resolves with canonical `/pl/konto/logowanie`.
 * Returns `null` for paths outside it.
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
    // The panel's old overview: the panel is external now, so the root signs in.
    return {
      canonical: accountHref(lang, "login"),
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
    // Unknown segment, the old panel's pages among them: a 404 under the
    // internal path, without asking to sign in first.
    return {
      canonical: `/${lang}/${ACCOUNT_ROOT[lang]}/${segment}${tail}`,
      internal: `/${lang}/${INTERNAL_ROOT}/${segment}${tail}`,
      page: null,
      isPublic: true,
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
 * Public URLs of the add-ons: the list is the CMS page at the root
 * (`/pl/dodatki-i-akcesoria`, a Extras section on it); each add-on has its own
 * page, `/pl/dodatki-i-akcesoria/fotelik-9-36kg-147`, as on the old site. The
 * app folder is `app/[lang]/extras/[slug]`; `proxy.ts` rewrites only paths with
 * a slug, so the root stays the CMS page. The slug ends with the RentCarSoft id
 * (`carSlug`); a stale name part redirects to the current one.
 */
const EXTRAS_ROOT: Record<Lang, string> = {
  pl: "dodatki-i-akcesoria",
  en: "addons-and-accessories",
  de: "extras-und-zubehoer",
  uk: "dodatky-i-aksesuary",
};
const EXTRAS_INTERNAL = "extras";

/** Public URL of the add-on list (a CMS page), or of one add-on with its slug. */
export function extrasHref(lang: Lang, slug?: string): string {
  const path = `/${lang}/${EXTRAS_ROOT[lang]}`;
  return slug ? `${path}/${encodeURIComponent(slug)}` : path;
}

/**
 * Resolves an add-on page, like `resolveFleetPath`, but only below the root:
 * the root itself is the CMS list page (the internal root redirects to it).
 */
export function resolveExtrasPath(
  lang: Lang,
  pathname: string,
): { canonical: string; internal: string | null; slug: string | null } | null {
  const [, pathLang, root, ...rest] = pathname.split("/");
  if (pathLang !== lang || (root !== EXTRAS_ROOT[lang] && root !== EXTRAS_INTERNAL)) {
    return null;
  }
  const tail = rest.filter(Boolean);
  if (tail.length === 0) {
    return root === EXTRAS_INTERNAL ? { canonical: extrasHref(lang), internal: null, slug: null } : null;
  }
  const suffix = `/${tail.join("/")}`;
  return {
    canonical: `/${lang}/${EXTRAS_ROOT[lang]}${suffix}`,
    internal: `/${lang}/${EXTRAS_INTERNAL}${suffix}`,
    slug: tail.length === 1 ? tail[0] : null,
  };
}

/**
 * Public URLs of the car-sale ads: the list is the CMS page at the root
 * (`/pl/sprzedaz-samochodow`, a Car sales section on it); each ad has its own
 * page, `/pl/sprzedaz-samochodow/mazda-cx-30`, as on the old site. The app
 * folder is `app/[lang]/sales/[slug]`; `proxy.ts` rewrites only paths with a
 * slug, so the root stays the CMS page (`resolveExtrasPath` does the same).
 */
const SALES_ROOT: Record<Lang, string> = {
  pl: "sprzedaz-samochodow",
  en: "cars-for-sale",
  de: "autos-zu-verkaufen",
  uk: "prodazh-avto",
};
const SALES_INTERNAL = "sales";

/** Public URL of the ad list (a CMS page), or of one ad with its slug. */
export function salesHref(lang: Lang, slug?: string): string {
  const path = `/${lang}/${SALES_ROOT[lang]}`;
  return slug ? `${path}/${encodeURIComponent(slug)}` : path;
}

/** Resolves an ad's page, like `resolveExtrasPath`: only below the root, which is the CMS list page. */
export function resolveSalesPath(
  lang: Lang,
  pathname: string,
): { canonical: string; internal: string | null; slug: string | null } | null {
  const [, pathLang, root, ...rest] = pathname.split("/");
  if (pathLang !== lang || (root !== SALES_ROOT[lang] && root !== SALES_INTERNAL)) {
    return null;
  }
  const tail = rest.filter(Boolean);
  if (tail.length === 0) {
    return root === SALES_INTERNAL ? { canonical: salesHref(lang), internal: null, slug: null } : null;
  }
  const suffix = `/${tail.join("/")}`;
  return {
    canonical: `/${lang}/${SALES_ROOT[lang]}${suffix}`,
    internal: `/${lang}/${SALES_INTERNAL}${suffix}`,
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

  const extras = resolveExtrasPath(lang, pathname);
  if (extras) {
    // The id at the end of the slug finds the add-on; its page redirects to the name in that language.
    return withQuery(extrasHref(target, extras.slug ? decodeURIComponent(extras.slug) : undefined));
  }

  // An ad's slug is per language and ads are rarely translated: the other language's list.
  if (resolveSalesPath(lang, pathname)) {
    return salesHref(target);
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
