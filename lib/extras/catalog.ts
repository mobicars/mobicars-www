import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { Lang } from "@/i18n/config";
import { carSlug } from "@/lib/fleet/slug";
import { sanitizeDescription } from "@/lib/fleet/sanitize";
import { cacheEnabled } from "@/lib/cache";
import { CACHE_TAGS, listAccessories, listAddons, listAllOffers, type Extra, type ExtraPresentation } from "@/lib/rentcarsoft";

/** RentCarSoft's `additionalType`, the group the booking and the old site use. Unknown types count as `other`. */
export const EXTRA_GROUPS = ["protection", "border", "kids", "multimedia", "other"] as const;
export type ExtraGroup = (typeof EXTRA_GROUPS)[number];
const GROUP_OF_TYPE: Record<number, ExtraGroup> = { 1: "protection", 4: "border", 2: "kids", 3: "multimedia", 0: "other" };

/** Add-ons shown nowhere on the site, by RentCarSoft id. Set here until the CMS has a template for them. */
const HIDDEN: ReadonlySet<number> = new Set<number>([]);

/**
 * One add-on or accessory of the catalog, for the list section and its page.
 * Variants RentCarSoft keeps per class, fuel or term ("Pełny Bak na Start
 * (Gaz)", "Strefa 1 (długoterminowy)") are one entry under the shared name:
 * the lowest id, the other ids in `variants` (their pages
 * redirect to this one).
 */
export type CatalogExtra = {
  id: number;
  slug: string;
  name: string;
  group: ExtraGroup;
  image: string | null;
  /** Sanitized HTML from RentCarSoft, or `null`. */
  description: string | null;
  /** Protection packages: the excess per damage, as in the booking. */
  presentation: ExtraPresentation | null;
  variants: number[];
  /** Price segments (RentCarSoft price lists) that offer it or one of its variants. */
  segmentIds: string[];
};

/** One add-on as RentCarSoft lists it for a price segment (`null`: the list without a segment). */
type SegmentExtra = Extra & { segmentId: string | null };

/** The bracketed variant note dropped: "Pełny Bak na Start (Gaz)" → "Pełny Bak na Start". */
export function baseName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*$/, "").replace(/\s+/g, " ").trim();
}

/**
 * Every add-on and accessory in `lang`, grouped by `EXTRA_GROUPS` and sorted
 * by name within a group, variants merged. The lists are read per price
 * segment too, as RentCarSoft offers some add-ons only for some segments (the
 * EV chargers), so each entry knows its segments. No price: it depends on the
 * segment and the dates, so the booking shows it. The merged catalog is
 * cached as one entry with the catalog (`rcs:catalog`), so the list section,
 * the add-on pages and every car page share it: one RentCarSoft call per
 * segment and list when the cache is cold, none after.
 */
export async function listCatalogExtras(lang: Lang): Promise<CatalogExtra[]> {
  return cacheEnabled() ? cachedCatalogExtras(lang) : loadCatalogExtras(lang);
}

async function cachedCatalogExtras(lang: Lang): Promise<CatalogExtra[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.catalog);
  return loadCatalogExtras(lang);
}

async function loadCatalogExtras(lang: Lang): Promise<CatalogExtra[]> {
  const offers = await listAllOffers({ lang, term: "short" });
  const segments = [...new Set(offers.map((offer) => offer.segmentId).filter((id): id is string => Boolean(id)))];
  const lists = await Promise.all(
    [null, ...segments].map(async (segmentId) => {
      const query = { lang, ...(segmentId ? { priceSegmentIds: [Number(segmentId)] } : {}) };
      const [addons, accessories] = await Promise.all([listAddons(query), listAccessories(query)]);
      return [...addons, ...accessories].map((extra): SegmentExtra => ({ ...extra, segmentId }));
    }),
  );
  return mergeExtras(lists.flat(), lang);
}

/** The catalog entry an id belongs to (itself or one of its variants), or `null`. */
export async function findCatalogExtra(lang: Lang, id: number): Promise<CatalogExtra | null> {
  return (await listCatalogExtras(lang)).find((extra) => extra.id === id || extra.variants.includes(id)) ?? null;
}

/**
 * The add-ons RentCarSoft offers with a car's price segment (the EV chargers
 * only with an electric car), in the catalog's order. None without a segment.
 */
export function segmentExtras(extras: readonly CatalogExtra[], segmentId: string | null): CatalogExtra[] {
  return segmentId ? extras.filter((extra) => extra.segmentIds.includes(segmentId)) : [];
}

export function mergeExtras(raw: readonly SegmentExtra[], lang: Lang): CatalogExtra[] {
  const byKey = new Map<string, SegmentExtra[]>();
  for (const extra of raw) {
    if (HIDDEN.has(extra.id) || !extra.name.trim()) continue;
    const key = `${groupOf(extra)}|${baseName(extra.name).toLowerCase()}`;
    byKey.set(key, [...(byKey.get(key) ?? []), extra]);
  }
  const merged = [...byKey.values()].map((variants): CatalogExtra => {
    // The same id comes once per segment; the lowest id is the entry, the others its variants.
    const sorted = [...variants].sort((left, right) => left.id - right.id);
    const main = sorted[0];
    const name = baseName(main.name);
    const described = sorted.find((extra) => extra.description?.trim());
    return {
      id: main.id,
      slug: carSlug(name, main.id),
      name,
      group: groupOf(main),
      image: sorted.find((extra) => extra.image)?.image ?? null,
      description: described?.description ? sanitizeDescription(described.description) || null : null,
      presentation: main.presentation,
      variants: [...new Set(sorted.map((extra) => extra.id))].filter((id) => id !== main.id),
      segmentIds: [...new Set(sorted.flatMap((extra) => (extra.segmentId ? [extra.segmentId] : [])))],
    };
  });
  const order = (extra: CatalogExtra) => EXTRA_GROUPS.indexOf(extra.group);
  return merged.sort((left, right) => order(left) - order(right) || left.name.localeCompare(right.name, lang));
}

function groupOf(extra: Extra): ExtraGroup {
  return GROUP_OF_TYPE[extra.type ?? 0] ?? "other";
}
