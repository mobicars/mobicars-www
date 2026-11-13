# Reservation flow

How a customer gets from the search widget to a chosen car, and where that state lives. RentCarSoft calls go through `@/lib/rentcarsoft` (see its `README.md`); this folder does not call the API itself.

## Pages

One page per rental term, like the old site. The homepage widget has the days/months tabs; a reservation page shows only its own term.

| Term | Polish URL | English URL | App folder |
| --- | --- | --- | --- |
| Daily (`short`) | `/pl/rezerwacja` | `/en/reservation` | `app/[lang]/reservation` |
| Monthly (`long`) | `/pl/rezerwacja/dlugoterminowa` | `/en/reservation/long-term` | `app/[lang]/reservation/long-term` |
| Thank-you page | `/pl/rezerwacja/potwierdzenie` | `/en/reservation/confirmation` | `app/[lang]/reservation/confirmation` |

- Build links with `reservationHref(lang, term, query)` from `i18n/routes.ts`. Do not write the paths by hand.
- `proxy.ts` rewrites the Polish URLs to the English folders and redirects mixed spellings (`/pl/reservation`, `/pl/rezerwacja/long-term`) with 308, keeping the query. Same pattern as the customer panel.
- Both pages render `components/reservation/search-page.tsx` with a fixed `term`. Reservation URLs are `noindex`: every search is its own URL.

## State

The URL is the source of truth. A refresh, a shared link and the back button all restore the search, and the server can fetch offers without client state.

```
/pl/rezerwacja?pickup=479&from=2026-11-12T10:00&to=2026-11-15T10:00&offer=1219
/pl/rezerwacja/dlugoterminowa?pickup=479&from=2026-11-20T10:00&months=3&km=2000
```

| Key | Meaning |
| --- | --- |
| `pickup`, `pickupAddress` | Service point id, and the customer address when the point takes one (`customAddresses`). |
| `dropoff`, `dropoffAddress` | Return point. Absent means "return where picked up". |
| `from` | Pickup, `YYYY-MM-DDTHH:mm`, Warsaw wall time. |
| `to` | Return, daily only. |
| `months`, `km` | Monthly only. Allowed values are in `config.ts`. The return date is `from` + `months`. |
| `offer` | Chosen car. Written with `history.replaceState`, so choosing does not refetch. |
| `step` | Daily only. Absent: the car list. `protection`, then `extras`, then `details` ("Twoje dane"). All need `offer`; without a matching car the page falls back to the list, without a package to protection, and `details` with a dropped extra to `extras`. |
| `protection` | Chosen insurance addon id. Written with `replaceState`. Absent: none chosen yet. |
| `zone` | Extras: the border trip zone (an addon id). Absent: no trip abroad. |
| `extras` | Extras: switched-on addon ids, comma separated (`2754,3765`). |
| `acc` | Extras: accessories as `id-quantity`, comma separated (`147-2,703-1`). |
| `view` | Daily list layout. Absent: one row per class. `cars`: one card per car. Written with `replaceState`; a new search from the reservation page keeps it. |

The term is in the path, not in the query.

- `search.ts` is the only codec: `draftFromQuery(query, term)` reads, `searchToQuery(search)` writes, and `validateSearch(draft, { places })` checks. Every reader and writer goes through it.
- `storage.ts` keeps the last search in `localStorage` under `mobicars:reservation-search`: `{ v: 2, savedAt, term, query }`. It expires after 30 days. The homepage widget restores it; past dates fall back to the default schedule. Access is wrapped in try/catch. Private mode only loses the convenience; the URL still works.
- Raise `VERSION` in `storage.ts` whenever the stored shape or the query keys change. Old entries are then dropped instead of misread.

## Pickup time rules

- **Lead time:** `pickupLeadMinutes` is 30. With 30-minute slots the first pickup the calendar offers is 30 to 60 minutes ahead.
- **Choosing:** the lead time applies when a time is chosen.
  - The calendar hides earlier slots.
  - "Szukaj" (on the homepage, or "Zacznij od wyboru auta" on the reservation page) checks it with `earliestPickup()`.
  - A search restored from the browser on the homepage gets the default dates if its pickup is earlier.
- **Booking in progress:** the reservation page, the quote endpoint, a change without "Szukaj", and the widget's own copy of the URL search validate against `bookingInProgressStart()`, the start of today.
  - The pickup minute passing while the customer picks a car, protection or extras throws nothing out.
  - Only a pickup on an earlier day (an old link opened the next day) sends them back to choose a new date.
- **Pickup too close or past** (`components/reservation/pickup-time-guard.tsx`): on the reservation page the browser checks the clock after loading and every 30 seconds. Once the pickup is less than `pickupLeadMinutes` away, or past, a popup says so ("Do odbioru zostało mniej niż 30 minut" / "Godzina odbioru już minęła").
  - It offers the earliest open slot (`earliestPickupPoint()`), e.g. "Przesuń na 23:30".
  - Moving keeps the return while it still follows the new pickup; otherwise the return moves by the same amount (`movePickup`, tested). It replaces `from` / `to` and keeps the car, protection and extras; the page then quotes again.
  - "Zmienię termin sam" closes it and scrolls up to the dates. It does not come back for the same pickup time.
  - The clock is read in the browser only, so the server render never differs.
- The final create step must check the time again before booking.

## Widget

`components/reservation/picker.tsx` owns one `SearchDraft` for both terms, so switching tabs on the homepage keeps the place and the date. A `term` prop locks it to one bar; the reservation pages use that.

On submit it does three things:

1. `validateSearch` runs with `earliestPickup()` (now + `pickupLeadMinutes`).
2. Every problem shows in one toast (`sonner`, mounted once in `app/[lang]/layout.tsx` as `components/ui/toaster.tsx`). The fields with problems get `data-invalid`, and focus goes to the first one.
3. A valid search is saved to storage and the router moves to `reservationHref(lang, term, query)`.

**On the reservation pages the widget is `live`:**

- Every change that leaves a valid search (a place picked, dates confirmed in the dialog, "Inne miejsce zwrotu" cleared) calls `router.replace` with the new search. It does this at once, without "Szukaj", and keeps `offer`, `step`, `protection` and `view`.
- The server re-renders. The cars, prices and protection prices follow the new place and dates, and the customer stays on their step. Under the bar, "Aktualizujemy auta i ceny…" shows while the transition runs.
- An edit that is still incomplete (e.g. "Inne miejsce zwrotu" before the return place is picked) waits and navigates nothing.
- If the chosen car is not in the new list (another place has another fleet), the page falls back to the car list with a note asking to pick again. `search-page.tsx` does this.
- **"Szukaj" on a reservation page** opens a dialog saying that changes apply on their own. Its two buttons:
  - "Anuluj" closes it.
  - "Zacznij od wyboru auta" keeps the search and `view`, drops the car and protection, and goes back to step 1.

Customer messages for each problem are in `components/reservation/messages.ts`. The reservation page renders the same messages when a link is incomplete.

| File | Role |
| --- | --- |
| `short-term-bar.tsx`, `long-term-bar.tsx` | One bar per term. Controlled by the picker. |
| `place-fields.tsx` | Pickup and return place, with the dialog (search, popular cities, own address). |
| `dates-dialog.tsx`, `start-date-dialog.tsx` | Range calendar with hours for the daily term; a start day and hour for the monthly term. |
| `schedule.ts` | Slot math and default dates. No React. |
| `dialog-parts.tsx`, `bar-field.tsx` | Shared modal shell, header, calendar grid, option list, bar cell, submit button. |

## Car list

`search-page.tsx` validates the query per request, after `connection()`, because the check compares with the current time. It then calls `listAllOffers`:

- Daily: `servicePointIds: [pickup]` and both dates. No availability flag (see below). The card shows `calculatedPrice` (whole period) and `dailyPrice`.
- Monthly: the same plus `longTermQuote: { months, monthlyKmLimit: km }`. The card shows `monthlyPrice` (gross) and gross ÷ 1.23 as net, like the old site.

`offers.ts` turns each `Offer` into an `OfferCard` on the server, so the client gets only what it shows. `toOfferCards` keeps every offer.

### Filters and phones

- **One choice per group.** Gearbox and category each take one value (tap again to clear). The two groups narrow each other down: "Automatyczna" with "Eko" shows automatic eco cars. Picking a second category replaces the first instead of adding a second group. "Wyczyść filtry" appears whenever a filter is set, and in the empty state.
- **Below `lg`** the filters, the sort and the layout switch sit behind one "Filtry" button (with the number of active filters) that opens a bottom sheet; choices apply at once and "Pokaż N samochodów" closes it. From `lg` they stay inline.
- **Narrow cards.** In a narrow column (the class list below the `@xl` container width, the car grid below `sm`) each class or car is `CompactOfferCard` (`offer-parts.tsx`): photo left, name and specs right, price and "Wybierz" below, about 170px. The other cars of a class become name pills. The 23-class list went from about 13,300px to 5,100px on a 375px phone.
- **Search widget.** On a valid results page it folds into one line (place, dates, a pencil) below `lg` (`compact-search.tsx`); a tap opens the full widget, which stays mounted so live updates keep working.
- **Step changes** navigate with `scroll: false`; `ReservationSteps` scrolls itself into view when the step changes within a visit (not on a fresh load).
- **Card prices, every view.** The total reads "250,20 zł / 2 dni" (`OfferCard.days`, the days the API counted). No per-day price, no "Bez kaucji" (a real deposit still shows). The struck-through regular price is small. The promotion shows its name and "do 15 gru 2026, 23:55", the old site's "Cena obowiązuje przy odbiorze auta do …" (also read to screen readers). Every view (`PromotionLine`): the promotion has its own row right above the price, with only a green icon and no background: the name, then "do 15 gru 2026, 23:55" on its own unbroken line. Above, not below: price and button stay the card's bottom row, level across a row of cards. The "Wszystkie auta" tiles stack price above a full-width button (a four-digit total with "/ 14 dni" leaves no room beside it).
- **No ellipsis on cards.** Class and car names, "X lub podobny", the specs, the promotion and the thumbnail labels wrap instead of being cut ("Toyota Yaris AUTOMAT lub podobny", "Benzyna + LPG").
- **Class card on a phone.** The promotion name sits above the price. The other cars of a class are a thumbnail row (`scroll-row.tsx`) that fades and shows an arrow at an edge with more behind it.
- **Swipe rows** (`slider.tsx`, own code on CSS scroll snap, no library): protection packages below `md` (same order, opening on the chosen or the recommended package), border zones and "Potrzebujesz większego komfortu?" in a narrow column. The next card peeks in and dots show the position. Wider screens get the grid or the comparison table from the same markup. The other extras are tiles two per row on a phone, so none hides behind an edge.
- **Extra tiles two per row** keep the ⓘ button in the tile's top-right corner and break long names (`hyphens-auto`, `break-words`): "Gwarancja Zarezerwowanego Modelu" with the button beside it was wider than a half-width tile and pushed the page sideways. `globals.css` also sets `overflow-x: clip` and `overscroll-behavior-x: none` on `html` and `body` as a safety net.
- **Modal buttons** stack full width on phones (`w-full shrink-0 sm:flex-1`): `flex-1` alone in a column collapsed them to the text height.
- **No iOS zoom.** `globals.css` sets every field to at least 16px on touch screens, so Safari does not zoom into a focused field. `maximum-scale=1` was not used: it also blocks pinch zoom on Android.

### Nothing to show

`empty-state.tsx` is the shared block (icon, title, next step) for every empty results area.

- **Stale or incomplete search** (`search-problem.tsx`). A linked or bookmarked URL can hold a pickup that has passed. The widget already replaces such dates with the default schedule (`prepareDraft` in `picker.tsx`) without touching the URL, so the page used to say "termin niedostępny" while the widget showed valid dates. Now the page shows "Brak wyników" and a button "Pokaż samochody: 12 lis, 01:30 – 14 lis, 01:30" with exactly the widget's dates; one tap replaces the URL and loads the cars. A search that only lacks input shows "Uzupełnij wyszukiwanie" and lists only what is still missing after the widget's defaults (usually the place). The fix depends on the clock, so it is computed in the browser.
- **No cars for the dates:** "Brak wolnych samochodów w tym terminie" with a car icon.

### Availability: every car is listed

Product decision (11 November 2026): the list shows every car of the pickup point, including cars already booked for the asked dates. The card does not mark them.

Why:

- The customer books a class, not a specific car. Every card says "… lub podobny", and in the checked data every car in a segment had the same price.
- The team confirms the booking after checking the fleet. The daily page says so above the list: "Rezerwację potwierdzi nasz zespół po sprawdzeniu dostępności auta".
- If the shown car is booked, the team gives a similar one. Hiding it would also hide whole classes the team can still serve.
- The old site worked the same way. It sent no availability flag and filtered nothing.

How:

- The list call does not send `onlyAvailable` or `onlyAvailableAtLocation`.
- `toOfferCards` filters nothing; `OfferCard` has no availability field.
- `rentable: false` offers are listed too, like on the old site.

Effect, Warszawa Górczewska, 20–23 November 2026:

| Query | Cars | Classes |
| --- | --- | --- |
| No availability flag (current, and the old site) | 33 | 23 |
| `onlyAvailable` | 25 | 18 |
| `onlyAvailableAtLocation` | 23 | 17 |

Without the flag, 8 cars were `available: false` and 1 was `rentable: false`. Five classes had no free car at all. Details are in `lib/rentcarsoft/docs/quirks.md`.

To change this, pass `onlyAvailable: true` in `search-page.tsx` and filter in `toOfferCards`. Showing booked cars marked "Na zapytanie" would need `available` back on `OfferCard`.

Still to decide for the quote and create steps:

- Whether a booked car is quoted and sent as chosen, or replaced by a free car of the same segment before `createReservation`.
- Whether `rentable: false` means "not bookable online" and should be hidden after all.

- The name comes from `attributes.name`, because the live API swaps `mark` and `model`.
- The photo is the gallery's main image (`default`), as on the old site, shown uncropped on white.
- **Prices on the cards come from the list as sent; nothing is multiplied or divided:**
  - `totalPrice` is `calculatedPrice`, or `discountedCalculatedPrice` with a promotion. `regularTotalPrice` is the struck-through total.
  - `dailyPrice` is the list's `dailyPrice`, or, with a promotion, the `promocja` of the `cennik` band the API matched to its own `days` (`Offer.promotion.dailyPrice`).
  - The old site did compute: it picked the band itself with its own day rule and multiplied the daily price by the days (`car-segment.tsx`).
- The gearbox and category filters match value ids (`14` automatic; `83/85/87/89/182` for small, compact, large, eco, delivery), not translated text.
- See `lib/rentcarsoft/docs/quirks.md`, 11 November 2026.

`components/reservation/offer-list.tsx` holds the client part: the old site's filters (gearbox, category), the sort, the view switch, choosing a car, and the summary.

- **Daily:** "Wybierz" goes straight to the protection step (`router.push` with `offer` and `step=protection`). Nothing is only marked; a car shows "Wybrany" only after coming back with "Zmień samochód", and the summary then offers "DALEJ" again.
- **Monthly:** "Wybierz" only marks the car, because the monthly flow has no next step yet.

Sort options:

- **Popularne** (default): cars with the "Popularny" badge (offer key 71) first, otherwise the API order. In the class view a class moves up with its first car, so classes with a popular car come first.
- **Od najtańszych** / **Od najdroższych**: by the price the customer pays, promotional when a promotion applies (`priceOf`). Cars without a price go last.

- **Daily, two views** behind the "Klasy / Wszystkie auta" switch:
  - **Klasy** (default, like the old `/rezerwacja`): one row per price segment (`offer-segments.tsx`). The customer books a class ("Skoda Fabia or similar"), and on the live list every car in a segment had the same daily and total price (checked 11 November 2026).
  - **Wszystkie auta** (`view=cars`): one card per car in a grid, like carfree.pl, with the same promotion badge and prices.
- **Details of the class view:**
  - The row shows a large photo of the previewed car, the segment name, "… lub podobny", its specs, thumbnails of the other cars in the class, the price and the choose button.
  - A thumbnail changes the preview. "Wybierz" stores the previewed car's id in `offer`.
  - In the class that already holds the chosen car (after coming back to the list), a thumbnail makes that car the choice at once: `offer` changes in place and the summary quotes it. Other classes only preview.
  - The class or car that holds the choice has a green frame, matching the green "Wybrany" button. The protection step uses the same rule.
  - Filters apply to cars, so a segment with no matching car disappears. Sorting runs on cars before grouping, so each segment takes the place of its cheapest (or first) car.
  - Grouping uses `segmentId`, falling back to the segment name.
- **Monthly: a grid of car tiles.** The old long-term list was flat as well.
- Shared card pieces (specs, price, choose button) are in `offer-parts.tsx`.

## Steps and summary

`components/reservation/steps.tsx` shows the progress on the daily page: Samochód → Ochrona → Dodatki → Twoje dane. Like the old site it uses an icon per step (a check once done, green; current blue) joined by lines, and below `md` only the current step shows its label.

- A step already done is a button back to it. It changes only `step`, so the car, protection and extras stay in the URL.
- "← Wróć do samochodu" (protection step) and "← Wróć do ochrony" (extras step) do the same for the previous step.
- "Zmień" in the summary panel starts the car choice over and drops the later choices.

`components/reservation/summary.tsx` is the booking summary, like carfree.pl:

- **From `lg`:** a sticky panel on the right (`SummaryPanel`). It shows the place and dates (`TripSummary`, formatted on the server in `search-page.tsx`), then the car: name and class, a "Zmień" button beside the name (like carfree.pl's "Edytuj", from step 2 on), and a large photo. Below come one line per price (the promotional price with the regular one struck through), the total, and the next-step button.
- **Discount code** (`promo-code.tsx`): checked with `/api/reservation/promo`, then written to the URL with `replaceParam`, not a navigation. The steps read it through `useLiveSearchQuery`, so only the summary quote runs again (as on the old site) and the code shows as active at once; "Rezerwuj" sends it in the search query. The "Weź 4 dni" hint keeps the prices of the last server render until the next one.
- **Below `lg`:** a bar at the bottom (`MobileSummaryBar`) with the car, the total and the button. It shows only once there is a car and an action.
- **Layout:** each step renders its content in `lg:grid-cols-[minmax(0,1fr)_20rem]` with the panel as the second column. The section is `max-w-7xl`.
- **Container queries:** the class rows switch layout by their column width (`@xl`, `@3xl`), not the window, because the panel takes 20rem.

## Summary prices

Rule: the summary never adds prices up. Every amount and the total come from RentCarSoft's `calculateReservation`. Only the quote knows the place fees (`pickUpPrice`, `returnPrice`, `relocationPrice`).

- Live check, Fabia + Premium, 20–26 November: delivery to an own address (point 483) added 89 + 89 zł. That made 1307.20 zł; a sum of the list prices would have said 1129.20 zł.

**Server side:**

- `GET /api/reservation/quote` (`app/api/reservation/quote/route.ts`) takes the search's own query plus `lang`, `offer` and up to 10 `addon` ids.
- It validates the search again on the server, calls `calculateReservation`, and returns `QuoteView` (`lib/reservation/quote.ts`): one line per amount and the API's `total`.
- Errors return 400 (bad input) or 502 (RentCarSoft).

**First paint:** the page calculates the first quote on the server (`serverQuote` in `search-page.tsx`), so the panel needs no fetch. This covers the protection step (with the package from the URL, or the car alone), the extras step, and the car step when a car is already chosen.

**In the browser:**

- When the customer changes the package, `useQuote` (`components/reservation/use-quote.ts`) fetches the endpoint and aborts an older request.
- While it loads, the spinner takes the place of the total, as on carfree.pl. The lines turn into placeholder bars, so no stale label or amount stays on screen, and "DALEJ" is disabled. In the mobile bar the spinner replaces the total.
- **Failures:**
  - A network or server error is retried once after 800 ms. A quote is a read, so this is safe.
  - If that also fails, the panel says "Nie udało się pobrać ceny" with a "Spróbuj ponownie" button.
  - If the pickup time has passed meanwhile (`invalid_search`), it asks to change the date instead.
  - If the server-rendered first quote failed, the browser asks again by itself.
  - The endpoint logs only the error code (`[reservation quote] calculate failed: timeout`).
- A new place or date re-renders the page, which brings a new server quote.

Monthly rental shows the list's `monthlyPrice` as sent; it has no quote yet.

## Protection step

`components/reservation/protection-step.tsx`, data from `lib/reservation/protection.ts`.

**Data:**

- `listAddons` with the chosen car's `segmentId` and the dates. `toProtectionOptions` keeps `Extra.type === 1` (insurance) and sorts by period price, cheapest first.
- Nothing is preselected on the first visit (the old site preselected the cheapest).
  - Until the customer picks a package, the summary quotes the car alone.
  - "DALEJ" stays disabled with the hint "Wybierz pakiet ochrony, aby przejść dalej."
  - A link to the extras step without a valid `protection` shows the protection step instead.
  - A car with no packages to choose can go on without one.
- Choosing a package goes straight on to the extras step with `protection` set, like "Wybierz" on the car list. That includes picking the package already chosen after coming back. "DALEJ" in the summary does the same for the chosen package.
- Switching from a chosen package to a cheaper one asks first ("Zmienić pakiet ochrony?"); "Tak, zmień" then goes on as well. The dialog says that anything can happen and good protection is the basis, and shows "from → to". "Anuluj" keeps the package and "Tak, zmień" applies the switch. A switch to a dearer package applies at once.
- The dearest gets the "Najczęściej wybierany" ribbon, as on carfree.pl.

**Layout:**

- **From `md`: a comparison table, like carfree.pl** (`ProtectionTable`).
  - A label column, then one rounded column per package. Every row has the same height, so the values line up.
  - The column head has the shield, the name with the description button, and the per-day price as the API sends it ("Darmowy" at 0) plus the period total.
  - Descriptions (here, on addons and on zones) are the API's HTML cleaned by `richText` in `text.ts`: only paragraphs, emphasis, lists, headings, tables and https links remain, without attributes, and the text is escaped again. The "i" dialog shows them with Tailwind Typography (`prose` plus the `.rich-text` colours in `globals.css`).
  - Covered rows ("0 zł", "bezpłatnie") show a green check. Other rows show the value.
  - The chosen package has a green frame, matching its green "Wybrany" button. The recommended one has a blue frame and a blue "Najczęściej wybierany" tab above the column; once chosen, the tab turns green with the frame.
  - The table is a `radiogroup`; each column's button is a `radio`.
  - "Wybierz" / "Wybrany" (cars and protection) show an empty square / a ticked square (`Square` / `SquareCheck`).
- **Below `md`: one card per package** (`ProtectionCard`): blue header, large shield, the same rows, price and button. Four columns do not fit a phone.

**Shield:** the addon's `image` from RentCarSoft, the same pictures as the old site's `public/assets/guard_*.png`. It is managed in RentCarSoft, so a new package brings its own picture. Without an image, a lucide `ShieldCheck` is coloured by price rank: bronze, silver, gold.

**Prices:** see "Summary prices".

Monthly rental has no protection step yet. The old site priced long-term insurance with `monthlyPrice` and `loadLongTerm`.

## Extras step

`components/reservation/extras-step.tsx`, data from `lib/reservation/extras.ts`.

`listAddons` and `listAccessories` with the car's segment and the dates. Insurance is left out; it has its own step. As on the old site, an extra with no price for the day count is hidden. That covers the long-term zones and the GPS or fuel card offers, whose bands start at 30 or 90 days, and the free app pickup.

**Order on the page:**

1. **Wyjazd za granicę.** Border trip addons (`type` 4) are a single choice: "Bez wyjazdu" (the default) or one zone.
   - The card shows the zone's map (the addon `image` from RentCarSoft: the zone's countries marked), the zone name ("Strefa 1"), the bracketed part of the API name as a note ("limit 400 km/ doba"), the price, and the description with the countries behind the "i" button.
   - "Bez wyjazdu" has no image; a house icon fills the same space so the cards line up.
   - Each zone card ends with the same "☐ Wybierz" / "☑ Wybrany" button as the protection packages. It is the group's radio, and its click area covers the whole card. The "i" button sits above it.
   - The old site let the customer tick several zones. The API accepts that and charges each one (Strefa 1 + 3 = 750 zł), so a single choice here is deliberate.
2. **Groups**, as on the old site: "Dla dzieci" (type 2), "Multimedia i aplikacja" (3), "Pozostałe" (0, and any type not known yet).
   - **Addons** are yes/no tiles. A green "Dodaj" adds one; once added the button turns into a red "Usuń" with a plain × (no frame, like the ✓ on "Wybrany").
   - **Accessories** have a − / + counter from 0 to 5 (`MAX_QUANTITY`). "+" is green and "−" red, matching "Dodaj" and "Usuń".
   - A tile or zone that is chosen gets the green frame, as on the car and protection steps. The chosen zone's bullet turns green; there is no tint.
   - Tiles sit 1 to 4 per row by the width of the content column (container queries `@md`, `@2xl`, `@3xl`), not the window, because the summary panel takes 20rem. The zone cards follow the same rule.

**State:** the choice lives in the URL (`zone`, `extras`, `acc`, written with `replaceState`). The server checks it against what the API offers (`sanitizeSelection`), so stale or made-up ids drop out.

**Prices:**

- Prices on the tiles are the API's. A one-time extra shows its `price` "jednorazowo". On the dated list, `calculatedPrice` multiplies even one-time extras by the days (full tank 405 → 2430), while the quote charges `price` once (see quirks). A per-day extra shows `price` "/ doba" and `calculatedPrice` for the period. Accessories add "za sztukę".
- The summary quotes the car, the protection, the zone, the toggles and the accessories in one `calculateReservation` call (`acc=id-quantity` on the quote endpoint).
- Checked: Fabia, Premium, Strefa 2, CarPlay and 2 child seats for 20–26 November gave 1703.20 zł.

"DALEJ" is disabled until the customer data step exists. "Wróć do ochrony" keeps the extras in the URL.

## Upsell: "Potrzebujesz większego komfortu?"

Below the extras, the extras step closes with cars from dearer classes, like carfree.pl.

- It shows 4, 2 or 1 of them (three candidates show two), two per row; none for the top classes.
- A single suggestion gets a larger card across the whole column, with the photo on the left. Code: `components/reservation/upsell.tsx`; rules in `lib/reservation/upsell.ts`, with tests.

**Rules.** All of them read fields the API sends, so new classes and cars need no code:

1. **Same family:** the `isDeliveryCar` flag must match. Car customers never get vans (Cargo, Klasa M), and van customers never get cars.
2. **Always dearer:** the period price with promotions (`totalPrice`) is higher. On 20–26 November, Sandero Stepway (B+ Cross) was not offered for a Fabia because, with promotions, it was cheaper.
3. **Not a step down:** at least as many seats (a 7-seat van gets no 5-seat SUV), and an automatic only gets automatics.
4. **Another class, one car per class:** free for the dates (`available`), a popular one first.
5. **Order:** the smallest increases first, at most `UPSELL_COUNT` (4), trimmed to full rows of two.

**Card:** photo, name, "lub podobny · class", gearbox, fuel and seats.

- **Price:** "+X zł / doba" and "+Y zł za cały wynajem".
- These differences are the only numbers the site derives itself: the difference between the two cars' API daily and period prices.
- The summary still comes from calculate.

**Choosing** opens "Czy potwierdzasz zmianę klasy samochodu?" with "from → to" and the surcharge.

- "Nie, cofnij" closes it.
- "Tak, potwierdzam" changes `offer` and stays on the extras step.
- The page then re-checks protection and extras for the new class (see below), quotes again, and shows new suggestions for the new car.

## Choices that depend on the car

Packages and extras come from the API for the chosen car's segment and the dates. They may be the same across classes or differ; the site does not assume either.

Checked on 11 November 2026:

- The three packages had the same ids in classes A, B, BUS and Cargo.
- The extras differed: "Pełny Bak" is 2910 in class A and 2909 in class B, CarPlay and "Gwarancja modelu" exist in class B only, and BUS has its own 2421.
- Accessories were the same everywhere.

**On every visit to a step** (a new car, other dates, an old link), the server asks the API again and checks the URL's choices against the answer:

- **Protection:** a `protection` id the API does not return for this car is dropped.
  - The step shows "Wybrany wcześniej pakiet ochrony nie jest dostępny dla tego auta. Wybierz pakiet ponownie."
  - Nothing is selected, and the browser removes the parameter from the URL.
  - On the extras step the same case sends the customer back to the protection step, with the same note.
- **Extras:** `sanitizeSelection` keeps only what the API offers. `droppedChoices` counts the rest.
  - The step shows a note that some extras are not available for this car or dates and were removed.
  - The browser rewrites `zone`, `extras` and `acc` to what is left.
  - Kept items get fresh prices, because the quote and the tiles come from the API again.
- The browser copy in `localStorage` holds only the search (place and dates), never the package or the extras. There is nothing stale to clean there.

## "Twoje dane" and placing the reservation

`components/reservation/customer-step.tsx` (`step=details`). Texts are in the `details` section of `messages/{lang}.json`: Polish and English word for word from the old site's Strapi dictionary (the two Polish "akceptację" typos included), German and Ukrainian translated for the new site. The Polish transfer consent was cut off in the CMS ("…dla mnie sa"); it ends "…dla mnie samochodu." as the English one shows.

- **Sign-in on the form** (`account-box.tsx`): "Mam już mobikonto" opens e-mail and password right on the step, as on the old site; `loginInPlace` signs in without a redirect and the page refreshes with the account's data (the form remounts, keyed by the account). A signed-in client gets "Wyloguj" (`logoutInPlace`). "Konto z podanymi danymi istnieje" after "Rezerwuj" opens the same box.

- **Summary first.** Odbiór i zwrot, the car, the protection and the extras, each with "Zmień" back to its step; then the quote lines (below `lg`; from `lg` they are in the side panel) and the deposit.
- **Guest.** "Klient indywidualny" (first and last name) or "Klient firmowy" (company name, NIP, contact person with the KRS/CEIDG note), email, phone, password and its repeat. The booking creates the account, so the password follows the registration rules (8 to 256 characters). "Mam już mobikonto" goes to the login page with `next` set to this URL; `safeReturnPath` accepts canonical reservation URLs, so the client comes back to the same step, now signed in.
- **Signed-in client.** Type, name or company, NIP and email come from the account (`getAccountDetails`) and cannot change, as on the old site; the phone can. A company still gives the contact person.
- **Everyone.** "Chcę otrzymać fakturę VAT" for individuals (asks for the NIP), the flight number (optional) when the pickup point is an airport, a comment, and the consents. The three document consents are required every time, signed in or not; "Zaznacz wszystkie wymagane zgody" ticks those three. The transfer consent is optional and starts from the account's saved answer.
- **Checks.** `lib/reservation/customer.ts` validates in the browser first (messages by the fields, focus on the first one) and again on the server. Client keys are as the old site sent them: 1, 2, 5 for a new person; 9, 7, 5 for a new company; 7 for an individual's invoice; 46 contact person; always 4 phone and 47 transfer consent (`"18"` yes, `"17"` no).

`placeReservation` in `actions.ts` (Server Action) trusts nothing from the browser:

1. Rate limit: 10 attempts per IP in 15 minutes (`lib/auth/rate-limit.ts`, per process).
2. The search is validated strictly: the pickup must still be `pickupLeadMinutes` away (unlike the lenient check while booking).
3. The car, the package and the extras are checked against fresh lists for this car's segment and dates. Anything missing returns `choices`.
4. The client comes from the session cookie (`clientId`), never from the form.
5. The price is quoted again. A total other than the one the customer saw (the hidden `total`) returns `price` with the new quote; the panel refreshes and the customer clicks again.
6. `createReservation` once, never retried: `paymentMethod: 1` like the old site (the deposit link is mailed after the team accepts), `clientType` 0/1 and `clientPassword` only for a new client, `flightNo` only for an airport, addresses only for points that take one.
7. `unique: false` is "Konto z podanymi danymi istnieje. Zaloguj się, aby kontynuować." with a login button. A timeout or network error during create says to check the inbox first: the reservation may exist. The old site treated a 15-second timeout as success; this one does not.
8. On success the action stores a receipt (`receipt.ts`) and redirects to the thank-you page.

**Thank-you page.** The old site's texts, the reservation number when create returned one, then the car, pickup and return place and time, protection, extras with quantities, the price lines, total and deposit. These come from a receipt cookie (`mc_booking`, `__Host-` in production): encrypted with its own key derived from `SESSION_SECRET`, httpOnly, two hours. No reservation id is taken from the URL, because `GET /reservation/{id}` returns any customer's booking. Without a receipt the page redirects to `/pl/rezerwacja`. It also clears the stored search.

Logs carry error codes only (`[reservation create] failed: <code>`), never form values, passwords or the request body.

## Compared with the old site (`mobicars-pl`)

Same as the old site:

- The two pages and their URLs.
- The term badge and title above the widget, with no term switch on the page.
- The filters, the monthly options (`1–6, 12, 24, 36` months; `1000–6000` km).
- The monthly price from `cennik.cena_miesieczna`.
- Every car of the pickup point is listed, booked ones included (see "Availability").

Deliberately different:

- State is in the URL plus a small storage copy. The old site kept one `UserSelection` object, base64 in `localStorage` as `user_selection_data`, so its pages could not be linked or rendered on the server.
- The daily list keeps the old segment rows but takes prices from the dated offer list instead of computing them in the browser from the `cennik[segmentId].czasy` day bands. With a promotion it shows `discountedCalculatedPrice` (what the quote charges), strikes through `calculatedPrice`, and shows the promotion name and end date from `cennik[segmentId]`, like the old "price valid until" note.
- Sorting (popular first, by price) and the "all cars" view were added; the old site had neither.
- No `order=pozycja` (it equals `order=default`, see quirks) and no `statusRez: 1219`. `paymentMethod: 1` is sent on create, as the old site did.

## Languages

Every text is in `messages/{pl,en,de,uk}.json`, one file per language, grouped by area (`search`, `cars`, `steps`, `protection`, `extras`, `upsell`, `summary`, `quoteLines`, `promo`, `details`, `confirmation`, `booking`, `layout`; the panel adds `account`, `auth`, `accountDetails`). `pl.json` is the source: `i18n/messages.ts` types the others against it, so a missing key fails `tsc`.

- Server code: `getMessages(lang)`. Client code: `useMessages()` and `useLang()` (providers in `app/[lang]/layout.tsx`); only the page's language reaches the browser. In client files import `fill` from `i18n/fill`, never from `i18n/messages` (that file imports all four JSON files).
- Placeholders `{name}` with `fill`; plural words as `{ one, few, many, other }` (all four keys in every language) with `plural` from `i18n/plural.ts`; links as `[text](href)` with `<RichText>`.
- Add or change a section with `python3 scripts/merge-messages.py fragment.json` (`{"pl": {...}, "en": …}`); it locks the files, because several people write them.
- Labels the server builds (protection rows, extras groups, categories, quote lines) are keys, not text: `ProtectionRow.key`, `ExtraGroup.id`, `cars.categories.<id>`, `QuoteLineView.kind` with `quoteLineLabel`.
- Dates, money and the calendars follow `intlLocales[lang]`. RentCarSoft gets `lang`, so car, addon and place names come in the page's language.

## Discount codes

`promo=CODE` in the URL (`QUERY_KEYS.promo`).

- "Masz kod rabatowy?" (`promo-code.tsx`) sits in the summary panel from the car step on, and on phones in the details step. A code is checked with `GET /api/reservation/promo?code=…&from=…` (`verifyPromoCode` for the pickup; 20 checks per IP in 15 minutes) and then put in the URL. A code that came with a link is checked again when the page opens; an invalid one leaves the URL with a message.
- The page puts the code into the `searchQuery` every step receives, so every quote (`quoteQuery` copies it, the endpoint passes `promoCode` to calculate) and the "Rezerwuj" form carry it without extra props. The discount shows in the prices RentCarSoft returns; nothing is subtracted on the site.
- `placeReservation` checks the code once more and stops with `promo` if it is no longer valid, then sends `promoCode` on calculate and create.
- The code survives date or place changes and a new search (`KEPT_ON_CHANGE`, `KEPT_ON_RESTART`). It is not part of the step key, so dropping it does not reset the steps.

## Monthly rental

`/pl/rezerwacja/dlugoterminowa?pickup=…&from=…&months=3&km=2000`, then the same steps as daily rental: car, protection, extras, details, thank-you page.

- The term comes from the query: `months` means monthly (`termOfQuery`).
- Cars: `listOfferCards` (monthly price for the months and km limit).
- Protection and extras: the long-term catalogue (`longTerm` for addons, `loadLongTerm` for accessories), priced by `monthlyPrice` per month or once (`oneTimeFee`). `forMonths` in `booking.ts` maps it to the shape the daily views read; `ExtraOption.unit` / `ProtectionOption.unit` is `"month"`, so cards say "/ mies.". Items without a monthly price are daily-only and left out.
- Quote: calculate with `longTerm { months, monthlyKmLimit }`. `QuoteView.monthly` splits it like the old site's summary: "Co miesiąc" (rent and monthly extras, `razem_miesiecznie…`), "Jednorazowo" (fees and one-time extras), the km limit per month and in total with the price per km over it, and "Razem za 3 miesiące" (`total`). The phone bar leads with the monthly amount.
- Upsell compares monthly prices (`upsellOptions(…, months)`).
- Create sends `longTerm` with the same months and limit. Unlike the old site it does not send `mileageLimit: 1` or `statusRez: 1219`: the quote was verified without them and create must match it. Check the first real monthly reservation in RentCarSoft.
- The thank-you page shows the long-term subtitle and the monthly split; the return date is the pickup plus the months.

## Extras for the customer

- **Dodaj do kalendarza** on the thank-you page: `GET /api/reservation/calendar?lang=…` returns an .ics file with the pickup and the return (`lib/reservation/calendar.ts`, times in UTC). It reads the same encrypted receipt as the page, so it only describes the visitor's own booking.
- **Monthly hint**: a daily search of 28 days or more (`monthlyHintDays`) shows "Wynajmujesz na 45 dni?" on the car list with a link to monthly rental for the same pickup (`monthlyAlternative`: nearest offered month count rounded down, `monthlyHintKm`). One-way rentals get no hint.
- **"Weź 4 dni zamiast 3"** (protection and extras steps, and above "Twoje dane" on the last step; daily rental only): when the car's price list has a cheaper band starting at most `MAX_EXTRA_DAYS` (2) days later (`extensionCandidate` in `lib/reservation/extend.ts`, with tests), `extensionHint` in `booking.ts` quotes the car alone for both lengths. It shows only if the per-day rent from those quotes really drops. The "+X zł" is the difference of the two quote totals, so it includes fees the longer stay adds (e.g. a weekend return). One tap moves `to`. Code: `ExtendHint` in `components/reservation/nudges.tsx`.
- **Better protection** (extras step, and between the data and the consents on the last step; the form keeps what was typed): someone who chose a lesser package than the recommended one sees it once more, with the price difference per day (or month) and the covers it pays in full that theirs does not. One tap sets `protection`. Code: `ProtectionUpgrade` in `nudges.tsx`, `protectionUpgrade` in `search-page.tsx`.
- **"Masz niedokończoną rezerwację"** (homepage popup): the protection, extras and details steps keep the current URL, car (name, class, photo), place and dates in `localStorage` (`RememberBooking`, `saveBookingDraft`; saved on mount, on leaving and when the tab is hidden). The homepage opens `ResumeBooking` only while the pickup is still bookable (`isSlotPast` with `pickupLeadMinutes`) and the draft is under 7 days old. "Wróć" opens the booking where it was left; "Nie, dziękuję" deletes the draft; × or a click outside only hides it for this visit. The thank-you page clears it with the search.
- **Udostępnij** (summary panel, and an icon in the phone's bottom bar): shares the current URL, which carries every choice. Where the browser has `navigator.share` (phones, Safari) the system sheet opens (SMS, Messenger, WhatsApp…); elsewhere the link is copied with a toast. Code: `components/reservation/share-booking.tsx`.
- **Użyj mojej lokalizacji** (place dialog): the browser asks for consent, then `GET /api/geo/reverse` (OpenStreetMap Nominatim, called from the server so the customer's IP does not reach it; coordinates rounded, rate-limited per IP, never logged) returns the city and "street number". On the list it filters to that city, or says there is no point there. On "Własny adres" it fills the street; another city is appended and flagged, and a spot without a street name asks to type it. Only 2 of 44 RentCarSoft points have coordinates, so there is no "nearest point by distance" yet. Nominatim allows about one request a second; heavy traffic needs a paid geocoder. Code: `use-my-location.ts`, `place-fields.tsx`.

## Not built yet

1. **Verify create live.** One real test reservation per term (comment "TEST - PROSZĘ ANULOWAĆ"), then read it back to settle the accessory key, `clientType` and the monthly fields (see `lib/rentcarsoft/docs/quirks.md`).
2. **Translations review.** German and Ukrainian were written for the new site; a native speaker should read them, the consents above all.

The old site had no minimum or maximum rental length check in the browser. `ServicePoint.minDays` / `maxDays` exist in the bridge if that rule is wanted.
