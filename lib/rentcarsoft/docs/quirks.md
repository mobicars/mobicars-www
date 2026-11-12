# Quirks

Checked against OpenAPI 1.0.8 and the live MobiCars API on 8 October 2026, with a read-only follow-up on 9 October 2026. Items marked UNVERIFIED were not settled. No reservation was created.

OpenAPI 1.0.10 (22 October 2026) did not change any operation listed here. Every spec gap below is still present in 1.0.10. Nothing was re-checked on the live API for that version.

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

## Verified on 22 October 2026

Read-only `GET /offers.json`, two short-term offers (1218, 4457), `keys` 1, 10, 79, 80, 133, with `lang` `pl`, `en`, and `de`. Same three languages on `GET /offer_keys.json`. Follow-up the same day added `uk` (and `5`, `ua`) on both calls. The spec types `KeyValue.value` as a plain string and does not say whether it follows `lang`.

- Text custom fields are translated per `lang`. Offer 1218 returned English `metaTitle` (79), `metaDescription` (80), and `description` (10) for `en`. For `de` it returned German 79 and 80, but Polish 10.
- A missing translation falls back to Polish silently. Offer 4457 returned the same Polish 10, 79, and 80 for all three languages. The response does not say which language a value is in.
- Key 133 (`descriptionEn`) is a separate legacy field. It returned the same English text for every `lang`. Where key 10 is translated, 133 is redundant. Keys 127 (`longTermDescription`) and 134 (`longTermDescriptionEn`) were not requested. UNVERIFIED, though they probably follow the same rule.
- `segment` follows `lang` (`Klasa A`, `A Class`, `A-Klasse`).
- `GET /offer_keys.json` translates select **values** per `lang` (`8`: `13=Manualna` / `Manual` / `Schaltgetriebe`; `128`: `168=Bezprzewodowy` / `Wireless` / `Kabellos`). Key **names** are not translated: `Skrzynia biegów`, `Czujniki parkowania`, and `Klimatyzacja` came back in Polish for `en` and `de`. On the offer, select fields return the value id (`8: "13"`), the same for every `lang`. `mapCustomFields` resolves that id through the dictionary loaded for the same `lang`, so `FieldAttribute.value` is already translated. The bridge does not expose the key name. `FieldAttribute.label` is the stable code name from `labels.ts`, so the site needs its own translated labels for spec rows.
- The four MobiCars languages from `/languages.json` are `pl` (id 1), `en` (2), `de` (3), and `uk` (5). With `uk` or `5`, select values came back in Ukrainian (`13=Механічна`), offer 1218 returned Ukrainian 79 and 80 and Polish 10, and `segment` was `Клас A`. Key names stayed Polish in all four languages. The key objects had no field beyond `id`, `name`, `type`, `mask`, `required`, and `values`, so there is no hidden translation map like `names` on addons.
- `lang=ua` is not an error. It returned the Polish dictionary and Polish text. Ukrainian must be sent as `uk`. A future `ua` site route has to map to `uk` before calling the bridge.

Consequences for callers: request 79 and 80 explicitly through `offerKeyIds`, because they are not in `DEFAULT_OFFER_KEY_IDS`. Read them from `Offer.attributes.metaTitle` and `Offer.attributes.metaDescription`. A non-Polish page cannot tell a real translation from the Polish fallback without a second `lang=pl` call.

## Verified on 11 November 2026

Read-only `GET /offers.json` for the reservation pages. A short-term list with `pickupDate` / `returnDate` three days apart, with and without `onlyAvailable`, in `pl` and `en`. A long-term list with `longTermQuote` (3 months, 2000 km) and a three-month window. No calculate or create call.

- `mark` holds the model and `model` holds the make (offer 1218: `mark: "Aygo"`, `model: "Toyota"`; 4457: `mark: "Fabia"`, `model: "Skoda"`). Key 1 (`name`) holds the full name, `Toyota Aygo`. The bridge keeps the spec mapping (`brand` ← `mark`), so callers show `attributes.name`.
- On the dated short-term list, `calculatedPrice` is the price of the whole window: `dailyPrice × days` on every checked row (139 × 3 = 417, 169 × 3 = 507). The day count rule for partial days was not tested.
- The long-term list has no `dailyPrice` or `calculatedPrice`. Each row carries `days`, `liczbaMiesiecy`, `limitMiesieczny`, `details`, and `cennik: { cena_miesieczna: 2650, limit_km_miesieczny: "50.00" }`. `cena_miesieczna` is parsed as `Offer.monthlyPrice`. The old client showed it as the gross monthly price and divided it by 1.23 for net. What `limit_km_miesieczny` means (here `50.00` for a 2000 km limit) is UNVERIFIED; it is not parsed.
- The dated short-term list carries promotions. Top level: `isDiscounted`, `discountedCalculatedPrice`, `discountedMinPrice` / `discountedMaxPrice` and their `…NoMileageLimit` twins, `days`, `minPrice` / `maxPrice`, `isMileageLimit`, `mileageLimit`, `mileageLimitFee`, `sellNoMileageLimit`. `cennik` is keyed by `segmentId`: `{ nazwa, kaucja, limitKm, monthly_price, is_promocja, promocja_nazwa, promocja_od, promocja_do, czasy: [{ od, do, cena, cena_bez_limitu, promocja, promocja_bez_limit, limit_km }] }`. `is_promocja` came back as the number `1` / `0`; the old client typed it as a string.
- `discountedCalculatedPrice` = the promotional band price × `days` (125.10 × 3 = 375.30 for offer 1218; 95.20 × 6 = 571.20). `calculateReservation` for the same offer, place and window returned `total` 375.30 and `priceDiscounted` 375.30, so the list price is what the quote charges. With no promotion in the window (10–12 January 2027) `isDiscounted` was `false`, `is_promocja` `0`, and the discounted total equalled `calculatedPrice`.
- The bridge maps `isDiscounted`, `discountedCalculatedPrice`, `days`, and `Offer.promotion` (name, start, end from `cennik[segmentId]`). It does not map the `czasy` bands; the API already applies them to the dated totals.
- The list's mileage fields disagree with calculate: the list said `mileageLimit` 1000 and fee 0.65 for offer 1218, calculate said 400 and 0.5 for the same window. Show the kilometre allowance from the quote, not from the list. Not parsed.
- Gallery images carry `default`, `cover`, and `coverBig`. Exactly one image per offer had `default: true` on the checked page; several had `cover: true`. The old client showed the `default` image. It is `OfferImage.main`. Main photos are studio shots on white, so show them uncropped (`object-contain`).
- Same place (479) and window (20–23 November 2026): without `onlyAvailable` the list had 33 offers in 23 segments, 8 of them `available: false`. With `onlyAvailable=true` it had 25 offers in 18 segments; the flag removed exactly those 8 but kept one `rentable: false` offer (6876, Skoda Octavia Kombi). `onlyAvailableAtLocation` on top left 23 offers in 17 segments. The old site sent no availability flag and did not filter, so it listed booked cars as choosable. The new pages do the same on purpose: they list every car, because the customer books a class "or similar" (product decision, `lib/reservation/README.md`, "Availability").
- `GET /addons.json` with `priceSegments=1463` and the same window returned 17 addons. Insurance is `additionalType: 1` (`additionalTypeName: "Ubezpieczenia"`): 2887 Ochrona Standard, 1005 Komfort, 1006 Premium. On that dated list `price` is the per-day price of the band for the day count (Komfort bands 129 / 69 / 49 / 39 / 29 zł; 69 for 3 days). `calculatedPrice` is the window total (207). Calculate with `addonIds: [1005]` for offer 4457 returned `total` 612.60 = rent 405.60 + 207, and an addon line `{ price: 207, itemPrice: 69 }`. Each insurance has an `image` (a shield, managed in RentCarSoft) and `presentation` strings, some with double spaces (`"100%  kosztu naprawy"`). `deductibleReduction` was `null`, not parsed.
- One-time extras on a dated list: `calculatedPrice` is still `price × days` (2909 "Pełny Bak na Start": `price` 405, `oneTimeFee: true`, `calculatedPrice` 2430 for 6 days; 1007 zone 1: 150 → 900). Calculate charges `price` once (addon line `price` 405 and 150, `isOneTime: true`). Per-day extras matched (2754 CarPlay: 5 × 6 = 30 on both). Accessories on calculate: `{ id: 147, quantity: 2 }` gave a line of 144 (12 × 6 × 2), `{ id: 703, quantity: 2 }` (one-time) gave 40.
- Calculate accepts two border zones at once (1007 + 2886) and charges both. The site offers one zone at a time.
- Accessories have the same fields as addons (`additionalType`, `prices`, `calculatedPrice`, …) plus `penaltyAmount` (not parsed). No maximum quantity is sent; the old site capped it at 5.
- Yes/no and select offer keys return value ids that do not depend on `lang`; only the text is translated (`Tak` / `Yes`). Transmission (key 8): `13` manual, `14` automatic. Yes values: 72 `isSmallCar` = `83`, 73 `isCompactCar` = `85`, 74 `isLargeCar` = `87`, 75 `isEcoCar` = `89`, 131 `isDeliveryCar` = `182` (the matching No values are `82`, `84`, `86`, `88`, `181`). Match on `FieldAttribute.valueId`, not on the text. `lib/reservation/offers.ts` uses these ids for the car filters.

## Verified on 12 November 2026

Read-only `GET /offers.json` (short and long term, no dates, all offer keys), `GET /offer/1219.json` in `en`, `GET /offer/999999.json`, and `GET /offer_keys.json`, for the fleet pages.

- The undated short-term list (34 offers) carries the full segment price list: `cennik[segmentId]` with `kaucja`, `limitKm`, `monthly_price`, `is_promocja`, the promotion fields and `czasy` (six bands, `od` null on the first and `do` null on the last). `minPrice` / `maxPrice` are the lowest and highest band `cena` (Aygo 89 / 179). `days` is null and `dailyPrice` equals `maxPrice`. No offer had `is_promocja: 1` that day. Parsed as `Offer.priceList`, `minPrice`, `maxPrice`.
- `details` is an array of strings on both lists and on `getOffer`, some with leading or trailing spaces (`" Zestaw wskaźników…"`). Parsed as `Offer.details`, trimmed.
- `GET /offer/{id}.json` has no `segmentId` field. Its `cennik` has exactly one key, the segment id. `details`, `minPrice` and the gallery are as on the list. An unknown id returns HTTP 404 with an empty body (`not_found`).
- The long-term-only offers 1224 ("Skoda Octavia OLD"), 1231 and 5000 are readable through `GET /offer/{id}.json` (`shortTerm: false`). The undated long-term list had 34 offers, 31 of them also on the short-term list.
- Gallery images carry `urls` with sizes 128, 256, 384, 512 and `original`, each with `webp` and `standard` (png). The main photo (`default: true`) is the last image of offer 1219's gallery; order is not by `default`.
- Key 10 (`description`) is HTML starting with an `<h1>` and contains an FAQ (`<h2>`/`<h3>` questions). Key 10 on `en` for offer 1219 was English; key 79 for 4457 and 1219 on `en` was Polish (the silent fallback). Dictionary ids for the equipment select keys: 65 central lock (65 Tak, 66 Nie), 67 air conditioning type (69 manual, 70 automatic, 170–172 zones), 68 windows and 69 mirrors (71/73 manual, 72/74 electric), 76 Bluetooth (90 Nie, 91 Tak), 77 cruise control (92 Nie, 93 Tak, 179, 180 active), 128 Android Auto/CarPlay (167 Brak, 168 wireless, 169 wired), 129 parking sensors (173 Brak, 174 rear, 175 front and rear), 130 rear camera (176 Brak, 177 rear, 178 360°). Fuel (key 9): 15 petrol, 16 diesel, 17 petrol + LPG, 18 hybrid, 102 hybrid + LPG, 110 electric, 202 plug-in hybrid.

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
- Whether `POST /reservation.json` reads accessory `quantity` or `ilosc`. Calculate reads `ilosc`. Until a live create settles it, the create body sends both keys with the same count (the old site sent `ilosc`). Settle it with one intentional test reservation that has an accessory with quantity 2, read it back with `getReservation`, and keep only the key that worked.
- The calculate top-level `available` number added by `onlyAvailableAtLocation`. For both a list-available car and a list-unavailable car it was `0`, while `vehicle.isAvailable` stayed `true`. The quote keeps mapping `vehicle.isAvailable` only. The flag is not on `CalculateReservationInput`.
- Whether create accepts a long-term body whose `months` and `monthlyKmLimit` are omitted. The type now requires both whenever `longTerm` is set.

## Reservation reads, checked 11 November 2026

Checked on `/reservationsall.json` (244 reservations created 20–27 October 2026). Only the structure was inspected, not customer values.

- `createdAt`, `pickUp.date`, and `return.date` are PHP DateTime objects, `{ date: "YYYY-mm-dd HH:mm:ss.uuuuuu", timezone_type: 3, timezone: "Europe/Warsaw" }`. The spec says a string. The parser accepts both and returns `YYYY-MM-DD HH:mm:ss`.
- `client` in a reservation is `{ keys: [] }` with no id. Ownership of a reservation cannot be read from `GET /reservation/{id}`. The panel checks it against `GET /reservations/{clientId}`.
- `offer` is `null` unless `offerKeys` is sent. With `offerKeys=[1,2]`, 186 of 244 had an offer object in the `parseOffer` shape.
- `currency` and `language` were missing from the live object.
- `pickupCode` and `accountManager` were `null` on all 244.
- `payment.chargeSummary` also has `paidOut` and `balance`, which the spec does not list.
- Statuses seen: Oczekująca, Zatwierdzona, Trwająca (`received`), Zakończona (`ending`), Anulowana (`cancel`), Odrzucona, Przekazana. Odrzucona and Przekazana set no flag.
- UNVERIFIED: `GET /reservations/{clientId}` for a client with no reservations (empty array or 404). The account layer treats 404 as empty.

## Password and account writes

- `PUT /client/password/recovery.json` sets a new password from the email alone. It does not take the recovery token. The site must compare the token from its link with `GET /client/password/recovery.json` before calling it (`resetPassword` in `lib/auth/account-actions.ts`).
- UNVERIFIED: whether `POST /client/password/recovery.json` sends the customer an email, and which URL that email links to.
- UNVERIFIED: whether RentCarSoft clears the token after a successful reset.
- UNVERIFIED: `PUT /client/password/{clientId}.json` with a JSON body. The spec puts `password` in the query string.
- UNVERIFIED: `PUT /client/{clientId}.json` with `{ keys: [{ id, value }] }` in a JSON body. The spec puts `keys` in the query string. The account form reads the client back after saving and reports `not_saved` when a value did not change.
- UNVERIFIED: the value format for select keys on write. The bridge sends the option id (`"18"` for “Tak” on key 47).
- UNVERIFIED: `PUT /client/{clientId}.json` with `{ keys: [{ id, value }] }` in a JSON body. The spec puts `keys` in the query string. The account form reads the client back after saving and reports `not_saved` when a value did not change.
- UNVERIFIED: the value format for select keys on write. The bridge sends the option id (`"18"` for “Tak” on key 47).
- UNVERIFIED: `POST /clients.json` on the live API, and whether it rejects a duplicate email. The site checks the email first with `clientEmailExists`.

## Spec gaps the client follows the live API for

- Long-term calculate response fields above.
- Promo `success` as a string.
- JSON bodies for login and password recovery writes.
- Long-term extras flag (live API, 12 November 2026, segment 8474): the addon list answers only to `longTerm=true` (with `loadLongTerm` it returned no items), the accessory list only to `loadLongTerm=true`. The old site sent the same pair. `buildExtrasQuery` now sends `longTerm` for addons and `loadLongTerm` for accessories. The long-term addon list also contains daily-only items (e.g. "Strefa 1 (limit 400 km/ doba)") with `monthlyPrice: null`; the reservation flow leaves those out.
- Long-term calculate (same day, offer 5196, 3 months, 2000 km): addon and accessory lines carry the whole-period `price` and `isOneTime`; accessories send the per-unit price as `itemPriceMoi`, addons as `itemPrice` (the parser reads either). `total` = `razem_miesiecznie_najem_akcesoria_dodatki` × months + `razem_jednorazowo` (2950 × 3 + 100 = 8950). The line `id` field held the price, not an id. `iloscMiesiecy` was not echoed once a one-time addon was added, so callers should keep their own month count.
- Calculate accessory quantity is `ilosc`. OpenAPI names the same field `quantity`.
