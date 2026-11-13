import { cacheLife, cacheTag } from "next/cache";

import { listPriceGroupKeys } from "./catalog";
import { parsePriceGroup, parsePriceGroups, type PriceGroup } from "../internal/entities";
import { rentCarSoftRequest } from "../internal/http";
import { CACHE_TAGS } from "../internal/labels";
import { cacheEnabled } from "../../cache";

export async function listPriceGroups(input: {
  lang?: string;
  keyIds?: number[];
} = {}): Promise<PriceGroup[]> {
  const lang = input.lang ?? "pl";
  const keyIds = input.keyIds ?? [1];
  return cacheEnabled() ? loadCachedPriceGroups(lang, keyIds) : loadPriceGroups(lang, keyIds);
}

export async function getPriceGroup(
  id: number,
  lang = "pl",
): Promise<PriceGroup> {
  return cacheEnabled() ? loadCachedPriceGroup(id, lang) : loadPriceGroup(id, lang);
}

async function loadCachedPriceGroups(lang: string, keyIds: number[]): Promise<PriceGroup[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.catalog);
  return loadPriceGroups(lang, keyIds);
}

async function loadCachedPriceGroup(id: number, lang: string): Promise<PriceGroup> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.catalog);
  return loadPriceGroup(id, lang);
}

async function loadPriceGroups(
  lang: string,
  keyIds: number[],
): Promise<PriceGroup[]> {
  const [payload, definitions] = await Promise.all([
    rentCarSoftRequest({
      path: "/price_groups.json",
      query: { lang, keys: keyIds },
    }),
    listPriceGroupKeys(lang),
  ]);
  return parsePriceGroups(payload, definitions);
}

async function loadPriceGroup(id: number, lang: string): Promise<PriceGroup> {
  const [payload, definitions] = await Promise.all([
    rentCarSoftRequest({
      path: `/price_group/${id}.json`,
      query: { lang },
    }),
    listPriceGroupKeys(lang),
  ]);
  return parsePriceGroup(payload, definitions);
}
