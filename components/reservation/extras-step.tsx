"use client";

import { useEffect, useState, type ReactNode, type SyntheticEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, GridList, GridListItem } from "react-aria-components";
import { ArrowLeft, Globe, House, Minus, Package, Plus } from "lucide-react";

import { DescriptionButton } from "@/components/reservation/description-button";
import { formatMoney } from "@/components/reservation/format";
import { ExtendHintSlot, ProtectionUpgrade } from "@/components/reservation/nudges";
import { ChooseFace, chooseClass } from "@/components/reservation/offer-parts";
import { MobileSummaryBar, SummaryPanel, quotePrices, type TripSummary } from "@/components/reservation/summary";
import { currentHrefWith, replaceParam, restartCarChoice } from "@/components/reservation/url";
import { Slider } from "@/components/reservation/slider";
import { Upsell } from "@/components/reservation/upsell";
import { useQuote } from "@/components/reservation/use-quote";
import { useLiveSearchQuery } from "@/components/reservation/use-search-query";
import { fill } from "@/i18n/fill";
import { useLang } from "@/i18n/lang-context";
import { useMessages } from "@/i18n/messages-context";
import {
  MAX_QUANTITY,
  selectedAccessories,
  selectedAddonIds,
  selectionToQuery,
  type ExtraOption,
  type ExtrasSelection,
  type ExtrasView,
} from "@/lib/reservation/extras";
import type { ExtensionHint } from "@/lib/reservation/extend";
import type { OfferCard } from "@/lib/reservation/offers";
import type { ProtectionOption } from "@/lib/reservation/protection";
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
  searchQuery: serverSearchQuery,
  car,
  protectionId,
  view,
  initialSelection,
  initialQuote,
  trip,
  droppedCount = 0,
  upsell = [],
  extension = null,
  upgrade = null,
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
  /** "Weź 4 dni zamiast 3", when the next price band is close (`extensionHint`). */
  extension?: Promise<ExtensionHint | null> | null;
  /** The best package, offered to someone who chose a lesser one. */
  upgrade?: { from: ProtectionOption; to: ProtectionOption } | null;
}) {
  const searchQuery = useLiveSearchQuery(serverSearchQuery);
  const router = useRouter();
  const t = useMessages().extras;
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
  const backToCars = () => router.push(restartCarChoice(), { scroll: false });
  const action = {
    label: t.next,
    onClick: () => router.push(currentHrefWith({ [QUERY_KEYS.step]: "details" }), { scroll: false }),
  };
  const prices = quotePrices(quote);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section aria-labelledby="extras-title" className="@container flex min-w-0 flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="extras-title" className="text-2xl font-semibold text-blue-dark">
            {t.title}
          </h2>
          <button
            type="button"
            onClick={backToProtection}
            className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-blue-medium underline-offset-2 hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t.backToProtection}
          </button>
        </div>

        {droppedCount > 0 ? (
          <p role="status" className="rounded-xl bg-blue-light px-4 py-3 text-sm text-blue-dark">
            {droppedCount === 1 ? t.droppedOne : t.droppedMany}
          </p>
        ) : null}

        {upgrade ? <ProtectionUpgrade from={upgrade.from} to={upgrade.to} /> : null}
        {extension ? <ExtendHintSlot hint={extension} currentDays={car.days} /> : null}

        {view.zones.length > 0 ? (
          <BorderZones zones={view.zones} value={selection.zone} onChange={(zone) => update({ ...selection, zone })} />
        ) : null}

        {view.groups.map((group) => {
          const toggles = group.items.filter((item) => item.kind === "toggle").map((item) => item.id);
          const counted = group.items.filter((item) => item.kind === "quantity").map((item) => item.id);
          return (
            <section key={group.id} aria-labelledby={`extras-${group.id}`}>
              <h3 id={`extras-${group.id}`} className="mb-3 text-lg font-semibold text-blue-dark">
                {t.groups[group.id]}
              </h3>
              {/*
                A grid list of cards: one tab stop, arrow keys move between cards, and
                Enter, Space or a click on a card switches its extra on or off. A
                countable extra switched on shows − n + instead of the switch (Tab
                reaches it); switched off, its count is gone.
              */}
              <GridList
                aria-labelledby={`extras-${group.id}`}
                layout="grid"
                selectionMode="multiple"
                selectedKeys={[
                  ...toggles.filter((id) => selection.addons.includes(id)),
                  ...counted.filter((id) => selection.accessories.has(id)),
                ]}
                onSelectionChange={(keys) => {
                  const isOn = (id: number) => keys === "all" || keys.has(id);
                  const accessories = new Map(selection.accessories);
                  for (const id of counted) {
                    if (!isOn(id)) {
                      accessories.delete(id);
                    } else if (!accessories.has(id)) {
                      accessories.set(id, 1);
                    }
                  }
                  update({
                    ...selection,
                    addons: [...selection.addons.filter((id) => !toggles.includes(id)), ...toggles.filter(isOn)],
                    accessories,
                  });
                }}
                className="grid grid-cols-1 gap-3 outline-none @2xl:grid-cols-2"
              >
                {group.items.map((item) => (
                  <ExtraTile
                    key={item.id}
                    item={item}
                    quantity={
                      item.kind === "quantity"
                        ? (selection.accessories.get(item.id) ?? 0)
                        : Number(selection.addons.includes(item.id))
                    }
                    onQuantity={(quantity) => setQuantity(item.id, quantity)}
                  />
                ))}
              </GridList>
            </section>
          );
        })}

        {view.zones.length === 0 && view.groups.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-sm text-blue-dark shadow-sm">
            {t.none}
          </p>
        ) : null}

        <Upsell options={upsell} />
      </section>
      <SummaryPanel trip={trip} car={car} prices={prices} action={action} onChangeCar={backToCars} searchQuery={searchQuery} />
      <MobileSummaryBar trip={trip} car={car} prices={prices} action={action} />
    </div>
  );
}

/** Poland alone, drawn like the zone maps from RentCarSoft. */
const NO_TRIP_MAP = "/assets/maps/mapa0.png";

/** The key of "Bez wyjazdu" in the zone list; a zone's is its id. */
const NO_TRIP = "none";

/**
 * "Bez wyjazdu" plus one card per zone; a single choice. A grid list of
 * selectable cards: one tab stop, arrow keys move between the cards without
 * picking (no quote per key press), Enter or Space picks, and the "i" inside a
 * card opens its details.
 */
function BorderZones({
  zones,
  value,
  onChange,
}: {
  zones: ExtraOption[];
  value: number | null;
  onChange: (zone: number | null) => void;
}) {
  const t = useMessages().extras;
  const lang = useLang();
  const selectedKey = value === null ? NO_TRIP : value;
  return (
    <section aria-labelledby="extras-border" className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-light text-blue-medium">
          <Globe className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <h3 id="extras-border" className="text-lg font-semibold text-blue-dark">
            {t.borderTitle}
          </h3>
          <p className="text-sm text-muted-dark">{t.borderText}</p>
        </div>
      </div>
      {/* Narrow: a swipe row with the chosen zone in view; wider: a grid. */}
      <Slider
        label={t.zones}
        startIndex={value === null ? 0 : zones.findIndex((zone) => zone.id === value) + 1}
        className="-mx-5 scroll-px-5 px-5 pb-1 @md:mx-0 @md:grid @md:grid-cols-2 @md:overflow-visible @md:px-0 @3xl:grid-cols-4"
        itemClassName="w-[62%] @md:w-auto"
        dotsClassName="@md:hidden"
        count={zones.length + 1}
        list={({ ref, className, itemClassName }) => (
          <GridList
            ref={ref}
            aria-labelledby="extras-border"
            layout="grid"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[selectedKey]}
            onSelectionChange={(keys) => {
              const [key] = keys;
              if (key !== undefined) {
                onChange(key === NO_TRIP ? null : Number(key));
              }
            }}
            className={`${className} outline-none`}
          >
            <ZoneCard id={NO_TRIP} className={itemClassName} title={t.noTrip} note={t.polandOnly} image={NO_TRIP_MAP}>
              <span className="text-lg font-bold text-green-medium">{formatMoney(lang, 0)}</span>
            </ZoneCard>
            {zones.map((zone) => (
              <ZoneCard
                key={zone.id}
                id={zone.id}
                className={itemClassName}
                title={zone.name}
                note={zone.note}
                description={zone.description}
                image={zone.image}
              >
                <ExtraPrice item={zone} />
              </ZoneCard>
            ))}
          </GridList>
        )}
      />
    </section>
  );
}

function ZoneCard({
  id,
  className,
  title,
  note,
  description,
  image,
  children,
}: {
  /** Its key in the zone list. */
  id: string | number;
  /** The slider's item class. */
  className: string;
  title: string;
  note: string | null;
  description?: string | null;
  /** The zone's map from RentCarSoft ("Bez wyjazdu" has our own); a zone without one gets an icon of the same size. */
  image: string | null;
  children: ReactNode;
}) {
  return (
    <GridListItem
      id={id}
      textValue={title}
      className={({ isSelected }) =>
        `${className} relative cursor-pointer flex-col gap-2 overflow-hidden rounded-2xl border-2 bg-white p-4 pt-0 outline-none transition-colors duration-200 ease-out data-focus-visible:ring-2 data-focus-visible:ring-blue-medium data-focus-visible:ring-offset-2 motion-reduce:transition-none ${
          isSelected ? "border-green-medium" : "border-muted-light hover:border-blue-medium/40"
        }`
      }
    >
      {({ isSelected }) => (
        <>
          <span className="relative -mx-4 mb-2 block aspect-[1200/1046] bg-surface">
            {image ? (
              <Image src={image} alt="" fill sizes="(min-width: 1280px) 240px, (min-width: 640px) 45vw, 100vw" className="object-contain" />
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
                isSelected ? "border-green-medium" : "border-blue-dark/30"
              }`}
            >
              {isSelected ? <span className="size-2.5 rounded-full bg-green-medium" /> : null}
            </span>
            <span className="font-semibold text-blue-dark">{title}</span>
          </div>
          {note ? <p className="text-xs text-muted-dark">{note}</p> : null}
          <div className="mt-auto flex items-end justify-between gap-2">
            <div>{children}</div>
            {description ? <DescriptionButton title={title} description={description} tone="light" /> : null}
          </div>
          {/* The look of "Wybierz" / "Wybrany"; the whole card is the control. */}
          <span aria-hidden className={`${chooseClass(isSelected)} mt-1 w-full`}>
            <ChooseFace selected={isSelected} />
          </span>
        </>
      )}
    </GridListItem>
  );
}

/**
 * A compact card: the extra's icon from RentCarSoft, its name and price, and on
 * the right the "i" and a switch. A countable extra switched on shows − n +
 * in place of the switch. The whole card is the switch (the card is selected).
 */
function ExtraTile({
  item,
  quantity,
  onQuantity,
}: {
  item: ExtraOption;
  /** Toggles: 0 or 1. */
  quantity: number;
  onQuantity: (quantity: number) => void;
}) {
  const t = useMessages().extras;
  const lang = useLang();
  const chosen = quantity > 0;
  return (
    <GridListItem
      id={item.id}
      textValue={item.name}
      // Hover darkens the frame, like the zone and protection cards.
      className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border-2 bg-white p-4 shadow-sm outline-none transition-colors duration-200 ease-out data-focus-visible:ring-2 data-focus-visible:ring-blue-medium data-focus-visible:ring-offset-2 motion-reduce:transition-none ${
        chosen ? "border-green-medium" : "border-transparent hover:border-blue-medium/40"
      }`}
    >
      <span className="relative flex size-9 shrink-0 items-center justify-center">
        {item.image ? (
          <Image src={item.image} alt="" fill sizes="36px" className="object-contain" />
        ) : (
          <Package className="size-6 text-blue-medium" strokeWidth={1.5} aria-hidden />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* Long words ("Zarezerwowanego") must not push the card wider; hyphens need the right `lang`. */}
        <h4 lang={lang} className="text-sm leading-snug font-semibold break-words hyphens-auto text-blue-dark @md:text-base">
          {item.name}
        </h4>
        <p className="text-sm text-blue-dark">
          <span className="font-bold">{formatMoney(lang, item.price)}</span>
          <span className="text-xs text-muted-dark">
            {" "}
            {item.oneTime ? t.oneTime : item.unit === "month" ? t.perMonth : t.perDay}
            {item.kind === "quantity" ? `, ${t.perItem}` : null}
          </span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {item.description ? <DescriptionButton title={item.name} description={item.description} tone="light" /> : null}
        {item.kind === "quantity" ? (
          <QuantitySwitch name={item.name} value={quantity} onChange={onQuantity} />
        ) : (
          <SwitchLook on={chosen} />
        )}
      </div>
    </GridListItem>
  );
}

/** Price as the API sends it: per day with the period total, or once. */
function ExtraPrice({ item }: { item: ExtraOption }) {
  const t = useMessages().extras;
  const lang = useLang();
  const period = !item.oneTime && item.periodPrice !== null ? fill(t.wholeRental, { price: formatMoney(lang, item.periodPrice) }) : null;
  const notes = [period, item.kind === "quantity" ? t.perItem : null].filter(Boolean);
  return (
    <div className="min-w-0">
      <p className="text-lg font-bold text-blue-dark">
        {formatMoney(lang, item.price)}
        <span className="text-xs font-semibold text-muted-dark"> {item.oneTime ? t.oneTime : item.unit === "month" ? t.perMonth : t.perDay}</span>
      </p>
      {notes.length > 0 ? <p className="text-xxs text-muted-dark">{notes.join(", ")}</p> : null}
    </div>
  );
}

/** Keeps a press inside the counter from reaching the card (which would switch the extra off). */
const stop = (event: SyntheticEvent) => event.stopPropagation();

/** One height for the switch and the counter, so a card does not jump when one turns into the other. */
const CONTROL_HEIGHT = "h-8";

/** The switch of an extra. Only the look: the card is the control and says "selected" itself. */
function SwitchLook({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex ${CONTROL_HEIGHT} w-12 shrink-0 items-center rounded-full p-1 transition-colors duration-300 ease-out motion-reduce:transition-none ${
        on ? "bg-green-medium" : "bg-muted"
      }`}
    >
      <span
        className={`size-6 rounded-full bg-white shadow-sm transition-transform duration-300 ease-out motion-reduce:transition-none ${
          on ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </span>
  );
}

/**
 * A countable extra's control: the switch while it is off, − n + once it is on.
 * One pill that grows and turns green while the knob slides away and the
 * counter fades in, and back. While off, the counter is inert (the card itself
 * switches it on). While on, only − and + act: a press anywhere else in the
 * green pill (the number, the gap, "+" at the maximum) stops here instead of
 * switching the card off; − at 1 switches it off.
 */
function QuantitySwitch({ name, value, onChange }: { name: string; value: number; onChange: (value: number) => void }) {
  const t = useMessages().extras;
  const on = value > 0;
  const round =
    "flex size-6 cursor-pointer items-center justify-center rounded-full outline-none transition-colors duration-200 ease-out data-disabled:cursor-default data-disabled:opacity-40 data-focus-visible:ring-2 data-focus-visible:ring-white motion-reduce:transition-none";
  return (
    <div
      onPointerDown={on ? stop : undefined}
      onPointerUp={on ? stop : undefined}
      onMouseDown={on ? stop : undefined}
      onClick={on ? stop : undefined}
      className={`relative flex ${CONTROL_HEIGHT} shrink-0 items-center overflow-hidden rounded-full transition-[width,background-color] duration-300 ease-out motion-reduce:transition-none ${
        on ? "w-24 bg-green-medium" : "w-12 bg-muted"
      }`}
    >
      <span
        aria-hidden
        // No pointer events: once on, the faded knob sits over "+" and must not take its clicks.
        className={`pointer-events-none absolute left-1 size-6 rounded-full bg-white shadow-sm transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${
          on ? "translate-x-16 opacity-0" : "translate-x-0 opacity-100"
        }`}
      />
      <div
        role="group"
        aria-label={fill(t.quantity, { name })}
        inert={!on}
        className={`flex w-24 shrink-0 items-center justify-between px-1 text-white transition-opacity duration-200 ease-out motion-reduce:transition-none ${
          on ? "opacity-100 delay-150" : "opacity-0"
        }`}
      >
        <Button aria-label={t.less} onPress={() => onChange(value - 1)} className={`${round} hover:bg-white/15`}>
          <Minus className="size-4" aria-hidden />
        </Button>
        <output aria-live="polite" className="w-5 text-center text-sm font-bold">
          {value}
        </output>
        <Button
          aria-label={t.more}
          isDisabled={value === MAX_QUANTITY}
          onPress={() => onChange(value + 1)}
          className={`${round} bg-white text-green-medium hover:bg-white/90`}
        >
          <Plus className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
