"use client";

import { useId, useState, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dialog } from "react-aria-components";
import { LayoutGrid, Rows3, SlidersHorizontal, X, type LucideIcon } from "lucide-react";

import { DialogHeader, WidgetModal } from "@/components/reservation/dialog-parts";
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
import { OFFER_CATEGORIES, type OfferCard, type OfferCategory } from "@/lib/reservation/offers";
import { quoteQuery, type QuoteView } from "@/lib/reservation/quote";
import { QUERY_KEYS, type ReservationTerm } from "@/lib/reservation/search";

type Sort = "popular" | "priceAsc" | "priceDesc";
export type OfferView = "classes" | "cars";
type Gearbox = "manual" | "automatic";

const GEARBOXES: { id: Gearbox; label: string }[] = [
  { id: "manual", label: "Manualna" },
  { id: "automatic", label: "Automatyczna" },
];

const VIEWS: { id: OfferView; label: string; icon: LucideIcon }[] = [
  { id: "classes", label: "Klasy", icon: Rows3 },
  { id: "cars", label: "Wszystkie auta", icon: LayoutGrid },
];

const SORTS: { id: Sort; label: string }[] = [
  { id: "popular", label: "Popularne" },
  { id: "priceAsc", label: "Od najtańszych" },
  { id: "priceDesc", label: "Od najdroższych" },
];

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
  searchQuery,
  initialQuote,
}: {
  offers: OfferCard[];
  term: ReservationTerm;
  initialSelected: number | null;
  initialView: OfferView;
  trip: TripSummary;
  lang: string;
  /** The search's canonical query, for the quote request. */
  searchQuery: string;
  /** Daily: the server's quote for `initialSelected`, if any. */
  initialQuote: { request: string; quote: QuoteView | null } | null;
}) {
  const router = useRouter();
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
  const countText = countLabel(visible.length, segments?.length ?? null);

  const filterRows = (
    <>
      <FilterRow label="Skrzynia biegów">
        {GEARBOXES.map((option) => (
          <Chip
            key={option.id}
            pressed={gearbox === option.id}
            onClick={() => setGearbox(gearbox === option.id ? null : option.id)}
          >
            {option.label}
          </Chip>
        ))}
      </FilterRow>
      {offeredCategories.length > 0 ? (
        <FilterRow label="Kategoria">
          {offeredCategories.map((option) => (
            <Chip
              key={option.id}
              pressed={category === option.id}
              onClick={() => setCategory(category === option.id ? null : option.id)}
            >
              {option.label}
            </Chip>
          ))}
        </FilterRow>
      ) : null}
    </>
  );

  /**
   * Daily: choosing a car goes straight to the protection step. Monthly has no
   * next step yet, so there the click only marks the car (again to unmark).
   */
  function choose(id: number) {
    if (term === "short") {
      setSelectedId(id);
      router.push(currentHrefWith({ [QUERY_KEYS.offer]: String(id), [QUERY_KEYS.step]: "protection" }), { scroll: false });
      return;
    }
    const next = id === selectedId ? null : id;
    setSelectedId(next);
    replaceParam(QUERY_KEYS.offer, next === null ? null : String(next));
  }

  // Daily prices in the summary come from a calculate quote. Monthly shows the
  // list's monthly price as sent; it has no quote step yet.
  const quote = useQuote(
    term === "short" && selected ? quoteQuery(lang, searchQuery, selected.id, []) : null,
    initialQuote,
  );
  const prices: SummaryPrices | null = !selected
    ? null
    : term === "short"
      ? quotePrices(quote)
      : {
          lines: selected.monthlyPrice === null ? [] : [{ label: "Rata miesięczna", amount: selected.monthlyPrice }],
          total: selected.monthlyPrice,
          totalSuffix: "/ mies.",
        };
  // Daily: "Wybierz" already moves on, so the panel offers "DALEJ" only
  // for a car chosen before (after "Zmień samochód" on the next step).
  const action: SummaryAction | undefined = !selected
    ? undefined
    : term === "short"
      ? {
          label: "DALEJ",
          onClick: () =>
            router.push(
              currentHrefWith({ [QUERY_KEYS.offer]: String(selected.id), [QUERY_KEYS.step]: "protection" }), { scroll: false }
            ),
        }
      : { label: "DALEJ", hint: "Kolejny krok wynajmu długoterminowego jest w przygotowaniu." };

  /** Another car of the already chosen class becomes the choice, without leaving the list. */
  function swap(id: number) {
    setSelectedId(id);
    replaceParam(QUERY_KEYS.offer, String(id));
  }

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
          className="flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-blue-dark shadow-sm"
        >
          <SlidersHorizontal className="size-4 text-blue-medium" aria-hidden />
          Filtry
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
        resultLabel={`${visible.length} ${plural(visible.length, "samochód", "samochody", "samochodów")}`}
        onClear={activeFilters > 0 ? clearFilters : null}
      >
        {term === "short" ? (
          <FilterRow label="Widok">
            {VIEWS.map((option) => (
              <Chip key={option.id} pressed={view === option.id} onClick={() => changeView(option.id)}>
                {option.label}
              </Chip>
            ))}
          </FilterRow>
        ) : null}
        <FilterRow label="Sortowanie">
          {SORTS.map((option) => (
            <Chip key={option.id} pressed={sort === option.id} onClick={() => setSort(option.id)}>
              {option.label}
            </Chip>
          ))}
        </FilterRow>
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
            <Segmented label="Widok" options={VIEWS} value={view} onChange={changeView} />
          ) : null}
          <Segmented label="Sortowanie" options={SORTS} value={sort} onChange={setSort} />
        </div>
      </div>
      {visible.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-blue-dark shadow-sm">
          <p>Żaden samochód nie pasuje do wybranych filtrów.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 cursor-pointer font-semibold text-blue-medium underline-offset-2 hover:underline"
          >
            Wyczyść filtry
          </button>
        </div>
      ) : null}
      {segments ? (
        <div className="@container flex flex-col gap-4">
          {segments.map((segment) => (
            <SegmentRow key={segment.key} segment={segment} selectedId={selectedId} onChoose={choose} onSwap={swap} />
          ))}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((offer) => (
            <li key={offer.id}>
              <div className="sm:hidden">
                <CompactOfferCard
                  offer={offer}
                  term={term}
                  title={offer.name}
                  subtitle={`lub podobny · ${offer.segment}`}
                  selected={offer.id === selectedId}
                  onChoose={() => choose(offer.id)}
                />
              </div>
              <div className="hidden h-full sm:block">
                <OfferTile
                  offer={offer}
                  term={term}
                  selected={offer.id === selectedId}
                  onChoose={() => choose(offer.id)}
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
      />
      <MobileSummaryBar car={selected} prices={prices} action={action} />
    </div>
  );
}

/** Pill radio group, e.g. the sort and the view switch. */
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
    <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-full bg-white p-1 shadow-sm">
      {options.map(({ id, label: optionLabel, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          onClick={() => onChange(id)}
          className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-blue-dark/70 transition-colors duration-200 ease-out hover:bg-muted-light aria-checked:bg-blue-medium aria-checked:text-white motion-reduce:transition-none"
        >
          {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
          {optionLabel}
        </button>
      ))}
    </div>
  );
}

function ClearButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 text-sm font-semibold text-red-600 transition-colors duration-200 ease-out hover:bg-red-50 motion-reduce:transition-none"
    >
      <X className="size-4" aria-hidden />
      Wyczyść filtry
    </button>
  );
}

/** Bottom sheet below `lg`. Choices apply at once; the button only closes it. */
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
  return (
    <WidgetModal
      open={open}
      onOpenChange={(value) => (value ? undefined : onClose())}
      className="mx-0 mb-0 max-h-[85dvh] w-full rounded-t-3xl shadow-2xl lg:hidden"
    >
      <Dialog aria-labelledby={titleId} className="flex min-h-0 flex-col outline-none">
        <DialogHeader titleId={titleId} title="Filtry i sortowanie" className="pt-4 pb-2" />
        <div className="flex min-h-0 flex-col gap-5 overflow-y-auto overscroll-contain px-5 py-3">{children}</div>
        <div className="flex shrink-0 items-center gap-3 border-t border-muted-light px-5 py-4">
          {onClear ? <ClearButton onClick={onClear} /> : null}
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 cursor-pointer rounded-xl bg-blue-medium px-4 text-sm font-bold text-white transition-colors duration-200 ease-out hover:bg-blue-dark motion-reduce:transition-none"
          >
            Pokaż {resultLabel}
          </button>
        </div>
      </Dialog>
    </WidgetModal>
  );
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="w-full text-xs font-semibold text-blue-dark sm:w-32">{label}</span>
      {children}
    </div>
  );
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="cursor-pointer rounded-full border border-blue-dark/15 px-3 py-1.5 text-xs font-semibold text-blue-dark/80 uppercase transition-colors duration-200 ease-out hover:border-blue-medium/50 aria-pressed:border-blue-medium aria-pressed:bg-blue-medium aria-pressed:text-white motion-reduce:transition-none"
    >
      {children}
    </button>
  );
}

function OfferTile({
  offer,
  term,
  selected,
  onChoose,
}: {
  offer: OfferCard;
  term: ReservationTerm;
  selected: boolean;
  onChoose: () => void;
}) {
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
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-3"
          />
        ) : null}
        {offer.popular ? (
          <span className="absolute top-3 left-3 rounded-full bg-green-light px-2.5 py-1 text-xxs font-bold text-green-dark">
            Popularny
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xxs font-semibold tracking-wide text-blue-medium uppercase">{offer.segment}</p>
          <h3 className="text-lg font-semibold text-blue-dark">{offer.name}</h3>
          <p className="text-xs text-muted-dark">lub podobny</p>
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

function countLabel(cars: number, segments: number | null): string {
  const carsText = `${cars} ${plural(cars, "samochód", "samochody", "samochodów")}`;
  if (segments === null) {
    return carsText;
  }
  return `${carsText} w ${segments} ${plural(segments, "klasie", "klasach", "klasach")}`;
}

function plural(count: number, one: string, few: string, many: string): string {
  if (count === 1) {
    return one;
  }
  const last = count % 10;
  const lastTwo = count % 100;
  return last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? few : many;
}
