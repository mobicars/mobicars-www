import { cacheTag } from "next/cache";

import type { Lang } from "@/i18n/config";
import { cacheEnabled } from "@/lib/cache";

import { BlogCardsDocument, PageDocument, ReviewsDocument } from "../generated/graphql";
import { contentStatus } from "../internal/config";
import { latestPostQueries, pageNeedsReviews, parsePage, type Page } from "../internal/entities";
import { strapiRequest } from "../internal/http";
import { cacheUntil } from "../internal/page-cache";
import { CACHE_TAGS } from "../internal/tags";
import { listPageRoutes } from "./routes";

/**
 * One page by `documentId` (from `findPageRoute`) in `lang`, or `null` when it
 * has no version in that language (404).
 */
export async function getPage(lang: Lang, documentId: string): Promise<Page | null> {
  return cacheEnabled() ? loadCachedPage(lang, documentId) : loadPage(lang, documentId);
}

async function loadCachedPage(lang: Lang, documentId: string): Promise<Page | null> {
  "use cache";
  // `page`: the page itself and the pages its links point to. `blog` and
  // `blog-category`: a blog block's cards, so a new post shows without a publish
  // here; `rating` the same for a reviews block.
  cacheTag(
    CACHE_TAGS.all,
    CACHE_TAGS.type("page"),
    CACHE_TAGS.type("blog"),
    CACHE_TAGS.type("blog-category"),
    CACHE_TAGS.type("rating"),
  );
  const page = await loadPage(lang, documentId);
  cacheUntil(page?.changesAt);
  return page;
}

async function loadPage(lang: Lang, documentId: string): Promise<Page | null> {
  const [own, routes] = await Promise.all([
    strapiRequest(PageDocument, { documentId, locale: lang, status: contentStatus() }),
    listPageRoutes(lang),
  ]);
  const { page } = own;
  if (!page) {
    return null;
  }
  // `latest` blog blocks list the newest posts, and reviews blocks the `rating`
  // collection: neither can be selected by the page query.
  const reviews = pageNeedsReviews(page)
    ? strapiRequest(ReviewsDocument, { status: contentStatus() }).then(({ ratings }) => ratings)
    : Promise.resolve([]);
  const latest = await Promise.all(
    latestPostQueries(page).map(async ({ blockId, limit, categoryId }) => {
      const { blogs } = await strapiRequest(BlogCardsDocument, {
        locale: lang,
        status: contentStatus(),
        limit,
        filters: categoryId ? { category: { documentId: { eq: categoryId } } } : null,
      });
      return [blockId, blogs] as const;
    }),
  );
  return parsePage(page, lang, routes, Object.fromEntries(latest), await reviews);
}
