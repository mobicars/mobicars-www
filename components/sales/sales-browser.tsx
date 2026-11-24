"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { Button, Label, ListBox, ListBoxItem, Popover, Select, SelectValue } from "react-aria-components";

import { ChoiceChips } from "@/components/ui/choice-chips";
import type { Lang } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { plural } from "@/i18n/plural";
import type { SaleCard as SaleCardData } from "@/lib/strapi";

import { SaleCard, type SalesTexts } from "./sale-card";

type Sort = "newest" | "price_asc" | "price_desc" | "year" | "mileage";
type FilterKey = "fuel" | "gearbox" | "body";
const FILTERS: readonly FilterKey[] = ["fuel", "gearbox", "body"];

/**
 * The Car sales section's list: the count, the sort and a filter per fuel,
 * gearbox and body type, built from the ads themselves (a value no ad has is
 * not offered; a filter with one value is left out). All in the browser: a few
 * dozen ads at most, already on the page. An ad without the sorted value (a
 * price, a year) goes to the end.
 */
export function SalesBrowser({ sales, lang, t }: { sales: SaleCardData[]; lang: Lang; t: SalesTexts }) {
  const [sort, setSort] = useState<Sort>("newest");
  const [filters, setFilters] = useState<Record<FilterKey, string | null>>({ fuel: null, gearbox: null, body: null });
  const ids = { fuel: useId(), gearbox: useId(), body: useId() };

  const options = useMemo(
    () =>
      Object.fromEntries(
        FILTERS.map((key) => {
          const counts = new Map<string, number>();
          for (const sale of sales) {
            const value = sale.specs[key];
            if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
          }
          return [key, [...counts].sort(([a], [b]) => a.localeCompare(b, lang)).map(([value, count]) => ({ value, label: `${value} (${count})` }))];
        }),
      ) as Record<FilterKey, { value: string; label: string }[]>,
    [sales, lang],
  );

  const shown = useMemo(() => {
    const matching = sales.filter((sale) => FILTERS.every((key) => !filters[key] || sale.specs[key] === filters[key]));
    return sortSales(matching, sort);
  }, [sales, filters, sort]);

  const active = FILTERS.some((key) => filters[key]);
  const labels: Record<FilterKey, string> = { fuel: t.specs.fuel, gearbox: t.specs.gearbox, body: t.specs.body };

  if (sales.length === 0) {
    return <p className="rounded-card bg-white p-6 text-center text-blue-dark ring-1 ring-line">{t.empty}</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-card bg-white p-4 ring-1 ring-line sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="text-base font-bold text-blue-dark">
            {fill(plural(lang, shown.length, t.count), { count: String(shown.length) })}
          </p>
          <SortSelect value={sort} onChange={setSort} t={t} />
        </div>
        {FILTERS.some((key) => options[key].length > 1) ? (
          <div className="flex flex-col gap-3 border-t border-line pt-4 lg:flex-row lg:flex-wrap lg:items-start lg:gap-x-8">
            {FILTERS.filter((key) => options[key].length > 1).map((key) => (
              <div key={key} className="flex min-w-0 flex-col gap-2">
                <p id={ids[key]} className="text-xs font-semibold text-muted-dark">
                  {labels[key]}
                </p>
                <ChoiceChips
                  labelledBy={ids[key]}
                  options={options[key]}
                  value={filters[key]}
                  onChange={(value) => setFilters({ ...filters, [key]: value })}
                />
              </div>
            ))}
            {active ? (
              <button
                type="button"
                onClick={() => setFilters({ fuel: null, gearbox: null, body: null })}
                className="flex h-10 cursor-pointer items-center gap-1.5 self-start rounded-full px-3 text-sm font-semibold text-blue-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-blue-medium lg:mt-6"
              >
                <X aria-hidden className="size-4" />
                {t.clear}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {shown.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {shown.map((sale, index) => (
            <li key={sale.id} className="flex">
              <SaleCard sale={sale} lang={lang} t={t} priority={index === 0} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-card bg-white p-6 text-center text-blue-dark ring-1 ring-line">{t.none}</p>
      )}
    </div>
  );
}

/** Missing values last, whatever the direction. */
function sortSales(sales: SaleCardData[], sort: Sort): SaleCardData[] {
  if (sort === "newest") {
    return [...sales].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  }
  const pick = (sale: SaleCardData): number | null => (sort === "year" ? sale.specs.year : sort === "mileage" ? sale.specs.mileage : sale.price);
  const direction = sort === "price_asc" || sort === "mileage" ? 1 : -1;
  return [...sales].sort((a, b) => {
    const left = pick(a);
    const right = pick(b);
    if (left === null || right === null) {
      return left === null ? (right === null ? 0 : 1) : -1;
    }
    return (left - right) * direction;
  });
}

/** The fleet list's sort (`FleetBrowser`): React Aria's `Select` in our pill style. */
function SortSelect({ value, onChange, t }: { value: Sort; onChange: (sort: Sort) => void; t: SalesTexts }) {
  const options: { id: Sort; label: string }[] = [
    { id: "newest", label: t.sortNewest },
    { id: "price_asc", label: t.sortPriceAsc },
    { id: "price_desc", label: t.sortPriceDesc },
    { id: "year", label: t.sortYear },
    { id: "mileage", label: t.sortMileage },
  ];
  return (
    <Select selectedKey={value} onSelectionChange={(key) => onChange(key as Sort)} className="flex min-w-0 items-center gap-2">
      <Label className="sr-only text-xs font-semibold text-muted-dark sm:not-sr-only">{t.sort}</Label>
      <Button className="group flex h-11 min-w-0 cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-white pr-3 pl-4 text-sm font-semibold text-blue-dark outline-none data-focus-visible:ring-2 data-focus-visible:ring-blue-medium data-pressed:bg-tint">
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

