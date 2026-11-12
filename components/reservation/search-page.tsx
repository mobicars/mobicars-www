import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CalendarRange, CarFront } from "lucide-react";

import { CompactSearch } from "@/components/reservation/compact-search";
import { CustomerStep, type AccountPrefill } from "@/components/reservation/customer-step";
import { EmptyState } from "@/components/reservation/empty-state";
import { formatDayCount, formatMonths } from "@/components/reservation/format";
import { ExtrasStep } from "@/components/reservation/extras-step";
import { OfferList, type OfferView } from "@/components/reservation/offer-list";
import { ReservationPicker } from "@/components/reservation/picker";
import { PickupTimeGuard } from "@/components/reservation/pickup-time-guard";
import { ProtectionStep } from "@/components/reservation/protection-step";
import { RememberBooking } from "@/components/reservation/remember-booking";
import { RememberSearch } from "@/components/reservation/remember-search";
import { SearchProblem } from "@/components/reservation/search-problem";
import { ReservationSteps } from "@/components/reservation/steps";
import type { TripSummary } from "@/components/reservation/summary";
import { compactTrip, tripSummary, type CompactTrip } from "@/components/reservation/trip";
import { buttonClass } from "@/components/ui/button";
import type { Lang } from "@/i18n/config";
import { fill, getMessages } from "@/i18n/messages";
import { reservationHref } from "@/i18n/routes";
import { listServicePoints } from "@/lib/rentcarsoft";
import { getAccountDetails, getSession } from "@/lib/auth/dal";
import {
  chosenExtras,
  listOfferCards,
  extensionHint,
  loadBookingChoices,
  normalizePromo,
  quoteFor,
} from "@/lib/reservation/booking";
import { monthlyAlternative } from "@/lib/reservation/monthly-hint";
import { toPickupPlace, type PickupPlace } from "@/lib/reservation/places";
import type { ProtectionOption } from "@/lib/reservation/protection";
import { upsellOptions } from "@/lib/reservation/upsell";
import { quoteQuery, type QuoteAccessory, type QuoteView } from "@/lib/reservation/quote";
import {
  droppedChoices,
  sanitizeSelection,
  selectedAccessories,
  selectedAddonIds,
  selectionFromQuery,
  selectionToQuery,
  type ExtrasSelection,
} from "@/lib/reservation/extras";
import {
  QUERY_KEYS,
  bookingInProgressStart,
  draftFromQuery,
  searchToQuery,
  validateSearch,
  type ReservationSearch,
  type ReservationTerm,
} from "@/lib/reservation/search";

type BookingStep = "car" | "protection" | "extras" | "details";

const BOOKING_STEPS: readonly BookingStep[] = ["protection", "extras", "details"];

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
      <Suspense fallback={<SearchBand lang={lang} term={term} />}>
        {/* The places load while the query is read. */}
        {Promise.all([searchParams, loadPlaces(lang)]).then(([query, places]) => (
          <SearchSection lang={lang} term={term} query={query} places={places} />
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
  lang,
  term,
  compact,
  children,
}: {
  lang: Lang;
  term: ReservationTerm;
  compact?: CompactTrip;
  children?: ReactNode;
}) {
  const t = getMessages(lang).booking;
  const copy =
    term === "short" ? { badge: t.badgeShort, title: t.titleShort } : { badge: t.badgeLong, title: t.titleLong };
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
  // The later steps need a chosen car; daily and monthly rental share them.
  const stepParam = query[QUERY_KEYS.step];
  const step: BookingStep =
    selected && BOOKING_STEPS.includes(stepParam as BookingStep)
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
  const protection = Number(single(QUERY_KEYS.protection)) || null;

  return (
    <>
      <SearchBand lang={lang} term={term} compact={result.ok ? compactTrip(lang, result.search, places) : undefined}>
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
        {!result.ok ? <CarStepHeading lang={lang} term={term} /> : null}
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
                promo={normalizePromo(single(QUERY_KEYS.promo))}
                trip={tripSummary(lang, result.search, places)}
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
  promo,
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
  /** Discount code from the URL; it travels inside `searchQuery` to every quote and to "Rezerwuj". */
  promo: string | null;
  trip: TripSummary;
  places: PickupPlace[];
}) {
  const t = getMessages(lang).booking;
  const searchQuery = withPromo(searchToQuery(search), promo).toString();
  // Started with the offers rather than after them: the last step's account
  // data, and the quote for a car already chosen on the car step.
  const account = step === "details" ? accountPrefill(lang) : null;
  // Awaited only when the last step renders; a failure that is never awaited must not go unhandled.
  account?.catch(() => null);
  const carQuote =
    step === "car" && selected !== null
      ? serverQuote(lang, search, searchQuery, selected, [])
      : null;
  const offers = await listOfferCards(lang, search);

  if (offers.length === 0) {
    return (
      <EmptyState icon={CarFront} title={t.noCars}>
        <p className="text-sm text-muted-dark">{t.noCarsHint}</p>
      </EmptyState>
    );
  }

  const car = step !== "car" ? offers.find((offer) => offer.id === selected) : undefined;
  if (car) {
    // The protection and extras steps start over for another car or search; not
    // for a discount code, so the code box keeps its message when it drops one.
    const stepKey = `${car.id}|${searchToQuery(search)}`;
    // Started now, awaited by the step that shows it.
    const extension = extensionHint(lang, search, car, promo);
    const { options, extrasView } = await loadBookingChoices(lang, search, car);
    // For the homepage's "finish your booking" banner.
    const where = compactTrip(lang, search, places);
    const remember = (
      <RememberBooking
        car={car.name}
        segment={car.segment}
        image={car.image?.src ?? null}
        place={where.place}
        dates={where.dates}
        start={search.start}
      />
    );
    // No package is preselected: the customer picks one (the free one included).
    const chosen = options.find((option) => option.id === protection)?.id ?? null;

    // Extras need a package when there are any; without one the page stays on protection.
    if (step !== "protection" && (chosen !== null || options.length === 0)) {
      const selection = sanitizeSelection(extras, extrasView);
      // The extras depend on the car's segment and the dates; a change can leave some out.
      const dropped = droppedChoices(extras, selection);
      const addonIds = [...(chosen === null ? [] : [chosen]), ...selectedAddonIds(selection)];
      const quote = await serverQuote(lang, search, searchQuery, car.id, addonIds, selectedAccessories(selection));

      // A choice that dropped out goes back to the extras step, which says so.
      if (account && dropped === 0) {
        const prefill = await account;
        return (
          <>
            <ReservationSteps current={3} />
            {remember}
            <CustomerStep
              // Signing in or out on the form refreshes the page: start the form over with the new data.
              key={prefill?.email ?? "guest"}
              lang={lang}
              searchQuery={searchQuery}
              car={car}
              protection={options.find((option) => option.id === chosen) ?? null}
              extras={chosenExtras(selection, extrasView, getMessages(lang).quoteLines.item)}
              addonIds={addonIds}
              accessories={selectedAccessories(selection)}
              selectionQuery={selectionToQuery(selection)}
              initialQuote={quote}
              trip={trip}
              airport={places.find((place) => place.id === search.pickup.id)?.airport ?? false}
              account={prefill}
              extension={await extension}
              upgrade={protectionUpgrade(options, chosen)}
            />
          </>
        );
      }

      return (
        <>
          <ReservationSteps current={2} />
          {remember}
          <ExtrasStep
            key={stepKey}
            lang={lang}
            searchQuery={searchQuery}
            car={car}
            protectionId={chosen}
            view={extrasView}
            initialSelection={selection}
            droppedCount={dropped}
            upsell={upsellOptions(car, offers, undefined, search.term === "long" ? search.months : null)}
            extension={await extension}
            upgrade={protectionUpgrade(options, chosen)}
            initialQuote={quote}
            trip={trip}
          />
        </>
      );
    }

    return (
      <>
        <ReservationSteps current={1} />
        {remember}
        <ProtectionStep
          key={stepKey}
          lang={lang}
          searchQuery={searchQuery}
          car={car}
          options={options}
          initialProtection={chosen}
          protectionDropped={protection !== null && chosen === null}
          initialQuote={await serverQuote(lang, search, searchQuery, car.id, chosen === null ? [] : [chosen])}
          extension={await extension}
          trip={trip}
        />
      </>
    );
  }

  // A changed place or date can drop the chosen car; the customer then picks again.
  const lostCar = step !== "car" || (selected !== null && !offers.some((offer) => offer.id === selected));
  return (
    <>
      <ReservationSteps current={0} />
      <CarStepHeading lang={lang} term={search.term} />
      <MonthlyHint lang={lang} search={search} />
      {lostCar ? (
        <p role="status" className="mb-4 rounded-xl bg-blue-light px-4 py-3 text-sm text-blue-dark">
          {t.lostCar}
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
        initialQuote={carQuote && !lostCar ? await carQuote : null}
        lostCar={lostCar}
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
/**
 * The best package (the recommended, dearest one) for someone who chose a
 * lesser one, offered again on the extras step. Null when they already have it.
 */
function protectionUpgrade(
  options: ProtectionOption[],
  chosen: number | null,
): { from: ProtectionOption; to: ProtectionOption } | null {
  const from = options.find((option) => option.id === chosen);
  const to = options.find((option) => option.recommended);
  if (!from || !to || from.id === to.id || (to.price ?? 0) <= (from.price ?? 0)) {
    return null;
  }
  return { from, to };
}

/** The search query plus the discount code, the form every step and quote request receives. */
function withPromo(query: URLSearchParams, promo: string | null): URLSearchParams {
  if (promo) {
    query.set(QUERY_KEYS.promo, promo);
  }
  return query;
}

async function serverQuote(
  lang: string,
  search: ReservationSearch,
  searchQuery: string,
  offerId: number,
  addonIds: number[],
  accessories: QuoteAccessory[] = [],
): Promise<{ request: string; quote: QuoteView | null }> {
  const request = quoteQuery(lang, searchQuery, offerId, addonIds, accessories);
  const promo = new URLSearchParams(searchQuery).get(QUERY_KEYS.promo);
  try {
    return { request, quote: await quoteFor(lang, search, offerId, addonIds, accessories, promo) };
  } catch {
    return { request, quote: null };
  }
}

/** "Wynajmujesz na 45 dni?" A link to the same pickup by the month (see `monthlyAlternative`). */
function MonthlyHint({ lang, search }: { lang: Lang; search: ReservationSearch }) {
  const hint = monthlyAlternative(search);
  if (!hint) {
    return null;
  }
  const t = getMessages(lang).booking.monthlyHint;
  return (
    <aside className="mb-6 flex flex-col gap-4 rounded-2xl border-2 border-green-medium/40 bg-green-light/40 p-4 sm:flex-row sm:items-center sm:p-5">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-green-medium">
        <CalendarRange className="size-6" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-blue-dark">{fill(t.title, { days: formatDayCount(lang, hint.days) })}</p>
        <p className="text-sm text-blue-dark/80">{t.text}</p>
      </div>
      <Link href={reservationHref(lang, "long", hint.query)} className={buttonClass("success", "md", "w-full sm:w-auto")}>
        {fill(t.button, { months: formatMonths(lang, hint.months) })}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </aside>
  );
}

function CarStepHeading({ lang, term }: { lang: Lang; term: ReservationTerm }) {
  const t = getMessages(lang).booking;
  return (
    <>
      <h2 className="text-center text-3xl font-semibold text-blue-dark">{t.chooseCar}</h2>
      {term === "short" ? (
        <p className="mx-auto mt-2 mb-6 max-w-2xl text-center text-sm text-muted-dark">{t.chooseCarIntro}</p>
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
