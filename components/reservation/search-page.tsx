import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { CarFront } from "lucide-react";

import { CustomerStep, type AccountPrefill } from "@/components/reservation/customer-step";
import { EmptyState } from "@/components/reservation/empty-state";
import { ExtrasStep } from "@/components/reservation/extras-step";
import { OfferList, type OfferView } from "@/components/reservation/offer-list";
import { ReservationPicker } from "@/components/reservation/picker";
import { PickupTimeGuard } from "@/components/reservation/pickup-time-guard";
import { ProtectionStep } from "@/components/reservation/protection-step";
import { RememberSearch } from "@/components/reservation/remember-search";
import { SearchProblem } from "@/components/reservation/search-problem";
import { ReservationSteps } from "@/components/reservation/steps";
import type { TripSummary } from "@/components/reservation/summary";
import { compactTrip, tripSummary, type CompactTrip } from "@/components/reservation/trip";
import { CompactSearch } from "@/components/reservation/compact-search";
import type { Lang } from "@/i18n/config";
import {
  calculateReservation,
  listAccessories,
  listAddons,
  listAllOffers,
  listServicePoints,
} from "@/lib/rentcarsoft";
import { getAccountDetails, getSession } from "@/lib/auth/dal";
import { toOfferCards } from "@/lib/reservation/offers";
import { toPickupPlace, type PickupPlace } from "@/lib/reservation/places";
import { toProtectionOptions } from "@/lib/reservation/protection";
import { upsellOptions } from "@/lib/reservation/upsell";
import { quoteQuery, toQuoteView, type QuoteAccessory, type QuoteView } from "@/lib/reservation/quote";
import {
  droppedChoices,
  sanitizeSelection,
  selectedAccessories,
  selectedAddonIds,
  selectionFromQuery,
  selectionToQuery,
  toExtrasView,
  type ExtrasSelection,
} from "@/lib/reservation/extras";
import {
  QUERY_KEYS,
  bookingInProgressStart,
  draftFromQuery,
  rentalPeriod,
  searchToQuery,
  toRentCarSoftDateTime,
  validateSearch,
  type ReservationSearch,
  type ReservationTerm,
} from "@/lib/reservation/search";

type BookingStep = "car" | "protection" | "extras" | "details";

const BOOKING_STEPS: readonly BookingStep[] = ["protection", "extras", "details"];

const TERM_COPY: Record<ReservationTerm, { badge: string; title: string }> = {
  short: { badge: "NA DNI", title: "Wynajem krótkoterminowy" },
  long: { badge: "NA MIESIĄCE", title: "Wynajem długoterminowy" },
};

/**
 * Body of a reservation page. Each rental term has its own page and URL
 * (`reservationHref`), so the widget here shows only that term.
 */
export function ReservationSearchPage({
  lang,
  term,
  searchParams,
}: {
  lang: Lang;
  term: ReservationTerm;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <main className="flex flex-1 flex-col bg-surface">
      <Suspense fallback={<SearchBand term={term} />}>
        {searchParams.then(async (query) => (
          <SearchSection lang={lang} term={term} query={query} places={await loadPlaces(lang)} />
        ))}
      </Suspense>
    </main>
  );
}

/**
 * Blue band with the term badge, the title and the search widget. With
 * `compact` (a valid search) the widget folds into one line below `lg` and the
 * band shrinks, so the results start on the first screen of a phone.
 */
function SearchBand({
  term,
  compact,
  children,
}: {
  term: ReservationTerm;
  compact?: CompactTrip;
  children?: ReactNode;
}) {
  const copy = TERM_COPY[term];
  return (
    <div
      className={`bg-linear-to-br from-blue-medium to-blue-dark px-3 sm:px-6 ${compact ? "py-4 lg:py-8" : "py-8"}`}
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className={compact ? "mb-3 flex items-center gap-2 lg:mb-5 lg:block" : "mb-5"}>
          <span className="inline-block shrink-0 rounded-md bg-white px-2 py-1 text-xs font-bold text-blue-dark">
            {copy.badge}
          </span>
          <h1
            className={`font-semibold text-white ${
              compact ? "text-lg lg:mt-2 lg:text-4xl" : "mt-2 text-3xl sm:text-4xl"
            }`}
          >
            {copy.title}
          </h1>
        </div>
        {children ? (
          compact ? (
            <CompactSearch trip={compact}>{children}</CompactSearch>
          ) : (
            children
          )
        ) : (
          <div className="h-16 animate-pulse rounded-full bg-white/20" />
        )}
      </div>
    </div>
  );
}

async function loadPlaces(lang: string): Promise<PickupPlace[]> {
  return (await listServicePoints({ lang })).map(toPickupPlace);
}

async function SearchSection({
  lang,
  term,
  query,
  places,
}: {
  lang: Lang;
  term: ReservationTerm;
  query: Record<string, string | string[] | undefined>;
  places: PickupPlace[];
}) {
  // Validation compares the dates with the current time, so it runs per request.
  await connection();
  const draft = draftFromQuery(query, term);
  // In progress: only a pickup day already over sends the customer back to the widget.
  const result = validateSearch(draft, { places, earliestStart: bookingInProgressStart() });
  const canonical = result.ok ? searchToQuery(result.search).toString() : "";
  const offerParam = query[QUERY_KEYS.offer];
  const selected = Number(Array.isArray(offerParam) ? offerParam[0] : offerParam) || null;
  const view = query[QUERY_KEYS.view] === "cars" ? "cars" : "classes";
  // The protection step needs a chosen car; monthly rental has no such step yet.
  const stepParam = query[QUERY_KEYS.step];
  const step: BookingStep =
    term === "short" && selected && BOOKING_STEPS.includes(stepParam as BookingStep)
      ? (stepParam as BookingStep)
      : "car";
  const single = (key: string) => {
    const value = query[key];
    return (Array.isArray(value) ? value[0] : value) ?? null;
  };
  const extras = selectionFromQuery(
    single(QUERY_KEYS.extras),
    single(QUERY_KEYS.accessories),
    single(QUERY_KEYS.zone),
  );
  const protection = Number(query[QUERY_KEYS.protection]) || null;

  return (
    <>
      <SearchBand term={term} compact={result.ok ? compactTrip(result.search, places) : undefined}>
        {/* A new search replaces the URL; the key resets the widget to it. */}
        <ReservationPicker
          key={canonical}
          lang={lang}
          term={term}
          layout="horizontal"
          places={places}
          initial={draft}
          live
        />
      </SearchBand>
      <section className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6">
        {!result.ok ? <CarStepHeading term={term} /> : null}
        {result.ok ? (
          <>
            <RememberSearch term={term} query={canonical} />
            <PickupTimeGuard
              start={result.search.start}
              end={result.search.term === "short" ? result.search.end : null}
            />
            <Suspense fallback={<OffersSkeleton />}>
              <Offers
                lang={lang}
                search={result.search}
                selected={selected}
                view={view}
                step={step}
                protection={protection}
                extras={extras}
                trip={tripSummary(result.search, places)}
                places={places}
              />
            </Suspense>
          </>
        ) : (
          <SearchProblem lang={lang} draft={draft} places={places} issues={result.issues} />
        )}
      </section>
    </>
  );
}

async function Offers({
  lang,
  search,
  selected,
  view,
  step,
  protection,
  extras,
  trip,
  places,
}: {
  lang: Lang;
  search: ReservationSearch;
  selected: number | null;
  view: OfferView;
  step: BookingStep;
  protection: number | null;
  extras: ExtrasSelection;
  trip: TripSummary;
  places: PickupPlace[];
}) {
  const { start, end } = rentalPeriod(search);
  const searchQuery = searchToQuery(search).toString();
  const offers = toOfferCards(
    await listAllOffers({
      lang,
      term: search.term,
      servicePointIds: [search.pickup.id],
      pickUpDate: toRentCarSoftDateTime(start),
      returnDate: toRentCarSoftDateTime(end),
      longTermQuote: search.term === "long" ? { months: search.months, monthlyKmLimit: search.km } : undefined,
    }),
  );

  if (offers.length === 0) {
    return (
      <EmptyState icon={CarFront} title="Brak wolnych samochodów w tym terminie">
        <p className="text-sm text-muted-dark">Zmień termin lub miejsce odbioru u góry strony i spróbuj ponownie.</p>
      </EmptyState>
    );
  }

  const car = step !== "car" ? offers.find((offer) => offer.id === selected) : undefined;
  if (car) {
    const extrasInput = {
      lang,
      priceSegmentIds: car.segmentId ? [Number(car.segmentId)] : undefined,
      pickUpDate: toRentCarSoftDateTime(start),
      returnDate: toRentCarSoftDateTime(end),
    };
    const addons = await listAddons(extrasInput);
    const options = toProtectionOptions(addons);
    // No package is preselected: the customer picks one (the free one included).
    const chosen = options.find((option) => option.id === protection)?.id ?? null;

    // Extras need a package when there are any; without one the page stays on protection.
    if (step !== "protection" && (chosen !== null || options.length === 0)) {
      const extrasView = toExtrasView(addons, await listAccessories(extrasInput));
      const selection = sanitizeSelection(extras, extrasView);
      // The extras depend on the car's segment and the dates; a change can leave some out.
      const dropped = droppedChoices(extras, selection);
      const addonIds = [...(chosen === null ? [] : [chosen]), ...selectedAddonIds(selection)];
      const quote = await serverQuote(lang, search, searchQuery, car.id, addonIds, selectedAccessories(selection));

      // A choice that dropped out goes back to the extras step, which says so.
      if (step === "details" && dropped === 0) {
        const names = new Map(
          [...extrasView.zones, ...extrasView.groups.flatMap((group) => group.items)].map((item) => [item.id, item.name]),
        );
        return (
          <>
            <ReservationSteps current={3} />
            <CustomerStep
              lang={lang}
              searchQuery={searchQuery}
              car={car}
              protection={options.find((option) => option.id === chosen) ?? null}
              extras={[
                ...selectedAddonIds(selection).map((id) => ({ id, name: names.get(id) ?? "Dodatek", quantity: 1 })),
                ...selectedAccessories(selection).map(({ id, quantity }) => ({
                  id,
                  name: names.get(id) ?? "Dodatek",
                  quantity,
                })),
              ]}
              addonIds={addonIds}
              accessories={selectedAccessories(selection)}
              selectionQuery={selectionToQuery(selection)}
              initialQuote={quote}
              trip={trip}
              airport={places.find((place) => place.id === search.pickup.id)?.airport ?? false}
              account={await accountPrefill(lang)}
            />
          </>
        );
      }

      return (
        <>
          <ReservationSteps current={2} />
          <ExtrasStep
            lang={lang}
            searchQuery={searchQuery}
            car={car}
            protectionId={chosen}
            view={extrasView}
            initialSelection={selection}
            droppedCount={dropped}
            upsell={upsellOptions(car, offers)}
            initialQuote={quote}
            trip={trip}
          />
        </>
      );
    }

    return (
      <>
        <ReservationSteps current={1} />
        <ProtectionStep
          lang={lang}
          searchQuery={searchQuery}
          car={car}
          options={options}
          initialProtection={chosen}
          protectionDropped={protection !== null && chosen === null}
          initialQuote={await serverQuote(lang, search, searchQuery, car.id, chosen === null ? [] : [chosen])}
          trip={trip}
        />
      </>
    );
  }

  // A changed place or date can drop the chosen car; the customer then picks again.
  const lostCar = step !== "car" || (selected !== null && !offers.some((offer) => offer.id === selected));
  return (
    <>
      {search.term === "short" ? <ReservationSteps current={0} /> : null}
      <CarStepHeading term={search.term} />
      {lostCar ? (
        <p role="status" className="mb-4 rounded-xl bg-blue-light px-4 py-3 text-sm text-blue-dark">
          Wybrane auto nie jest dostępne dla nowego miejsca lub terminu. Wybierz samochód ponownie.
        </p>
      ) : null}
      <OfferList
        offers={offers}
        term={search.term}
        initialSelected={selected}
        initialView={view}
        trip={trip}
        lang={lang}
        searchQuery={searchQuery}
        initialQuote={
          search.term === "short" && selected !== null && !lostCar
            ? await serverQuote(lang, search, searchQuery, selected, [])
            : null
        }
      />
    </>
  );
}

/** The signed-in client's data for the last step; `null` for a guest. */
async function accountPrefill(lang: Lang): Promise<AccountPrefill | null> {
  if (!(await getSession())) {
    return null;
  }
  const details = await getAccountDetails(lang);
  return {
    type: details.isCompany ? "company" : "individual",
    firstName: details.text.firstName,
    lastName: details.text.lastName,
    companyName: details.text.companyName,
    vatNumber: details.text.vatNumber,
    email: details.email ?? "",
    phone: details.text.phone,
    transferConsent: details.consents.reservationTransferConsent,
  };
}

/**
 * The first summary quote, rendered with the page so it needs no fetch. A
 * failed call yields `quote: null`; the panel then says the price is missing.
 */
async function serverQuote(
  lang: string,
  search: ReservationSearch,
  searchQuery: string,
  offerId: number,
  addonIds: number[],
  accessories: QuoteAccessory[] = [],
): Promise<{ request: string; quote: QuoteView | null }> {
  const request = quoteQuery(lang, searchQuery, offerId, addonIds, accessories);
  const { start, end } = rentalPeriod(search);
  try {
    const quote = await calculateReservation({
      offerId,
      pickUpPointId: search.pickup.id,
      returnPointId: (search.dropoff ?? search.pickup).id,
      pickUpDate: toRentCarSoftDateTime(start),
      returnDate: toRentCarSoftDateTime(end),
      lang,
      addonIds,
      accessories,
    });
    return { request, quote: toQuoteView(quote) };
  } catch {
    return { request, quote: null };
  }
}

function CarStepHeading({ term }: { term: ReservationTerm }) {
  return (
    <>
      <h2 className="text-center text-3xl font-semibold text-blue-dark">Wybierz samochód</h2>
      {term === "short" ? (
        <p className="mx-auto mt-2 mb-6 max-w-2xl text-center text-sm text-muted-dark">
          Im dłuższy okres wynajmu, tym niższa cena za dobę. Rezerwację potwierdzi nasz zespół po
          sprawdzeniu dostępności auta.
        </p>
      ) : (
        <div className="mb-6" />
      )}
    </>
  );
}

function OffersSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="h-96 animate-pulse rounded-2xl bg-white" />
      ))}
    </div>
  );
}
