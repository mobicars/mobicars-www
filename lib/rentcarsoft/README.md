# RentCarSoft bridge

Server-only client for the MobiCars Next.js application. Application code imports `@/lib/rentcarsoft` and does not build RentCarSoft HTTP requests itself. Capability functions live in `modules/`. HTTP, configuration, query building, and parsers live in `internal/` and are not a public import path.

The contract is the RentCarSoft API (OpenAPI 1.0.10, reviewed 22 October 2026; the 1.0.8 → 1.0.10 changes are listed in `docs/api-coverage.md` and do not affect the bridge) plus live behavior recorded in `docs/quirks.md`. The vendor specification file is not part of this repository. Legacy `mobicars-pl` is migration reference only. This package does not wrap the whole RentCarSoft API.

## Configuration

Set these in the server environment. Do not use `NEXT_PUBLIC_`.

- `RCS_URL` — API origin, including `/api/v4`, without a trailing slash requirement
- `RCS_KEY` — bearer token

Missing configuration throws `RentCarSoftError` with code `config` before any request. The key is read inside the HTTP client. It is not a cache argument, not a return value, and not part of an error message.

## Server-only

`index.ts` imports `server-only`. Import the package from Server Components, Server Functions, or Route Handlers. A Client Component import fails the build.

## Calling it

```ts
import {
  formatRentCarSoftDateTime,
  listAllOffers,
  listServicePoints,
} from "@/lib/rentcarsoft";

export default async function FleetPage() {
  const points = await listServicePoints({ lang: "pl" });
  const offers = await listAllOffers({ lang: "pl", term: "short" });
  return { points, offers };
}
```

Format pickup and return with `formatRentCarSoftDate` or `formatRentCarSoftDateTime`. Both use the server's local calendar fields. Do not send `Date.toISOString()`.

```ts
import { calculateReservation, formatRentCarSoftDateTime } from "@/lib/rentcarsoft";

await calculateReservation({
  offerId: 10,
  pickUpPointId: 3,
  returnPointId: 3,
  pickUpDate: formatRentCarSoftDateTime(pickUp),
  returnDate: formatRentCarSoftDateTime(dropOff),
});
```

`mileageLimit` is optional on both the quote and the reservation. Omit it and the API default applies: no mileage limit (`false`). Pass `true` or `false` when the booking screen has chosen. The bridge does not default the flag. The same rule applies to `calculateReservation` and `createReservation`. A live check could not tell `true` from `1` or from `false`, because the tested cars had the same price with and without a kilometre limit.

`ReservationQuote.mileageLimit` is a different field. It is the kilometre allowance from `vehicle.mileageLimit`. `price`, `priceDiscounted`, `priceWithoutDiscount`, and `mileageLimitFee` come from that same vehicle object. They are `null` when the response omits them.

A long-term quote:

```ts
await calculateReservation({
  offerId: 10,
  pickUpPointId: 3,
  returnPointId: 3,
  pickUpDate: "2026-11-02 10:00",
  returnDate: "2027-11-02 10:00",
  longTerm: { months: 12, monthlyKmLimit: 1500 },
});
```

That request sends `longTerm=1`, which is the encoding that returned the long-term price fields on the live API.

## Public surface

Catalog, cached when the arguments are not date- or code-dependent:

- `listLanguages`, `listCurrencies`, `listPaymentTypes`
- `listOfferKeys`, `listServicePointKeys`, `listClientKeys`, `listPriceGroupKeys`
- `listOffers` (one page), `listAllOffers` (catalog walk), `getOffer`
- `listServicePoints`, `getServicePoint`, `listDepartments`, `getDepartment`
- `listPriceGroups`, `getPriceGroup`
- `listAddons`, `getAddon`, `listAccessories`, `getAccessory`

Realtime, never cached:

- `verifyPromoCode`
- `calculateReservation`
- `createReservation`
- `listClientReservations`, `getReservation` (the response has no client id; check ownership against the client's list)
- `loginClient`, `getClient`, `isClientBanned` (client key 25, value 16)
- `changeClientPassword`, `createClient`, `clientEmailExists`, `updateClient`
- `startPasswordRecovery`, `getPasswordRecoveryToken`, `completePasswordRecovery`

`listOffers` and the extras list switch to the uncached path when the input includes dates, a promo code, `onlyAvailable`, `onlyAvailableAtLocation`, a long-term quote, or client ids.

## Errors

Every failure throws `RentCarSoftError`. The library does not turn a failed reservation or login into `{ success: false }`.

Codes: `config`, `unauthorized`, `invalid_request`, `not_found`, `api`, `timeout`, `network`, `malformed_response`.

Messages are fixed strings. They do not include the response body, the API key, passwords, reset tokens, or customer fields. `status` is set when the HTTP status is known.

Mutations are not retried.

## Business rules in the bridge

- Offer lists sort with `order=default`. `order=pozycja` is not sent.
- Long-term offer search can send `longTermKalukator`, `okresLongTerm`, and `limitLongTerm` through `longTermQuote`. That path is not cached. `longTermQuote` selects the long-term list and does not also send `shortTerm`.
- `onlyAvailable` requires both dates. `onlyAvailableAtLocation` requires service points and both dates. The bridge throws `invalid_request` and does not call the API when those inputs are missing. Without the location flag, availability stays company-wide.
- Service points are active when custom field 2 equals `6` (`Aktywny`). `listServicePoints` returns those points unless `includeInactive` is set.
- `ServicePoint.city` and `ServicePoint.address` are trimmed custom fields 3 and 4. An empty value is `null`.
- `ServicePoint.office` is custom field 22 with value `13` (`Tak`). `ServicePoint.trainStation` is custom field 21 with value `9` (`Tak`). `airport` stays the API boolean `isAirport`.
- Offer field 71 with value `81` sets `Offer.isPopular`.
- On a dated short-term list, `Offer.isDiscounted` and `Offer.discountedCalculatedPrice` carry a segment promotion, and `Offer.promotion` its name and dates from `cennik[segmentId]`. The discounted total matched the calculate total on the live API.
- `OfferImage.main` is the gallery's `default` flag: the offer's main photo.
- `Offer.monthlyPrice` is `cennik.cena_miesieczna` from the long-term list (`longTermQuote`). Short-term lists and `getOffer` leave it `null`; they price through `dailyPrice` and `calculatedPrice` (the whole searched period).
- `Offer.brand` and `Offer.model` map `mark` and `model` as the spec names them, but the live list fills them the other way round (`mark: "Aygo"`, `model: "Toyota"`). Show `attributes.name` (key 1) when it is set. See `docs/quirks.md`.
- Addon and accessory long-term catalogs use `loadLongTerm`.
- `Extra.type` is `additionalType`; `1` is insurance. On a dated addon list `Extra.price` is the per-day price for that day count and `Extra.calculatedPrice` the window total. The calculate addon line matched it (see `docs/quirks.md`).
- Reservation accessories are `{ id, quantity }` in the domain. Calculate sends `ilosc`. Create sends both `quantity` and `ilosc` until a live create shows which one it reads (the old site sent `ilosc`). Do not match a selected accessory by `QuoteLine.id`: on the live short quote that id equalled the line price.
- `createReservation` does not set `paymentMethod` or `statusRez` unless the caller passes `paymentMethodId` or `forcedStatusId`.
- Login, password-recovery start, and password replacement use a JSON body. The recovery token read uses a query string.
- `GET /client/{id}` accepts one object or an array of exactly one object. Any other shape is `malformed_response`. The successful live shape is still UNVERIFIED.
- Quote image fields are file names from the API. The bridge does not build a graphics URL.

## Limitations

See `docs/quirks.md` for UNVERIFIED items and responses that differ from OpenAPI. The rest of the bridge notes are in `docs/`.

`listAllOffers` stops after 20 full pages and throws rather than returning a silently truncated catalog.
