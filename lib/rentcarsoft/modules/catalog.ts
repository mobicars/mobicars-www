import { cacheLife, cacheTag } from "next/cache";

import { parseCurrencies, parseLanguages, parsePaymentTypes } from "../internal/entities";
import { rentCarSoftRequest } from "../internal/http";
import { CACHE_TAGS } from "../internal/labels";
import { parseKeyDefinitions } from "../internal/parse";
import { isProduction } from "../../env";

export async function listLanguages() {
  if (!isProduction()) {
    return parseLanguages(await rentCarSoftRequest({ path: "/languages.json" }));
  }
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
  if (!isProduction()) {
    return parseCurrencies(await rentCarSoftRequest({ path: "/currencies.json" }));
  }
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
  if (!isProduction()) {
    return parsePaymentTypes(await rentCarSoftRequest({ path: "/payment_types.json" }));
  }
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
  if (!isProduction()) {
    return parseKeyDefinitions(
      await rentCarSoftRequest({
        path: "/offer_keys.json",
        query: { lang },
      }),
    );
  }
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
  if (!isProduction()) {
    return parseKeyDefinitions(
      await rentCarSoftRequest({
        path: "/service_point_keys.json",
        query: { lang },
      }),
    );
  }
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
  if (!isProduction()) {
    return parseKeyDefinitions(
      await rentCarSoftRequest({
        path: "/client_keys.json",
        query: { lang },
      }),
    );
  }
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
  if (!isProduction()) {
    return parseKeyDefinitions(
      await rentCarSoftRequest({
        path: "/price_group_keys.json",
        query: { lang },
      }),
    );
  }
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
