import type { MetadataRoute } from "next";

import { defaultLang, langs, type Lang } from "@/i18n/config";
import { fleetHref } from "@/i18n/routes";
import { listFleetCars } from "@/lib/fleet/cars";
import { absoluteUrl } from "@/lib/fleet/seo";
import {
  blogHref,
  getBlogPost,
  getPage,
  getPlacePage,
  listBlogRoutes,
  listPageRoutes,
  listPlaceRoutes,
  pageHref,
  type Page,
  type PageRoute,
} from "@/lib/strapi";

/**
 * `/sitemap.xml`: one file for every language. The site has a few hundred URLs,
 * far below the 50 000 per file, so no sitemap index (`generateSitemaps` would
 * also give `/sitemap/[id].xml` without an index file at `/sitemap.xml`).
 *
 * Listed, each with hreflang for the languages it exists in and `x-default`
 * (Polish) when there is a Polish version:
 * - CMS pages (`app/[lang]/page.tsx`, `app/[lang]/[...slug]`), only in the
 *   languages that have the page, and only when its SEO is not `noIndex`.
 * - the fleet list and every car page (`app/[lang]/fleet/**`).
 *
 * Left out: the reservation flow and the customer panel (`noindex`, blocked in
 * `app/robots.ts`) and Route Handlers. Blog posts (`app/[lang]/blog/[slug]`),
 * cities and local pages are listed like CMS pages.
 *
 * CMS pages carry `lastModified` from Strapi's `updatedAt` per language
 * (`listPageRoutes`); the fleet has none, RentCarSoft gives no change date.
 *
 * Caching: every read below is cached and tagged by its source (`cms`,
 * `cms:page`, `rcs`, `rcs:catalog`) while `CACHE_ENABLED` is on, so the
 * sitemap is prerendered and expires with the same tags as the pages
 * (`POST /api/revalidate`). With the cache off it is built per request, drafts
 * included, like every other page; `app/robots.ts` closes that site to crawlers.
 * A failed read fails the sitemap instead of caching a partial one.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, cities, locals, posts, cars] = await Promise.all([
    cmsEntries(listPageRoutes, getPage),
    cmsEntries((lang) => listPlaceRoutes("city", lang), (lang, id) => getPlacePage("city", lang, id)),
    cmsEntries((lang) => listPlaceRoutes("local", lang), (lang, id) => getPlacePage("local", lang, id)),
    cmsEntries(listBlogRoutes, async (lang, id) => (await getBlogPost(lang, id))?.page ?? null, (lang, segments) => blogHref(lang, segments[0])),
    fleetEntries(),
  ]);
  return [...pages, ...cities, ...locals, ...posts, ...cars];
}

type Localized = Partial<Record<Lang, string>>;

/** One entry per language version, each listing all versions as alternates. */
function entries(
  versions: Localized,
  extra: Partial<MetadataRoute.Sitemap[number]> = {},
  modified: Localized = {},
): MetadataRoute.Sitemap {
  const languages: Record<string, string> = Object.fromEntries(
    langs.flatMap((lang) => (versions[lang] ? [[lang, absoluteUrl(versions[lang])]] : [])),
  );
  if (versions[defaultLang]) {
    languages["x-default"] = absoluteUrl(versions[defaultLang]);
  }
  return langs.flatMap((lang) =>
    versions[lang]
      ? [{ url: absoluteUrl(versions[lang]), alternates: { languages }, ...(modified[lang] ? { lastModified: modified[lang] } : {}), ...extra }]
      : [],
  );
}

/**
 * CMS pages, city or local pages (`lib/strapi/modules/places.ts`) or blog posts, grouped
 * by `documentId`, shared by every language version (Strapi 5). A version
 * with `seo.noIndex` is neither listed nor an alternate.
 */
async function cmsEntries(
  listRoutes: (lang: Lang) => Promise<PageRoute[]>,
  readPage: (lang: Lang, documentId: string) => Promise<Page | null>,
  href: (lang: Lang, segments: readonly string[]) => string = pageHref,
): Promise<MetadataRoute.Sitemap> {
  const perLang = await Promise.all(
    langs.map(async (lang) => {
      // `servedByApp`: an app folder answers the URL. The fleet page shows its CMS page and is
      // listed like one; the CMS copies the reservation and account folders never show are left out.
      const routes = (await listRoutes(lang)).filter(
        (route) => !route.servedByApp || href(lang, route.segments) === fleetHref(lang),
      );
      const indexable = await Promise.all(
        routes.map(async (route) => {
          const page = await readPage(lang, route.documentId);
          return page && !page.seo.noIndex ? route : null;
        }),
      );
      return { lang, routes: indexable.filter((route) => route !== null) };
    }),
  );

  const documents = new Map<string, { versions: Localized; modified: Localized }>();
  for (const { lang, routes } of perLang) {
    for (const route of routes) {
      const document = documents.get(route.documentId) ?? { versions: {}, modified: {} };
      document.versions[lang] = href(lang, route.segments);
      document.modified[lang] = route.updatedAt;
      documents.set(route.documentId, document);
    }
  }
  return [...documents.values()].flatMap(({ versions, modified }) => entries(versions, {}, modified));
}


/**
 * The fleet list in every language and each car of the daily catalog in the
 * languages whose catalog lists it. The car slug is the same in every language
 * (`lib/fleet/slug.ts`), but each language's own list is used, so a car missing
 * from one catalog gets no URL there.
 */
async function fleetEntries(): Promise<MetadataRoute.Sitemap> {
  const catalogs = await Promise.all(langs.map(async (lang) => ({ lang, cars: await listFleetCars(lang) })));

  const cars = new Map<number, { versions: Localized; image: string | null }>();
  for (const { lang, cars: list } of catalogs) {
    for (const car of list) {
      const entry = cars.get(car.id) ?? { versions: {}, image: car.image?.src ?? null };
      entry.versions[lang] = fleetHref(lang, car.slug);
      cars.set(car.id, entry);
    }
  }

  // The fleet list itself is a CMS page, listed with the other CMS pages in the languages that have it.
  return [...cars.values()].flatMap(({ versions, image }) => entries(versions, image ? { images: [image] } : {}));
}
