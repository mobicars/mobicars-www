# Integration

## Environment

`RCS_URL` and `RCS_KEY` are server environment variables. The URL used by MobiCars includes the `/api/v4` prefix. The client trims a trailing slash and sends `Authorization: Bearer <RCS_KEY>`.

Every request also sends `dataType=json`. The live API labels the body as `text/html`; the client still parses JSON.

The default timeout is 15 seconds. Quotes, promo checks, reservations, login, client reads, and password recovery use 20 seconds. Nothing is retried.

## Where to call it

Call the bridge from the server. Do not pass `RCS_KEY`, recovery tokens, or reservation bodies into Client Components.

Dates that go to RentCarSoft should already be strings produced by `formatRentCarSoftDate` or `formatRentCarSoftDateTime`.

## Accounts

`loginClient` posts JSON `{ email, password }`. A missing account is a thrown `not_found` or `unauthorized` error from the API status, not `null`.

`startPasswordRecovery` posts JSON `{ email }` and resolves on HTTP 204.

`completePasswordRecovery` puts JSON `{ email, password }` and resolves on HTTP 204.

`getPasswordRecoveryToken` sends `email` as a query parameter. The return value contains the token so the server can finish the reset. Callers must not log it or send it to the browser.

`getClient` requests the MobiCars field set `1, 2, 4, 5, 7, 9, 44, 46` unless `keyIds` is passed. The payload is not cached.

## Reservations

`createReservation` posts JSON. Required domain fields match the OpenAPI required set: offer, both points, both dates, and `clientKeys`.

Optional pass-through:

- `paymentMethodId` → `paymentMethod`
- `forcedStatusId` → `statusRez`
- `clientType` → `clientType`
- `longTerm.months` → `iloscMiesiecy`
- `longTerm.monthlyKmLimit` → `ustalonyLimitKm`

No default is applied for payment method, forced status, or `mileageLimit`. Omit `mileageLimit` and the API default (`false`) applies on both calculate and create. Pass `true` or `false` from the booking screen when that screen has chosen.

## Offers

`listOffers` returns one page. `page` starts at 0. `perPage` defaults to 100.

`listAllOffers` walks pages until a short page. After 20 full pages it throws `RentCarSoftError` code `api`.

`order` defaults to `default`. Callers can pass `price_asc`, `price_desc`, `name_asc`, or `name_desc`.

`longTermQuote` turns on `longTermKalukator`, `okresLongTerm`, and `limitLongTerm`, and forces the long-term flag. That combination changes prices and can return an empty page. It is not cached.

## Extras

Addons send customer filters as `clients`. Accessories send them as `customers`. Both use `loadLongTerm` when `longTerm` is true.
