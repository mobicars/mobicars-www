# Caching

`cacheComponents` is enabled in `next.config.ts`. Cached reads use `use cache`, `cacheLife`, and `cacheTag` from `next/cache`.

Cache identity is the cached function plus its arguments: language, ids, key lists, filters, page, and page size. The API key is read inside the request helper and is not an argument. Do not close a cached function over a customer id, a date, or a promo code that is not already an argument of that function.

`fetch` is called with `cache: "no-store"`. The `use cache` result is the cache. Realtime functions do not use `use cache` at all.

## Cached

| Function | Profile | Tag | Cached only when |
| --- | --- | --- | --- |
| `listLanguages`, `listCurrencies`, key dictionaries | `days` | `rcs:keys` | always |
| `listPaymentTypes` | `hours` | `rcs:catalog` | always |
| `listDepartments`, `getDepartment` | `hours` | `rcs:catalog` | always |
| `listPriceGroups`, `getPriceGroup` | `hours` | `rcs:catalog` | always |
| `listServicePoints`, `getServicePoint` | `hours` | `rcs:catalog` | always; active filtering happens after the read |
| `listOffers`, `getOffer` | `hours` | `rcs:catalog` | no pickup date, return date, promo code, `onlyAvailable`, or `longTermQuote` |
| `listAddons`, `getAddon`, `listAccessories`, `getAccessory` | `hours` | `rcs:catalog` | no dates, promo code, or client ids |

`listAllOffers` is not itself cached. Each catalog page it requests is cached through `listOffers`.

Tags are exported as `CACHE_TAGS`.

## Not cached

- `calculateReservation`
- `verifyPromoCode`
- `createReservation`
- `loginClient`, `getClient`, password recovery
- Offer and extra reads that include dates, a promo code, availability, a long-term quote, or client ids

Price groups are base price lists. They are not a reservation quote.

## Why long-term quotes are uncached

`longTermQuote` changes `calculatedPrice` on the live offer list even when no pickup date is sent. That is current pricing, so the page is loaded with the uncached function.
