import { cacheLife, cacheTag } from "next/cache";

import { parseExtra, parseExtras, type Extra } from "../internal/entities";
import { rentCarSoftRequest } from "../internal/http";
import { CACHE_TAGS } from "../internal/labels";
import {
  buildExtrasQuery,
  isCatalogExtrasQuery,
  type ExtrasQueryInput,
  type QueryParams,
} from "../internal/params";

export async function listAddons(input: ExtrasQueryInput = {}): Promise<Extra[]> {
  const query = buildExtrasQuery(input, "clients");
  if (isCatalogExtrasQuery(input)) {
    return loadCachedAddons(query);
  }
  return loadAddons(query);
}

export async function getAddon(
  id: number,
  input: Pick<ExtrasQueryInput, "lang" | "pickUpDate" | "returnDate" | "promoCode"> = {},
): Promise<Extra> {
  const query = buildExtrasQuery(input, "clients");
  if (isCatalogExtrasQuery(input)) {
    return loadCachedAddon(id, query);
  }
  return loadAddon(id, query);
}

export async function listAccessories(
  input: ExtrasQueryInput = {},
): Promise<Extra[]> {
  const query = buildExtrasQuery(input, "customers");
  if (isCatalogExtrasQuery(input)) {
    return loadCachedAccessories(query);
  }
  return loadAccessories(query);
}

export async function getAccessory(
  id: number,
  input: Pick<ExtrasQueryInput, "lang" | "pickUpDate" | "returnDate" | "promoCode"> = {},
): Promise<Extra> {
  const query = buildExtrasQuery(input, "customers");
  if (isCatalogExtrasQuery(input)) {
    return loadCachedAccessory(id, query);
  }
  return loadAccessory(id, query);
}

async function loadCachedAddons(query: QueryParams): Promise<Extra[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.catalog);
  return loadAddons(query);
}

async function loadCachedAddon(id: number, query: QueryParams): Promise<Extra> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.catalog);
  return loadAddon(id, query);
}

async function loadCachedAccessories(query: QueryParams): Promise<Extra[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.catalog);
  return loadAccessories(query);
}

async function loadCachedAccessory(
  id: number,
  query: QueryParams,
): Promise<Extra> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.catalog);
  return loadAccessory(id, query);
}

async function loadAddons(query: QueryParams): Promise<Extra[]> {
  return parseExtras(
    await rentCarSoftRequest({ path: "/addons.json", query }),
  );
}

async function loadAddon(id: number, query: QueryParams): Promise<Extra> {
  return parseExtra(
    await rentCarSoftRequest({ path: `/addon/${id}.json`, query }),
  );
}

async function loadAccessories(query: QueryParams): Promise<Extra[]> {
  return parseExtras(
    await rentCarSoftRequest({ path: "/accessories.json", query }),
  );
}

async function loadAccessory(id: number, query: QueryParams): Promise<Extra> {
  return parseExtra(
    await rentCarSoftRequest({ path: `/accessory/${id}.json`, query }),
  );
}
