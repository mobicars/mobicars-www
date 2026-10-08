---
name: mobicars-rentcarsoft
description: Work on the MobiCars RentCarSoft bridge in mobicars-www/lib/rentcarsoft. Use when changing RentCarSoft calls, caching, errors, types, quotes, reservations, or the bridge docs.
---

# MobiCars RentCarSoft

The bridge is `mobicars-www/lib/rentcarsoft`. Application code imports `@/lib/rentcarsoft`. It does not build RentCarSoft requests itself and does not import `modules/` or `internal/` directly.

Do not inspect or edit `mobicars-cms` for this integration.

## Layout

- `index.ts` — public entry. `server-only`.
- `README.md` — how callers use the bridge.
- `rentcarsoft.test.ts` — package tests.
- `modules/` — public capabilities, one file each (offers, clients, extras, locations, price groups, pricing, reservations, catalog).
- `internal/` — HTTP, config, query, params, parsers, labels. Not a public API.
- `docs/` — maintained notes for this bridge. Start with `README.md`, then `docs/`.

## Source of truth

1. The documented RentCarSoft API contract. OpenAPI 1.0.8 was the reviewed baseline. The vendor file is not in this repository. Do not depend on `tmp-spec` or copy the specification in.
2. Live behavior recorded in `lib/rentcarsoft/docs/quirks.md` when it conflicts with the spec. The recorded live result wins for wire format, and the deviation stays written there.
3. Current MobiCars product requirements.
4. `mobicars-pl/lib/rentcarsoft` only as migration reference.

Do not copy a legacy workaround because the old client did it. When legacy and the spec conflict, follow the spec unless `quirks.md` records a live result that proves the spec wrong.

Do not invent behavior for UNVERIFIED items. Leave them marked UNVERIFIED in `quirks.md`.

## Read before editing

- `lib/rentcarsoft/README.md`
- `lib/rentcarsoft/docs/architecture.md`
- `lib/rentcarsoft/docs/integration.md`
- `lib/rentcarsoft/docs/api-coverage.md`
- `lib/rentcarsoft/docs/legacy-decisions.md`
- `lib/rentcarsoft/docs/quirks.md`
- `lib/rentcarsoft/docs/caching.md`
- `lib/rentcarsoft/docs/errors.md`

## Implementation rules

- Keep HTTP inside `internal/http.ts`. Add request fields in `internal/params.ts`, not in callers.
- Native `fetch` only. No Axios.
- Public functions throw `RentCarSoftError`. Do not return fake success.
- Do not retry `createReservation` or other mutations.
- `import "server-only"` stays on `index.ts` and on `internal/config.ts`.
- No `NEXT_PUBLIC_` RentCarSoft variables.
- Never log `RCS_KEY`, passwords, reset tokens, client records, or reservation bodies. Do not put those values in errors, tests, or docs.
- Login and password recovery POST/PUT use a JSON body. Recovery GET uses a query email. The token stays on the server. Do not return it to the browser.
- Do not send `order=pozycja`. The list default is `order=default`.
- Long-term offer search keeps `longTermKalukator`, `okresLongTerm`, and `limitLongTerm`, and that path is not cached. Those parameters are kept because a live check showed they change the list, not because legacy sent them.
- Long-term calculate sends `longTerm=1`.
- Addon and accessory long-term filters use `loadLongTerm`.
- Accessories use `quantity`. Do not reconstruct quantity from prices.
- Do not default `paymentMethod`, `statusRez`, or `mileageLimit`. Do not hard-code status `1219` or payment type `1`.
- `mileageLimit` is a boolean. Send it only when the caller sets it. The API default is `false`.
- Do not build the old `/grafiki/oferta/512/` image URL.
- Format rental dates with `formatRentCarSoftDate` / `formatRentCarSoftDateTime`.
- `GET /client/{id}` stays defensive: one object or a one-element array. Do not pretend the success shape is verified.
- `listOffers` is one page. `listAllOffers` walks pages and throws after 20 full pages.
- Do not add fleet, reports, alerts, `reservationsall`, drivers, or representatives unless a later product decision says so. Update `api-coverage.md` in the same change.

## Caching

Follow `lib/rentcarsoft/docs/caching.md`.

Catalog and dictionaries can use `use cache`. Call `cacheLife` in that same function. Put every filter that changes the RentCarSoft request into the cached function's arguments.

`fetch` inside the client stays `cache: "no-store"`. On Next.js 16.4 that does not cancel a `use cache` scope. Outside `use cache` it keeps the call uncached.

Do not cache quotes, promo checks, reservation creates, login, client reads, or password recovery. Do not cache offer or extra reads that include dates, promo codes, availability, or `longTermQuote`.

Do not use a constant cache key.

## Errors

Follow `lib/rentcarsoft/docs/errors.md`. Map new HTTP cases in `internal/http.ts` only. Keep messages free of response bodies.

## Tests

`npm test` runs `node:test` through `tsx` on `lib/rentcarsoft/rentcarsoft.test.ts`. Tests must not call the live API and must not contain real credentials. Cover serializers, request construction, error mapping, and pure normalizers when you change them.

## Documentation

A behavior change updates the matching file under `lib/rentcarsoft/docs/` and `lib/rentcarsoft/README.md` in the same change.

Update this skill when an agent rule changes: what may be cached, what must not be logged, which source wins, or which operations are in scope. Do not paste endpoint catalogs into this file.

Remove docs that no longer match the code, including UNVERIFIED notes that a later live check has settled. When a check settles an item, say what was observed and which source wins.
