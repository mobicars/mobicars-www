import { cacheLife, cacheTag } from "next/cache";

import type { Lang } from "@/i18n/config";
import { cacheEnabled } from "@/lib/cache";

import { PlaceLinksDocument, type PlaceLinksQuery } from "../generated/graphql";
import { contentStatus } from "../internal/config";
import { StrapiError } from "../internal/errors";
import { strapiRequest } from "../internal/http";
import { pageHref } from "../internal/routes";
import { CACHE_TAGS } from "../internal/tags";
import { placeSegments } from "./places";

export type PlaceLink = { label: string; href: string };

/**
 * Links to the city, airport and local pages of one language, for the footer's
 * link groups: only the pages that language has, sorted by label. The label is
 * the page's `shortName` ("Kraków Balice"), else its title. A city page is an
 * airport when its `kind` says so. Empty lists when Strapi fails: the footer
 * then shows no groups, the page still renders.
 */
export type PlaceLinks = { cities: PlaceLink[]; airports: PlaceLink[]; locals: PlaceLink[] };

const EMPTY: PlaceLinks = { cities: [], airports: [], locals: [] };

export async function listPlaceLinks(lang: Lang): Promise<PlaceLinks> {
  return cacheEnabled() ? loadCachedLinks(lang) : loadLinks(lang);
}

async function loadCachedLinks(lang: Lang): Promise<PlaceLinks> {
  "use cache";
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.type("city"), CACHE_TAGS.type("local-page"));
  try {
    return parsePlaceLinks(await strapiRequest(PlaceLinksDocument, { locale: lang, status: contentStatus() }), lang);
  } catch (error) {
    logFailure(lang, error);
    cacheLife({ stale: 30, revalidate: 30, expire: 60 });
    return EMPTY;
  }
}

async function loadLinks(lang: Lang): Promise<PlaceLinks> {
  try {
    return parsePlaceLinks(await strapiRequest(PlaceLinksDocument, { locale: lang, status: contentStatus() }), lang);
  } catch (error) {
    logFailure(lang, error);
    return EMPTY;
  }
}

/** Sorted links; entries without a slug or a label are left out. */
export function parsePlaceLinks(raw: PlaceLinksQuery, lang: Lang): PlaceLinks {
  const sort = (links: PlaceLink[]) => links.sort((a, b) => a.label.localeCompare(b.label, lang));
  const link = (kind: "city" | "local", slug: string, label: string): PlaceLink[] =>
    slug && label ? [{ label, href: pageHref(lang, placeSegments(kind, lang, slug)) }] : [];
  const cities: PlaceLink[] = [];
  const airports: PlaceLink[] = [];
  for (const city of raw.cities) {
    if (!city) continue;
    const entry = link("city", city.slug ?? "", (city.shortName || city.title || "").trim());
    (city.kind === "airport" ? airports : cities).push(...entry);
  }
  const locals = raw.localPages.flatMap((page) => (page ? link("local", page.slug ?? "", (page.shortName || page.title || "").trim()) : []));
  return { cities: sort(cities), airports: sort(airports), locals: sort(locals) };
}

function logFailure(lang: Lang, error: unknown): void {
  const code = error instanceof StrapiError ? error.code : "unexpected";
  console.error(`[strapi] place links (${lang}) unavailable, footer without them: ${code}`);
}
