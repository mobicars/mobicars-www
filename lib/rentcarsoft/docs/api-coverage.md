# API coverage

Baseline: RentCarSoft OpenAPI 1.0.10 (reviewed 22 October 2026; previous baseline 1.0.8). Only operations this bridge implements are listed as implemented. “Later” means the spec has them and the current MobiCars site does not need them yet. “Out of scope” means they stay out of this package.

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
| PUT | `/client/password/{clientId}.json` | implemented | `changeClientPassword` (JSON body, UNVERIFIED live) |
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

## Changes from 1.0.8 to 1.0.10

None of these touch an implemented operation. Requests, parsers, and types in the bridge are unchanged.

- New tag “Blokady pojazdów” with four operations: list, create, update (`dateStart`, `dateEnd`, `reason`), and delete vehicle blockades. Create takes `type` `normal`, `service`, or `regional`. Overlap with a car-blocking reservation or another blockade returns HTTP 409 (`reservation_conflict` or `blockade_conflict`). These are fleet-management writes, so they stay out of scope with the rest of the fleet endpoints.
- `/fleet.json` and `/fleet/{identyfikator}.json` vehicles gain `activeBlockade` (nullable). `status` is documented as the warehouse status, which a blockade does not change.
- New schemas: `VehicleBlockade`, `VehicleBlockadeError`, `VehicleBlockadeReservationConflict`, `VehicleBlockadeReservationRef`, `VehicleBlockadeOverlapConflict`, `FleetActiveBlockade`.

The spec does not say whether an active blockade affects `available` on `/offers.json` or `isAvailable` on `/reservation_calculate.json`. UNVERIFIED.
