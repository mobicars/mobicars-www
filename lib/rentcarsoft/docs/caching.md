# Caching

`cacheComponents` is enabled in `next.config.ts`. Cached reads use `use cache`, `cacheLife`, and `cacheTag` from `next/cache`.

Cache identity is the cached function plus its arguments: language, ids, key lists, filters, page, and page size. The API key is read inside the request helper and is not an argument. Do not close a cached function over a customer id, a date, or a promo code that is not already an argument of that function.

`fetch` is called with `cache: "no-store"`. The `use cache` result is the cache. Realtime functions do not use `use cache` at all. A dated search is cached only briefly (see below).

## Switch

Every cached read goes through `cacheEnabled()` from `lib/cache.ts`, which reads `CACHE_ENABLED` (on unless `false`, `0` or `off`). With caching off every function below calls the API directly. The site's domain no longer decides this.

## Cached

Every cached function is tagged `rcs` (`CACHE_TAGS.all`) and one of the tags below.

| Function | Profile | Tag | Cached when |
| --- | --- | --- | --- |
| `listLanguages`, `listCurrencies`, key dictionaries | `days` | `rcs:keys` | always |
| `listPaymentTypes` | `hours` | `rcs:catalog` | always |
| `listDepartments`, `getDepartment` | `hours` | `rcs:catalog` | always |
| `listPriceGroups`, `getPriceGroup` | `hours` | `rcs:catalog` | always |
| `listServicePoints`, `getServicePoint` | `hours` | `rcs:catalog` | always; active filtering happens after the read |
| `listOffers`, `getOffer` | `hours` | `rcs:catalog` | no pickup date, return date, promo code, `onlyAvailable`, `onlyAvailableAtLocation`, or `longTermQuote` |
| `listOffers`, `getOffer` | `SEARCH_CACHE_LIFE` | `rcs:search` | any of those (a dated search) |
| `listAddons`, `getAddon`, `listAccessories`, `getAccessory` | `hours` | `rcs:catalog` | no dates, promo code, or client ids |
| `listAddons`, `getAddon`, `listAccessories`, `getAccessory` | `SEARCH_CACHE_LIFE` | `rcs:search` | dates or a promo code, no client ids |

`SEARCH_CACHE_LIFE` (`internal/labels.ts`) keeps a dated search for at most two minutes (`revalidate` 60 s, `expire` 120 s). The booking steps and the back button ask for the same search again and again; two minutes covers that, and availability and prices are never older than that. The search is the key: pickup point, dates and hours, code, language. Two visitors rarely share one, so this cache is per-visitor in practice. It stays in the default in-memory handler; a remote handler would write almost every search and read few of them back.

`listAllOffers` is not itself cached. Each page it requests is cached through `listOffers`.

Tags are exported as `CACHE_TAGS`.

## Expiring on demand

After a change in RentCarSoft, `POST /api/revalidate` (`lib/revalidate.ts`) with the header `Authorization: Bearer <REVALIDATE_SECRET>` expires cached reads at once:

- `{"tags":["rcs:catalog"]}`: cars, extras, service points (any `CACHE_TAGS` value is accepted, `rcs` for all of RentCarSoft),
- `{"event":"purge"}`: every RentCarSoft tag together with the CMS.

## Not cached

- `calculateReservation`
- `verifyPromoCode`
- `createReservation`
- `loginClient`, `getClient`, password recovery, client reservations
- Addon and accessory reads with client ids (client-specific prices)

Price groups are base price lists. They are not a reservation quote.

## Why long-term quotes are searches

`longTermQuote` changes `calculatedPrice` on the live offer list even when no pickup date is sent. That is current pricing, so it gets the short search cache, not the catalog's hours.
