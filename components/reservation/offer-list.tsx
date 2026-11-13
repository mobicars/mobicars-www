"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ToggleButton, ToggleButtonGroup } from "react-aria-components";
import { LayoutGrid, Rows3, SlidersHorizontal, X, type LucideIcon } from "lucide-react";

import { DialogHeader } from "@/components/reservation/dialog-parts";
import {
  ChooseButton,
  CompactOfferCard,
  Price,
  PromotionLine,
  SpecList,
  priceOf,
} from "@/components/reservation/offer-parts";
import { SegmentRow, groupBySegment } from "@/components/reservation/offer-segments";
import {
  MobileSummaryBar,
  SummaryPanel,
  quotePrices,
  type SummaryAction,
  type SummaryPrices,
  type TripSummary,
} from "@/components/reservation/summary";
import { useQuote } from "@/components/reservation/use-quote";
import { currentHrefWith, replaceParam } from "@/components/reservation/url";
import { useLiveSearchQuery } from "@/components/reservation/use-search-query";
import { buttonClass } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/sheet";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { fill } from "@/i18n/fill";
import type { Lang } from "@/i18n/config";
import { useMessages } from "@/i18n/messages-context";
import type { Messages } from "@/i18n/messages";
import { plural } from "@/i18n/plural";
import { OFFER_CATEGORIES, type OfferCard, type OfferCategory } from "@/lib/reservation/offers";
import { quoteQuery, type QuoteView } from "@/lib/reservation/quote";
import { QUERY_KEYS, type ReservationTerm } from "@/lib/reservation/search";

type Sort = "popular" | "priceAsc" | "priceDesc";
export type OfferView = "classes" | "cars";
type Gearbox = "manual" | "automatic";

// Labels are in messages under `cars.gearboxes`, `cars.views` and `cars.sorts`.
const GEARBOXES: Gearbox[] = ["manual", "automatic"];

const VIEWS: { id: OfferView; icon: LucideIcon }[] = [
  { id: "classes", icon: Rows3 },
  { id: "cars", icon: LayoutGrid },
];

const SORTS: Sort[] = ["popular", "priceAsc", "priceDesc"];

/** Booking choices made after the car; they mean nothing once the car is gone. */
const AFTER_CAR = [
  QUERY_KEYS.offer,
  QUERY_KEYS.step,
  QUERY_KEYS.protection,
  QUERY_KEYS.zone,
  QUERY_KEYS.extras,
  QUERY_KEYS.accessories,
] as const;

/**
 * Car step. The chosen car (`offer=`) and the daily layout (`view=`) go into
 * the URL with `replaceState`, so a refresh keeps them and neither queries
 * RentCarSoft again.
 */
export function OfferList({
  offers,
  term,
  initialSelected,
  initialView,
  trip,
  lang,
  searchQuery: serverSearchQuery,
  initialQuote,
  lostCar,
}: {
  offers: OfferCard[];
  term: ReservationTerm;
  initialSelected: number | null;
  initialView: OfferView;
  trip: TripSummary;
  lang: Lang;
  /** The search's canonical query, for the quote request. */
  searchQuery: string;
  /** Daily: the server's quote for `initialSelected`, if any. */
  initialQuote: { request: string; quote: QuoteView | null } | null;
  /**
   * The car in the URL is no longer offered (a changed place or date). By
   * default only `initialSelected` missing from `offers` counts.
   */
  lostCar?: boolean;
}) {
  const searchQuery = useLiveSearchQuery(serverSearchQuery);
  const router = useRouter();
  const { cars } = useMessages();
  const [sort, setSort] = useState<Sort>("popular");
  const [view, setView] = useState<OfferView>(initialView);
  // One choice per group; the two groups narrow each other down ("Automatyczna" and "Eko").
  const [gearbox, setGearbox] = useState<Gearbox | null>(null);
  const [category, setCategory] = useState<OfferCategory | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(
    offers.some((offer) => offer.id === initialSelected) ? initialSelected : null,
  );
  const selected = offers.find((offer) => offer.id === selectedId) ?? null;
  const lost = lostCar ?? (initialSelected !== null && !offers.some((offer) => offer.id === initialSelected));

  // A lost car takes its protection and extras with it: drop them from the URL,
  // so a refresh or "Wybierz" does not carry them over to another car.
  useEffect(() => {
    if (lost) {
      for (const key of AFTER_CAR) {
        replaceParam(key, null);
      }
    }
    // Only on mount: later choices write the URL themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const offeredCategories = OFFER_CATEGORIES.filter((category) =>
    offers.some((offer) => offer.categories.includes(category.id)),
  );
  const visible = sortOffers(
    offers.filter(
      (offer) =>
        (gearbox === null || offer.automatic === (gearbox === "automatic")) &&
        (category === null || offer.categories.includes(category)),
    ),
    sort,
    term,
  );

  // Daily rental books a class, so by default it is listed by segment like the
  // old site. `visible` is already sorted, so each segment takes the place of
  // its first car. The monthly list has no segment view, as on the old site.
  const segments = term === "short" && view === "classes" ? groupBySegment(visible) : null;

  const activeFilters = Number(gearbox !== null) + Number(category !== null);
  function clearFilters() {
    setGearbox(null);
    setCategory(null);
  }
  const countText = countLabel(lang, cars, visible.length, segments?.length ?? null);

  const filterRows = (
    <>
      <FilterRow
        label={cars.gearbox}
        options={GEARBOXES.map((id) => ({ id, label: cars.gearboxes[id] }))}
        value={gearbox}
        onChange={setGearbox}
      />
      {offeredCategories.length > 0 ? (
        <FilterRow
          label={cars.category}
          options={offeredCategories.map((option) => ({ id: option.id, label: cars.categories[option.id] }))}
          value={category}
          onChange={setCategory}
        />
      ) : null}
    </>
  );

  /** Choosing a car goes straight to the protection step, for daily and monthly rental alike. */
  function choose(id: number) {
    setSelectedId(id);
    router.push(currentHrefWith({ [QUERY_KEYS.offer]: String(id), [QUERY_KEYS.step]: "protection" }), { scroll: false });
  }

  // Summary prices come from a calculate quote (monthly: with the months and km limit).
  const quote = useQuote(selected ? quoteQuery(lang, searchQuery, selected.id, []) : null, initialQuote);
  const prices: SummaryPrices | null = selected ? quotePrices(quote) : null;
  // "Wybierz" already moves on, so the panel offers "DALEJ" only for a car
  // chosen before (after "Zmień samochód" on the next step).
  const action: SummaryAction | undefined = !selected
    ? undefined
    : {
        label: cars.next,
        onClick: () =>
          router.push(currentHrefWith({ [QUERY_KEYS.offer]: String(selected.id), [QUERY_KEYS.step]: "protection" }), {
            scroll: false,
          }),
      };

  /** Another car of the already chosen class becomes the choice, without leaving the list. */
  function swap(id: number) {
    setSelectedId(id);
    replaceParam(QUERY_KEYS.offer, String(id));
  }

  const viewOptions = VIEWS.map((option) => ({ ...option, label: cars.views[option.id] }));
  const sortOptions = SORTS.map((id) => ({ id, label: cars.sorts[id] }));

  function changeView(next: OfferView) {
    setView(next);
    replaceParam(QUERY_KEYS.view, next === "cars" ? "cars" : null);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0">
      {/* Below `lg`: one "Filtry" button; filters, sort and layout open in a sheet. */}
      <div className="mb-4 flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className={buttonClass("secondary", "md", "px-4")}
        >
          <SlidersHorizontal className="size-4 text-blue-medium" aria-hidden />
          {cars.filters}
          {activeFilters > 0 ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-blue-medium text-xxs text-white">
              {activeFilters}
            </span>
          ) : null}
        </button>
        <p className="min-w-0 flex-1 truncate text-sm text-muted-dark" aria-live="polite">
          {countText}
        </p>
        {activeFilters > 0 ? <ClearButton onClick={clearFilters} /> : null}
      </div>
      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        resultLabel={carCount(lang, cars, visible.length)}
        onClear={activeFilters > 0 ? clearFilters : null}
      >
        {term === "short" ? (
          <FilterRow
            label={cars.view}
            options={viewOptions.map(({ id, label }) => ({ id, label }))}
            value={view}
            onChange={(next) => (next ? changeView(next) : undefined)}
            required
          />
        ) : null}
        <FilterRow
          label={cars.sort}
          options={sortOptions}
          value={sort}
          onChange={(next) => (next ? setSort(next) : undefined)}
          required
        />
        {filterRows}
      </FilterSheet>

      <div className="mb-4 hidden flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm lg:flex">
        {filterRows}
        {activeFilters > 0 ? (
          <div className="flex justify-end border-t border-muted-light pt-3">
            <ClearButton onClick={clearFilters} />
          </div>
        ) : null}
      </div>
      <div className="mb-4 hidden flex-wrap items-center justify-between gap-3 lg:flex">
        <p className="text-sm text-muted-dark" aria-live="polite">
          {countText}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {term === "short" ? (
            <Segmented label={cars.view} options={viewOptions} value={view} onChange={changeView} />
          ) : null}
          <Segmented label={cars.sort} options={sortOptions} value={sort} onChange={setSort} />
        </div>
      </div>
      {visible.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-blue-dark shadow-sm">
          <p>{cars.noMatch}</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 cursor-pointer font-semibold text-blue-medium underline-offset-2 hover:underline"
          >
            {cars.clearFilters}
          </button>
        </div>
      ) : null}
      {segments ? (
        <div className="@container flex flex-col gap-4">
          {segments.map((segment, index) => (
            <SegmentRow
              key={segment.key}
              segment={segment}
              selectedId={selectedId}
              onChoose={choose}
              onSwap={swap}
              preload={index === 0}
            />
          ))}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((offer, index) => (
            <li key={offer.id}>
              <div className="sm:hidden">
                <CompactOfferCard
                  offer={offer}
                  term={term}
                  title={offer.name}
                  subtitle={`${cars.orSimilar} · ${offer.segment}`}
                  selected={offer.id === selectedId}
                  onChoose={() => choose(offer.id)}
                  preload={index === 0}
                />
              </div>
              <div className="hidden h-full sm:block">
                <OfferTile
                  offer={offer}
                  term={term}
                  selected={offer.id === selectedId}
                  onChoose={() => choose(offer.id)}
                  preload={index === 0}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      </div>
      <SummaryPanel
        trip={trip}
        car={selected}
        prices={prices}
        action={action}
        searchQuery={searchQuery}
      />
      <MobileSummaryBar trip={trip} car={selected} prices={prices} action={action} />
    </div>
  );
}

/**
 * Pill switch, e.g. the sort and the view: one always chosen. A toggle button
 * group, so it is one tab stop and arrow keys move between the pills.
 */
function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: T; label: string; icon?: LucideIcon }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <ToggleButtonGroup
      aria-label={label}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[value]}
      onSelectionChange={(keys) => {
        const [next] = keys;
        if (next !== undefined) {
          onChange(next as T);
        }
      }}
      className="flex gap-1 rounded-full bg-white p-1 shadow-sm"
    >
      {options.map(({ id, label: optionLabel, icon: Icon }) => (
        <ToggleButton
          key={id}
          id={id}
          className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-blue-dark/70 outline-none transition-colors duration-200 ease-out hover:bg-muted-light data-focus-visible:ring-2 data-focus-visible:ring-blue-medium data-selected:bg-blue-medium data-selected:text-white motion-reduce:transition-none"
        >
          {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
          {optionLabel}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

function ClearButton({ onClick }: { onClick: () => void }) {
  const { cars } = useMessages();
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 text-sm font-semibold text-red-600 transition-colors duration-200 ease-out hover:bg-red-50 motion-reduce:transition-none"
    >
      <X className="size-4" aria-hidden />
      {cars.clearFilters}
    </button>
  );
}

/** Bottom sheet below `lg` (swipe down to close). Choices apply at once; the button only closes it. */
function FilterSheet({
  open,
  onClose,
  resultLabel,
  onClear,
  children,
}: {
  open: boolean;
  onClose: () => void;
  resultLabel: string;
  /** Null when no filter is set. */
  onClear: (() => void) | null;
  children: ReactNode;
}) {
  const titleId = useId();
  const { cars } = useMessages();
  return (
    <BottomSheet open={open} onOpenChange={(value) => (value ? undefined : onClose())} labelledBy={titleId} className="lg:hidden">
        <DialogHeader titleId={titleId} title={cars.filtersTitle} className="pt-6 pb-2" />
        <div className="flex flex-col gap-5 px-5 py-3">{children}</div>
        {/* Stays at the bottom while the content scrolls under it. */}
        <div className="sticky bottom-0 flex items-center gap-3 border-t border-muted-light bg-white px-5 py-4">
          {onClear ? <ClearButton onClick={onClear} /> : null}
          <button
            type="button"
            onClick={onClose}
            className={buttonClass("primary", "md", "flex-1 px-4")}
          >
            {fill(cars.showResults, { cars: resultLabel })}
          </button>
        </div>
    </BottomSheet>
  );
}

/** A label and its chips (`ChoiceChips`): one choice at most, cleared by pressing it again unless `required`. */
function FilterRow<T extends string>({
  label,
  options,
  value,
  onChange,
  required = false,
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
  required?: boolean;
}) {
  const labelId = useId();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span id={labelId} className="w-full text-xs font-semibold text-blue-dark sm:w-32">
        {label}
      </span>
      <ChoiceChips
        labelledBy={labelId}
        options={options.map((option) => ({ value: option.id, label: option.label }))}
        value={value}
        onChange={onChange}
        required={required}
        size="sm"
        className="flex flex-wrap items-center gap-2"
      />
    </div>
  );
}

function OfferTile({
  offer,
  term,
  selected,
  onChoose,
  preload,
}: {
  offer: OfferCard;
  term: ReservationTerm;
  selected: boolean;
  onChoose: () => void;
  /** The first card of the list: its photo is the page's largest paint. */
  preload: boolean;
}) {
  const { cars } = useMessages();
  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-2xl border-2 bg-white transition-[border-color,box-shadow] duration-200 ease-out motion-reduce:transition-none ${
        selected ? "border-green-medium shadow-lg" : "border-transparent shadow-sm hover:shadow-md"
      }`}
    >
      <div className="relative aspect-[16/10] bg-white">
        {offer.image ? (
          <Image
            src={offer.image.src}
            alt={offer.image.alt}
            fill
            // Three columns next to the 20rem summary panel from `xl`, two below.
            sizes="(min-width: 1280px) 300px, (min-width: 1024px) 460px, (min-width: 640px) 50vw, 100vw"
            preload={preload}
            className="object-contain p-3"
          />
        ) : null}
        {offer.popular ? (
          <span className="absolute top-3 left-3 rounded-full bg-green-light px-2.5 py-1 text-xxs font-bold text-green-dark">
            {cars.popular}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xxs font-semibold tracking-wide text-blue-medium uppercase">{offer.segment}</p>
          <h3 className="text-lg font-semibold text-blue-dark">{offer.name}</h3>
          <p className="text-xs text-muted-dark">{cars.orSimilar}</p>
        </div>
        <SpecList offer={offer} />
        {/* Stacked: a four-digit total with "/ 14 dni" leaves no room for the button beside it. */}
        <div className="mt-auto flex flex-col gap-3">
          {/* Above the price: price and button stay at the bottom, level across the row of cards. */}
          {term === "short" ? <PromotionLine offer={offer} /> : null}
          <div className="border-t border-muted-light pt-3">
            <Price offer={offer} term={term} />
          </div>
          <ChooseButton selected={selected} onClick={onChoose} className="w-full" />
        </div>
      </div>
    </article>
  );
}

function sortOffers(offers: OfferCard[], sort: Sort, term: ReservationTerm): OfferCard[] {
  if (sort === "popular") {
    // Cars marked popular first; otherwise the API order. `toSorted` is stable.
    return offers.toSorted((left, right) => Number(right.popular) - Number(left.popular));
  }
  const direction = sort === "priceAsc" ? 1 : -1;
  return offers.toSorted((left, right) => {
    const leftPrice = priceOf(left, term);
    const rightPrice = priceOf(right, term);
    if (leftPrice === null || rightPrice === null) {
      // Offers without a price go last in both directions.
      return Number(leftPrice === null) - Number(rightPrice === null);
    }
    return direction * (leftPrice - rightPrice);
  });
}

function carCount(lang: Lang, cars: Messages["cars"], count: number): string {
  return `${count} ${plural(lang, count, cars.carCount)}`;
}

function countLabel(lang: Lang, cars: Messages["cars"], count: number, segments: number | null): string {
  const carsText = carCount(lang, cars, count);
  if (segments === null) {
    return carsText;
  }
  return fill(cars.inClasses, { cars: carsText, count: segments, classes: plural(lang, segments, cars.classCount) });
}
