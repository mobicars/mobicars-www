# API coverage

Baseline: RentCarSoft OpenAPI 1.0.12 (reviewed 25 November 2026; previous baselines 1.0.11, 1.0.10 and 1.0.8; copies in `tmp-spec/` next to the repositories). Only operations this bridge implements are listed as implemented. “Later” means the spec has them and the current MobiCars site does not need them yet. “Out of scope” means they stay out of this package.

| Method | Path | Status | Bridge |
| --- | --- | --- | --- |
| GET | `/languages.json` | implemented | `listLanguages` |
| GET | `/currencies.json` | implemented | `listCurrencies` |
| GET | `/payment_types.json` | implemented | `listPaymentTypes` |
| GET | `/offers.json` | implemented | `listOffers`, `listAllOffers` |
| GET | `/offer/{offerId}.json` | implemented | `getOffer` |
| GET | `/offer_keys.json` | implemented | `listOfferKeys` |
| GET | `/service_points.json` | implemented | `listServicePoints` |
| GET | `/service_point/{id}.json` | implemented | `getServicePoint` |
| GET | `/service_point_keys.json` | implemented | `listServicePointKeys` |
| GET | `/departments.json` | implemented | `listDepartments` |
| GET | `/department/{id}.json` | implemented | `getDepartment` |
| GET | `/price_groups.json` | implemented | `listPriceGroups` |
| GET | `/price_group/{id}.json` | implemented | `getPriceGroup` |
| GET | `/price_group_keys.json` | implemented | `listPriceGroupKeys` |
| GET | `/addons.json` | implemented | `listAddons` |
| GET | `/addon/{id}.json` | implemented | `getAddon` |
| GET | `/accessories.json` | implemented | `listAccessories` |
| GET | `/accessory/{id}.json` | implemented | `getAccessory` |
| GET | `/verification_promocode.json` | implemented | `verifyPromoCode` |
| GET | `/reservation_calculate.json` | implemented | `calculateReservation` |
| POST | `/reservation.json` | implemented | `createReservation` |
| POST | `/client/login.json` | implemented | `loginClient` |
| GET | `/client/{clientId}.json` | implemented | `getClient` |
| GET | `/client_keys.json` | implemented | `listClientKeys` |
| POST | `/client/password/recovery.json` | implemented | `startPasswordRecovery` |
| GET | `/client/password/recovery.json` | implemented | `getPasswordRecoveryToken` |
| PUT | `/client/password/recovery.json` | implemented | `completePasswordRecovery` |
| GET | `/reservation/{id}.json` | implemented | `getReservation` |
| GET | `/reservations/{clientId}.json` | implemented | `listClientReservations` |
| GET | `/tpay_payment_methods.json` | later | — |
| POST | `/clients.json` | implemented | `createClient` (UNVERIFIED live) |
| PUT | `/client/{clientId}.json` | implemented | `updateClient` (JSON body, UNVERIFIED live) |
| POST | `/client/password/{clientId}.json` | implemented | `changeClientPassword` (JSON body, UNVERIFIED live) |
| GET/POST/PUT/DELETE | client drivers | later | — |
| GET/POST/PUT/DELETE | client representatives | later | — |
| GET | `/reservationsall.json` | out of scope | — |
| GET | `/fleet.json` | out of scope | — |
| GET | `/fleet/{identyfikator}.json` | out of scope | — |
| GET | `/car_id_all.json` | out of scope | — |
| POST | `/car_reservations_services_short.json` | out of scope | — |
| GET | `/car_reservations_services/{id}.json` | out of scope | — |
| POST | `/car_alert_fast_speed_satis.json` | out of scope | — |
| POST | `/car_alert_fast_speed_geonavi.json` | out of scope | — |
| POST | `/raport_aut.json` | out of scope | — |
| GET | `/vehicle_blockades/{identyfikator}.json` | out of scope | — |
| POST | `/vehicle_blockades/{identyfikator}.json` | out of scope | — |
| PUT | `/vehicle_blockade/{id}.json` | out of scope | — |
| DELETE | `/vehicle_blockade/{id}.json` | out of scope | — |

Cache column for the implemented reads is in `caching.md`.

## Changes from 1.0.11 to 1.0.12

No new or removed operation. The API changed together with the spec; `quirks.md` ("Verified on 25 November 2026") has the live check.

- `/offers.json`: `mark` is the make and `model` the model on the live API now. `order` is a string (default `price_asc`). `longTermKalukator`, `okresLongTerm` and `limitLongTerm` are documented. `onlyAvailable=true` without both dates returns HTTP 400. The bridge sends `order=default` and refuses `onlyAvailable` without dates itself, unchanged; the name fallbacks on the reservation and fleet pages now put the make first.
- `/addons.json`, `/accessories.json`: both take `longTerm` and `loadLongTerm`, which filter on the panel's long-term field (with a monthly price). For `oneTimeFee: true`, `calculatedPrice` / `discountedCalculatedPrice` equal `price` / `priceDiscounted`. The bridge sends the flag only as `true`; the site already showed `price` for one-time extras.
- `/reservation_calculate.json`: accessory quantity as `quantity` (preferred) or `ilosc`; line `id` is the item id; the long-term response fields are documented; `longTerm=1` without `iloscMiesiecy` returns HTTP 400. The bridge now sends `quantity` and always sends the month count with `longTerm`.
- `/reservation.json` (create): accessories take `quantity` or `ilosc`. The bridge sends both, unchanged.
- `/verification_promocode.json`: the `{ success: "false", kod: null }` body is documented.

## Changes from 1.0.10 to 1.0.11

No new operation. One implemented operation changed, the rest is documentation catching up with the live API (`quirks.md` has the item-by-item comparison).

- `/client/password/{clientId}.json` is `POST`, not `PUT`, with the password in a JSON body. The live API answers `PUT` with HTTP 405, so the bridge switched (`changeClientPassword`).
- JSON bodies are now documented for login, the three password-recovery calls and `PUT /client/{clientId}.json`; the recovery `email` is a string; `GET /client/{clientId}.json` returns one object. The bridge already sent and read these that way.
- Password recovery: `POST` emails a new 5-digit code that has no expiry and overwrites the previous one; a successful `PUT` clears it.
- `/reservation_calculate.json` documents the top-level `available` (binding, only with `checkAvailable=1`) and calls `vehicle.isAvailable` a loose check. The bridge maps `vehicle.isAvailable` only, unchanged.
- `/reservation.json` (create) documents `paymentUrl` for online methods and a new `paymentError` (reservation saved, payment link not generated: do not create it again), the `paymentMethod` and `currencyId` ids (PLN 1, EUR 9) and the date format `YYYY-MM-DD HH:MM[:SS]`. The site sends payment method 1 (no online payment), so neither payment field is read yet.
- Reservation reads gain `identifier`, `pickupWorkerId`, `returnWorkerId` and `employees`; `pickUp.date` and `return.date` are documented as PHP DateTime objects. Not parsed.
- `Client.discounts` gains `deposit`. Not parsed.
- The calculate and offer-list `available` descriptions now name schedule blocks and the stock status, which answers part of the blockade question below for offers and calculate.

## Changes from 1.0.8 to 1.0.10

None of these touch an implemented operation. Requests, parsers, and types in the bridge are unchanged.

- New tag “Blokady pojazdów” with four operations: list, create, update (`dateStart`, `dateEnd`, `reason`), and delete vehicle blockades. Create takes `type` `normal`, `service`, or `regional`. Overlap with a car-blocking reservation or another blockade returns HTTP 409 (`reservation_conflict` or `blockade_conflict`). These are fleet-management writes, so they stay out of scope with the rest of the fleet endpoints.
- `/fleet.json` and `/fleet/{identyfikator}.json` vehicles gain `activeBlockade` (nullable). `status` is documented as the warehouse status, which a blockade does not change.
- New schemas: `VehicleBlockade`, `VehicleBlockadeError`, `VehicleBlockadeReservationConflict`, `VehicleBlockadeReservationRef`, `VehicleBlockadeOverlapConflict`, `FleetActiveBlockade`.

The spec does not say whether an active blockade affects `available` on `/offers.json` or `isAvailable` on `/reservation_calculate.json`. UNVERIFIED.
