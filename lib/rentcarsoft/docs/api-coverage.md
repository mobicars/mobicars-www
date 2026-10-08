# API coverage

Baseline: RentCarSoft OpenAPI 1.0.8. Only operations this bridge implements are listed as implemented. “Later” means the spec has them and the current MobiCars site does not need them yet. “Out of scope” means they stay out of this package.

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
| GET | `/reservation/{id}.json` | later | — |
| GET | `/reservations/{clientId}.json` | later | — |
| GET | `/tpay_payment_methods.json` | later | — |
| POST | `/clients.json` | later | — |
| PUT | `/client/{clientId}.json` | later | — |
| PUT | `/client/password/{clientId}.json` | later | — |
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

Cache column for the implemented reads is in `caching.md`.
