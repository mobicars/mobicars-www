import { cacheLife, cacheTag } from "next/cache";

import type { Lang } from "@/i18n/config";
import { cacheEnabled } from "@/lib/cache";

import {
  BlogCardsDocument,
  CityDocument,
  CityRoutesDocument,
  LocalPageDocument,
  LocalPageRoutesDocument,
  ReviewsDocument,
  type CityQuery,
} from "../generated/graphql";
import { contentStatus } from "../internal/config";
import { latestPostQueries, pageNeedsReviews, parsePage, type Page } from "../internal/entities";
import { strapiRequest } from "../internal/http";
import { cacheUntil } from "../internal/page-cache";
import { findRoute, type PageRoute } from "../internal/routes";
import { CACHE_TAGS } from "../internal/tags";
import { listPageRoutes } from "./routes";

/**
 * City and airport pages (`city`, `/pl/wypozyczalnia-samochodow-warszawa`) and
 * local pickup pages (`local-page`,
 * `/pl/lokalna-wypozyczalnia-samochodow/warszawa-bemowo`), at the old site's
 * URLs so links and search results carry over. They render like CMS pages
 * (`Page`), from their own `blocks`. An entry with no version in a language
 * has no URL there (404).
 */
export type PlaceKind = "city" | "local";

/** The folder of local pages; Polish and English as on the old site. */
export const LOCAL_ROOT: Record<Lang, string> = {
  pl: "lokalna-wypozyczalnia-samochodow",
  en: "local-car-rental",
  de: "lokale-autovermietung",
  uk: "lokalna-orenda-avto",
};

const TYPES: Record<PlaceKind, string> = { city: "city", local: "local-page" };

const PAGE_SIZE = 100;
const MAX_REQUESTS = 5;

/** A place's path below the language: `[slug]` for a city, `[LOCAL_ROOT, slug]` for a local page. */
export function placeSegments(kind: PlaceKind, lang: Lang, slug: string): string[] {
  return kind === "city" ? [slug] : [LOCAL_ROOT[lang], slug];
}

/** Every place of one kind in `lang`. A path a CMS page already uses stays the CMS page's. */
export async function listPlaceRoutes(kind: PlaceKind, lang: Lang): Promise<PageRoute[]> {
  const [own, pages] = await Promise.all([loadOwnSlugs(kind, lang), listPageRoutes(lang)]);
  const taken = new Set(pages.map((route) => route.segments.join("/").toLowerCase()));
  return own
    .map((route) => ({ ...route, segments: placeSegments(kind, lang, route.segments[0]) }))
    .filter((route) => !taken.has(route.segments.join("/").toLowerCase()));
}

/** Which kind of place a path can be: one segment a city, `LOCAL_ROOT` and a slug a local page. */
export function placeKindOf(lang: Lang, segments: readonly string[]): PlaceKind | null {
  if (segments.length === 1) {
    return "city";
  }
  return segments.length === 2 && segments[0].toLowerCase() === LOCAL_ROOT[lang] ? "local" : null;
}

/** The place at `/{lang}/{...segments}`, or `null`. Asked only when no CMS page has the path. */
export async function findPlaceRoute(
  lang: Lang,
  segments: readonly string[],
): Promise<{ kind: PlaceKind; route: PageRoute } | null> {
  const kind = placeKindOf(lang, segments);
  if (!kind) {
    return null;
  }
  const route = findRoute(await listPlaceRoutes(kind, lang), segments);
  return route ? { kind, route } : null;
}

/** One place by `documentId` in `lang`, or `null` when it has no version there. */
export async function getPlacePage(kind: PlaceKind, lang: Lang, documentId: string): Promise<Page | null> {
  return cacheEnabled() ? loadCachedPlacePage(kind, lang, documentId) : loadPlacePage(kind, lang, documentId);
}

async function loadCachedPlacePage(kind: PlaceKind, lang: Lang, documentId: string): Promise<Page | null> {
  "use cache";
  // As `getPage`: the pages its links point to, and the blog and review cards its blocks list.
  cacheTag(
    CACHE_TAGS.all,
    CACHE_TAGS.type(TYPES[kind]),
    CACHE_TAGS.type("page"),
    CACHE_TAGS.type("blog"),
    CACHE_TAGS.type("blog-category"),
    CACHE_TAGS.type("rating"),
  );
  const page = await loadPlacePage(kind, lang, documentId);
  cacheUntil(page?.changesAt);
  return page;
}

async function loadPlacePage(kind: PlaceKind, lang: Lang, documentId: string): Promise<Page | null> {
  const [raw, routes] = await Promise.all([readPlace(kind, lang, documentId), listPageRoutes(lang)]);
  if (!raw) {
    return null;
  }
  const page = { documentId: raw.documentId, title: raw.title, seo: raw.seo, blocks: raw.blocks, pickupPoint: raw.pickupPoint };
  // As in `getPage`: `latest` blog blocks and reviews blocks read their own collections.
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

type RawPlace = Omit<NonNullable<CityQuery["city"]>, "__typename">;

async function readPlace(kind: PlaceKind, lang: Lang, documentId: string): Promise<RawPlace | null> {
  const variables = { documentId, locale: lang, status: contentStatus() };
  if (kind === "city") {
    return (await strapiRequest(CityDocument, variables)).city;
  }
  return (await strapiRequest(LocalPageDocument, variables)).localPage;
}

function loadOwnSlugs(kind: PlaceKind, lang: Lang): Promise<PageRoute[]> {
  return cacheEnabled() ? loadCachedSlugs(kind, lang) : loadSlugs(kind, lang);
}

async function loadCachedSlugs(kind: PlaceKind, lang: Lang): Promise<PageRoute[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.type(TYPES[kind]));
  return loadSlugs(kind, lang);
}

/** `segments` hold just the slug here; `listPlaceRoutes` adds the folder. */
async function loadSlugs(kind: PlaceKind, lang: Lang): Promise<PageRoute[]> {
  const routes: PageRoute[] = [];
  for (let page = 1; page <= MAX_REQUESTS; page++) {
    const variables = { locale: lang, status: contentStatus(), page, pageSize: PAGE_SIZE };
    const connection =
      kind === "city"
        ? (await strapiRequest(CityRoutesDocument, variables)).cities_connection
        : (await strapiRequest(LocalPageRoutesDocument, variables)).localPages_connection;
    for (const node of connection?.nodes ?? []) {
      if (node.slug) {
        routes.push({ documentId: node.documentId, segments: [node.slug], updatedAt: node.updatedAt ?? undefined });
      }
    }
    if (!connection || page >= connection.pageInfo.pageCount) {
      return routes;
    }
  }
  throw new Error(`Strapi has more than ${PAGE_SIZE * MAX_REQUESTS} ${TYPES[kind]} entries in "${lang}".`);
}
