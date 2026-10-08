import { cacheLife, cacheTag } from "next/cache";

import { parseOffer, parseOffers, type Offer } from "../internal/entities";
import { RentCarSoftError } from "../internal/errors";
import { rentCarSoftRequest } from "../internal/http";
import { CACHE_TAGS } from "../internal/labels";
import {
  buildOfferQuery,
  isCatalogOfferQuery,
  type OfferListInput,
  type QueryParams,
} from "../internal/params";
import { listOfferKeys } from "./catalog";

const MAX_OFFER_PAGES = 20;

/** One page of offers. `page` starts at 0. Walk the catalog with `listAllOffers`. */
export async function listOffers(input: OfferListInput = {}): Promise<Offer[]> {
  const query = buildOfferQuery(input);
  if (isCatalogOfferQuery(input)) {
    return loadCachedOffers(query);
  }
  return loadOffers(query);
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
  if (isCatalogOfferQuery(input)) {
    return loadCachedOffer(id, query);
  }
  return loadOffer(id, query);
}

async function loadCachedOffers(query: QueryParams): Promise<Offer[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.catalog);
  return loadOffers(query);
}

async function loadCachedOffer(id: number, query: QueryParams): Promise<Offer> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.catalog);
  return loadOffer(id, query);
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
