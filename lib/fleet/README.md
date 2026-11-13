# Fleet

The fleet list and one page per car, generated from the RentCarSoft catalog. There is no CMS content: every car the API returns gets a page. RentCarSoft calls go through `@/lib/rentcarsoft`; this folder only maps offers to what the pages show.

## Pages

| Page | Polish URL | English URL | German / Ukrainian | App folder |
| --- | --- | --- | --- | --- |
| List | `/pl/flota` | `/en/fleet` | `/de/flotte`, `/uk/avtopark` | `app/[lang]/fleet` |
| Car | `/pl/flota/toyota-yaris-1219` | `/en/fleet/toyota-yaris-1219` | same slug | `app/[lang]/fleet/[slug]` |

- Build links with `fleetHref(lang, slug?)` from `i18n/routes.ts`. Do not write the paths by hand.
- `proxy.ts` rewrites `/pl/flota/…`, `/de/flotte/…` and `/uk/avtopark/…` to the English folder and redirects mixed spellings (`/pl/fleet/…`, a trailing slash) with 308. A second matcher entry covers car URLs with a dot in the slug, which the main pattern skips as files. Same pattern as the reservation pages and the panel (`resolveFleetPath`, tested in `i18n/routes.test.ts`).
- Each language has its own segment (`FLEET_ROOT`): `flota`, `fleet`, `flotte`, `avtopark`. The car slug is the same in all four.
- The language menu keeps the car: `switchLangHref` maps `/pl/flota/toyota-yaris-1219` to `/en/fleet/toyota-yaris-1219`. A filtered list keeps its query.
- The header and the footer link to the list (`layout.fleet` in `messages/*.json`).

## Car slugs (`slug.ts`)

`carSlug(name, id)` → `toyota-yaris-1219`: the name from offer key 1, lowercased, without Polish letters and punctuation, then the offer id.

- **The id stays in the URL.** The page reads only the id (`offerIdFromSlug`). Names repeat in the catalog (two "Renault Trafic" and two "Toyota Corolla" on 12 November 2026), so a slug without the id could not pick one. Competitors that use bare names (99rent) add `-2` suffixes instead.
- **Old URLs keep working.** The old site built the same shape with `slugify` (`mobicars-pl/utils/route.ts`), which kept dots: `nissan-x-trail-7-os.-4431`. Any slug whose name part differs from the current one, including renamed cars, redirects permanently to the current slug. Only the id has to match.
- An unknown id or a slug without an id is a 404.

## Data (`cars.ts`)

Server-only. `listFleetCars(lang)` reads the daily catalog (`listAllOffers`, term `short`, no dates); `getFleetCar(lang, id)` reads one offer (`getOffer`). Both are cached by the bridge (`rcs:catalog`, `hours`) when `CACHE_ENABLED` is on (production) and read live when it is off (local, preview); see `lib/cache.ts` and `lib/rentcarsoft/docs/caching.md`.

What the undated catalog carries (checked on the live API on 12 November 2026, 34 offers):

| Field | Used for |
| --- | --- |
| `cennik[segmentId].czasy` | The price table: base price per day for 1 / 2–3 / 4–7 / 8–14 / 15–29 / 30+ days, with `promocja` when a promotion runs. Parsed as `Offer.priceList.bands`. |
| `cennik[segmentId].monthly_price` | "od 1 500 zł / mies." for cars with `longTerm`. `Offer.priceList.monthlyFrom`. |
| `cennik[segmentId].kaucja`, `deposit` | Shown only when above 0 (0 for every car on that date), like the reservation cards. |
| `minPrice`, `maxPrice` | Fallback for "od X zł / doba" when there are no bands. |
| `details` | Free-text equipment lines. Polish only, so only the Polish page lists them. |
| `gallery[].urls.original` | The large gallery photo (`OfferImage.largeWebp`). The 512 px size is the thumbnail and the card photo. |

`GET /offer/{id}` has no `segmentId`; its `cennik` has exactly one segment key, which the bridge takes as the offer's own.

**Card price.** `FleetCard.dailyFrom` is the cheapest band, promotional when a band has a promotion: the "od" price of the longest rental (89 zł for the Aygo at 30+ days). The table on the car page shows every band, so the "od" is never the only price a visitor sees. Nothing is multiplied or divided.

**Which cars.** The list is the daily catalog in the API's order ("Polecane"), including the two cars with `rentable: false` (the old site listed them too). Long-term-only offers (`1224 Skoda Octavia OLD`, `1231`, `5000`) are not on the list, but their pages render if linked: the page works for any id the API knows. The booking widget on such a page is locked to its only term.

**Translations.** Select values (gearbox, fuel, body) and `segment` come translated by the API. Key names do not, so spec labels are ours (`messages/*.json` → `fleet.specs`, `fleet.features`). Text keys fall back to Polish silently (`lib/rentcarsoft/docs/quirks.md`); on a non-Polish page `getFleetCar` also reads keys 10, 79 and 80 in Polish and drops any text equal to it. The English page then falls back to the legacy English description (key 133). German and Ukrainian pages without a translation show no description and use the generated meta title and description.

**Equipment.** Select keys with a "No" / "None" value (ids in `NO_VALUES`) are left out; "Tak" shows the feature name alone, other values follow it ("Kamera cofania: 360 °").

**Description HTML.** Offer key 10 is HTML typed in RentCarSoft. `sanitize.ts` keeps text formatting only (an allowlist of tags, no attributes except a safe `href`), strips scripts and handlers, and moves headings one level down: the texts start with their own `<h1>`, and the page already has one. Tested in `fleet.test.ts`.

## List page

- Server-rendered with every car in the HTML (good for search engines), then filtered in the browser (`components/fleet/fleet-browser.tsx`).
- Filters, one value per group: category (the old site's small / compact / large / eco / delivery, matched by value id, `OFFER_CATEGORIES` in `lib/reservation/offers.ts`), gearbox, fuel (value ids of key 9), seats ("5+", "7+", "9+"). Sort: recommended (API order), price up, price down. A group with nothing to choose from is hidden. Each group is a `ChoiceChips` (`components/ui/choice-chips.tsx`, React Aria `ToggleButtonGroup`): one Tab stop per group, arrows between chips, pressing the chosen chip again clears the filter.
- **The query string is the state**: `?category=eco&gearbox=automatic&fuel=18&seats=7&sort=price_asc` (`filters.ts`, tested). The keys are the same in every language. The page does not read `searchParams` on the server, so it stays static; the browser applies the query after hydration through `useSyncExternalStore`, and changes use `history.replaceState`.
- Below `lg` the filters fold behind a "Filtry" button with the number of active filters.
- The note "Rezerwujesz klasę samochodu…" is the old site's `infoCar.all`: a booking is for a class, "or similar".

## Car page

In order: breadcrumbs, segment and `h1` ("Wynajem Toyota Yaris"), gallery, key facts (seats, gearbox, fuel, doors, luggage), the class note; beside them a sticky box with the "od" price and the booking widget; then the price table, long-term rental, technical data, equipment, description, and "Podobne samochody".

- **Booking.** The box holds the homepage widget (`ReservationPicker`) with `offerId`: "Szukaj" opens the reservation page with this car chosen and the next step open (`offer=<id>&step=protection`), for daily and monthly rental alike. If the car is not in the list for the chosen place and dates, the reservation page falls back to the car list with "Wybrane auto nie jest dostępne…" (`lib/reservation/README.md`). The widget starts on the visitor's last search, so a car with both terms can open on the monthly tab.
- **Monthly availability differs from the catalog flag.** `longTerm: true` and a `monthly_price` do not mean the car is on every monthly list: on 12 November 2026 the monthly list for place 479, 3 months and 2000 km had 14 cars and no Toyota Yaris (1219), although its page shows "od 1500 zł / mies.". The monthly list depends on the months and the kilometre limit.
- **Similar cars** (`similarCars`): up to four, the most shared categories first, then the closest "od" price.
- **Rendering.** `generateStaticParams` prerenders every car of the daily catalog (same slugs in every language). Other ids render on their first visit. The page sets `export const instant = false` and reads `params` and the offer before rendering, outside `<Suspense>`, so an unknown id answers a real 404 and an old slug a real 308 (inside a streamed part both would come back as 200).

## SEO

- Titles and descriptions: list from `fleet.metaTitle` / `metaDescription`; car from RentCarSoft keys 79 and 80 when translated, otherwise "Wynajem {name} – {segment} | MobiCars" and a generated description with the "od" price.
- Canonical URL and `hreflang` for all four languages plus `x-default` (Polish), absolute, from the `DOMAIN` env (`seo.ts`). The old site had neither `hreflang` nor JSON-LD.
- JSON-LD: `BreadcrumbList` on both pages, `ItemList` on the list, `Car` with an `Offer` priced per day (`UnitPriceSpecification`, `unitCode: DAY`) on the car page.

## Texts

`messages/{pl,en,de,uk}.json`, section `fleet`. Plural words (`results`, `seatCount`, `doorCount`, `days`) are `{ one, few, many, other }` for `i18n/plural.ts`. These files are shared with other areas: add keys with a script (read, add, write), not by hand-merging.

## What competitors do (research of 12 November 2026)

| Site | List | Car page |
| --- | --- | --- |
| mobicars.pl (old) | Filters gearbox and category, no price on cards | Gallery, specs, long text with FAQ, equipment, price table by rental length. No similar cars, no JSON-LD, no hreflang. |
| Express Rent a Car | Six class cards, "od X zł / doba", "lub podobne" | No per-car pages; clear FAQ on deposit, insurance excess and trips abroad |
| 99rent | Filters segment and gearbox, ACRISS code, no price | Booking widget instead of a price table, engine-variant tabs |
| Europcar | Category landing pages (`/fleet/size/suv`, `/fleet/seats/7-seats`) | — |
| Traficar, Ayvens Flex | Classes, not models | Monthly: what the price includes, mileage packages |

Taken over: "od" prices on the cards (daily and monthly), the price table by rental length, the booking widget on the car page, similar cars, structured data, hreflang. Sixt, Panek (closed), Rentis and Getaround could not be read.

## Not done yet

- Indexable filter pages (`/pl/flota/suv`, `/pl/flota/automat`, Europcar style). The filter query is not indexed (canonical points at the bare list).
- A terms box on the car page (requirements: age, licence years, documents; insurance and excess). The old site has them only in each car's FAQ text; they belong in the CMS, not in RentCarSoft.
- `FAQPage` JSON-LD. The FAQ lives inside the description HTML of each car and is not structured.
- The `details` equipment lines have no translations in RentCarSoft.
