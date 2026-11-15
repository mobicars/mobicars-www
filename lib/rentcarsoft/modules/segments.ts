import { collectSegments, type RcsSegment } from "../internal/entities";
import { RCS_LANGUAGE_IDS } from "../internal/labels";
import { listAllOffers } from "./offers";

/**
 * The car classes (price segments) that have cars, for the CMS: the stable
 * `segmentId` editors store, its name in each site language, how many cars it
 * has and whether it is offered by the day and by the month. Built from the
 * offer lists (cached as `rcs:catalog`), so no extra RentCarSoft call per CMS
 * request: four by-the-day lists (one per language) and one monthly list.
 */
export async function listSegments(): Promise<RcsSegment[]> {
  const langs = Object.keys(RCS_LANGUAGE_IDS) as (keyof typeof RCS_LANGUAGE_IDS)[];
  const [byDay, byMonth] = await Promise.all([
    Promise.all(langs.map(async (lang) => [lang, await listAllOffers({ lang, term: "short" })] as const)),
    listAllOffers({ lang: "pl", term: "long" }),
  ]);
  return collectSegments(Object.fromEntries(byDay), byMonth);
}
