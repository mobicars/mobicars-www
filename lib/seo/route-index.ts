import type { Lang } from "@/i18n/config";

/**
 * Which CMS URLs exist, for `proxy.ts`. With Cache Components a page sends its
 * static shell, and with it a `200`, before its own lookup runs, so a
 * `notFound()` or `permanentRedirect()` in the page can only add `noindex` or
 * redirect in the browser (Next docs: streaming, "The HTTP contract"). The
 * proxy answers before the page renders: a real 404 for a path the CMS does
 * not have, a real 308 for a wrongly cased one.
 *
 * Only Strapi content: `app/api/route-index/[lang]` builds the index from the
 * lists the pages look in (`listPageRoutes`, `listPlaceRoutes`,
 * `listBlogRoutes`, `listSales`), prerendered and expired with their tags.
 * RentCarSoft pages (cars, add-ons) are left to the page, apart from a slug
 * without an offer id, which never finds anything. A list that could not be
 * read is `null`, and its paths are left to the page, as before.
 */
export type RouteIndex = {
  /** CMS pages, cities and local pages: the canonical segments below the language. App folders' paths are left out. */
  pages: string[][] | null;
  /** Blog post slugs. */
  blog: string[] | null;
  /** Car-sale ad slugs. */
  sales: string[] | null;
};

/** What the proxy does with a path: let the page render, redirect (308) to the canonical path, or answer 404. */
export type Verdict = { kind: "ok" } | { kind: "redirect"; segments: string[] } | { kind: "missing" };

const OK: Verdict = { kind: "ok" };
const MISSING: Verdict = { kind: "missing" };

/** The index in the shapes the checks read: paths keyed case-insensitively, as `findRoute` matches them. */
export type RouteLookup = {
  pages: Map<string, string[]> | null;
  blog: Map<string, string> | null;
  sales: Set<string> | null;
};

export function compileRouteIndex(index: RouteIndex): RouteLookup {
  return {
    pages: index.pages ? new Map(index.pages.map((segments) => [key(segments), segments])) : null,
    blog: index.blog ? new Map(index.blog.map((slug) => [slug.toLowerCase(), slug])) : null,
    sales: index.sales ? new Set(index.sales) : null,
  };
}

/** A CMS page, city or local page at these (encoded) segments below the language. */
export function checkPage(lookup: RouteLookup, segments: readonly string[]): Verdict {
  if (!lookup.pages) {
    return OK;
  }
  const decoded = segments.map(safeDecode);
  const canonical = lookup.pages.get(key(decoded));
  if (!canonical) {
    return MISSING;
  }
  return same(canonical, decoded) ? OK : { kind: "redirect", segments: canonical };
}

/** A blog post (`/{lang}/blog/{slug}`); matched regardless of case, like the page. */
export function checkBlog(lookup: RouteLookup, slug: string): Verdict {
  if (!lookup.blog) {
    return OK;
  }
  const decoded = safeDecode(slug);
  const canonical = lookup.blog.get(decoded.toLowerCase());
  if (canonical === undefined) {
    return MISSING;
  }
  return canonical === decoded ? OK : { kind: "redirect", segments: [canonical] };
}

/** A car-sale ad; the page looks its slug up exactly. */
export function checkSale(lookup: RouteLookup, slug: string): Verdict {
  return !lookup.sales || lookup.sales.has(safeDecode(slug)) ? OK : MISSING;
}

/** How long the proxy trusts an index before it reads it again in the background. */
const FRESH_MS = 60_000;
/** A path the index does not have, or has in another case, is checked against a newer index once it is this old. */
const RECHECK_MS = 10_000;
/** Past this the proxy gives up waiting and lets the page decide. */
const TIMEOUT_MS = 2_000;

type State = {
  /** The last index read, and when. */
  lookup: RouteLookup | null;
  at: number;
  /** When the last read failed: until `RECHECK_MS` later a miss is left to the page without asking again. */
  failedAt: number;
  loading: Promise<RouteLookup | null> | null;
};
const states = new Map<Lang, State>();

/**
 * Checks a path against the index of `lang` held by this proxy instance and
 * refreshed in the background (`waitUntil`). Nothing here ever waits on a
 * request that would render anyway: an instance without an index yet lets the
 * page decide while it reads one. Only a 404 or a redirect from an index older
 * than `RECHECK_MS` waits for a fresh read, so a page just published or renamed
 * is never answered from an old list; when that read fails the page decides.
 */
export async function routeLookup(
  origin: string,
  lang: Lang,
  check: (lookup: RouteLookup) => Verdict,
  waitUntil: (promise: Promise<unknown>) => void,
): Promise<Verdict> {
  const now = Date.now();
  let state = states.get(lang);
  if (!state) {
    state = { lookup: null, at: 0, failedAt: 0, loading: null };
    states.set(lang, state);
  }
  if (now - state.at > FRESH_MS && !state.loading) {
    waitUntil(load(origin, state, lang));
  }
  if (!state.lookup) {
    return OK;
  }
  const verdict = check(state.lookup);
  if (verdict.kind === "ok" || now - state.at < RECHECK_MS) {
    return verdict;
  }
  if (now - state.failedAt < RECHECK_MS) {
    return OK;
  }
  const fresh = await (state.loading ?? load(origin, state, lang));
  return fresh ? check(fresh) : OK;
}

function load(origin: string, state: State, lang: Lang): Promise<RouteLookup | null> {
  state.loading = fetch(`${origin}/api/route-index/${lang}`, { signal: AbortSignal.timeout(TIMEOUT_MS) })
    .then(async (response) => (response.ok ? compileRouteIndex((await response.json()) as RouteIndex) : null))
    .catch(() => null)
    .then((lookup) => {
      if (lookup) {
        state.lookup = lookup;
        state.at = Date.now();
      } else {
        state.failedAt = Date.now();
      }
      state.loading = null;
      return lookup;
    });
  return state.loading;
}

function key(segments: readonly string[]): string {
  // Joined by a character a decoded segment cannot hold, so `a/b` stays apart from `a%2Fb`.
  return segments.map((segment) => segment.toLowerCase()).join("\u0000");
}

function same(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((segment, index) => segment === b[index]);
}

function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}
