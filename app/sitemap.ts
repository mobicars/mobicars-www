import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";

import { defaultLang, langs, type Lang } from "@/i18n/config";
import { fleetHref } from "@/i18n/routes";
import { cacheEnabled } from "@/lib/cache";
import { listFleetCars } from "@/lib/fleet/cars";
import { absoluteUrl } from "@/lib/fleet/seo";
import { listSales, listSitemapUrls } from "@/lib/strapi";

/**
 * `/sitemap.xml`: one file for every language. The site has a few hundred URLs,
 * far below the 50 000 per file, so no sitemap index (`generateSitemaps` would
 * also give `/sitemap/[id].xml` without an index file at `/sitemap.xml`).
 *
 * Listed, each with hreflang for the languages it exists in and `x-default`
 * (Polish) when there is a Polish version:
 * - CMS pages, blog posts, cities and local pages, from one light query per
 *   language (`listSitemapUrls`): only the languages that have the document,
 *   and only versions whose SEO is not `noIndex` (neither listed nor an alternate);
 * - the fleet list and every car page (`app/[lang]/fleet/**`);
 * - every car-sale ad (`app/[lang]/sales/[slug]`) not marked `noIndex`.
 *
 * Left out: the reservation flow and the customer panel (`noindex`, blocked in
 * `app/robots.ts`) and Route Handlers.
 *
 * CMS entries carry `lastModified` from Strapi's `updatedAt` per language;
 * the fleet has none, RentCarSoft gives no change date.
 *
 * Caching: with `CACHE_ENABLED` on the whole sitemap is one cached entry, kept
 * until a page, post, city, local page or the car catalog changes (the tags
 * `POST /api/revalidate` expires), so it is built once, not per request. With
 * the cache off it is built per request, drafts included; `app/robots.ts`
 * closes that site to crawlers. A failed read fails the sitemap instead of
 * caching a partial one.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (cacheEnabled()) {
    return cachedSitemap();
  }
  await connection();
  return buildSitemap();
}

async function cachedSitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("max");
  // The CMS lists and the car catalog below tag this entry too.
  cacheTag("sitemap");
  return buildSitemap();
}

async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  const [cms, cars, sales] = await Promise.all([cmsEntries(), fleetEntries(), salesEntries()]);
  return [...cms, ...cars, ...sales];
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

/** Every language's CMS URLs, grouped by document (type and `documentId`, shared by its language versions in Strapi 5). */
async function cmsEntries(): Promise<MetadataRoute.Sitemap> {
  const perLang = await Promise.all(langs.map(async (lang) => ({ lang, urls: await listSitemapUrls(lang) })));
  const documents = new Map<string, { versions: Localized; modified: Localized }>();
  for (const { lang, urls } of perLang) {
    for (const url of urls) {
      const document = documents.get(url.key) ?? { versions: {}, modified: {} };
      document.versions[lang] = url.href;
      if (url.updatedAt) {
        document.modified[lang] = url.updatedAt;
      }
      documents.set(url.key, document);
    }
  }
  return [...documents.values()].flatMap(({ versions, modified }) => entries(versions, {}, modified));
}

/** The car-sale ads of every language, grouped by document like the CMS pages. */
async function salesEntries(): Promise<MetadataRoute.Sitemap> {
  const perLang = await Promise.all(langs.map(async (lang) => ({ lang, sales: await listSales(lang) })));
  const documents = new Map<string, { versions: Localized; modified: Localized }>();
  for (const { lang, sales } of perLang) {
    for (const sale of sales) {
      if (sale.noIndex) {
        continue;
      }
      const document = documents.get(sale.id) ?? { versions: {}, modified: {} };
      document.versions[lang] = sale.href;
      if (sale.updatedAt) {
        document.modified[lang] = sale.updatedAt;
      }
      documents.set(sale.id, document);
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
