"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Globe, House, Minus, Plus, X } from "lucide-react";

import { DescriptionButton } from "@/components/reservation/description-button";
import { ChooseButton, formatMoney } from "@/components/reservation/offer-parts";
import { MobileSummaryBar, SummaryPanel, quotePrices, type TripSummary } from "@/components/reservation/summary";
import { currentHrefWith, replaceParam } from "@/components/reservation/url";
import { Slider } from "@/components/reservation/slider";
import { Upsell } from "@/components/reservation/upsell";
import { useQuote } from "@/components/reservation/use-quote";
import {
  MAX_QUANTITY,
  selectedAccessories,
  selectedAddonIds,
  selectionToQuery,
  type ExtraOption,
  type ExtrasSelection,
  type ExtrasView,
} from "@/lib/reservation/extras";
import type { OfferCard } from "@/lib/reservation/offers";
import type { UpsellOption } from "@/lib/reservation/upsell";
import { quoteQuery, type QuoteView } from "@/lib/reservation/quote";
import { QUERY_KEYS } from "@/lib/reservation/search";

/**
 * Third step: border trip first, then the other extras by group. Yes/no
 * extras switch on and off; accessories take a quantity. Every change goes
 * into the URL and asks RentCarSoft for a new quote.
 */
export function ExtrasStep({
  lang,
  searchQuery,
  car,
  protectionId,
  view,
  initialSelection,
  initialQuote,
  trip,
  droppedCount = 0,
  upsell = [],
}: {
  lang: string;
  searchQuery: string;
  car: OfferCard;
  /** The insurance chosen on the previous step, quoted together with the extras. */
  protectionId: number | null;
  view: ExtrasView;
  initialSelection: ExtrasSelection;
  initialQuote: { request: string; quote: QuoteView | null };
  trip: TripSummary;
  /** Choices from the URL that this car (segment) or these dates no longer offer. */
  droppedCount?: number;
  /** Dearer classes to suggest, see `lib/reservation/upsell.ts`. */
  upsell?: UpsellOption[];
}) {
  const router = useRouter();
  const [selection, setSelection] = useState(initialSelection);
  const quote = useQuote(
    quoteQuery(
      lang,
      searchQuery,
      car.id,
      [...(protectionId === null ? [] : [protectionId]), ...selectedAddonIds(selection)],
      selectedAccessories(selection),
    ),
    initialQuote,
  );

  // The server already left them out; make the URL say the same.
  useEffect(() => {
    if (droppedCount > 0) {
      const query = selectionToQuery(initialSelection);
      replaceParam(QUERY_KEYS.zone, query.zone);
      replaceParam(QUERY_KEYS.extras, query.extras);
      replaceParam(QUERY_KEYS.accessories, query.acc);
    }
  }, [droppedCount, initialSelection]);

  function update(next: ExtrasSelection) {
    setSelection(next);
    const query = selectionToQuery(next);
    replaceParam(QUERY_KEYS.zone, query.zone);
    replaceParam(QUERY_KEYS.extras, query.extras);
    replaceParam(QUERY_KEYS.accessories, query.acc);
  }

  function toggle(id: number) {
    const on = selection.addons.includes(id);
    update({ ...selection, addons: on ? selection.addons.filter((item) => item !== id) : [...selection.addons, id] });
  }

  function setQuantity(id: number, quantity: number) {
    const accessories = new Map(selection.accessories);
    if (quantity > 0) {
      accessories.set(id, Math.min(quantity, MAX_QUANTITY));
    } else {
      accessories.delete(id);
    }
    update({ ...selection, accessories });
  }

  const backToProtection = () => router.push(currentHrefWith({ [QUERY_KEYS.step]: "protection" }), { scroll: false });
  const backToCars = () =>
    router.push(
      currentHrefWith({
        [QUERY_KEYS.step]: null,
        [QUERY_KEYS.protection]: null,
        [QUERY_KEYS.zone]: null,
        [QUERY_KEYS.extras]: null,
        [QUERY_KEYS.accessories]: null,
      }), { scroll: false }
    );
  const action = {
    label: "DALEJ",
    onClick: () => router.push(currentHrefWith({ [QUERY_KEYS.step]: "details" }), { scroll: false }),
  };
  const prices = quotePrices(quote);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section aria-labelledby="extras-title" className="@container flex min-w-0 flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="extras-title" className="text-2xl font-semibold text-blue-dark">
            Wybierz dodatki
          </h2>
          <button
            type="button"
            onClick={backToProtection}
            className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-blue-medium underline-offset-2 hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Wróć do ochrony
          </button>
        </div>

        {droppedCount > 0 ? (
          <p role="status" className="rounded-xl bg-blue-light px-4 py-3 text-sm text-blue-dark">
            {droppedCount === 1
              ? "Jeden z wybranych wcześniej dodatków nie jest dostępny dla tego auta lub terminu i został usunięty."
              : "Część wybranych wcześniej dodatków nie jest dostępna dla tego auta lub terminu i została usunięta."}
          </p>
        ) : null}

        {view.zones.length > 0 ? (
          <BorderZones zones={view.zones} value={selection.zone} onChange={(zone) => update({ ...selection, zone })} />
        ) : null}

        {view.groups.map((group) => (
          <section key={group.id} aria-labelledby={`extras-${group.id}`}>
            <h3 id={`extras-${group.id}`} className="mb-3 text-lg font-semibold text-blue-dark">
              {group.title}
            </h3>
            <ul className="grid grid-cols-2 gap-3 @md:gap-4 @2xl:grid-cols-3 @3xl:grid-cols-4">
              {group.items.map((item) => (
                <li key={item.id} className="flex">
                  <ExtraTile
                    item={item}
                    quantity={
                      item.kind === "quantity"
                        ? (selection.accessories.get(item.id) ?? 0)
                        : Number(selection.addons.includes(item.id))
                    }
                    onToggle={() => toggle(item.id)}
                    onQuantity={(quantity) => setQuantity(item.id, quantity)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}

        {view.zones.length === 0 && view.groups.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-sm text-blue-dark shadow-sm">
            Do tego auta i terminu nie ma dodatków do wyboru.
          </p>
        ) : null}

        <Upsell current={car} options={upsell} />
      </section>
      <SummaryPanel trip={trip} car={car} prices={prices} action={action} onChangeCar={backToCars} />
      <MobileSummaryBar car={car} prices={prices} action={action} />
    </div>
  );
}

/** "Bez wyjazdu" plus one card per zone; a single choice. */
function BorderZones({
  zones,
  value,
  onChange,
}: {
  zones: ExtraOption[];
  value: number | null;
  onChange: (zone: number | null) => void;
}) {
  return (
    <section aria-labelledby="extras-border" className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-light text-blue-medium">
          <Globe className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <h3 id="extras-border" className="text-lg font-semibold text-blue-dark">
            Wyjazd za granicę
          </h3>
          <p className="text-sm text-muted-dark">
            Planujesz wyjazd poza Polskę? Wybierz strefę z krajami, do których jedziesz.
          </p>
        </div>
      </div>
      {/* Narrow: a swipe row with the chosen zone in view; wider: a grid. */}
      <div role="radiogroup" aria-labelledby="extras-border">
      <Slider
        label="Strefy wyjazdu"
        startIndex={value === null ? 0 : zones.findIndex((zone) => zone.id === value) + 1}
        className="-mx-5 scroll-px-5 px-5 pb-1 @md:mx-0 @md:grid @md:grid-cols-2 @md:overflow-visible @md:px-0 @3xl:grid-cols-4"
        itemClassName="w-[62%] @md:w-auto"
        dotsClassName="@md:hidden"
      >
        <ZoneCard selected={value === null} onSelect={() => onChange(null)} title="Bez wyjazdu" note="Tylko Polska" image={null}>
          <span className="text-lg font-bold text-green-medium">0,00 zł</span>
        </ZoneCard>
        {zones.map((zone) => (
          <ZoneCard
            key={zone.id}
            selected={value === zone.id}
            onSelect={() => onChange(zone.id)}
            title={zone.name}
            note={zone.note}
            description={zone.description}
            image={zone.image}
          >
            <ExtraPrice item={zone} />
          </ZoneCard>
        ))}
      </Slider>
      </div>
    </section>
  );
}

function ZoneCard({
  selected,
  onSelect,
  title,
  note,
  description,
  image,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  note: string | null;
  description?: string | null;
  /** The zone's map from RentCarSoft. "Bez wyjazdu" has none and gets an icon of the same size. */
  image: string | null;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative flex w-full flex-col gap-2 overflow-hidden rounded-2xl border-2 bg-white p-4 pt-0 transition-colors duration-200 ease-out motion-reduce:transition-none ${
        selected ? "border-green-medium" : "border-muted-light hover:border-blue-medium/40"
      }`}
    >
      <span className="relative -mx-4 mb-2 block aspect-[3/2] bg-surface">
        {image ? (
          <Image src={image} alt="" fill sizes="(min-width: 1280px) 240px, (min-width: 640px) 45vw, 100vw" className="object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center text-blue-medium/60">
            <House className="size-12" strokeWidth={1.25} aria-hidden />
          </span>
        )}
      </span>
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? "border-green-medium" : "border-blue-dark/30"
          }`}
        >
          {selected ? <span className="size-2.5 rounded-full bg-green-medium" /> : null}
        </span>
        <span className="font-semibold text-blue-dark">{title}</span>
      </div>
      {note ? <p className="text-xs text-muted-dark">{note}</p> : null}
      <div className="mt-auto flex items-end justify-between gap-2">
        <div>{children}</div>
        {description ? (
          // Above the card-wide click area of the button below, so it opens the details instead.
          <span className="relative z-10">
            <DescriptionButton title={title} description={description} tone="light" />
          </span>
        ) : null}
      </div>
      {/* The radio of the group; its ::after stretches over the card so the whole card picks it. */}
      <ChooseButton
        selected={selected}
        onClick={onSelect}
        radio={{ label: title }}
        className="mt-1 w-full after:absolute after:inset-0 after:rounded-2xl"
      />
    </div>
  );
}

function ExtraTile({
  item,
  quantity,
  onToggle,
  onQuantity,
}: {
  item: ExtraOption;
  /** Toggles: 0 or 1. */
  quantity: number;
  onToggle: () => void;
  onQuantity: (quantity: number) => void;
}) {
  const chosen = quantity > 0;
  return (
    <article
      className={`relative flex w-full min-w-0 flex-col rounded-2xl border-2 bg-white p-3 shadow-sm transition-[border-color,box-shadow] duration-200 ease-out motion-reduce:transition-none @md:p-4 ${
        chosen ? "border-green-medium shadow-md" : "border-transparent"
      }`}
    >
      {/* In the corner, so it takes no width from the name in a narrow tile. */}
      {item.description ? (
        <span className="absolute top-2 right-2 z-10">
          <DescriptionButton title={item.name} description={item.description} tone="light" />
        </span>
      ) : null}
      {item.image ? (
        <span className="relative mb-3 block h-16 w-full @md:h-20">
          <Image src={item.image} alt="" fill sizes="240px" className="object-contain" />
        </span>
      ) : null}
      {/* Long Polish words ("Zarezerwowanego") must not push a half-width tile wider. */}
      <h4
        lang="pl"
        className={`text-sm font-semibold break-words hyphens-auto text-blue-dark @md:text-base ${
          item.image || !item.description ? "" : "pr-7"
        }`}
      >
        {item.name}
      </h4>
      <div className="mt-auto flex flex-col gap-3 pt-4">
        <ExtraPrice item={item} />
        {item.kind === "toggle" ? (
          <ToggleButton added={chosen} onClick={onToggle} />
        ) : (
          <Stepper name={item.name} value={quantity} onChange={onQuantity} />
        )}
      </div>
    </article>
  );
}

/** Price as the API sends it: per day with the period total, or once. */
function ExtraPrice({ item }: { item: ExtraOption }) {
  return (
    <div className="min-w-0">
      <p className="text-lg font-bold text-blue-dark">
        {formatMoney(item.price)}
        <span className="text-xs font-semibold text-muted-dark">{item.oneTime ? " jednorazowo" : " / doba"}</span>
      </p>
      {(!item.oneTime && item.periodPrice !== null) || item.kind === "quantity" ? (
        <p className="text-xxs text-muted-dark">
          {!item.oneTime && item.periodPrice !== null ? `${formatMoney(item.periodPrice)} za cały wynajem` : ""}
          {!item.oneTime && item.periodPrice !== null && item.kind === "quantity" ? ", " : ""}
          {item.kind === "quantity" ? "za sztukę" : ""}
        </p>
      ) : null}
    </div>
  );
}

/** "Dodaj" (green, +) adds the extra; once added, "Usuń" (red, ×) takes it off. Icons without frames, like ✓ on "Wybrany". */
function ToggleButton({ added, onClick }: { added: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={added}
      onClick={onClick}
      className={`flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white transition-colors duration-200 ease-out motion-reduce:transition-none ${
        added ? "bg-red-500 hover:bg-red-600" : "bg-green-medium hover:bg-green-dark"
      }`}
    >
      {added ? <X className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
      {added ? "Usuń" : "Dodaj"}
    </button>
  );
}

function Stepper({ name, value, onChange }: { name: string; value: number; onChange: (value: number) => void }) {
  // "+" adds, green like "Dodaj"; "−" removes, red like "Usuń".
  const button =
    "flex size-10 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200 ease-out disabled:cursor-default disabled:opacity-40 motion-reduce:transition-none";
  const less = `${button} bg-red-500 text-white hover:bg-red-600 disabled:hover:bg-red-500`;
  const more = `${button} bg-green-medium text-white hover:bg-green-dark disabled:hover:bg-green-medium`;
  return (
    <div role="group" aria-label={`Ilość: ${name}`} className="flex items-center justify-between gap-2 rounded-xl bg-surface p-1">
      <button
        type="button"
        aria-label="Mniej"
        disabled={value === 0}
        onClick={() => onChange(value - 1)}
        className={less}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <output aria-live="polite" className="flex-1 text-center text-lg font-bold text-blue-dark">
        {value}
      </output>
      <button
        type="button"
        aria-label="Więcej"
        disabled={value === MAX_QUANTITY}
        onClick={() => onChange(value + 1)}
        className={more}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
