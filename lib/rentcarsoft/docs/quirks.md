# Quirks

Checked against OpenAPI 1.0.8 and the live MobiCars API on 8 October 2026, with a read-only follow-up on 9 October 2026. Items marked UNVERIFIED were not settled. No reservation was created.

OpenAPI 1.0.10 (22 October 2026) did not change any operation listed here. Every spec gap below is still present in 1.0.10. Nothing was re-checked on the live API for that version.

OpenAPI 1.0.11 (the copy in `tmp-spec/spec-1.0.11.php`, read on 24 November 2026; diff against 1.0.10 in `tmp-spec/diff-1.0.10-1.0.11.txt`) caught up with part of this file:

- Now documented as the live API behaves: JSON bodies for login, password recovery, `PUT /client/{id}` and `POST /client/password/{id}`; the recovery `email` as a string; `GET /client/{id}` as one object; `pickUp.date` and `return.date` as PHP DateTime objects (`PhpDateTime`); the calculate `available` field.
- Changed: `POST /client/password/{clientId}.json` (was `PUT`). The bridge followed on 24 November 2026; see "Password and account writes".
- Still wrong or missing in 1.0.11: everything under "Spec gaps the client follows the live API for", `createdAt` (still a string in the spec), `order` (typed `integer`), `mark` / `model` (swapped live), and the promo verification body. Each item below says which.

OpenAPI 1.0.12 (`tmp-spec/spec-1.0.12.php`, read on 25 November 2026) answers our list of 24 November. The API changed with it, so several entries below describe the API before 1.0.12; see "Verified on 25 November 2026" for what holds now. In short: `mark` / `model` are no longer swapped, one-time `calculatedPrice` is no longer multiplied by days, calculate reads `quantity` (and still `ilosc`), calculate line `id` is the item id, `createdAt` is a string, `order` is typed as a string, both long-term flags work on both extras lists, and the API now returns HTTP 400 for `longTerm=1` without `iloscMiesiecy` and for `onlyAvailable=true` without dates. The promo body, the long-term calculate fields and `longTermKalukator` / `okresLongTerm` / `limitLongTerm` are now documented.

## Verified on 25 November 2026 (API 1.0.12)

Read-only calls: offers, addons and accessories for segment 1462 with a six-day window (7–13 December 2026), calculate for offers 1218 (short) and 5196 (3 months), one invalid promo code, reservations created 20–25 November (structure only) and one reservation read. No reservation was created.

- `mark` is the make and `model` the model (1230: `Skoda` / `Superb`). The old site had built names as `model mark` to undo the swap; it showed "Superb SKODA" and moved its car URLs until it was changed to `mark model` (`mobicars-pl` a6a9e82). The bridge always mapped `brand` ← `mark`, so only the name fallbacks in `lib/reservation/offers.ts` and `lib/fleet/cars.ts` changed order.
- One-time extras: `calculatedPrice` and `discountedCalculatedPrice` equal `price` / `priceDiscounted` (2910 "Pełny Bak na Start" 299 / 299, zones 1007 / 1008 / 2886 150 / 400 / 600, accessory 703 20 / 20). Per-day extras still multiply (1005: 49 → 294 for 6 days).
- Calculate prices accessories sent as `quantity` (`{ id: 147, quantity: 2 }` → line 144, the same as `ilosc`; one-time 703 × 2 → 40). Line `id` is the accessory or addon id (147, 703, 2910 short; 1005, 2994, 147 long). Lines also carry `name`, `nameEn` and `suggested`. The bridge sends `quantity` on calculate since this check.
- Long-term calculate with `quantity: 1` priced the accessory per month (147: 150 × 3 = 450). `total` 10170 = 3300 × 3 + 270, as before.
- `longTerm=1` without `iloscMiesiecy`: HTTP 400 `{ success: false, error: "Parametr iloscMiesiecy jest wymagany …" }`. `onlyAvailable=true` without dates: HTTP 400 with a similar body. The bridge already refuses both before calling (`invalid_request`).
- Invalid promo code: still HTTP 200 `{ success: "false", kod: null }`, now documented.
- `order=default` and `order=pozycja` returned the same first page (1218, 7082, 4457, 1219, …); omitting `order` sorts by price (1.0.12 default `price_asc`).
- `/addons.json` long-term flag: `longTerm=true` returns only items with the RentCarSoft panel's long-term field set to yes and a monthly price (0 counts). "Ochrona Standard" (2887) was missing from the monthly list until that field was switched on in the panel. `longTerm=false` returns only items set to no that have a monthly price (2 of 14 for segment 1: 1010, 2887) — not "everything short-term". The old site sent `false` on every short-term booking and lost the extras and Komfort / Premium until it stopped sending it. Send the flag only as `true`.
- Reservations: `createdAt` is a `YYYY-MM-DD HH:mm:ss` string on all 168 reservations from 20–25 November; `pickUp.date` is still the PHP DateTime object. `currency` and `language` are on `GET /reservation/{id}` but still missing from `/reservationsall.json`. `/reservationsall.json` without a `created_od` / `created_do` filter answered HTTP 502.
- Answers from the API author (e-mail, 25 November 2026, not checked live): create reads both `quantity` and `ilosc`, `quantity` preferred; `GET /reservations/{clientId}` with no reservations returns HTTP 200 and `[]`; `paymentMethod` is optional, an unknown id returns HTTP 400, and only an online method from `payment_types` produces a payment link.

## Verified on the live API

- Login and password recovery POST/PUT accept a JSON body. The same calls with query or form fields returned HTTP 500 and an empty body. Specs up to 1.0.10 described query parameters; 1.0.11 describes the JSON body.
- Password recovery GET accepts `email` as a query string. A non-integer email is processed. Specs up to 1.0.10 typed that email as `integer`; 1.0.11 types it as a string.
- `order=pozycja` is not a distinct sort (1.0.11 typed `order` as `integer` with string values `default`, `price_asc`, `price_desc`, `name_asc`, `name_desc`; 1.0.12 types it as a string, default `price_asc`). It matched `order=default` and an unknown token. Omitting `order` matched `price_asc` for the first page that was compared.
- `longTermKalukator` is read. Alone, the tested list came back empty. With `okresLongTerm=1` and `limitLongTerm=1000`, rows remained and prices changed. `okresLongTerm=12` with `limitLongTerm=2500` and the calculator flag returned no rows. An unknown parameter did not change the list.
- Service-point key `2` is Status. Value `6` is Aktywny. Value `7` is Nieaktywny.
- Payment type `1` is “Nie podano”.
- An invalid promo code returned `{ success: "false", kod: null }` with HTTP 200. The spec describes that body since 1.0.12.
- A long-term calculate call with `longTerm=1`, twelve months, and a one-year date range returned the extra price fields listed in `legacy-decisions.md`. The spec’s 200 schema includes them since 1.0.12.
- The same calculate call with `longTerm=true` and a one-week range stayed on the short schema and added `limitKmDzienny`.
- Successful catalog bodies were JSON. `Content-Type` was `text/html; charset=UTF-8`. Responses were not JWTs. The `useJwt` flag itself is not readable.

## Also observed on that calculate response

These types differ from the schema (unchanged in 1.0.11) and are accepted by the parsers as strings or numbers:

- `prices.days` can be a string on the short response.
- `vehicle.deposit` and the vehicle price fields can be strings.
- `vehicle.id` and `release.id` can be strings.
- `vehicle.details` items can be objects with `fk_oferta` and `nazwa`. The schema says an array of strings. The bridge does not interpret those objects.

The bridge does not build `/grafiki/oferta/512/`. That path was only in the old client.

## Verified on 22 October 2026

Read-only `GET /offers.json`, two short-term offers (1218, 4457), `keys` 1, 10, 79, 80, 133, with `lang` `pl`, `en`, and `de`. Same three languages on `GET /offer_keys.json`. Follow-up the same day added `uk` (and `5`, `ua`) on both calls. The spec types `KeyValue.value` as a plain string and does not say whether it follows `lang`.

- Text custom fields are translated per `lang`. Offer 1218 returned English `metaTitle` (79), `metaDescription` (80), and `description` (10) for `en`. For `de` it returned German 79 and 80, but Polish 10.
- A missing translation falls back to Polish silently. Offer 4457 returned the same Polish 10, 79, and 80 for all three languages. The response does not say which language a value is in.
- Key 133 (`descriptionEn`) is a separate legacy field. It returned the same English text for every `lang`. Where key 10 is translated, 133 is redundant. Keys 127 (`longTermDescription`, textarea, Polish) and 134 (`longTermDescriptionEn`, text, English) are named so in the live key dictionary (`offer_keys.json`, checked 2026-11-13); monthly-rental reads request both (`DEFAULT_LONG_TERM_OFFER_KEY_IDS`). Whether 127 changes with `lang` like key 10 is UNVERIFIED.
- `segment` follows `lang` (`Klasa A`, `A Class`, `A-Klasse`).
- `GET /offer_keys.json` translates select **values** per `lang` (`8`: `13=Manualna` / `Manual` / `Schaltgetriebe`; `128`: `168=Bezprzewodowy` / `Wireless` / `Kabellos`). Key **names** are not translated: `Skrzynia biegów`, `Czujniki parkowania`, and `Klimatyzacja` came back in Polish for `en` and `de`. On the offer, select fields return the value id (`8: "13"`), the same for every `lang`. `mapCustomFields` resolves that id through the dictionary loaded for the same `lang`, so `FieldAttribute.value` is already translated. The bridge does not expose the key name. `FieldAttribute.label` is the stable code name from `labels.ts`, so the site needs its own translated labels for spec rows.
- The four MobiCars languages from `/languages.json` are `pl` (id 1), `en` (2), `de` (3), and `uk` (5). With `uk` or `5`, select values came back in Ukrainian (`13=Механічна`), offer 1218 returned Ukrainian 79 and 80 and Polish 10, and `segment` was `Клас A`. Key names stayed Polish in all four languages. The key objects had no field beyond `id`, `name`, `type`, `mask`, `required`, and `values`, so there is no hidden translation map like `names` on addons.
- `lang=ua` is not an error. It returned the Polish dictionary and Polish text. Ukrainian must be sent as `uk`. A future `ua` site route has to map to `uk` before calling the bridge.

Consequences for callers: request 79 and 80 explicitly through `offerKeyIds`, because they are not in `DEFAULT_OFFER_KEY_IDS`. Read them from `Offer.attributes.metaTitle` and `Offer.attributes.metaDescription`. A non-Polish page cannot tell a real translation from the Polish fallback without a second `lang=pl` call.

## Verified on 11 November 2026

Read-only `GET /offers.json` for the reservation pages. A short-term list with `pickupDate` / `returnDate` three days apart, with and without `onlyAvailable`, in `pl` and `en`. A long-term list with `longTermQuote` (3 months, 2000 km) and a three-month window. No calculate or create call.

- Before API 1.0.12, `mark` held the model and `model` the make (offer 1218: `mark: "Aygo"`, `model: "Toyota"`; 4457: `mark: "Fabia"`, `model: "Skoda"`). Fixed in 1.0.12 (see 25 November). Key 1 (`name`) holds the full name, `Toyota Aygo`. The bridge keeps the spec mapping (`brand` ← `mark`); callers show `attributes.name` and fall back to brand and model.
- On the dated short-term list, `calculatedPrice` is the price of the whole window: `dailyPrice × days` on every checked row (139 × 3 = 417, 169 × 3 = 507). The day count rule for partial days was not tested.
- The long-term list has no `dailyPrice` or `calculatedPrice`. Each row carries `days`, `liczbaMiesiecy`, `limitMiesieczny`, `details`, and `cennik: { cena_miesieczna: 2650, limit_km_miesieczny: "50.00" }`. `cena_miesieczna` is parsed as `Offer.monthlyPrice`. The old client showed it as the gross monthly price and divided it by 1.23 for net. What `limit_km_miesieczny` means (here `50.00` for a 2000 km limit) is UNVERIFIED; it is not parsed.
- The dated short-term list carries promotions. Top level: `isDiscounted`, `discountedCalculatedPrice`, `discountedMinPrice` / `discountedMaxPrice` and their `…NoMileageLimit` twins, `days`, `minPrice` / `maxPrice`, `isMileageLimit`, `mileageLimit`, `mileageLimitFee`, `sellNoMileageLimit`. `cennik` is keyed by `segmentId`: `{ nazwa, kaucja, limitKm, monthly_price, is_promocja, promocja_nazwa, promocja_od, promocja_do, czasy: [{ od, do, cena, cena_bez_limitu, promocja, promocja_bez_limit, limit_km }] }`. `is_promocja` came back as the number `1` / `0`; the old client typed it as a string.
- `discountedCalculatedPrice` = the promotional band price × `days` (125.10 × 3 = 375.30 for offer 1218; 95.20 × 6 = 571.20). `calculateReservation` for the same offer, place and window returned `total` 375.30 and `priceDiscounted` 375.30, so the list price is what the quote charges. With no promotion in the window (10–12 January 2027) `isDiscounted` was `false`, `is_promocja` `0`, and the discounted total equalled `calculatedPrice`.
- The bridge maps `isDiscounted`, `discountedCalculatedPrice`, `days`, and `Offer.promotion` (name, start, end from `cennik[segmentId]`). It does not map the `czasy` bands; the API already applies them to the dated totals.
- The list's mileage fields disagree with calculate: the list said `mileageLimit` 1000 and fee 0.65 for offer 1218, calculate said 400 and 0.5 for the same window. Show the kilometre allowance from the quote, not from the list. Not parsed.
- Gallery images carry `default`, `cover`, and `coverBig`. Exactly one image per offer had `default: true` on the checked page; several had `cover: true`. The old client showed the `default` image. It is `OfferImage.main`. Main photos are studio shots on white, so show them uncropped (`object-contain`).
- Same place (479) and window (20–23 November 2026): without `onlyAvailable` the list had 33 offers in 23 segments, 8 of them `available: false`. With `onlyAvailable=true` it had 25 offers in 18 segments; the flag removed exactly those 8 but kept one `rentable: false` offer (6876, Skoda Octavia Kombi). `onlyAvailableAtLocation` on top left 23 offers in 17 segments. The old site sent no availability flag and did not filter, so it listed booked cars as choosable. The new pages do the same on purpose: they list every car, because the customer books a class "or similar" (product decision, `lib/reservation/README.md`, "Availability").
- `GET /addons.json` with `priceSegments=1463` and the same window returned 17 addons. Insurance is `additionalType: 1` (`additionalTypeName: "Ubezpieczenia"`): 2887 Ochrona Standard, 1005 Komfort, 1006 Premium. On that dated list `price` is the per-day price of the band for the day count (Komfort bands 129 / 69 / 49 / 39 / 29 zł; 69 for 3 days). `calculatedPrice` is the window total (207). Calculate with `addonIds: [1005]` for offer 4457 returned `total` 612.60 = rent 405.60 + 207, and an addon line `{ price: 207, itemPrice: 69 }`. Each insurance has an `image` (a shield, managed in RentCarSoft) and `presentation` strings, some with double spaces (`"100%  kosztu naprawy"`). `deductibleReduction` was `null`, not parsed.
- Before API 1.0.12 (fixed then, see 25 November): one-time extras on a dated list: `calculatedPrice` is still `price × days` (2909 "Pełny Bak na Start": `price` 405, `oneTimeFee: true`, `calculatedPrice` 2430 for 6 days; 1007 zone 1: 150 → 900). Calculate charges `price` once (addon line `price` 405 and 150, `isOneTime: true`). The spec (1.0.8 to 1.0.11) says the same: with `oneTimeFee=true`, `price` is the one fee for the whole period and `calculatedPrice` / `discountedCalculatedPrice` are not the total (use `price` / `priceDiscounted`). So `lib/reservation/extras.ts` shows `price` for one-time extras. `lib/reservation/protection.ts` still totals insurance from `calculatedPrice`, which is right only while every insurance is per day (2887, 1005 and 1006 were, in the checked list above). Per-day extras matched (2754 CarPlay: 5 × 6 = 30 on both). Accessories on calculate: `{ id: 147, quantity: 2 }` gave a line of 144 (12 × 6 × 2), `{ id: 703, quantity: 2 }` (one-time) gave 40.
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
- Before API 1.0.12: calculate accessories `{ id, quantity: 2 }` left the rental total unchanged and returned a zero-priced line. `{ id, ilosc: 2 }` added `itemPrice × days × 2` to the total. Sending both keys priced the line the same way as `ilosc` alone. The bridge sent `ilosc` on calculate until 25 November 2026; since 1.0.12 it sends `quantity`.
- On those `ilosc` lines, response `id` equalled `price` (`itemPrice × days × ilosc`), not the accessory id from the request. `itemPriceMoi` was absent. Since 1.0.12 `id` is the item id. The quote view does not use it.
- `longTerm=1` with a one-year window switched to the long-term price shape. `longTerm=true` with the same window, twelve months, and a kilometre limit stayed on the short shape (`prices.rent` present, no `cena_miesieczna_najmu`). The bridge still sends `1` on calculate.
- Before API 1.0.12, `longTerm=1` without `iloscMiesiecy` returned the long-term shape with monthly price `0` and total `0` (now HTTP 400). `iloscMiesiecy=12` without `limitKmMiesieczny` returned the same non-zero monthly price as the call that also sent `1500`. The kilometre field was echoed only when it was sent. The domain type still requires both `months` and `monthlyKmLimit` on calculate and on create, so a chosen limit is not dropped between the two calls. That requirement is a bridge rule. The API did not reject the call that omitted the kilometre limit.
- Offer list `onlyAvailableAtLocation=true`, with `servicePoints`, `pickupDate`, and `returnDate`, changed one car on the tested page from `available: true` to `available: false` (15 available without the flag, 14 with it). The bridge passes the flag through only when those three inputs are present.
- `onlyAvailable=true` without dates returned an empty offer list before API 1.0.12; it now returns HTTP 400. The bridge rejects that input locally and does not send it.

## UNVERIFIED

- Successful `GET /client/{id}` body. Specs up to 1.0.10 said an array; 1.0.11 says one object, as the old client read it. Missing ids returned HTTP 404 with an empty body. The parser accepts one object or an array of one object and rejects anything else.
- Whether `statusRez` `1219` is a real reservation status. There is no status dictionary in the API (1.0.11 only calls it "Wymuszony status rezerwacji"). The bridge does not send it unless `forcedStatusId` is passed.
- Whether `createReservation` requires `paymentMethod`. The spec marks it optional (an id from `payment_types`; only online methods produce `paymentUrl`). The API author confirmed it is optional and that an unknown id returns HTTP 400 (25 November 2026). No reservation was created during verification, and the bridge does not default it.
- Fields inside a successful promo `kod` object. Invalid codes return `kod: null`. A non-null object is passed through as a record.
- Accessory `itemPriceMoi` on a long-term quote. The 9 October accessory line was a short-term row and had no `itemPriceMoi`.
- Whether `clientType` `0` and `1` still mean person and company. 1.0.11 gives only the default `0`.
- Whether `mileageLimit=true` is accepted the same way as `1` or as `false`. On 9 October, omit, `true`, `false`, and `1` returned the same total on the tested offer. All 34 dated offers on that page had `dailyPrice` equal to `dailyPriceNoMileageLimit`, so the flag had no price to change. The bridge still sends a boolean only when the caller sets it, on both calculate and create.
- Whether `POST /reservation.json` reads accessory `quantity` or `ilosc`. The API author says both, `quantity` preferred (1.0.12), and calculate reads both. Until a live create settles it, the create body sends both keys with the same count (the old site sent `ilosc`). Settle it with one intentional test reservation that has an accessory with quantity 2, read it back with `getReservation`, and keep only the key that worked.
- The calculate top-level `available` number added by `onlyAvailableAtLocation`. For both a list-available car and a list-unavailable car it was `0`, while `vehicle.isAvailable` stayed `true`. 1.0.11 explains it: `available` is the binding answer, returned only with `checkAvailable=1` (which `onlyAvailableAtLocation` switches on); it is `1` only when a car is free in the window and its stock status does not block it and it has a price list. `vehicle.isAvailable` is a loose check of reservations and schedule blocks only, so it can be `true` with `available` `0`. The `0` for a list-available car is UNVERIFIED against that rule. The quote keeps mapping `vehicle.isAvailable` only (the pages list every car, `lib/reservation/README.md`, "Availability"). The flag is not on `CalculateReservationInput`.
- Whether create accepts a long-term body whose `months` and `monthlyKmLimit` are omitted. The type now requires both whenever `longTerm` is set.

## Reservation reads, checked 11 November 2026

Checked on `/reservationsall.json` (244 reservations created 20–27 October 2026). Only the structure was inspected, not customer values.

- `createdAt`, `pickUp.date`, and `return.date` are PHP DateTime objects, `{ date: "YYYY-mm-dd HH:mm:ss.uuuuuu", timezone_type: 3, timezone: "Europe/Warsaw" }`. 1.0.11 documents that object (`PhpDateTime`) for `pickUp.date` and `return.date`, but calls `createdAt` a string. Since 1.0.12 `createdAt` is a string live as well. The parser accepts both and returns `YYYY-MM-DD HH:mm:ss`.
- `client` in a reservation is `{ keys: [] }` with no id. Ownership of a reservation cannot be read from `GET /reservation/{id}`. The panel checks it against `GET /reservations/{clientId}`.
- `offer` is `null` unless `offerKeys` is sent. With `offerKeys=[1,2]`, 186 of 244 had an offer object in the `parseOffer` shape.
- `currency` and `language` were missing from the live object. Since 1.0.12 they are on `GET /reservation/{id}`, but still not on `/reservationsall.json` (25 November 2026).
- `pickupCode` and `accountManager` were `null` on all 244.
- `payment.chargeSummary` has `paidOut` and `balance` besides `amountDue`, `totalPaid` and `remainingToPay`. The spec lists all five (`ReservationChargeSummary`; an earlier note here said otherwise).
- Statuses seen: Oczekująca, Zatwierdzona, Trwająca (`received`), Zakończona (`ending`), Anulowana (`cancel`), Odrzucona, Przekazana. Odrzucona and Przekazana set no flag.
- `GET /reservations/{clientId}` for a client with no reservations: HTTP 200 with `[]`, per the API author (25 November 2026, not checked live).

## Password and account writes

- `PUT /client/password/recovery.json` sets a new password from the email alone. It does not take the recovery token. The site must compare the token from its link with `GET /client/password/recovery.json` before calling it (`resetPassword` in `lib/auth/account-actions.ts`).
- `POST /client/password/recovery.json` emails the customer a new 5-digit code and overwrites the previous one. The code has no expiry date (spec 1.0.11), so the site's attempt limits are its only guard. Sending it needs the client password-recovery email template in RentCarSoft.
- Spec 1.0.11: a successful `PUT /client/password/recovery.json` clears the code. UNVERIFIED live.
- `POST /client/password/{clientId}.json` with a JSON body sets a signed-in client's password. Spec 1.0.11 says `POST` (1.0.10 and earlier said `PUT` with a query string; the bridge sent `PUT` until 24 November 2026). Checked live on 24 November 2026 with a client id that does not exist: `PUT` answers HTTP 405, `POST` HTTP 404 (endpoint found, client not). A successful change on a real account is UNVERIFIED.
- UNVERIFIED: `PUT /client/{clientId}.json` with `{ keys: [{ id, value }] }` in a JSON body (the spec has said so since 1.0.11). The account form reads the client back after saving and reports `not_saved` when a value did not change.
- UNVERIFIED: the value format for select keys on write. The bridge sends the option id (`"18"` for “Tak” on key 47).
- UNVERIFIED: `POST /clients.json` on the live API, and whether it rejects a duplicate email. The site checks the email first with `clientEmailExists`.

## Spec gaps the client follows the live API for

- Long-term calculate response fields above.
- Promo `success` as a string.
- JSON bodies for login and password recovery writes (documented since 1.0.11).
- Long-term extras flag (live API, 12 November 2026, segment 8474; 1.0.11 listed only `loadLongTerm` for both): the addon list answered only to `longTerm=true` (with `loadLongTerm` it returned no items), the accessory list only to `loadLongTerm=true`. Since 1.0.12 both names work on both lists and the flag filters on the panel's long-term field (see 25 November). `buildExtrasQuery` sends `longTerm` for addons and `loadLongTerm` for accessories, only when `true`. The long-term addon list also contains daily-only items (e.g. "Strefa 1 (limit 400 km/ doba)") with `monthlyPrice: null`; the reservation flow leaves those out.
- Long-term calculate (same day, offer 5196, 3 months, 2000 km): addon and accessory lines carry the whole-period `price` and `isOneTime`; accessories send the per-unit price as `itemPriceMoi`, addons as `itemPrice` (the parser reads either). `total` = `razem_miesiecznie_najem_akcesoria_dodatki` × months + `razem_jednorazowo` (2950 × 3 + 100 = 8950). The line `id` field held the price, not an id (the item id since 1.0.12). `iloscMiesiecy` was not echoed once a one-time addon was added, so callers should keep their own month count.
- Calculate accessory quantity was `ilosc` until 1.0.12; it now reads `quantity` as well, and the bridge sends `quantity`.
- `longTermKalukator`, `okresLongTerm` and `limitLongTerm` on `GET /offers.json` are read by the API; documented since 1.0.12.
- `onlyAvailable=true` without dates returned an empty list until 1.0.12; it now returns HTTP 400.
