import type { MetadataRoute } from "next";
import { connection } from "next/server";

import { langs } from "@/i18n/config";
import { accountHref, reservationHref } from "@/i18n/routes";
import { contentPreview } from "@/lib/cache";
import { absoluteUrl, siteOrigin } from "@/lib/fleet/seo";

/**
 * `/robots.txt`. Closed to every crawler while the cache is off (`CACHE_ENABLED`,
 * see `lib/cache.ts`: Strapi drafts and the preview banner) and on any copy that
 * is not the production domain (`indexable`). Production lets crawlers in,
 * except:
 *
 * - `/api/`: Route Handlers, nothing to index.
 * - the customer panel (`/pl/konto`, `/en/account`, `/de/konto`, `/uk/kabinet`):
 *   signed-in pages, every one already `noindex, nofollow`.
 * - the reservation flow (`/pl/rezerwacja`, `/en/reservation`, `/de/buchung`,
 *   `/uk/bronyuvannya`): one URL per search, already `noindex`. Blocked so
 *   crawlers do not spend the crawl budget on endless query strings.
 *
 * Each localized root is listed three ways (`$`, `/`, `?`) instead of as a bare
 * prefix, so a CMS page such as `/pl/konto-firmowe` is not caught by `/pl/konto`.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  // Read the environment per request: one build may serve preview and production.
  await connection();

  if (contentPreview() || !indexable()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  const roots = langs.flatMap((lang) => [accountHref(lang), reservationHref(lang)]);
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", ...roots.flatMap((root) => [`${root}$`, `${root}/`, `${root}?`])],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

/**
 * A staging copy with the cache on must not reach search results, and
 * production must not be closed by a forgotten variable. So `SITE_INDEXABLE`
 * decides when it is set (`true` / `false`); otherwise only the production
 * domain (`DOMAIN`, `lib/fleet/seo.ts`) is open.
 */
function indexable(): boolean {
  const flag = process.env.SITE_INDEXABLE;
  if (flag === "true" || flag === "false") {
    return flag === "true";
  }
  return ["mobicars.pl", "www.mobicars.pl"].includes(new URL(siteOrigin()).hostname);
}
