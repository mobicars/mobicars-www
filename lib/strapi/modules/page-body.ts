import type { Lang } from "@/i18n/config";

import { BlogCardsDocument, SectionReviewsDocument } from "../generated/graphql";
import { contentStatus } from "../internal/config";
import { latestPostQueries, latestReviewQueries, parsePage, type Page, type RawPage } from "../internal/entities";
import { strapiRequest } from "../internal/http";
import type { PageRoute } from "../internal/routes";

/**
 * A page, blog post or place with its sections: Blog sections with the newest
 * posts and Reviews sections with the newest reviews read those first, as the
 * page query cannot select them.
 */
export async function readPageBody(raw: RawPage, lang: Lang, routes: readonly PageRoute[]): Promise<Page> {
  const [posts, reviews] = await Promise.all([
    Promise.all(
      latestPostQueries(raw).map(async ({ blockId, limit }) => {
        const { blogs } = await strapiRequest(BlogCardsDocument, { locale: lang, status: contentStatus(), limit, filters: null });
        return [blockId, blogs] as const;
      }),
    ),
    // In the page's language.
    Promise.all(
      latestReviewQueries(raw).map(async ({ sectionId, limit }) => {
        const { ratings } = await strapiRequest(SectionReviewsDocument, { locale: lang, status: contentStatus(), limit });
        return [sectionId, ratings] as const;
      }),
    ),
  ]);
  return parsePage(raw, lang, routes, Object.fromEntries(posts), Object.fromEntries(reviews));
}
