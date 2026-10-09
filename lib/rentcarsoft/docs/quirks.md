# Quirks

Checked against OpenAPI 1.0.8 and the live MobiCars API on 8 October 2026, with a read-only follow-up on 9 October 2026. Items marked UNVERIFIED were not settled. No reservation was created.

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

## Verified on 9 October 2026

Read-only `GET` calls. One short-term offer, one service point, one priced accessory, and a seven-day window. No `POST /reservation.json`.

- Calculate vehicle objects include `price`, `priceDiscounted`, `priceWithoutDiscount`, `mileageLimit`, and `mileageLimitFee`. On the checked short quote they were numeric strings and, on that undiscounted car, the three prices were equal. The quote parser reads them with the same string-or-number conversion as `deposit`. `mileageLimit` here is the kilometre allowance, not the request flag.
- Calculate accessories: `{ id, quantity: 2 }` left the rental total unchanged and returned a zero-priced line. `{ id, ilosc: 2 }` added `itemPrice × days × 2` to the total. Sending both keys priced the line the same way as `ilosc` alone. The bridge therefore sends `ilosc` on calculate. The domain field stays `quantity`.
- On those `ilosc` lines, response `id` equalled `price` (`itemPrice × days × ilosc`), not the accessory id from the request. `itemPriceMoi` was absent. The parser still reads `id` as sent. Do not treat `QuoteLine.id` as the selected accessory id.
- `longTerm=1` with a one-year window switched to the long-term price shape. `longTerm=true` with the same window, twelve months, and a kilometre limit stayed on the short shape (`prices.rent` present, no `cena_miesieczna_najmu`). The bridge still sends `1` on calculate.
- `longTerm=1` without `iloscMiesiecy` returned the long-term shape with monthly price `0` and total `0`. `iloscMiesiecy=12` without `limitKmMiesieczny` returned the same non-zero monthly price as the call that also sent `1500`. The kilometre field was echoed only when it was sent. The domain type still requires both `months` and `monthlyKmLimit` on calculate and on create, so a chosen limit is not dropped between the two calls. That requirement is a bridge rule. The API did not reject the call that omitted the kilometre limit.
- Offer list `onlyAvailableAtLocation=true`, with `servicePoints`, `pickupDate`, and `returnDate`, changed one car on the tested page from `available: true` to `available: false` (15 available without the flag, 14 with it). The bridge passes the flag through only when those three inputs are present.
- `onlyAvailable=true` without dates returned an empty offer list, not HTTP 400. The spec says both dates are required. The bridge rejects that input locally and does not send it.

## UNVERIFIED

- Successful `GET /client/{id}` body. The spec says an array. The old client read one object. Missing ids returned HTTP 404 with an empty body. The parser accepts one object or an array of one object and rejects anything else.
- Whether `statusRez` `1219` is a real reservation status. There is no status dictionary in the API. The bridge does not send it unless `forcedStatusId` is passed.
- Whether `createReservation` requires `paymentMethod`. The spec marks it optional. No reservation was created during verification, and the bridge does not default it.
- Fields inside a successful promo `kod` object. Invalid codes return `kod: null`. A non-null object is passed through as a record.
- Accessory `itemPriceMoi` on a long-term quote. The 9 October accessory line was a short-term row and had no `itemPriceMoi`.
- Whether `clientType` `0` and `1` still mean person and company.
- Whether `mileageLimit=true` is accepted the same way as `1` or as `false`. On 9 October, omit, `true`, `false`, and `1` returned the same total on the tested offer. All 34 dated offers on that page had `dailyPrice` equal to `dailyPriceNoMileageLimit`, so the flag had no price to change. The bridge still sends a boolean only when the caller sets it, on both calculate and create.
- Whether `POST /reservation.json` reads accessory `quantity` or `ilosc`. Calculate reads `ilosc`. The create body still sends `quantity`, matching OpenAPI. Settle it with one intentional create that sends the count as `ilosc`, then read that reservation and check the stored accessory quantity. Do not send a second create unless that line is missing.
- The calculate top-level `available` number added by `onlyAvailableAtLocation`. For both a list-available car and a list-unavailable car it was `0`, while `vehicle.isAvailable` stayed `true`. The quote keeps mapping `vehicle.isAvailable` only. The flag is not on `CalculateReservationInput`.
- Whether create accepts a long-term body whose `months` and `monthlyKmLimit` are omitted. The type now requires both whenever `longTerm` is set.

## Spec gaps the client follows the live API for

- Long-term calculate response fields above.
- Promo `success` as a string.
- JSON bodies for login and password recovery writes.
- `loadLongTerm` on both addon and accessory lists.
- Calculate accessory quantity is `ilosc`. OpenAPI names the same field `quantity`.
