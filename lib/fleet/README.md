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

Server-only. `listFleetCars(lang)` reads the daily catalog (`listAllOffers`, term `short`); `getFleetCar(lang, id)` reads one offer (`getOffer`). Both ask with a pickup date of now and no return date (`catalogPickup`): RentCarSoft sends a running promotion only with a pickup date (none of 35 cars undated, 25 dated, 19 November 2026); the other fields are the same. The bridge keeps such a dated request two minutes (a search); `cars.ts` caches the fleet built from it (`rcs:catalog`, `hours`, `setPriceLife`) when `CACHE_ENABLED` is on (production) and read live when it is off (local, preview); see `lib/cache.ts` and `lib/rentcarsoft/docs/caching.md`.

What the undated catalog carries (checked on the live API on 12 November 2026, 34 offers):

| Field | Used for |
| --- | --- |
| `cennik[segmentId].czasy` | The price table: base price per day for 1 / 2–3 / 4–7 / 8–14 / 15–29 / 30+ days, with `promocja` when a promotion runs (only on a dated request). Parsed as `Offer.priceList.bands`. |
| `cennik[segmentId].monthly_price` | Not shown. It is not a bookable price (1500 against a quoted 1900 for the Aygo on 13 November 2026); the monthly "from" comes from the calculator, see below. |
| `cennik[segmentId].kaucja`, `deposit` | Shown only when above 0 (0 for every car on that date), like the reservation cards. |
| `minPrice`, `maxPrice` | Fallback for "od X zł / doba" when there are no bands. |
| `details` | Free-text equipment lines. Polish only, so only the Polish page lists them. |
| `gallery[].urls.original` | The large gallery photo (`OfferImage.largeWebp`). The 512 px size is the thumbnail and the card photo. |

`GET /offer/{id}` has no `segmentId`; its `cennik` has exactly one segment key, which the bridge takes as the offer's own.

**Daily price** (`daily-price.ts`, decided 13 November 2026). The "od" is the real lowest price a car can be booked for, never a bare number: `FleetCard.daily` holds the cheapest band (`price`), the rental length it needs (`fromDays`) and the 1-day price (`oneDay`, "1 doba: 179 zł", `fleet.oneDayPrice`). The fleet card shows the bare "od" (no rental length or 1-day price, decided 19 November 2026; the monthly "od" only for a car without a daily one), so the cards in rows and sliders stay short; the header's "Samochody" panel and the Car classes cards show the bare "od" too (decided 20 November 2026). The car page's booking box and phone bar show the bare "od" with no notes (decided 19 November 2026); the meta description and the `Car` JSON-LD (`eligibleDuration`) carry the condition too. A promotional band price counts only between `promocja_od` and `promocja_do` (Warsaw time, `bandsAt`); the fleet data is cached like the catalog but its lifetime ends at the next promotion start or end (`nextPriceChange`, `setPriceLife` in `cars.ts`), so a promotion never shows before or after its dates. Prices are gross PLN. Pickup and return fees (airports 79 + 79 zł, delivery to an address 89 + 89 zł) depend on the place and are not in the "od"; the booking shows them.

`classPricesFrom(cars)` gives the "od" per price class and the lowest one, from bookable cars only (`rentable` and rented by the day). On 13 November 2026: 34 cars, 32 bookable, 22 classes with a price; the lowest is Klasa A, 89 zł per day from 30 days, 179 zł for 1 day; the highest "od" is BUS 9 os., 299 zł.

**Monthly price** (`price-from.ts`). The client's rule: "od" is the lowest price a customer can actually book. `monthlyPricesFrom(lang)` asks the long-term calculator once per rental length the site offers (`longTermMonthCounts`, 9 lists) with the smallest kilometre package (`kilometerLimits`, 1000 km) and keeps each car's lowest monthly price with its length; `FleetCard.monthlyFrom` and `monthlyTerms` come from it. The car page shows the monthly "od" without its terms (decided 19 November 2026). A car with no quote for any length (the Yaris on 13 November 2026) shows no monthly price. The result is cached like the catalog (`rcs:catalog`, `hours`) in `lib/fleet`, so the bridge's 2-minute quote cache stays as it is. With the cache off (local, preview) every page render makes these 9 requests: the list page takes 10–15 s locally.

**Which cars.** The list is the daily catalog in the API's order ("Polecane"), including the two cars with `rentable: false` (the old site listed them too). Long-term-only offers (`1224 Skoda Octavia OLD`, `1231`, `5000`) are not on the list, but their pages render if linked: the page works for any id the API knows. The booking widget on such a page is locked to its only term.

**Translations.** Select values (gearbox, fuel, body) and `segment` come translated by the API. Key names do not, so spec labels are ours (`messages/*.json` → `fleet.specs`, `fleet.features`). Text keys fall back to Polish silently (`lib/rentcarsoft/docs/quirks.md`); on a non-Polish page `getFleetCar` also reads keys 10, 79 and 80 in Polish and drops any text equal to it. The English page then falls back to the legacy English description (key 133). German and Ukrainian pages without a translation show no description and use the generated meta title and description.

**Equipment.** Select keys with a "No" / "None" value (ids in `NO_VALUES`) are left out; "Tak" shows the feature name alone, other values follow it ("Kamera cofania: 360 °").

**Description HTML.** Offer key 10 is HTML typed in RentCarSoft. `sanitize.ts` keeps text formatting only (an allowlist of tags, no attributes except a safe `href`), strips scripts and handlers, and moves headings one level down: the texts start with their own `<h1>`, and the page already has one. Tested in `fleet.test.ts`.

## Car card (`components/fleet/fleet-card.tsx`)

One card for the whole site: the fleet list, "Podobne samochody" and the CMS cars block. Server-safe markup, no state; the whole card is one link (one tab stop). "Clear Road" look: `rounded-card`, `border-line`, `shadow-card`, a 2 px lift and `shadow-lift` on hover (off with reduced motion), focus ring on the card. `sizes` can be passed for a scroll row.

## CMS cars block (`components/blocks/cars.tsx`, `cars-block.ts`)

`blocks.cars`: the fleet on any CMS page (delivery vans, electric cars, family cars, business). The CMS stores only the choice; names, prices and photos come from the one cached catalog list (`listFleetCars`), filtered in the server component, so several blocks on a page make no extra RentCarSoft request. No client JavaScript.

- `source: "all"` – the daily catalog in the API's order.
- `source: "classes"` – `segmentIds`, RentCarSoft price classes (`segmentId`, stable ids; names are translated and get renamed). Picked in Strapi through a multi-select custom field fed from the API. Ids no longer in the catalog are skipped with a server warning (the old site still filters EV on `6317`, which no longer exists).
- `source: "category"` – `electric` (fuel value 110), `delivery` (category 182), `family` (7+ seats, not delivery), `automatic`. Survives a reshuffle of the classes.
- `limit` (empty = all), `layout` `grid` or `row` (a swipeable row on phones with CSS scroll snap, the next card peeking in; a grid from `lg`), `cta` (empty = "Cała flota" to the fleet list), the shared `section` style and header.

The type lives in `lib/fleet/cars-block.ts` until the Strapi bridge exports it (`lib/strapi`, Worker B); `selectBlockCars` is tested in `fleet.test.ts`. The switch in `components/blocks/blocks.tsx` gets its `cars` case together with the bridge.

**Better than the old pages.** The old van page lists four cars without prices, with units mixed up ("13m3" in a litres field, 17 m³ in the text against 15 m³ on the cards); the electric page shows one card (MG 4) and nothing about range or charging. With this block those pages show every matching car with its "od" price per day and per month, the same card as the fleet, and they never go stale when RentCarSoft adds or drops a car. Copy about payload, dimensions or charging belongs in the page's own CMS blocks next to it.

## List page

- Server-rendered with every car in the HTML (good for search engines), then filtered in the browser (`components/fleet/fleet-browser.tsx`).
- Filters, one value per group: category (the old site's small / compact / large / eco / delivery, matched by value id, `OFFER_CATEGORIES` in `lib/reservation/offers.ts`), gearbox, fuel (value ids of key 9), seats ("5+", "7+", "9+"). Sort: recommended (API order), price up, price down. A group with nothing to choose from is hidden. Each group is a `ChoiceChips` (`components/ui/choice-chips.tsx`, React Aria `ToggleButtonGroup`): one Tab stop per group, arrows between chips, pressing the chosen chip again clears the filter.
- **The query string is the state**: `?category=eco&gearbox=automatic&fuel=18&seats=7&sort=price_asc` (`filters.ts`, tested). The keys are the same in every language. The page does not read `searchParams` on the server, so it stays static; the browser applies the query after hydration through `useSyncExternalStore`, and changes use `history.replaceState`.
- **Collections** (20 November 2026). A CMS car collection (`api::car-collection`) marked "Show in fleet" is a shortcut in the header's Samochody menu (instead of the fixed vans and electric links), with its Lucide icon, in the CMS order (`fleetOrder`, then title), and only while it has cars. The shortcut leads to the collection's landing page (a CMS Page, picked per language: Strapi 5 keeps relations per language) when that page has a URL in this language, else to the fleet filtered to it: `?collection=<slug>`, the slug translated, the key English like the others (`fleetCollectionHref` in `lib/strapi/modules/fleet-collections.ts`, tested). The list narrows to the collection first (`collectionCars`, the rules the Cars section uses, no RentCarSoft call) and the other filters work within it; while it is on, a red "Dla rodzin ×" pill over the list says why and drops it, and "Wyczyść filtry" drops it too. No row of collection chips on the list: they would repeat the filters. Collections are read once per language, cached until a car collection is saved (`cms:car-collection`).
- Below `lg` the filters open in a bottom sheet (`components/ui/sheet.tsx`, React Aria: focus kept inside, swipe or Escape closes it) from a "Filtry" button with the number of active filters; the sheet ends with "Pokaż wyniki (n)".
- The note "Rezerwujesz klasę samochodu…" is the old site's `infoCar.all`: a booking is for a class, "or similar".

## Car page

In order: breadcrumbs, segment and `h1` ("Wynajem Toyota Yaris"), gallery, key facts (seats, gearbox, fuel, doors, luggage), the class note; beside them a sticky box with the "od" price and the booking widget; then the price table, long-term rental, technical data, equipment, description, and "Podobne samochody".

- **Phone bar.** Below `lg` a bar at the bottom shows the "od" price and "Sprawdź dostępność", a link down to the booking box (`#book`). It moves out of the way while the booking box is on screen (`sticky-book-bar.tsx`, an `IntersectionObserver`) and uses the booking flow's `data-mobile-summary-bar`, so `globals.css` keeps room for it at the page end and above the preview banner.
- **Booking.** The box holds the homepage widget (`ReservationPicker`) with `offerId`: "Szukaj" opens the reservation page with this car chosen and the next step open (`offer=<id>&step=protection`), for daily and monthly rental alike. If the car is not in the list for the chosen place and dates, the reservation page falls back to the car list with "Wybrane auto nie jest dostępne…" (`lib/reservation/README.md`). The widget starts on the visitor's last search, so a car with both terms can open on the monthly tab.
- **Monthly availability differs from the catalog flag.** `longTerm: true` and a `monthly_price` do not mean the car is on every monthly list: on 12 November 2026 the monthly list for place 479, 3 months and 2000 km had 14 cars and no Toyota Yaris (1219), although its page shows "od 1500 zł / mies.". The monthly list depends on the months and the kilometre limit.
- **Similar cars** (`similarCars`): up to four, the most shared categories first, then the closest "od" price.
- **Fleet page from the CMS.** `/[lang]/flota` (`app/[lang]/fleet/page.tsx`) is the CMS page at that path in the language: its blocks, with the cars list as a `cars` block with the `catalog` layout (the filters and the `ItemList`, `CatalogList` in `components/blocks/cars.tsx`). Metadata come from that page's SEO, hreflang from its language versions, and a `BreadcrumbList` stands in for the visible trail. A language whose CMS has no fleet page (or one without blocks) answers 404; the sitemap lists the fleet page only where it exists. A `cars` block with `classes` and no class picked shows every car.
- **Rendering.** `generateStaticParams` prerenders one car (the first of the Polish catalog; `catalog-unavailable`, a 404 without RentCarSoft, when the catalog cannot be read at build). Every other car renders on its first visit and is cached from then on, so one RentCarSoft 5xx no longer stops a build.
- **RentCarSoft down.** When `getOffer` fails with anything but `not_found`, `getFleetCar` returns the car's catalog card (`partialFleetCar`, `partial: true`, cached for minutes): photo, list facts and the "from" price, no specs, equipment, description or price table. The page says the details are unavailable, with the hotline and the booking form, and stays indexable; its JSON-LD carries a price only when the catalog has one. When the list cannot be read either, the error stands. The page sets `export const instant = false` and reads `params` and the offer before rendering, outside `<Suspense>`, so an unknown id answers a real 404 and an old slug a real 308 (inside a streamed part both would come back as 200).

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
