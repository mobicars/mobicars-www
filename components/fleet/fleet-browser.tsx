"use client";

import { SearchX, SlidersHorizontal, X } from "lucide-react";
import { useId, useState, useSyncExternalStore, type ReactNode } from "react";

import { FleetCard, type FleetTexts } from "@/components/fleet/fleet-card";
import type { Lang } from "@/i18n/config";
import type { FleetCard as FleetCardData } from "@/lib/fleet/cars";
import { countLabel } from "@/lib/fleet/format";
import { parseFleetFilters, fleetFiltersToQuery, type FleetFilters, type FleetSort } from "@/lib/fleet/filters";
import type { OfferCategory } from "@/lib/reservation/offers";

const CATEGORY_ORDER: OfferCategory[] = ["small", "compact", "large", "eco", "delivery"];

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

export function FleetBrowser({ cars, lang, t }: { cars: FleetCardData[]; lang: Lang; t: FleetTexts }) {
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => "");
  const filters = parseFleetFilters(new URLSearchParams(search));
  const [panelOpen, setPanelOpen] = useState(false);
  const panelId = useId();

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

  function update(patch: Partial<FleetFilters>) {
    writeFilters({ ...filters, ...patch });
  }

  function clear() {
    writeFilters({ category: null, gearbox: null, fuel: null, seats: null, sort: filters.sort });
  }

  const resultLabel = countLabel(lang, shown.length, t.results);

  return (
    <div className="flex flex-col gap-6">
      <section aria-label={t.filtersLabel} className="rounded-2xl border border-muted bg-white p-3 shadow-sm sm:p-4">
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <button
            type="button"
            aria-expanded={panelOpen}
            aria-controls={panelId}
            onClick={() => setPanelOpen((open) => !open)}
            className="flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-blue-medium px-4 text-sm font-bold text-white transition-colors duration-200 ease-out hover:bg-blue-dark motion-reduce:transition-none"
          >
            {panelOpen ? <X className="size-4" aria-hidden /> : <SlidersHorizontal className="size-4" aria-hidden />}
            {panelOpen ? t.close : t.filters}
            {active > 0 && !panelOpen ? (
              <span className="rounded-full bg-white px-1.5 text-xs text-blue-dark">{active}</span>
            ) : null}
          </button>
          <SortSelect value={filters.sort} onChange={(sort) => update({ sort })} t={t} />
        </div>

        <div id={panelId} className={`${panelOpen ? "mt-4 flex" : "hidden"} flex-col gap-4 lg:mt-0 lg:flex`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:gap-x-8">
            {categories.length > 0 ? (
              <ChipGroup label={t.category}>
                {categories.map((category) => (
                  <Chip
                    key={category}
                    pressed={filters.category === category}
                    onClick={() => update({ category: filters.category === category ? null : category })}
                  >
                    {t.categories[category]}
                  </Chip>
                ))}
              </ChipGroup>
            ) : null}
            {hasGearboxChoice ? (
              <ChipGroup label={t.gearbox}>
                {(["manual", "automatic"] as const).map((gearbox) => (
                  <Chip
                    key={gearbox}
                    pressed={filters.gearbox === gearbox}
                    onClick={() => update({ gearbox: filters.gearbox === gearbox ? null : gearbox })}
                  >
                    {t[gearbox]}
                  </Chip>
                ))}
              </ChipGroup>
            ) : null}
            {fuels.length > 1 ? (
              <ChipGroup label={t.fuel}>
                {fuels.map(([id, label]) => (
                  <Chip
                    key={id}
                    pressed={filters.fuel === id}
                    onClick={() => update({ fuel: filters.fuel === id ? null : id })}
                  >
                    {label}
                  </Chip>
                ))}
              </ChipGroup>
            ) : null}
            {seatOptions.length > 1 ? (
              <ChipGroup label={t.seats}>
                {seatOptions.map((seats) => (
                  <Chip
                    key={seats}
                    pressed={filters.seats === seats}
                    onClick={() => update({ seats: filters.seats === seats ? null : seats })}
                  >
                    {t.seatsAtLeast.replace("{count}", String(seats))}
                  </Chip>
                ))}
              </ChipGroup>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-muted-light pt-3">
            <p aria-live="polite" className="text-sm font-semibold text-blue-dark">
              {resultLabel}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {active > 0 ? (
                <button
                  type="button"
                  onClick={clear}
                  className="flex h-9 cursor-pointer items-center gap-1 rounded-full px-3 text-sm font-semibold text-blue-medium underline-offset-4 hover:underline"
                >
                  <X className="size-4" aria-hidden />
                  {t.clear}
                </button>
              ) : null}
              <div className="hidden lg:block">
                <SortSelect value={filters.sort} onChange={(sort) => update({ sort })} t={t} />
              </div>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="h-11 cursor-pointer rounded-xl bg-green-medium px-4 text-sm font-bold text-white transition-colors duration-200 ease-out hover:bg-green-dark motion-reduce:transition-none lg:hidden"
              >
                {t.showResults.replace("{count}", String(shown.length))}
              </button>
            </div>
          </div>
        </div>
      </section>

      {shown.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((car, index) => (
            <li key={car.id}>
              <FleetCard car={car} lang={lang} t={t} priority={index < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-muted px-4 py-16 text-center">
          <SearchX className="size-10 text-muted-dark" strokeWidth={1.5} aria-hidden />
          <p className="text-blue-dark">{t.empty}</p>
          <button
            type="button"
            onClick={clear}
            className="h-11 cursor-pointer rounded-xl bg-blue-medium px-4 text-sm font-bold text-white hover:bg-blue-dark"
          >
            {t.clear}
          </button>
        </div>
      )}
    </div>
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

function ChipGroup({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-2">
      <span id={id} className="text-xs font-semibold text-muted-dark">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`h-9 cursor-pointer rounded-full border px-3.5 text-sm font-semibold transition-colors duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-blue-medium focus-visible:ring-offset-1 motion-reduce:transition-none ${
        pressed
          ? "border-blue-medium bg-blue-medium text-white hover:bg-blue-dark"
          : "border-muted bg-white text-blue-dark hover:border-blue-medium/60 hover:bg-blue-light/40"
      }`}
    >
      {children}
    </button>
  );
}

function SortSelect({ value, onChange, t }: { value: FleetSort; onChange: (sort: FleetSort) => void; t: FleetTexts }) {
  const id = useId();
  return (
    <div className="flex min-w-0 items-center gap-2">
      <label htmlFor={id} className="sr-only text-xs font-semibold text-muted-dark sm:not-sr-only">
        {t.sort}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as FleetSort)}
        className="h-9 max-w-full min-w-0 cursor-pointer truncate rounded-xl border border-muted bg-white px-2 text-sm font-semibold text-blue-dark outline-none focus-visible:ring-2 focus-visible:ring-blue-medium"
      >
        <option value="default">{t.sortDefault}</option>
        <option value="price_asc">{t.sortPriceAsc}</option>
        <option value="price_desc">{t.sortPriceDesc}</option>
      </select>
    </div>
  );
}
