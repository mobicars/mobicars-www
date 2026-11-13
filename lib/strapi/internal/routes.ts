import type { Lang } from "@/i18n/config";

/** One page as the routes query returns it. */
export type RouteNode = {
  documentId: string;
  slug: string;
  parentDocumentId: string | null;
};

export type PageRoute = {
  /** Shared by every language version of the page in Strapi 5. */
  documentId: string;
  /** Path below the language, `[]` for the home page: `["wynajem", "warszawa"]`. */
  segments: string[];
};

/** The slug of the page served at `/{lang}`. */
export const HOME_SLUG = "homepage";

/**
 * Slugs that are content, not URLs. `404` is the copy the old site showed on
 * its not-found page; served as a page it would answer 200.
 */
const UNROUTABLE_SLUGS: ReadonlySet<string> = new Set(["404"]);

/** Deeper chains than this are treated as a cycle. */
const MAX_DEPTH = 8;

/**
 * Turns the flat page list of one language into URLs by walking `parentPage`.
 * A page under the home page sits at the root, like one without a parent.
 *
 * A page is left out (404) rather than given a wrong URL when its parent is
 * missing from the list, unroutable, or part of a cycle. In production the list
 * holds published pages only, so a published child of an unpublished parent
 * has no URL until the parent is published.
 */
export function buildRoutes(nodes: readonly RouteNode[]): PageRoute[] {
  const byId = new Map(nodes.map((node) => [node.documentId, node]));
  const routes: PageRoute[] = [];

  for (const node of nodes) {
    const segments = pathOf(node, byId);
    if (segments) {
      routes.push({ documentId: node.documentId, segments });
    }
  }
  return routes;
}

function pathOf(node: RouteNode, byId: ReadonlyMap<string, RouteNode>): string[] | null {
  if (node.slug === HOME_SLUG) {
    return [];
  }
  const segments: string[] = [];
  let current: RouteNode | undefined = node;
  for (let depth = 0; current; depth++) {
    if (depth >= MAX_DEPTH || UNROUTABLE_SLUGS.has(current.slug) || !current.slug) {
      return null;
    }
    if (current.slug === HOME_SLUG) {
      break;
    }
    segments.unshift(current.slug);
    if (current.parentDocumentId === null) {
      break;
    }
    current = byId.get(current.parentDocumentId);
    if (!current) {
      return null;
    }
  }
  return segments;
}

/**
 * A blog post, `/pl/blog/{slug}`: the old site's URLs, kept so links and
 * search results carry over. mobicars-www has no blog route yet.
 */
export function blogHref(lang: Lang, slug: string): string {
  return `/${lang}/blog/${encodeURIComponent(slug)}`;
}

/** `/pl/wynajem/warszawa`, `/pl` for the home page. */
export function pageHref(lang: Lang, segments: readonly string[]): string {
  return `/${[lang, ...segments.map(encodeURIComponent)].join("/")}`;
}

/**
 * The route for a URL path below the language. Matches regardless of letter
 * case; the caller redirects when `route.segments` differ from the request.
 */
export function findRoute(routes: readonly PageRoute[], segments: readonly string[]): PageRoute | null {
  // Compared segment by segment: a decoded `%2F` must not join two segments.
  const wanted = segments.map((segment) => safeDecode(segment).toLowerCase());
  return (
    routes.find(
      (route) =>
        route.segments.length === wanted.length &&
        route.segments.every((segment, index) => segment.toLowerCase() === wanted[index]),
    ) ?? null
  );
}

function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}
