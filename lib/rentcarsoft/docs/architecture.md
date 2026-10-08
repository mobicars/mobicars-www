# Architecture

The bridge lives in `mobicars-www/lib/rentcarsoft`. Application code imports `@/lib/rentcarsoft`. HTTP, configuration, and query serialization stay inside the package.

## Layout

| Path | Role |
| --- | --- |
| `index.ts` | Public exports. Imports `server-only`. |
| `README.md` | How to call the bridge. |
| `rentcarsoft.test.ts` | `node:test` coverage for the package. |
| `docs/` | Architecture, quirks, caching, errors, coverage. |
| `modules/` | Public capabilities: catalog, offers, locations, price groups, extras, pricing, reservations, clients. |
| `internal/` | HTTP, config, query, params, errors, dates, labels, parse, entities. Not imported by the app. |

## Internal files

| File | Role |
| --- | --- |
| `config.ts` | Reads `RCS_URL` and `RCS_KEY`. |
| `http.ts` | `fetch`, bearer auth, timeout, status mapping. |
| `query.ts` | Query-string serializer. |
| `params.ts` | Request objects for offers, quotes, reservations, accounts, extras. |
| `errors.ts` | `RentCarSoftError`. |
| `dates.ts` | Local `YYYY-MM-DD` and `YYYY-MM-DD HH:mm`. |
| `labels.ts` | Stable field names and verified select ids. |
| `parse.ts` | Narrowing, promo and client normalization. |
| `entities.ts` | Domain records parsed from API JSON. |

There is no second long-term client. `term` and `longTermQuote` are arguments.

## Request path

1. A public function in `modules/` builds a plain query or JSON body in `internal/params.ts`.
2. Catalog functions that are safe to cache call a nested function marked `use cache`.
3. `rentCarSoftRequest` reads configuration, sends the request, and returns `unknown` or throws.
4. Parsers turn that value into a domain record. A surprising shape throws `malformed_response` instead of being cast through.

`rentCarSoftRequest` is the only place that talks to the network.

## Adjustment made while implementing

`cacheLife` is called inside each cached function. Next.js 16 asks for that, so there is no shared cache wrapper.

`listServicePoints({ includeInactive })` filters after the cached load. The cache stores the full list for that language, key set, and department filter. `includeInactive` is not part of the cache key, and it does not change which rows were fetched.

Detail offer requests drop `page`, `perPage`, and `order`. Those belong to the list operation.

Tests load TypeScript with `tsx` because this repo had no runner and Node's native strip mode does not resolve extensionless imports. The runner is still `node:test`.
