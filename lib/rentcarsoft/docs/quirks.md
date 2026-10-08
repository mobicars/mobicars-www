# Quirks

Checked against OpenAPI 1.0.8 and the live MobiCars API on 8 October 2026. Items marked UNVERIFIED were not settled then and are still not settled.

## Verified on the live API

- Login and password recovery POST/PUT accept a JSON body. The same calls with query or form fields returned HTTP 500 and an empty body. The spec describes query parameters.
- Password recovery GET accepts `email` as a query string. A non-integer email is processed. The spec types that email as `integer`.
- `order=pozycja` is not a distinct sort. It matched `order=default` and an unknown token. Omitting `order` matched `price_asc` for the first page that was compared.
- `longTermKalukator` is read. Alone, the tested list came back empty. With `okresLongTerm=1` and `limitLongTerm=1000`, rows remained and prices changed. `okresLongTerm=12` with `limitLongTerm=2500` and the calculator flag returned no rows. An unknown parameter did not change the list.
- Service-point key `2` is Status. Value `6` is Aktywny. Value `7` is Nieaktywny.
- Payment type `1` is “Nie podano”.
- An invalid promo code returned `{ success: "false", kod: null }` with HTTP 200. The spec does not describe that body.
- A long-term calculate call with `longTerm=1`, twelve months, and a one-year date range returned the extra price fields listed in `legacy-decisions.md`. The spec’s 200 schema does not include them.
- The same calculate call with `longTerm=true` and a one-week range stayed on the short schema and added `limitKmDzienny`.
- Successful catalog bodies were JSON. `Content-Type` was `text/html; charset=UTF-8`. Responses were not JWTs. The `useJwt` flag itself is not readable.

## Also observed on that calculate response

These types differ from the schema and are accepted by the parsers as strings or numbers:

- `prices.days` can be a string on the short response.
- `vehicle.deposit` and the vehicle price fields can be strings.
- `vehicle.id` and `release.id` can be strings.
- `vehicle.details` items can be objects with `fk_oferta` and `nazwa`. The schema says an array of strings. The bridge does not interpret those objects.

The bridge does not build `/grafiki/oferta/512/`. That path was only in the old client.

## UNVERIFIED

- Successful `GET /client/{id}` body. The spec says an array. The old client read one object. Missing ids returned HTTP 404 with an empty body. The parser accepts one object or an array of one object and rejects anything else.
- Whether `statusRez` `1219` is a real reservation status. There is no status dictionary in the API. The bridge does not send it unless `forcedStatusId` is passed.
- Whether `createReservation` requires `paymentMethod`. The spec marks it optional. No reservation was created during verification, and the bridge does not default it.
- Fields inside a successful promo `kod` object. Invalid codes return `kod: null`. A non-null object is passed through as a record.
- Accessory `itemPriceMoi` on a long-term quote. The checked response had no accessory rows.
- Whether `clientType` `0` and `1` still mean person and company.
- Whether `mileageLimit=true` is accepted the same way as `1`. The spec type is boolean, so the bridge sends a boolean. The live long-term check used `1`.

## Spec gaps the client follows the live API for

- Long-term calculate response fields above.
- Promo `success` as a string.
- JSON bodies for login and password recovery writes.
- `loadLongTerm` on both addon and accessory lists.
