import { cacheLife, cacheTag } from "next/cache";

import { parseExtra, parseExtras, type Extra } from "../internal/entities";
import { rentCarSoftRequest } from "../internal/http";
import { CACHE_TAGS, SEARCH_CACHE_LIFE } from "../internal/labels";
import {
  buildExtrasQuery,
  isCatalogExtrasQuery,
  type ExtrasQueryInput,
  type QueryParams,
} from "../internal/params";
import { cacheEnabled } from "../../cache";

type Cache = "catalog" | "search" | "none";

/**
 * Undated reads are the catalog; dates or a code make it a search, cached
 * briefly. Client-specific prices are never cached.
 */
function cacheFor(input: ExtrasQueryInput): Cache {
  if (!cacheEnabled() || input.clientIds?.length) {
    return "none";
  }
  return isCatalogExtrasQuery(input) ? "catalog" : "search";
}

export async function listAddons(input: ExtrasQueryInput = {}): Promise<Extra[]> {
  const query = buildExtrasQuery(input, "clients");
  const cache = cacheFor(input);
  if (cache === "catalog") {
    return loadCachedAddons(query);
  }
  return cache === "search" ? loadSearchedAddons(query) : loadAddons(query);
}

export async function getAddon(
  id: number,
  input: Pick<ExtrasQueryInput, "lang" | "pickUpDate" | "returnDate" | "promoCode"> = {},
): Promise<Extra> {
  const query = buildExtrasQuery(input, "clients");
  const cache = cacheFor(input);
  if (cache === "catalog") {
    return loadCachedAddon(id, query);
  }
  return cache === "search" ? loadSearchedAddon(id, query) : loadAddon(id, query);
}

export async function listAccessories(
  input: ExtrasQueryInput = {},
): Promise<Extra[]> {
  const query = buildExtrasQuery(input, "customers");
  const cache = cacheFor(input);
  if (cache === "catalog") {
    return loadCachedAccessories(query);
  }
  return cache === "search" ? loadSearchedAccessories(query) : loadAccessories(query);
}

export async function getAccessory(
  id: number,
  input: Pick<ExtrasQueryInput, "lang" | "pickUpDate" | "returnDate" | "promoCode"> = {},
): Promise<Extra> {
  const query = buildExtrasQuery(input, "customers");
  const cache = cacheFor(input);
  if (cache === "catalog") {
    return loadCachedAccessory(id, query);
  }
  return cache === "search" ? loadSearchedAccessory(id, query) : loadAccessory(id, query);
}

async function loadCachedAddons(query: QueryParams): Promise<Extra[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.catalog);
  return loadAddons(query);
}

async function loadCachedAddon(id: number, query: QueryParams): Promise<Extra> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.catalog);
  return loadAddon(id, query);
}

async function loadCachedAccessories(query: QueryParams): Promise<Extra[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.catalog);
  return loadAccessories(query);
}

async function loadCachedAccessory(
  id: number,
  query: QueryParams,
): Promise<Extra> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.catalog);
  return loadAccessory(id, query);
}

async function loadSearchedAddons(query: QueryParams): Promise<Extra[]> {
  "use cache";
  cacheLife(SEARCH_CACHE_LIFE);
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.search);
  return loadAddons(query);
}

async function loadSearchedAddon(id: number, query: QueryParams): Promise<Extra> {
  "use cache";
  cacheLife(SEARCH_CACHE_LIFE);
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.search);
  return loadAddon(id, query);
}

async function loadSearchedAccessories(query: QueryParams): Promise<Extra[]> {
  "use cache";
  cacheLife(SEARCH_CACHE_LIFE);
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.search);
  return loadAccessories(query);
}

async function loadSearchedAccessory(id: number, query: QueryParams): Promise<Extra> {
  "use cache";
  cacheLife(SEARCH_CACHE_LIFE);
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.search);
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
