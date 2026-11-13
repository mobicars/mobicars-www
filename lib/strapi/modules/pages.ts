import { cacheLife, cacheTag } from "next/cache";

import type { Lang } from "@/i18n/config";
import { cacheEnabled } from "@/lib/cache";

import { PageDocument } from "../generated/graphql";
import { contentStatus } from "../internal/config";
import { parsePage, type Page } from "../internal/entities";
import { strapiRequest } from "../internal/http";
import { CACHE_TAGS } from "../internal/tags";
import { listPageRoutes } from "./routes";

/** One page by `documentId` (from `findPageRoute`), or `null` when it has no version in `lang`. */
export async function getPage(lang: Lang, documentId: string): Promise<Page | null> {
  return cacheEnabled() ? loadCachedPage(lang, documentId) : loadPage(lang, documentId);
}

async function loadCachedPage(lang: Lang, documentId: string): Promise<Page | null> {
  "use cache";
  cacheLife("max");
  // `page` covers the page itself and the pages its links point to.
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.type("page"));
  return loadPage(lang, documentId);
}

async function loadPage(lang: Lang, documentId: string): Promise<Page | null> {
  const [{ page }, routes] = await Promise.all([
    strapiRequest(PageDocument, { documentId, locale: lang, status: contentStatus() }),
    listPageRoutes(lang),
  ]);
  return page ? parsePage(page, lang, routes) : null;
}
