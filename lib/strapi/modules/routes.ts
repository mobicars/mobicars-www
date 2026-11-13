import { cacheLife, cacheTag } from "next/cache";

import type { Lang } from "@/i18n/config";
import { cacheEnabled } from "@/lib/cache";

import { PageRoutesDocument } from "../generated/graphql";
import { contentStatus } from "../internal/config";
import { strapiRequest } from "../internal/http";
import { buildRoutes, findRoute, type PageRoute, type RouteNode } from "../internal/routes";
import { CACHE_TAGS } from "../internal/tags";

/** Strapi's GraphQL caps a page at 100 entries in production (`amountLimit`). */
const PAGE_SIZE = 100;
/** 2 000 pages per language; past that the list is cut, not silently partial. */
const MAX_REQUESTS = 20;

/**
 * Every routable page of one language. One small list answers whether a URL
 * exists, builds `generateStaticParams`, hreflang and links between pages,
 * without a content query per URL.
 */
export async function listPageRoutes(lang: Lang): Promise<PageRoute[]> {
  return cacheEnabled() ? loadCachedRoutes(lang) : loadRoutes(lang);
}

/** The page at `/{lang}/{...segments}`, or `null` (404). */
export async function findPageRoute(lang: Lang, segments: readonly string[]): Promise<PageRoute | null> {
  return findRoute(await listPageRoutes(lang), segments);
}

async function loadCachedRoutes(lang: Lang): Promise<PageRoute[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.type("page"));
  return loadRoutes(lang);
}

async function loadRoutes(lang: Lang): Promise<PageRoute[]> {
  const nodes: RouteNode[] = [];
  for (let page = 1; page <= MAX_REQUESTS; page++) {
    const { pages_connection } = await strapiRequest(PageRoutesDocument, {
      locale: lang,
      status: contentStatus(),
      page,
      pageSize: PAGE_SIZE,
    });
    for (const node of pages_connection?.nodes ?? []) {
      nodes.push({
        documentId: node.documentId,
        slug: node.slug,
        parentDocumentId: node.parentPage?.documentId ?? null,
      });
    }
    if (!pages_connection || page >= pages_connection.pageInfo.pageCount) {
      return buildRoutes(nodes);
    }
  }
  throw new Error(`Strapi has more than ${PAGE_SIZE * MAX_REQUESTS} pages in "${lang}".`);
}
