import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";

import type { Lang } from "@/i18n/config";
import { cacheEnabled } from "@/lib/cache";
import { CACHE_TAGS, listAllOffers } from "@/lib/rentcarsoft";
import { reservationConfig } from "@/lib/reservation/config";

/**
 * The real monthly "from" price of each car: the lowest monthly price the
 * long-term calculator quotes for it over every rental length the site offers
 * (`longTermMonthCounts`) with the smallest kilometre package. This is a price
 * a customer can book; the catalog's `monthly_price` is not (1500 against a
 * quoted 1900 for the Aygo on 13 November 2026, `redesign/rcs-analysis.md`).
 *
 * One calculator list per rental length (9 requests), shared by every page
 * and language; the result is cached like the catalog (`rcs:catalog`,
 * `hours`) when the cache is on, so the bridge's 2-minute quote cache does not
 * change. Cars without a quote for any length are missing from the map.
 */
export type MonthlyFrom = {
  price: number;
  /** The rental length of that price, the shortest one when several tie. */
  months: number;
  /** Kilometres a month included in that price. */
  kmPerMonth: number;
};

/** Once per request: the car page needs it for the car and for the similar cars. */
export const monthlyPricesFrom = cache(async (lang: Lang): Promise<Map<number, MonthlyFrom>> => {
  const prices = cacheEnabled() ? await loadCached(lang) : await load(lang);
  return new Map(prices);
});

async function loadCached(lang: Lang): Promise<[number, MonthlyFrom][]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.catalog);
  return load(lang);
}

/** Entries, not a `Map`: the cached value must be plain data. */
async function load(lang: Lang): Promise<[number, MonthlyFrom][]> {
  const kmPerMonth = Math.min(...reservationConfig.kilometerLimits);
  const lists = await Promise.all(
    reservationConfig.longTermMonthCounts.map(async (months) => ({
      months,
      offers: await listAllOffers({ lang, longTermQuote: { months, monthlyKmLimit: kmPerMonth }, offerKeyIds: [1] }),
    })),
  );
  const best = new Map<number, MonthlyFrom>();
  for (const { months, offers } of lists) {
    for (const offer of offers) {
      const price = offer.monthlyPrice;
      if (price === null || price <= 0) {
        continue;
      }
      const current = best.get(offer.id);
      if (!current || price < current.price || (price === current.price && months < current.months)) {
        best.set(offer.id, { price, months, kmPerMonth });
      }
    }
  }
  return [...best];
}
