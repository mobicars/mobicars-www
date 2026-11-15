"use client";

import { Check, ChevronDown, SearchX, SlidersHorizontal, X } from "lucide-react";
import { Button, Label, ListBox, ListBoxItem, Popover, Select, SelectValue } from "react-aria-components";
import { useId, useState, useSyncExternalStore, type ReactNode } from "react";

import { FleetCard, type FleetTexts } from "@/components/fleet/fleet-card";
import { buttonClass } from "@/components/ui/button";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { ShowMore } from "@/components/ui/show-more";
import { BottomSheet } from "@/components/ui/sheet";
import type { Lang } from "@/i18n/config";
import type { FleetCard as FleetCardData } from "@/lib/fleet/cars";
import { countLabel } from "@/lib/fleet/format";
import { parseFleetFilters, fleetFiltersToQuery, type FleetFilters, type FleetSort } from "@/lib/fleet/filters";
import type { OfferCategory } from "@/lib/reservation/offers";

const CATEGORY_ORDER: OfferCategory[] = ["small", "compact", "large", "eco", "delivery"];

const GRID = "grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4";

/**
 * The filter state lives in the query string (`?category=eco&gearbox=automatic`),
 * so a filtered list can be shared and survives a refresh. The server renders
 * the full list (no `searchParams`, so the page stays static and every car is
 * in the HTML); after hydration the store below reads the URL.
 */
const URL_EVENT = "fleet:filters";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(URL_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(URL_EVENT, onChange);
  };
}

function writeFilters(filters: FleetFilters) {
  const query = fleetFiltersToQuery(filters).toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
  // Keep Next's router state in `history.state`.
  window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(URL_EVENT));
}

export function FleetBrowser({
  cars,
  lang,
  t,
  more,
}: {
  cars: FleetCardData[];
  lang: Lang;
  t: FleetTexts;
  /** Show the (filtered) list `step` cars at a time with "Show more" (the Cars section's `full`); without it, all at once. */
  more?: { step: number; labels: { more: string; shownOf: string } };
}) {
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => "");
  const filters = parseFleetFilters(new URLSearchParams(search));
  const [panelOpen, setPanelOpen] = useState(false);
  const sheetTitleId = useId();

  const categories = CATEGORY_ORDER.filter((category) => cars.some((car) => car.categories.includes(category)));
  const fuels = [...new Map(cars.flatMap((car) => (car.fuel?.id ? [[car.fuel.id, car.fuel.label] as const] : []))).entries()];
  const seatOptions = [...new Set(cars.flatMap((car) => (car.seats ? [car.seats] : [])))]
    .filter((seats) => seats >= 5)
    .sort((left, right) => left - right);
  const hasGearboxChoice = cars.some((car) => car.automatic === true) && cars.some((car) => car.automatic === false);

  const shown = sortCars(
    cars.filter((car) => matches(car, filters)),
    filters.sort,
  );
  const active =
    Number(filters.category !== null) +
    Number(filters.gearbox !== null) +
    Number(filters.fuel !== null) +
    Number(filters.seats !== null);

  const card = (car: FleetCardData, index: number) => (
    <FleetCard car={car} lang={lang} t={t} priority={index < 2} compact sizes="(min-width: 1280px) 300px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 40vw" />
  );

  function update(patch: Partial<FleetFilters>) {
    writeFilters({ ...filters, ...patch });
  }

  function clear() {
    writeFilters({ category: null, gearbox: null, fuel: null, seats: null, sort: filters.sort });
  }

  const resultLabel = countLabel(lang, shown.length, t.results);

  const groups = (
    <>
      {categories.length > 0 ? (
        <ChipGroup
          label={t.category}
          options={categories.map((category) => ({ value: category, label: t.categories[category] }))}
          value={filters.category}
          onChange={(category) => update({ category })}
        />
      ) : null}
      {hasGearboxChoice ? (
        <ChipGroup
          label={t.gearbox}
          options={(["manual", "automatic"] as const).map((gearbox) => ({ value: gearbox, label: t[gearbox] }))}
          value={filters.gearbox}
          onChange={(gearbox) => update({ gearbox })}
        />
      ) : null}
      {fuels.length > 1 ? (
        <ChipGroup
          label={t.fuel}
          options={fuels.map(([id, label]) => ({ value: id, label }))}
          value={filters.fuel}
          onChange={(fuel) => update({ fuel })}
        />
      ) : null}
      {seatOptions.length > 1 ? (
        <ChipGroup
          label={t.seats}
          options={seatOptions.map((seats) => ({ value: seats, label: t.seatsAtLeast.replace("{count}", String(seats)) }))}
          value={filters.seats}
          onChange={(seats) => update({ seats })}
        />
      ) : null}
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      <section aria-label={t.filtersLabel} className="flex flex-col gap-4">
        {categories.length > 1 ? (
          // Phones and tablets: the categories stay in sight (desktops have every chip in the panel below).
          // Links to the filtered URL, so the filtered lists can be crawled; a click filters in place.
          <nav aria-label={t.category} className="lg:hidden">
            <ul className="-mx-gutter flex gap-2 overflow-x-auto px-gutter pb-1 [scrollbar-width:none]">
              {[null, ...categories].map((category) => {
                const selected = filters.category === category;
                return (
                  <li key={category ?? "all"} className="shrink-0">
                    <a
                      href={category ? `?category=${category}` : "?"}
                      aria-current={selected ? "true" : undefined}
                      onClick={(event) => {
                        event.preventDefault();
                        update({ category });
                      }}
                      className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold whitespace-nowrap ring-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-medium motion-reduce:transition-none ${
                        selected ? "bg-blue-dark text-white ring-blue-dark" : "bg-white text-blue-dark ring-line hover:bg-blue-light"
                      }`}
                    >
                      {category ? t.categories[category] : t.tabsAll}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
        {/* Phones and tablets: a bar with the filter button and the sort; the chips open in a sheet. */}
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setPanelOpen(true)}
            className={buttonClass("secondary", "md", "px-4")}
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            {t.filters}
            {active > 0 ? (
              <span className="rounded-full bg-blue-medium px-1.5 text-xs text-white">{active}</span>
            ) : null}
          </button>
          <SortSelect value={filters.sort} onChange={(sort) => update({ sort })} t={t} />
        </div>

        <div className="hidden rounded-card border border-line bg-white p-5 lg:flex lg:flex-row lg:flex-wrap lg:items-start lg:gap-x-10 lg:gap-y-5">
          {groups}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="text-sm font-semibold text-blue-dark">
            {resultLabel}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {active > 0 ? <ClearButton onClick={clear} label={t.clear} /> : null}
            <div className="hidden lg:block">
              <SortSelect value={filters.sort} onChange={(sort) => update({ sort })} t={t} />
            </div>
          </div>
        </div>

        <BottomSheet open={panelOpen} onOpenChange={setPanelOpen} labelledBy={sheetTitleId} className="lg:hidden">
          <h2 id={sheetTitleId} className="px-5 pt-7 pb-2 text-subtitle text-blue-dark">
            {t.filters}
          </h2>
          <div className="flex flex-col gap-5 px-5 py-3">{groups}</div>
          {/* Stays at the bottom while the chips scroll under it. */}
          <div className="sticky bottom-0 flex items-center gap-3 border-t border-line bg-white px-5 py-4">
            {active > 0 ? <ClearButton onClick={clear} label={t.clear} /> : null}
            <button type="button" onClick={() => setPanelOpen(false)} className={buttonClass("primary", "md", "flex-1 px-4")}>
              {t.showResults.replace("{count}", String(shown.length))}
            </button>
          </div>
        </BottomSheet>
      </section>

      {shown.length > 0 && more ? (
        // A new filter starts again from the first step (`key`).
        <ShowMore
          key={search}
          items={shown.map((car, index) => ({ key: String(car.id), node: card(car, index) }))}
          step={more.step}
          listClassName={GRID}
          labels={more.labels}
        />
      ) : shown.length > 0 ? (
        <ul className={GRID}>
          {shown.map((car, index) => (
            <li key={car.id}>{card(car, index)}</li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-line-strong px-4 py-16 text-center">
          <SearchX className="size-10 text-muted-dark" strokeWidth={1.5} aria-hidden />
          <p className="text-blue-dark">{t.empty}</p>
          <button type="button" onClick={clear} className={buttonClass("primary")}>
            {t.clear}
          </button>
        </div>
      )}
    </div>
  );
}

function ClearButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 cursor-pointer items-center gap-1 rounded-full px-3 text-sm font-semibold text-blue-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-blue-medium"
    >
      <X className="size-4" aria-hidden />
      {label}
    </button>
  );
}

function matches(car: FleetCardData, filters: FleetFilters): boolean {
  if (filters.category && !car.categories.includes(filters.category)) {
    return false;
  }
  if (filters.gearbox && car.automatic !== (filters.gearbox === "automatic")) {
    return false;
  }
  if (filters.fuel !== null && car.fuel?.id !== filters.fuel) {
    return false;
  }
  if (filters.seats !== null && (car.seats ?? 0) < filters.seats) {
    return false;
  }
  return true;
}

/** Price sorts keep cars without a price at the end; "Polecane" is the API's own order. */
function sortCars(cars: FleetCardData[], sort: FleetSort): FleetCardData[] {
  if (sort === "default") {
    return cars;
  }
  const direction = sort === "price_asc" ? 1 : -1;
  return cars.toSorted((left, right) => {
    if (left.dailyFrom === null || right.dailyFrom === null) {
      return Number(left.dailyFrom === null) - Number(right.dailyFrom === null);
    }
    return (left.dailyFrom - right.dailyFrom) * direction;
  });
}

/** A filter's label and its chips: one choice at most, cleared by pressing it again (`ChoiceChips`). */
function ChipGroup<T>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: ReactNode }[];
  value: T | null;
  onChange: (value: T | null) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <span id={id} className="text-xs font-semibold text-muted-dark">
        {label}
      </span>
      <ChoiceChips labelledBy={id} options={options} value={value} onChange={onChange} />
    </div>
  );
}

/**
 * The sort: React Aria's `Select` (a button and a list in a popover) in our
 * pill style with a chevron, not a native `<select>`, whose arrow each system
 * draws its own way. Arrow keys, typing and Escape work as in a listbox.
 */
function SortSelect({ value, onChange, t }: { value: FleetSort; onChange: (sort: FleetSort) => void; t: FleetTexts }) {
  const options: { id: FleetSort; label: string }[] = [
    { id: "default", label: t.sortDefault },
    { id: "price_asc", label: t.sortPriceAsc },
    { id: "price_desc", label: t.sortPriceDesc },
  ];
  return (
    <Select selectedKey={value} onSelectionChange={(key) => onChange(key as FleetSort)} className="flex min-w-0 items-center gap-2">
      <Label className="sr-only text-xs font-semibold text-muted-dark sm:not-sr-only">{t.sort}</Label>
      <Button className="group flex h-12 min-w-0 cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-white pr-3 pl-4 text-sm font-semibold text-blue-dark outline-none data-focus-visible:ring-2 data-focus-visible:ring-blue-medium data-pressed:bg-tint lg:h-10">
        <SelectValue className="truncate" />
        <ChevronDown aria-hidden className="size-4 shrink-0 text-blue-medium transition-transform group-data-[pressed]:rotate-180 motion-reduce:transition-none" />
      </Button>
      <Popover placement="bottom end" offset={6} className="z-50 min-w-(--trigger-width) rounded-2xl border border-line bg-white p-1.5 outline-none">
        <ListBox items={options} className="outline-none">
          {(option) => (
            <ListBoxItem
              id={option.id}
              textValue={option.label}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-blue-dark outline-none data-focused:bg-tint data-selected:font-semibold"
            >
              {({ isSelected }) => (
                <>
                  {option.label}
                  {isSelected ? <Check aria-hidden className="size-4 text-blue-medium" /> : null}
                </>
              )}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </Select>
  );
}
