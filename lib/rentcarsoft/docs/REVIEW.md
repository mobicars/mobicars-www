# RentCarSoft Integration Review

Independent review of the implemented MobiCars RentCarSoft bridge. Production code was not changed. `mobicars-cms` was not inspected or modified.

Reviewed on 8 October 2026 against OpenAPI 1.0.8, the legacy client in `mobicars-pl/lib/rentcarsoft`, the live-API decisions already recorded in `quirks.md`, and the bridge as it stood then. The vendor specification file is not kept in this repository. This note is a point-in-time review, not the current source of truth.

## Executive Summary

The bridge is a solid first cut. HTTP, auth, error mapping, server-only boundaries, and the verified wire-format decisions (JSON login/recovery, `order=default`, `longTerm=1` on calculate, `loadLongTerm`, `quantity`, no `pozycja`) are implemented as specified. I did not find a secret leak or a wrong HTTP method on an implemented operation.

It is not yet a complete MobiCars booking client. The domain layer drops quote line items, several offer and price-group fields the current site uses, and it defaults mileage limit on calculate but not on create. Those are the main gaps. There is no Critical merge blocker for landing a **library-only** change, provided checkout is not built on this quote type as-is.

`listAllOffers`’s 20-page cap is a justified guardrail for the current fleet size, not a defect.

## Critical Issues

None that should block merging a library-only change.

No RCS_KEY leak, no client-bundle exposure through the public entry, no mutation retries, no silent `{ success: false }` on HTTP failure, and no caching of calculate / promo / reservation / login / client / password recovery.

If this package is treated as “booking-ready,” the missing quote extras in Important issue 1 become a blocker for the first checkout screen. They are not a blocker for merging the library itself.

## Important Issues

### 1. Reservation quotes drop addons and accessories

- **Severity:** Important
- **File:** `lib/rentcarsoft/entities.ts`
- **Area:** `parseReservationQuote` / `ReservationQuote`
- **Problem:** OpenAPI and the live calculate response include `prices.addons` and `prices.accessories` (id, price, itemPrice, isOneTime, name, nameEn). Legacy mapped those into the summary UI. The new quote type has no extras at all. Accessory rows were empty in the live check, so `itemPriceMoi` remains UNVERIFIED, but the arrays themselves are specified and were present (empty) on the wire.
- **Why it matters:** Checkout cannot show priced extras from the quote. Re-fetching `/addons.json` will not reproduce the calculated line totals.
- **Recommended fix:** Add a verified extras array to `ReservationQuote` (id, name, price, itemPrice, isOneTime). Do not invent `itemPriceMoi` until a non-empty long-term accessory row is seen.

### 2. Mileage limit is defaulted on calculate and omitted on create

- **Severity:** Important
- **File:** `lib/rentcarsoft/params.ts`
- **Area:** `buildCalculateQuery` vs `buildReservationBody`
- **Problem:** Calculate always sends `mileageLimit: true` unless the caller passes `false`. Create sends `mileageLimit` only when the caller sets it. OpenAPI defaults the flag to false. Legacy calculate always sent `1`; legacy create sent it only on the long-term form.
- **Why it matters:** A quoted limited rental can be booked as unlimited if the UI follows the README for calculate and does not also set `mileageLimit` on create.
- **Recommended fix:** Either default create the same way as calculate, or stop defaulting calculate and require the caller to pass the flag on both. Document the chosen rule in the README. This is MobiCars policy, not an OpenAPI requirement.

### 3. Offer and price-group projections drop fields the current site uses

- **Severity:** Important
- **File:** `lib/rentcarsoft/entities.ts`
- **Area:** `Offer`, `PriceGroup`, `Extra`
- **Problem:**
  - `Offer` keeps `dailyPrice` / `calculatedPrice` / `deposit` and drops `minPrice`, `maxPrice`, discounted prices, `mileageLimit`, `isDiscounted`, `segmentNames`, and `details`.
  - `PriceGroup` drops `monthlyInfo` (monthly price, km limit, excess fee) which is the long-term cennik on the spec.
  - `Extra` drops `presentation`, `prices[]`, `names` / `descriptions`, `calculatedPrice`, and `deductibleReduction`. Legacy insurance / guard UI read `Addon.presentation`.
- **Why it matters:** Fleet cards, promo strikethrough, long-term monthly tables, and insurance copy cannot be built from the public types without another API call or a parser change.
- **Recommended fix:** Widen the domain types with fields that exist on the spec (and, for extras presentation, on the spec Addon object). Do not add UNVERIFIED fields.

### 4. `listOffers` is a page; callers can think it is the catalog

- **Severity:** Important
- **File:** `lib/rentcarsoft/offers.ts`
- **Area:** `listOffers` / `listAllOffers`
- **Problem:** Default `perPage` is 100. Legacy `rcsGetOffers` sent `perPage: 999` and returned the catalog in one call. There is no total count in the API. `listAllOffers` walks pages and throws after 20 full pages (2 000 rows).
- **Why it matters:** `listOffers()` on a fleet page silently returns the first 100 cars. MobiCars is well under that today; the footgun appears as the catalog grows or if someone ports a page 1:1 from legacy.
- **Recommended fix:** Keep pagination. Make the README example use `listAllOffers` for fleet (it already does). Consider a TypeScript name or JSDoc on `listOffers` that says “one page.” Do not raise the 20-page cap without a reason.

### 5. `fetch({ cache: "no-store" })` inside `use cache` is unverified on this Next.js 16 build

- **Severity:** Important
- **File:** `lib/rentcarsoft/http.ts`
- **Area:** `rentCarSoftRequest`
- **Problem:** Every request, including those from `loadLanguages` / `loadCachedOffers`, sets `cache: "no-store"`. Next.js 16 Cache Components docs say fetches are uncached unless they run inside `use cache`, and that `cache` / `next.revalidate` on `fetch` should move to `cacheLife` / `cacheTag`. Official `use cache` examples use plain `fetch()`.
- **Why it matters:** The combination is probably fine (function result is cached; `no-store` only disables the old fetch Data Cache). If Next.js still treats `no-store` as a request-time signal, catalog reads may never prerender. This was not confirmed with a page build.
- **Recommended fix:** Render a server page that only calls `listLanguages` and inspect whether it is in the static shell. If it is dynamic, drop `no-store` on the cached path and keep it on calculate / mutations / auth.

### 6. Location-scoped availability is not exposed

- **Severity:** Important (product gap, not a regression)
- **File:** `lib/rentcarsoft/params.ts`
- **Area:** `OfferListInput` / `CalculateReservationInput`
- **Problem:** OpenAPI documents `onlyAvailableAtLocation` (and `checkAvailable` on calculate). Without it, `available` is company-wide. Legacy never sent these flags. The new client also does not.
- **Why it matters:** A car can look bookable at Warsaw when the free vehicle is in Kraków. Same as today’s site.
- **Recommended fix:** Do not invent behavior. When booking UI is built, decide whether to send `onlyAvailableAtLocation` with `servicePoints` + dates. Record the decision in `quirks.md`.

### 7. Password recovery token is a public return value

- **Severity:** Important (product caution)
- **File:** `lib/rentcarsoft/clients.ts`
- **Area:** `getPasswordRecoveryToken`
- **Problem:** The function returns `{ token }`. The library does not log it. A Server Action that returns the result to the browser will ship a customer secret.
- **Why it matters:** Same pattern as legacy. Easy to misuse in App Router.
- **Recommended fix:** Keep the function. README should say the token must be consumed on the server and never serialized to the client. Prefer completing reset on the server in one action.

## Minor Issues

### Public API leaks a few internals

- **Severity:** Minor
- **File:** `lib/rentcarsoft/index.ts`
- **Area:** exports
- **Problem:** `CACHE_TAGS`, `ACTIVE_SERVICE_POINT_STATUS_VALUE`, and `POPULAR_OFFER_VALUE` are public. Useful for tests and revalidation, but they are implementation constants.
- **Why it matters:** Callers may start depending on RentCarSoft select ids.
- **Recommended fix:** Keep `CACHE_TAGS` (revalidate). Move the two magic values to docs or a `labels` subpath if the public surface should stay domain-only.

### `getOffer` reuses `OfferListInput` and then deletes list fields

- **Severity:** Minor
- **File:** `lib/rentcarsoft/offers.ts`
- **Area:** `getOffer`
- **Problem:** Builds a list query, then deletes `page`, `perPage`, and `order`.
- **Why it matters:** Works; slightly confusing.
- **Recommended fix:** A dedicated detail input type.

### Calculate sends `lang`, which is not on the OpenAPI operation

- **Severity:** Minor
- **File:** `lib/rentcarsoft/params.ts`
- **Area:** `buildCalculateQuery`
- **Problem:** Legacy sent `lang`. Spec for `/reservation_calculate.json` does not list it. Live check did not prove it is read.
- **Why it matters:** Harmless if ignored. Names on the quote may stay Polish.
- **Recommended fix:** Keep it (legacy compatibility). Mark as undocumented extra query param in `quirks.md`.

### Boolean `mileageLimit=true` vs live `1`

- **Severity:** Minor
- **File:** `lib/rentcarsoft/query.ts` / `params.ts`
- **Area:** calculate query
- **Problem:** Live long-term extra fields were observed with `mileageLimit=1`. The client serializes the boolean as `true`. Spec type is boolean.
- **Why it matters:** PHP usually accepts both. Not re-checked.
- **Recommended fix:** Leave as boolean unless a live quote comes back unlimited.

### `onlyAvailable` without dates is allowed

- **Severity:** Minor
- **File:** `lib/rentcarsoft/params.ts`
- **Area:** `OfferListInput`
- **Problem:** Spec requires `pickupDate` and `returnDate` when `onlyAvailable` is true. Types do not.
- **Why it matters:** Likely HTTP 400 at runtime.
- **Recommended fix:** Throw `invalid_request` in the bridge if `onlyAvailable` is set without both dates.

### Service-point default keys omit 1, 18, 19

- **Severity:** Minor / UNVERIFIED if entity fields are empty
- **File:** `lib/rentcarsoft/labels.ts`
- **Area:** `DEFAULT_SERVICE_POINT_KEY_IDS`
- **Problem:** Legacy asked for keys `1, 2, 3, 4, 14, 18, 19, 21, 22`. New defaults are `2, 3, 4, 14, 21, 22`. Name and coordinates are read from first-class `ServicePoint` fields, which the spec includes.
- **Why it matters:** Map pins fail only if those entity fields are empty and the values live only on keys.
- **Recommended fix:** If a map page shows missing coords, add 18 and 19 back to the default key list.

### README overstates the mileage-limit default

- **Severity:** Minor
- **File:** `lib/rentcarsoft/README.md`
- **Area:** “Mileage limit defaults to `true`”
- **Problem:** True only for `calculateReservation`.
- **Recommended fix:** Say so.

### No test for active-point filtering after dictionary mapping

- **Severity:** Minor
- **File:** `lib/rentcarsoft/rentcarsoft.test.ts`
- **Area:** `parseServicePoint`
- **Problem:** Tests pass raw value `"6"`. After `listServicePointKeys`, `attributes.status.value` becomes `"Aktywny"` and activity depends on `valueId`. The parser handles both; the second path is untested.
- **Recommended fix:** One test with a key definition `{ id: 6, name: "Aktywny" }`.

### Deep imports bypass `index.ts`

- **Severity:** Minor
- **File:** `lib/rentcarsoft/*.ts`
- **Area:** module graph
- **Problem:** `server-only` is on `index.ts` and `config.ts`. `dates`, `errors`, `params`, `query` can be imported from a Client Component.
- **Why it matters:** No key leak (those modules do not read env). Callers might format dates or build reservation bodies in the browser.
- **Recommended fix:** Acceptable. Do not import anything except `@/lib/rentcarsoft` from app code (already in the skill).

## Correct Decisions

- Native `fetch`, one HTTP helper, no Axios.
- `RentCarSoftError` with fixed messages; original fetch errors and bodies are discarded.
- JSON body for login and recovery POST/PUT; query email for recovery GET. Matches live API, not the spec.
- `order=default`, never `pozycja`.
- Long-term offer params kept and excluded from cache.
- Long-term calculate uses `longTerm=1` and maps the verified extra price fields.
- Addons/accessories use `loadLongTerm` and `quantity`.
- No default `paymentMethod` or `statusRez`.
- Local date helpers; no `toISOString()`.
- Client GET accepts one object or a one-element array; success shape stays UNVERIFIED.
- JWT-shaped bodies are rejected; no JWT decode.
- `includeInactive` filters after a shared cache entry. Safe: same request, different view.
- Catalog cache identity is the query object / lang / ids, not a fixed `rcsCars` key.
- `server-only` on the public entry; `RCS_KEY` is not an argument to cached functions.
- No mutation retries.
- Out-of-scope fleet / alerts / `reservationsall` stay out.
- Skill is short and points at docs instead of copying OpenAPI.

## API / Legacy Compatibility Review

| Topic | OpenAPI | Legacy | Live | Bridge | Verdict |
| --- | --- | --- | --- | --- | --- |
| Login / recovery writes | Query params | JSON body | JSON → 404 for unknown user; query → 500 | JSON body | Intentional compatibility. Live + legacy win. |
| Recovery GET email type | `integer` | string query | string accepted (404) | string query | Intentional. Spec type is wrong. |
| `order=pozycja` | Not in enum | Sent | 200, same order as `default` | `default` | Correct removal. |
| Long-term offer extras | Absent | `longTermKalukator`, `okresLongTerm`, `limitLongTerm` | Accepted; changes prices / count | `longTermQuote` | Intentional undocumented params. |
| Point status `6` | Unspecified | Filter `=== "6"` | Key 2 value 6 = Aktywny | `active` + default filter | Correct keep. |
| `paymentMethod = 1` | Optional int | Always 1 | Type 1 = “Nie podano” | No default | Correct removal of the default. Necessity on create is UNVERIFIED. |
| `statusRez = 1219` | Optional “forced status” | Long-term only | Not created live | `forcedStatusId`, no default | Correct. Meaning UNVERIFIED. |
| Promo body | Undocumented 200 | `success === "true"` | `{ success: "false", kod: null }` | String or boolean | Correct for invalid codes. Success object UNVERIFIED. |
| `GET /client/{id}` | `array<Client>` | Single object | Missing ids → empty 404 | Object or `[object]` | Defensive. Success UNVERIFIED. |
| Long-term calculate | Short schema only | Extra PL fields | Extra fields when `longTerm=1` + year span | Mapped | Live + legacy win. Spec incomplete. |
| `useJwt` | Possible JWT body | Assumed JSON | JSON (`text/html`) | JSON; JWT rejected | Correct. |
| Addon long-term flag | `loadLongTerm` | Addons sent `longTerm` | Not re-probed | `loadLongTerm` | Correct spec fix. |
| Accessory quantity | `quantity` | `ilosc` | Not re-probed on calculate | `quantity` | Correct spec fix; encoding UNVERIFIED on a non-empty quote. |
| Mileage limit | bool, default false | `1` on calculate | Long-term probe used `1` | bool `true` on calculate | Intentional MobiCars rule; create inconsistency is a real gap. |
| Image URL | File name on quote | Hard-coded host | File name | File name only | Correct removal. |
| Quote extras | In schema | Mapped | Empty arrays | Dropped | Bug / omission. See Important 1. |

## Cache Components Review

`cacheComponents` is on. Cached loaders are nested async functions with `'use cache'`, `cacheLife` in the same function, and `cacheTag`. That matches Next.js 16.

Realtime methods do not use `'use cache'`. Offer/extra loaders switch to the uncached function when dates, promo, `onlyAvailable`, `longTermQuote`, or client ids are present. `longTermQuote` is correctly treated as current pricing.

`includeInactive` is not part of the cache key. The cached function always fetches the same list; the public function filters afterwards. Intentional and safe.

`listAllOffers` is not cached as a whole; each catalog page is. Arguments (page, perPage, lang, keys, filters) participate in identity. `RCS_KEY` does not.

`fetch(..., { cache: "no-store" })` plus `'use cache'`:

- With Cache Components, the documented cache for this data is `'use cache'`, not the old fetch Data Cache.
- `no-store` on every fetch is consistent with “do not use the old fetch cache.”
- Official migration text says to move fetch cache options to `cacheLife` / `cacheTag` and that fetches inside `'use cache'` are cached as part of that scope.
- I am **not** calling this incorrect. I am saying it is unverified on a real page and is the one Cache Components risk to confirm before trusting prerendered catalog shells.

No test covers cache identity (acceptable without a Next runtime harness).

## Security Review

- `RCS_URL` / `RCS_KEY` are server env vars. No `NEXT_PUBLIC_` RentCarSoft vars in the bridge.
- `index.ts` and `config.ts` import `server-only`. Importing `@/lib/rentcarsoft` from a Client Component fails the build.
- The key is only read in `getRentCarSoftConfig` and placed in the `Authorization` header. It is not in the URL, error messages, cache arguments, or test assertions except as a dummy that must **not** appear in errors.
- Failed `fetch` errors are swallowed and replaced with a fixed message. Timeouts do not echo the URL or key.
- No `console.log` in the bridge. Legacy reservation `console.log` is gone.
- Tests use `test-key-should-not-leak` and assert it never appears in messages or URLs.
- `createReservation` / login / recovery send secrets on the wire only. They are not logged.
- Residual risks sit above the library: returning `getClient`, `getPasswordRecoveryToken`, or `createReservation` input from a Server Action to the browser. The skill already forbids logging those values; it should also forbid returning the recovery token to the client.

I did not find RCS_KEY in docs or tests as a real credential.

## Documentation Review

Docs match the implementation on the big rules: sources of truth, cache table, error codes, UNVERIFIED list, out-of-scope operations, JSON vs query, `pozycja`, long-term params, `longTerm=1`.

Gaps:

- README implies mileage limit always defaults to true (only calculate).
- Quote extras omission is not documented as a known limitation.
- `onlyAvailableAtLocation` is not mentioned as a later product decision.
- `lang` on calculate is undocumented extra query.
- Skill is useful and the right length. `references/index.md` only points at `docs/rentcarsoft/`; that is enough.
- Detailed docs do not copy OpenAPI. Little harmful duplication (skill lists the same files twice).

UNVERIFIED items in `quirks.md` still match the code. Nothing in the skill claims they are settled.

## Test Coverage Review

17 tests cover the decisions that were easy to get wrong: query encoding, `pozycja` absence, long-term offer params, `longTerm=1`, reservation `quantity` and no payment/status defaults, JSON auth bodies, promo string flags, client object-or-array, popular / active mapping, long-term quote fields, local dates, bearer header placement, 401/400/404/500/timeout/network/JWT/empty/HTML-JSON, missing config.

They are meaningful, not trivia.

Missing, and worth adding without a live API:

- Quote extras parsing (even empty arrays vs omitted).
- Service point `active` when the dictionary maps `6` → `"Aktywny"`.
- `isCatalogOfferQuery` / `isCatalogExtrasQuery` boolean matrix (cache vs live path).
- `listAllOffers` page-limit error (with a mocked client, if HTTP becomes injectable in tests — today it is not public).
- Create vs calculate `mileageLimit` defaults.
- `onlyAvailable` without dates (once validated).

Cache identity and Next prerender behavior cannot be covered well by `node:test`. That is fine.

## Remaining UNVERIFIED Items

These are still explicitly open in code and `quirks.md`. This review did not settle them.

1. Successful `GET /client/{id}` body (object vs array).
2. Meaning of `statusRez` `1219`.
3. Whether `createReservation` requires `paymentMethod`.
4. Fields inside a successful promo `kod` object.
5. `itemPriceMoi` on a long-term quote with accessories.
6. Whether `clientType` `0` / `1` still mean person / company.
7. Whether `mileageLimit=true` (string) is accepted the same as `1` on calculate.
8. Query encoding of non-empty `accessories[]` on calculate.
9. Whether `lang` is honored on `/reservation_calculate.json`.
10. Whether `use cache` + `fetch({ cache: "no-store" })` prerenders catalog routes.
11. Whether `ServicePoint.latitude` / `longitude` are always populated without keys 18 and 19.

## Recommended Changes

1. Put addon/accessory lines on `ReservationQuote` from the spec fields that already exist. Do not add `itemPriceMoi` yet.
2. Make mileage-limit policy identical on calculate and create, and fix the README sentence.
3. Restore spec fields needed for current UI: offer min/max/discounted prices, price-group `monthlyInfo`, addon `presentation`.
4. Confirm Cache Components with one catalog page; drop `no-store` on the cached path only if that page is forced dynamic.
5. JSDoc / README: `listOffers` is one page; fleet uses `listAllOffers`.
6. Document `onlyAvailableAtLocation` as a later booking decision; do not send it until then.
7. Tests for dictionary-mapped status `6` and for quote extras arrays.
8. README warning: do not return recovery tokens to the client.

Do not reintroduce `order=pozycja`, `ilosc`, addon `longTerm`, hard-coded image hosts, reservation logging, or default `paymentMethod` / `statusRez`.
