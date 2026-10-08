# Legacy decisions

Source of the old client: `mobicars-pl/lib/rentcarsoft`. It is migration reference, not a source of truth. A legacy behavior stays only when the API contract, a recorded live check, or a current product requirement needs it.

## Kept

- Bearer auth from `RCS_URL` and `RCS_KEY`.
- `mileageLimit` is a boolean and is sent only when the caller sets it. The API default is `false`. The old client defaulted calculate to `1` and set the flag on create only for long-term bookings. That split is not carried over.
- Active service points only, by status value `6` (`Aktywny` on the live key dictionary).
- Popular cars: offer key `71`, value `81`.
- Local `YYYY-MM-DD HH:mm` pickup strings.
- Long-term offer parameters `longTermKalukator`, `okresLongTerm`, `limitLongTerm`.
- Long-term quote fields that the live API returned: `iloscMiesiecy`, `limitKmMiesieczny`, `cena_miesieczna_najmu`, `razem_jednorazowo`, `razem_miesiecznie_najem_akcesoria_dodatki`, `limitKmMonth`, `limitKmTotal`.
- Customer creation stays inside reservation `clientKeys`. There is no `POST /clients.json` wrapper.
- JSON body for login and for password recovery POST and PUT.
- Query email for the recovery token GET.
- String promo flag `"true"` / `"false"`.

## Reimplemented

- One `fetch` client instead of Axios.
- One offer module for short and long term.
- Key labels stay local. Select labels come from `/offer_keys.json`, `/service_point_keys.json`, `/client_keys.json`, and `/price_group_keys.json`.
- Cache uses `use cache`, `cacheLife`, and `cacheTag`. Arguments are the cache identity.
- Errors throw `RentCarSoftError`.

## Replaced

- Addon long-term filter is `loadLongTerm`, including the addon list. The old addon client sent `longTerm`.
- Accessory lines use `quantity`.
- Sort is `order=default`, which matched `pozycja` and also matched an unknown sort token on the live list. `pozycja` is not sent.
- Long-term calculate sends `longTerm=1`. A boolean `true` on a short rental window stayed on the short response shape during the live check.

## Removed

- Hard-coded image host `https://mobicars.rentcarsoft.pl/grafiki/oferta/512/`. The quote exposes `imageFile` and `imageWebpFile` only.
- `console` logging of reservation bodies.
- Quantity reconstructed by dividing prices.
- `toISOString()` date handling.
- The fixed cache key `rcsCars` and the service-point cache key that ignored the requested field set.
- Default `paymentMethod: 1` and default `statusRez: 1219`.
- A silent `mileageLimit: true` on every calculate call.
- The duplicate long-offer module and the empty offers type file. Those files were not copied.

## Not treated as fact

- `statusRez` `1219` means a long-term status. The field can be passed as `forcedStatusId`. The id is UNVERIFIED.
- `paymentMethod` `1` means a chosen payment method. Live payment type `1` is “Nie podano”.
- `clientType` `0` / `1` as person / company. The old UI sent that. It was not rechecked live. The field is still passed through when provided.
