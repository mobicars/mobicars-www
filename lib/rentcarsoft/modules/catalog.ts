import { cacheLife, cacheTag } from "next/cache";

import { parseCurrencies, parseLanguages, parsePaymentTypes } from "../internal/entities";
import { rentCarSoftRequest } from "../internal/http";
import { CACHE_TAGS } from "../internal/labels";
import { parseKeyDefinitions } from "../internal/parse";

export async function listLanguages() {
  return loadLanguages();
}

async function loadLanguages() {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.keys);
  return parseLanguages(
    await rentCarSoftRequest({ path: "/languages.json" }),
  );
}

export async function listCurrencies() {
  return loadCurrencies();
}

async function loadCurrencies() {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.keys);
  return parseCurrencies(
    await rentCarSoftRequest({ path: "/currencies.json" }),
  );
}

export async function listPaymentTypes() {
  return loadPaymentTypes();
}

async function loadPaymentTypes() {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.catalog);
  return parsePaymentTypes(
    await rentCarSoftRequest({ path: "/payment_types.json" }),
  );
}

export async function listOfferKeys(lang = "pl") {
  return loadOfferKeys(lang);
}

async function loadOfferKeys(lang: string) {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.keys);
  return parseKeyDefinitions(
    await rentCarSoftRequest({
      path: "/offer_keys.json",
      query: { lang },
    }),
  );
}

export async function listServicePointKeys(lang = "pl") {
  return loadServicePointKeys(lang);
}

async function loadServicePointKeys(lang: string) {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.keys);
  return parseKeyDefinitions(
    await rentCarSoftRequest({
      path: "/service_point_keys.json",
      query: { lang },
    }),
  );
}

export async function listClientKeys(lang = "pl") {
  return loadClientKeys(lang);
}

async function loadClientKeys(lang: string) {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.keys);
  return parseKeyDefinitions(
    await rentCarSoftRequest({
      path: "/client_keys.json",
      query: { lang },
    }),
  );
}

export async function listPriceGroupKeys(lang = "pl") {
  return loadPriceGroupKeys(lang);
}

async function loadPriceGroupKeys(lang: string) {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.keys);
  return parseKeyDefinitions(
    await rentCarSoftRequest({
      path: "/price_group_keys.json",
      query: { lang },
    }),
  );
}
