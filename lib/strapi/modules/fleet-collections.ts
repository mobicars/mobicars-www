import { cacheLife, cacheTag } from "next/cache";

import type { Lang } from "@/i18n/config";
import { fleetHref } from "@/i18n/routes";
import { cacheEnabled } from "@/lib/cache";
import { COLLECTION_KEY } from "@/lib/fleet/filters";

import { FleetCollectionsDocument, type FleetCollectionsQuery } from "../generated/graphql";
import { StrapiError } from "../internal/errors";
import { strapiRequest } from "../internal/http";
import { pageHref, type PageRoute } from "../internal/routes";
import { parseCarCollection, type CarCollection } from "../internal/sections";
import { CACHE_TAGS } from "../internal/tags";

/**
 * A car collection marked "Show in fleet" (`api::car-collection`): a shortcut
 * in the header's Samochody menu and a filter of the fleet list
 * (`?collection=<slug>`). `landing` is the page picked as its landing in this
 * language (a relation is per language in Strapi 5), or null.
 */
export type FleetCollection = CarCollection & {
  /** The translated slug, the value of `?collection=`. */
  slug: string;
  /** A Lucide icon name (strapi-lucide-icons), or null. */
  icon: string | null;
  landing: string | null;
};

/**
 * The language's fleet collections, in the CMS order (`fleetOrder`, then title).
 * A collection without a translation in this language, or without a slug, is
 * left out. Empty when Strapi fails: the menu then has no shortcuts.
 */
export async function listFleetCollections(lang: Lang): Promise<FleetCollection[]> {
  return cacheEnabled() ? loadCachedCollections(lang) : loadCollections(lang);
}

async function loadCachedCollections(lang: Lang): Promise<FleetCollection[]> {
  "use cache";
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.type("car-collection"));
  try {
    const collections = parseFleetCollections(await strapiRequest(FleetCollectionsDocument, { locale: lang }));
    cacheLife("max");
    return collections;
  } catch (error) {
    logFailure(lang, error);
    cacheLife({ stale: 30, revalidate: 30, expire: 60 });
    return [];
  }
}

async function loadCollections(lang: Lang): Promise<FleetCollection[]> {
  try {
    return parseFleetCollections(await strapiRequest(FleetCollectionsDocument, { locale: lang }));
  } catch (error) {
    logFailure(lang, error);
    return [];
  }
}

export function parseFleetCollections(raw: FleetCollectionsQuery): FleetCollection[] {
  return raw.carCollections.flatMap((item) => {
    const slug = item?.slug?.trim();
    if (!item || !slug || !item.title.trim()) {
      return [];
    }
    return [{ ...parseCarCollection(item), title: item.title.trim(), slug, icon: item.icon || null, landing: item.landingPage?.documentId ?? null }];
  });
}

/**
 * Where a collection's shortcut leads: its landing page when that page has a
 * URL in this language (published, routable), else the fleet filtered to the
 * collection. So a landing written in Polish only never sends a Ukrainian
 * visitor to a 404.
 */
export function fleetCollectionHref(lang: Lang, collection: Pick<FleetCollection, "slug" | "landing">, routes: readonly PageRoute[]): string {
  const landing = collection.landing ? routes.find((route) => route.documentId === collection.landing) : undefined;
  return landing ? pageHref(lang, landing.segments) : `${fleetHref(lang)}?${new URLSearchParams({ [COLLECTION_KEY]: collection.slug })}`;
}

function logFailure(lang: Lang, error: unknown): void {
  const code = error instanceof StrapiError ? error.code : "unexpected";
  console.error(`[strapi] fleet collections (${lang}) unavailable, menu without them: ${code}`);
}
