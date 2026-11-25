import { cacheLife, cacheTag } from "next/cache";

import { parseOffer, parseOffers, type Offer } from "../internal/entities";
import { RentCarSoftError, type RentCarSoftErrorCode } from "../internal/errors";
import { rentCarSoftRequest } from "../internal/http";
import { CACHE_TAGS, SEARCH_CACHE_LIFE } from "../internal/labels";
import {
  buildOfferQuery,
  isCatalogOfferQuery,
  type OfferListInput,
  type QueryParams,
} from "../internal/params";
import { listOfferKeys } from "./catalog";
import { cacheEnabled } from "../../cache";

const MAX_OFFER_PAGES = 20;

/** One page of offers. `page` starts at 0. Walk the catalog with `listAllOffers`. */
export async function listOffers(input: OfferListInput = {}): Promise<Offer[]> {
  const query = buildOfferQuery(input);
  if (!cacheEnabled()) {
    return loadOffers(query);
  }
  return isCatalogOfferQuery(input) ? loadCachedOffers(query) : loadSearchedOffers(query);
}

/**
 * Walks offer pages until a short page.
 * Throws `RentCarSoftError` with code `api` after 20 full pages.
 */
export async function listAllOffers(
  input: Omit<OfferListInput, "page"> = {},
): Promise<Offer[]> {
  const perPage = input.perPage ?? 100;
  const offers: Offer[] = [];

  for (let page = 0; page < MAX_OFFER_PAGES; page += 1) {
    const batch = await listOffers({ ...input, page, perPage });
    offers.push(...batch);
    if (batch.length < perPage) {
      return offers;
    }
  }

  throw new RentCarSoftError(
    "api",
    undefined,
    "RentCarSoft offer list exceeded the page limit.",
  );
}

export async function getOffer(
  id: number,
  input: Omit<OfferListInput, "page" | "perPage"> = {},
): Promise<Offer> {
  const query = buildOfferQuery({ ...input, page: undefined, perPage: undefined });
  delete query.page;
  delete query.perPage;
  delete query.order;
  if (!cacheEnabled()) {
    return loadOffer(id, query);
  }
  return isCatalogOfferQuery(input) ? loadCachedOffer(id, query) : loadSearchedOffer(id, query);
}

async function loadCachedOffers(query: QueryParams): Promise<Offer[]> {
  return outcome(await cachedOffers(query));
}

async function cachedOffers(query: QueryParams): Promise<Outcome<Offer[]>> {
  "use cache";
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.catalog);
  return settle(() => loadOffers(query), "hours");
}

async function loadCachedOffer(id: number, query: QueryParams): Promise<Offer> {
  return outcome(await cachedOffer(id, query));
}

async function cachedOffer(id: number, query: QueryParams): Promise<Outcome<Offer>> {
  "use cache";
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.catalog);
  return settle(() => loadOffer(id, query), "hours");
}

/** Dates, a code, availability or a long-term quote: `SEARCH_CACHE_LIFE`. */
async function loadSearchedOffers(query: QueryParams): Promise<Offer[]> {
  return outcome(await searchedOffers(query));
}

async function searchedOffers(query: QueryParams): Promise<Outcome<Offer[]>> {
  "use cache";
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.search);
  return settle(() => loadOffers(query), SEARCH_CACHE_LIFE);
}

async function loadSearchedOffer(id: number, query: QueryParams): Promise<Offer> {
  return outcome(await searchedOffer(id, query));
}

async function searchedOffer(id: number, query: QueryParams): Promise<Outcome<Offer>> {
  "use cache";
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.search);
  return settle(() => loadOffer(id, query), SEARCH_CACHE_LIFE);
}

/**
 * What a cached read hands back. An error thrown inside `use cache` reaches
 * the caller as a plain `Error`, without the `RentCarSoftError` class or
 * code, so callers could not tell an unknown id from an outage. The cached
 * scope returns the code and `outcome` throws the error again outside it.
 */
type Outcome<T> = { value: T } | { error: RentCarSoftErrorCode; status?: number };

/**
 * Runs a read inside a cached scope with `life` for a result. A RentCarSoft
 * error is kept briefly: an unknown id for minutes, so repeated visits do not
 * ask again, any other failure for seconds. Other errors are not cached.
 */
async function settle<T>(read: () => Promise<T>, life: "hours" | typeof SEARCH_CACHE_LIFE): Promise<Outcome<T>> {
  try {
    const value = await read();
    if (life === "hours") {
      cacheLife("hours");
    } else {
      cacheLife(life);
    }
    return { value };
  } catch (error) {
    if (!(error instanceof RentCarSoftError)) {
      throw error;
    }
    if (error.code === "not_found") {
      cacheLife("minutes");
    } else {
      cacheLife("seconds");
    }
    return { error: error.code, ...(error.status !== undefined ? { status: error.status } : {}) };
  }
}

function outcome<T>(result: Outcome<T>): T {
  if ("error" in result) {
    throw new RentCarSoftError(result.error, result.status);
  }
  return result.value;
}

async function loadOffers(query: QueryParams): Promise<Offer[]> {
  const [payload, definitions] = await Promise.all([
    rentCarSoftRequest({ path: "/offers.json", query }),
    listOfferKeys(typeof query.lang === "string" ? query.lang : "pl"),
  ]);
  return parseOffers(payload, definitions);
}

async function loadOffer(id: number, query: QueryParams): Promise<Offer> {
  const [payload, definitions] = await Promise.all([
    rentCarSoftRequest({ path: `/offer/${id}.json`, query }),
    listOfferKeys(typeof query.lang === "string" ? query.lang : "pl"),
  ]);
  return parseOffer(payload, definitions);
}
