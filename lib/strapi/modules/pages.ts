import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";

import type { Lang } from "@/i18n/config";
import { cacheEnabled } from "@/lib/cache";

import { PageDocument } from "../generated/graphql";
import { contentStatus } from "../internal/config";
import type { Page } from "../internal/entities";
import { strapiRequest } from "../internal/http";
import { CACHE_TAGS } from "../internal/tags";
import { readPageBody } from "./page-body";
import { listPageRoutes } from "./routes";

/**
 * One page by `documentId` (from `findPageRoute`) in `lang`, or `null` when it
 * has no version in that language (404).
 */
export async function getPage(lang: Lang, documentId: string): Promise<Page | null> {
  return cacheEnabled() ? loadCachedPage(lang, documentId) : loadLivePage(lang, documentId);
}

/** Uncached (local, preview): every request reads the CMS. */
async function loadLivePage(lang: Lang, documentId: string): Promise<Page | null> {
  await connection();
  return loadPage(lang, documentId);
}

async function loadCachedPage(lang: Lang, documentId: string): Promise<Page | null> {
  "use cache";
  // `page`: the page itself and the pages its links point to. `blog` and
  // `rating`: a Blog or Reviews section's newest entries, so a new one shows
  // without a publish here; `car-collection` for a Cars section's rules.
  cacheLife("max");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.type("page"), CACHE_TAGS.type("blog"), CACHE_TAGS.type("rating"), CACHE_TAGS.type("car-collection"));
  return loadPage(lang, documentId);
}

async function loadPage(lang: Lang, documentId: string): Promise<Page | null> {
  const [own, routes] = await Promise.all([
    strapiRequest(PageDocument, { documentId, locale: lang, status: contentStatus() }),
    listPageRoutes(lang),
  ]);
  return own.page ? readPageBody(own.page, lang, routes) : null;
}
