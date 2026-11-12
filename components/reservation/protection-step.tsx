"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dialog } from "react-aria-components";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";

import { DescriptionButton } from "@/components/reservation/description-button";
import { DialogHeader, WidgetModal } from "@/components/reservation/dialog-parts";
import { ChooseButton, formatMoney } from "@/components/reservation/offer-parts";
import { MobileSummaryBar, SummaryPanel, quotePrices, type TripSummary } from "@/components/reservation/summary";
import { Slider } from "@/components/reservation/slider";
import { useQuote } from "@/components/reservation/use-quote";
import { currentHrefWith, replaceParam } from "@/components/reservation/url";
import type { OfferCard } from "@/lib/reservation/offers";
import type { ProtectionOption, ProtectionTier } from "@/lib/reservation/protection";
import { quoteQuery, type QuoteView } from "@/lib/reservation/quote";
import { QUERY_KEYS } from "@/lib/reservation/search";

/**
 * Second step: one insurance package. None is preselected; the customer picks
 * one before going on, and the choice goes into the URL (`protection=`).
 */
export function ProtectionStep({
  lang,
  searchQuery,
  car,
  options,
  initialProtection,
  initialQuote,
  trip,
  protectionDropped = false,
}: {
  lang: string;
  /** The search's canonical query, for the quote request. */
  searchQuery: string;
  car: OfferCard;
  options: ProtectionOption[];
  /** The URL's package when it is valid; none on the first visit. */
  initialProtection: number | null;
  /** The quote the server calculated for `initialProtection`. */
  initialQuote: { request: string; quote: QuoteView | null };
  trip: TripSummary;
  /** The URL named a package this car (segment, dates) does not offer. */
  protectionDropped?: boolean;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(initialProtection);
  const quote = useQuote(
    quoteQuery(lang, searchQuery, car.id, selectedId === null ? [] : [selectedId]),
    initialQuote,
  );

  // Drop a package the API no longer offers from the URL, so a refresh does not carry it on.
  useEffect(() => {
    if (protectionDropped) {
      replaceParam(QUERY_KEYS.protection, null);
    }
  }, [protectionDropped]);

  // Options are sorted cheapest first, so a lower index is a lower package.
  const [downgradeTo, setDowngradeTo] = useState<ProtectionOption | null>(null);
  const rank = (id: number | null) => options.findIndex((option) => option.id === id);
  const selected = options.find((option) => option.id === selectedId) ?? null;

  /** Choosing a package moves on to the extras, like "Wybierz" on the car list. */
  function apply(id: number) {
    setSelectedId(id);
    router.push(currentHrefWith({ [QUERY_KEYS.step]: "extras", [QUERY_KEYS.protection]: String(id) }), { scroll: false });
  }

  /** A switch to a cheaper package asks first; any other choice (the same one too) goes on at once. */
  function choose(id: number) {
    if (selectedId !== null && id !== selectedId && rank(id) < rank(selectedId)) {
      setDowngradeTo(options.find((option) => option.id === id) ?? null);
      return;
    }
    apply(id);
  }

  // A package must be chosen before the extras, unless the car has none to choose.
  const canContinue = selectedId !== null || options.length === 0;
  const action = {
    label: "DALEJ",
    hint: "Wybierz pakiet ochrony, aby przejść dalej.",
    onClick: canContinue
      ? () =>
          router.push(
            currentHrefWith({
              [QUERY_KEYS.step]: "extras",
              [QUERY_KEYS.protection]: selectedId === null ? null : String(selectedId),
            }), { scroll: false }
          )
      : undefined,
  };
  // Like the step bar: back to the list with every choice kept in the URL.
  const backToCarList = () => router.push(currentHrefWith({ [QUERY_KEYS.step]: null }), { scroll: false });
  const backToCars = () =>
    router.push(currentHrefWith({ [QUERY_KEYS.step]: null, [QUERY_KEYS.protection]: null }), { scroll: false });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section aria-labelledby="protection-title" className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 id="protection-title" className="text-2xl font-semibold text-blue-dark">
            Wybierz pakiet ochrony
          </h2>
          <button
            type="button"
            onClick={backToCarList}
            className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-blue-medium underline-offset-2 hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Wróć do samochodu
          </button>
        </div>
        {protectionDropped ? (
          <p role="status" className="mb-4 rounded-xl bg-blue-light px-4 py-3 text-sm text-blue-dark">
            Wybrany wcześniej pakiet ochrony nie jest dostępny dla tego auta. Wybierz pakiet ponownie.
          </p>
        ) : null}
        {options.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-sm text-blue-dark shadow-sm">
            Dla tego auta nie ma pakietów ochrony do wyboru. Podstawowe ubezpieczenie jest w cenie.
          </p>
        ) : (
          <>
            <ProtectionTable options={options} selectedId={selectedId} onChoose={choose} />
            {/* Phones: one package per swipe, in the same order, opening on the chosen or recommended one. */}
            <div className="md:hidden">
              <Slider
                label="Pakiety ochrony"
                startIndex={Math.max(
                  0,
                  options.findIndex((option) => option.id === selectedId) >= 0
                    ? options.findIndex((option) => option.id === selectedId)
                    : options.findIndex((option) => option.recommended),
                )}
                className="-mx-3 scroll-px-3 px-3 pt-5 pb-2"
                itemClassName="w-[82%]"
              >
                {options.map((option) => (
                  <ProtectionCard
                    key={option.id}
                    option={option}
                    selected={option.id === selectedId}
                    onChoose={() => choose(option.id)}
                  />
                ))}
              </Slider>
            </div>
          </>
        )}
      </section>
      <SummaryPanel
        trip={trip}
        car={car}
        prices={quotePrices(quote)}
        action={action}
        onChangeCar={backToCars}
      />
      <MobileSummaryBar car={car} prices={quotePrices(quote)} action={action} />
      <DowngradeDialog
        from={selected}
        to={downgradeTo}
        onCancel={() => setDowngradeTo(null)}
        onConfirm={() => {
          if (downgradeTo) {
            apply(downgradeTo.id);
          }
          setDowngradeTo(null);
        }}
      />
    </div>
  );
}

/** Asks before a cheaper package replaces the chosen one. */
function DowngradeDialog({
  from,
  to,
  onCancel,
  onConfirm,
}: {
  from: ProtectionOption | null;
  to: ProtectionOption | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  return (
    <WidgetModal
      open={to !== null}
      onOpenChange={(open) => (open ? undefined : onCancel())}
      className="w-[min(28rem,calc(100%-1.5rem))] rounded-2xl shadow-2xl"
    >
      <Dialog aria-labelledby={titleId} className="flex flex-col outline-none">
        <DialogHeader titleId={titleId} title="Zmienić pakiet ochrony?" className="pt-4 pb-1" />
        <div className="flex flex-col items-center gap-4 px-5 pb-5 text-center">
          {from ? <Shield option={from} size="small" /> : null}
          <p className="text-sm text-blue-dark/80">
            Wszystko może się zdarzyć, a dobra ochrona to podstawa. Czy na pewno chcesz zmienić pakiet
            ochrony?
          </p>
          {from && to ? (
            <p className="text-sm font-semibold text-blue-dark">
              {from.name} → {to.name}
            </p>
          ) : null}
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onCancel}
              className="h-12 w-full shrink-0 sm:w-auto sm:flex-1 cursor-pointer rounded-xl border border-blue-dark/15 text-sm font-bold text-blue-dark transition-colors duration-200 ease-out hover:bg-blue-dark/[0.04] motion-reduce:transition-none"
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="h-12 w-full shrink-0 sm:w-auto sm:flex-1 cursor-pointer rounded-xl bg-blue-medium text-sm font-bold text-white transition-colors duration-200 ease-out hover:bg-blue-dark motion-reduce:transition-none"
            >
              Tak, zmień
            </button>
          </div>
        </div>
      </Dialog>
    </WidgetModal>
  );
}

/**
 * Comparison table from `md`, like carfree.pl: a label column, then one
 * rounded column per package with the same row heights. The chosen package
 * has a blue frame; the recommended one a green frame and a tab above it.
 */
function ProtectionTable({
  options,
  selectedId,
  onChoose,
}: {
  options: ProtectionOption[];
  selectedId: number | null;
  onChoose: (id: number) => void;
}) {
  const labels = [...new Set(options.flatMap((option) => option.rows.map((row) => row.label)))];
  const head = "flex h-52 flex-col items-center justify-end gap-1 px-3 pb-4 text-center";
  const cell = "flex h-14 items-center border-t border-muted-light px-3 text-sm";

  return (
    <div
      role="radiogroup"
      aria-labelledby="protection-title"
      className="hidden gap-3 pt-8 md:grid"
      style={{ gridTemplateColumns: `minmax(8rem,1.1fr) repeat(${options.length}, minmax(0,1fr))` }}
    >
      <div aria-hidden className="rounded-3xl bg-white shadow-sm">
        <div className={head} />
        {labels.map((label) => (
          <div key={label} className={`${cell} px-5 text-blue-dark/80`}>
            {label}
          </div>
        ))}
        <div className="h-20" />
      </div>

      {options.map((option) => {
        const selected = option.id === selectedId;
        return (
          <div
            key={option.id}
            className={`relative rounded-3xl bg-white transition-shadow duration-200 ease-out motion-reduce:transition-none ${
              selected ? "shadow-lg" : "shadow-sm"
            }`}
          >
            {option.recommended ? (
              // Narrower than the column: it starts where the column's rounded corners end,
              // overlaps the top border by 2px so the two read as one piece, and grows
              // upwards when the label wraps in a narrow column. It takes the frame's colour.
              <span
                className={`absolute inset-x-6 bottom-[calc(100%-2px)] z-30 flex min-h-7 items-center justify-center rounded-t-xl px-2 py-1 text-center text-xxs leading-tight font-bold text-white transition-colors duration-200 ease-out motion-reduce:transition-none ${
                  selected ? "bg-green-medium" : "bg-blue-medium"
                }`}
              >
                Najczęściej wybierany
              </span>
            ) : null}
            {/* The frame is its own top layer, so the chosen column's border runs over the green tab. */}
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-0 z-20 rounded-3xl border-2 transition-colors duration-200 ease-out motion-reduce:transition-none ${
                selected ? "border-green-medium" : option.recommended ? "border-blue-medium" : "border-transparent"
              }`}
            />
            <div className={`${head} relative z-10 rounded-t-3xl bg-white`}>
              <Shield option={option} size="small" />
              <h3 className="flex items-center gap-1 text-sm font-semibold text-blue-dark">
                {option.name}
                {option.description ? <DescriptionButton title={option.name} description={option.description} tone="light" /> : null}
              </h3>
              <HeadPrice option={option} />
            </div>
            {labels.map((label) => {
              const row = option.rows.find((item) => item.label === label);
              return (
                <div key={label} className={`${cell} justify-center text-center font-semibold`}>
                  <span className="sr-only">{label}: </span>
                  {!row ? (
                    <span className="text-muted-dark">—</span>
                  ) : row.covered ? (
                    <>
                      <Check className="size-5 text-green-medium" aria-hidden />
                      <span className="sr-only">{row.value}</span>
                    </>
                  ) : (
                    <span className="text-blue-dark">{row.value}</span>
                  )}
                </div>
              );
            })}
            <div className="flex h-20 items-center justify-center border-t border-muted-light px-3">
              <ChooseButton
                selected={selected}
                onClick={() => onChoose(option.id)}
                radio={{ label: option.name }}
                className="w-full max-w-40"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Price under the package name: per day as the API sends it, "Darmowy" at 0. */
function HeadPrice({ option }: { option: ProtectionOption }) {
  if (!option.price) {
    return (
      <p className="flex flex-col items-center">
        <span className="text-2xl font-bold text-green-medium">Darmowy</span>
        <span className="text-xs text-muted-dark">w cenie wynajmu</span>
        <span className="text-xxs text-muted-dark">{formatMoney(option.totalPrice ?? 0)} za cały wynajem</span>
      </p>
    );
  }
  return (
    <p className="flex flex-col items-center">
      <span className="text-2xl font-bold text-blue-medium">{formatMoney(option.price)}</span>
      <span className="text-xs text-muted-dark">{option.oneTime ? "jednorazowo" : "/ doba"}</span>
      {!option.oneTime && option.totalPrice !== null ? (
        <span className="text-xxs text-muted-dark">{formatMoney(option.totalPrice)} za cały wynajem</span>
      ) : null}
    </p>
  );
}

function ProtectionCard({
  option,
  selected,
  onChoose,
}: {
  option: ProtectionOption;
  selected: boolean;
  onChoose: () => void;
}) {
  return (
    <article
      className={`relative flex w-full flex-col rounded-2xl border-2 bg-white shadow-sm transition-[border-color,box-shadow] duration-200 ease-out motion-reduce:transition-none ${
        selected ? "border-green-medium shadow-lg" : option.recommended ? "border-blue-medium" : "border-transparent"
      }`}
    >
      {option.recommended ? (
        <span
          className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xxs font-bold whitespace-nowrap text-white ${
            selected ? "bg-green-medium" : "bg-blue-medium"
          }`}
        >
          Najczęściej wybierany
        </span>
      ) : null}
      <header className="flex items-center justify-center gap-2 rounded-t-[14px] bg-blue-medium px-4 py-3 text-white">
        <ShieldCheck className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
        <h3 className="text-base font-bold">{option.name}</h3>
        {option.description ? <DescriptionButton title={option.name} description={option.description} /> : null}
      </header>

      <div className="flex justify-center bg-white py-3">
        <Shield option={option} size="small" />
      </div>

      <dl className="flex flex-col px-4 text-sm">
        {option.rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[1fr_auto] items-baseline gap-3 border-b border-muted-light py-2">
            <dt className="text-xs text-muted-dark">{row.label}</dt>
            <dd className={`flex items-center gap-1 text-right font-semibold ${row.covered ? "text-green-dark" : "text-blue-dark"}`}>
              {row.covered ? <Check className="size-4 shrink-0" aria-hidden /> : null}
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto flex flex-col gap-3 p-4">
        <ProtectionPrice option={option} />
        <ChooseButton selected={selected} onClick={onChoose} className="w-full" />
      </div>
    </article>
  );
}

function ProtectionPrice({ option }: { option: ProtectionOption }) {
  if (!option.price) {
    return (
      <div className="text-center">
        <p className="text-2xl font-bold text-green-medium">W cenie</p>
        <p className="text-xxs text-muted-dark">{formatMoney(option.totalPrice ?? 0)} za cały wynajem</p>
      </div>
    );
  }
  return (
    <div className="text-center">
      <p>
        <span className="text-2xl font-bold text-blue-medium">{formatMoney(option.price)}</span>
        <span className="text-xs font-semibold text-muted-dark"> brutto{option.oneTime ? " jednorazowo" : " / doba"}</span>
      </p>
      {!option.oneTime && option.totalPrice !== null ? (
        <p className="text-xxs text-muted-dark">
          {option.regularTotalPrice ? <s className="mr-1">{formatMoney(option.regularTotalPrice)}</s> : null}
          {formatMoney(option.totalPrice)} za cały wynajem
        </p>
      ) : null}
    </div>
  );
}

const TIER_COLORS: Record<ProtectionTier, string> = {
  bronze: "text-[#9b5a66]",
  silver: "text-[#8a939c]",
  gold: "text-[#c9a227]",
};

/** The shield picture from RentCarSoft; a coloured lucide shield when there is none. */
function Shield({ option, size = "large" }: { option: ProtectionOption; size?: "large" | "small" }) {
  const box = size === "large" ? "size-36" : "size-20";
  if (option.image) {
    return (
      <span className={`relative block shrink-0 ${box}`}>
        <Image src={option.image} alt="" fill sizes={size === "large" ? "144px" : "80px"} className="object-contain" />
      </span>
    );
  }
  return (
    <ShieldCheck
      className={`${size === "large" ? "size-28" : "size-16"} shrink-0 ${TIER_COLORS[option.tier]}`}
      strokeWidth={1.25}
      aria-hidden
    />
  );
}
