import { cacheLife, cacheTag } from "next/cache";

import type { Lang } from "@/i18n/config";
import { fleetHref } from "@/i18n/routes";
import { cacheEnabled } from "@/lib/cache";

import { SitemapDocument, type SitemapQuery } from "../generated/graphql";
import { contentStatus } from "../internal/config";
import { strapiRequest } from "../internal/http";
import { blogHref, buildRoutes, pageHref, type RouteNode } from "../internal/routes";
import { CACHE_TAGS } from "../internal/tags";
import { placeSegments } from "./places";
import { markServedByApp } from "./routes";

/**
 * The indexable URLs of one language for `app/sitemap.ts`: CMS pages, blog
 * posts, cities and local pages, from one light query (`graphql/sitemap.graphql`)
 * instead of a content read per URL. Paths are built as the pages build them
 * (`buildRoutes`, `markServedByApp`, `placeSegments`); a place whose path a CMS
 * page uses stays the page's. Versions with `seo.noIndex` are left out.
 */
export type SitemapUrl = {
  /** The type and `documentId`, shared by every language version of one document. */
  key: string;
  href: string;
  /** ISO date of the last change of this language version. */
  updatedAt: string | null;
};

/** The CMS's GraphQL `maxLimit` (local and production): one request per language at today's size. */
const PAGE_SIZE = 1000;
/** 10 000 entries per type and language; past that the sitemap fails rather than being silently partial. */
const MAX_REQUESTS = 10;

export function listSitemapUrls(lang: Lang): Promise<SitemapUrl[]> {
  return cacheEnabled() ? loadCachedUrls(lang) : loadUrls(lang);
}

async function loadCachedUrls(lang: Lang): Promise<SitemapUrl[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.type("page"), CACHE_TAGS.type("blog"), CACHE_TAGS.type("city"), CACHE_TAGS.type("local-page"));
  return loadUrls(lang);
}

type Entry = { documentId: string; slug: string; updatedAt: string | null; noIndex: boolean };
type PageEntry = Entry & { parentDocumentId: string | null };

async function loadUrls(lang: Lang): Promise<SitemapUrl[]> {
  const pages: PageEntry[] = [];
  const blogs: Entry[] = [];
  const cities: Entry[] = [];
  const locals: Entry[] = [];
  for (let page = 1; page <= MAX_REQUESTS; page++) {
    const data = await strapiRequest(SitemapDocument, { locale: lang, status: contentStatus(), page, pageSize: PAGE_SIZE });
    for (const node of data.pages_connection?.nodes ?? []) {
      pages.push({ ...entry(node), parentDocumentId: node.parentPage?.documentId ?? null });
    }
    blogs.push(...(data.blogs_connection?.nodes ?? []).map(entry));
    cities.push(...(data.cities_connection?.nodes ?? []).map(entry));
    locals.push(...(data.localPages_connection?.nodes ?? []).map(entry));
    if (page >= lastPage(data)) {
      return urls(lang, pages, blogs, cities, locals);
    }
  }
  throw new Error(`Strapi has more than ${PAGE_SIZE * MAX_REQUESTS} entries of one type in "${lang}".`);
}

function entry(node: { documentId: string; slug: string | null; updatedAt?: unknown; seo?: { noIndex?: boolean | null } | null }): Entry {
  return {
    documentId: node.documentId,
    slug: node.slug ?? "",
    updatedAt: typeof node.updatedAt === "string" ? node.updatedAt : null,
    noIndex: node.seo?.noIndex === true,
  };
}

/** The highest page count of the four lists: each list comes back empty past its own last page. */
function lastPage(data: SitemapQuery): number {
  return Math.max(
    1,
    data.pages_connection?.pageInfo.pageCount ?? 0,
    data.blogs_connection?.pageInfo.pageCount ?? 0,
    data.cities_connection?.pageInfo.pageCount ?? 0,
    data.localPages_connection?.pageInfo.pageCount ?? 0,
  );
}

function urls(lang: Lang, pages: PageEntry[], blogs: Entry[], cities: Entry[], locals: Entry[]): SitemapUrl[] {
  // Every page takes part in building paths (a noindex parent still gives its children their URL).
  const nodes: RouteNode[] = pages.map((page) => ({ documentId: page.documentId, slug: page.slug, parentDocumentId: page.parentDocumentId, updatedAt: page.updatedAt }));
  const routes = markServedByApp(lang, buildRoutes(nodes));
  const noIndex = new Set([...pages, ...blogs, ...cities, ...locals].filter((item) => item.noIndex).map((item) => item.documentId));
  const taken = new Set(routes.map((route) => route.segments.join("/").toLowerCase()));

  const result: SitemapUrl[] = [];
  for (const route of routes) {
    const href = pageHref(lang, route.segments);
    // An app folder answers these URLs; only the fleet page shows its CMS page.
    if (noIndex.has(route.documentId) || (route.servedByApp && href !== fleetHref(lang))) {
      continue;
    }
    result.push({ key: `page:${route.documentId}`, href, updatedAt: route.updatedAt ?? null });
  }
  for (const post of blogs) {
    if (!post.noIndex && post.slug) {
      result.push({ key: `blog:${post.documentId}`, href: blogHref(lang, post.slug), updatedAt: post.updatedAt });
    }
  }
  for (const [kind, list] of [["city", cities], ["local", locals]] as const) {
    for (const place of list) {
      const segments = placeSegments(kind, lang, place.slug);
      if (!place.noIndex && place.slug && !taken.has(segments.join("/").toLowerCase())) {
        result.push({ key: `${kind}:${place.documentId}`, href: pageHref(lang, segments), updatedAt: place.updatedAt });
      }
    }
  }
  return result;
}
