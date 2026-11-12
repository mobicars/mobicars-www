"use client";

import Image from "next/image";
import { ArrowRight, CalendarDays, LoaderCircle, MapPin } from "lucide-react";

import { formatMoney } from "@/components/reservation/offer-parts";
import type { QuoteState } from "@/components/reservation/use-quote";
import type { OfferCard } from "@/lib/reservation/offers";

/**
 * Booking summary beside the steps, like carfree.pl: a sticky panel on the
 * right from `lg`, a bar at the bottom below that. It shows prices exactly as
 * RentCarSoft returns them and adds nothing up.
 */

/** Search context, formatted on the server. */
export type TripSummary = {
  pickup: string;
  /** Null when the car goes back where it was picked up. */
  dropoff: string | null;
  start: string;
  /** Daily: the return. Monthly: the month count. */
  end: string;
};

export type SummaryLine = {
  label: string;
  /** 0 shows "w cenie". */
  amount: number;
  /** Price before a promotion, struck through. */
  regular?: number | null;
};

export type SummaryPrices = {
  lines: SummaryLine[];
  total: number | null;
  /** Suffix after the total, e.g. "/ mies.". */
  totalSuffix?: string;
  /** A newer quote is on its way; the lines shown are the previous ones. */
  loading?: boolean;
  failed?: boolean;
  /** Why it failed, from the quote endpoint. */
  error?: string | null;
  onRetry?: () => void;
};

export type SummaryAction = {
  label: string;
  onClick?: () => void;
  /** Id of a form this button submits, instead of `onClick`. */
  form?: string;
  /** Submitting: the button stays disabled and shows a spinner. */
  busy?: boolean;
  /** Shown under a disabled action, e.g. why it cannot go on yet. */
  hint?: string;
};

type SummaryProps = {
  trip: TripSummary;
  car: OfferCard | null;
  prices: SummaryPrices | null;
  /** Omitted: no button, e.g. before a car is chosen. */
  action?: SummaryAction;
  /** Shows "Zmień" next to the car, like carfree.pl's "Edytuj". */
  onChangeCar?: () => void;
};

/** Summary prices from a calculate quote. */
export function quotePrices(state: QuoteState): SummaryPrices {
  return {
    lines: state.quote?.lines ?? [],
    total: state.quote?.total ?? null,
    loading: state.loading,
    failed: state.failed,
    error: state.error,
    onRetry: state.retry,
  };
}

export function SummaryPanel({ trip, car, prices, action, onChangeCar }: SummaryProps) {
  const loading = prices?.loading ?? false;
  return (
    <aside aria-label="Twoja rezerwacja" aria-busy={loading} className="hidden lg:block">
      <div className="sticky top-4 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-blue-dark">Twoja rezerwacja</h2>
        <dl className="flex flex-col gap-2 text-xs text-blue-dark/80">
          <div className="flex gap-2">
            <MapPin className="mt-px size-4 shrink-0 text-blue-medium" strokeWidth={1.75} aria-hidden />
            <div className="min-w-0">
              <dt className="sr-only">Miejsce</dt>
              <dd>{trip.pickup}</dd>
              {trip.dropoff ? <dd className="text-muted-dark">Zwrot: {trip.dropoff}</dd> : null}
            </div>
          </div>
          <div className="flex gap-2">
            <CalendarDays className="mt-px size-4 shrink-0 text-blue-medium" strokeWidth={1.75} aria-hidden />
            <div>
              <dt className="sr-only">Termin</dt>
              <dd>
                {trip.start} – {trip.end}
              </dd>
            </div>
          </div>
        </dl>

        {car ? (
          <div className="border-t border-muted-light pt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-blue-dark">{car.name}</p>
                <p className="text-xs text-muted-dark">lub podobny · {car.segment}</p>
              </div>
              {onChangeCar ? (
                <button
                  type="button"
                  onClick={onChangeCar}
                  className="shrink-0 cursor-pointer rounded-full border border-blue-dark/20 px-3 py-1 text-xs font-semibold text-blue-dark transition-colors duration-200 ease-out hover:border-blue-medium hover:text-blue-medium motion-reduce:transition-none"
                >
                  Zmień
                </button>
              ) : null}
            </div>
            {car.image ? (
              <span className="relative mt-2 block h-24 w-full">
                <Image src={car.image.src} alt="" fill sizes="280px" className="object-contain" />
              </span>
            ) : null}
          </div>
        ) : (
          <p className="border-t border-muted-light pt-4 text-sm text-muted-dark">
            Wybierz samochód z listy.
          </p>
        )}

        {car && prices ? <PriceLines prices={prices} /> : null}

        {action ? (
          <ActionButton action={action} disabled={!car || !actionable(action) || loading} className="w-full" />
        ) : null}
      </div>
    </aside>
  );
}

/** Has something to do: a click handler or a form to submit, and is not busy. */
function actionable(action: SummaryAction): boolean {
  return (action.onClick !== undefined || action.form !== undefined) && !action.busy;
}

/** Quote lines and total; also used by the last step's summary on small screens. */
export function PriceLines({ prices }: { prices: SummaryPrices }) {
  if (prices.failed) {
    // A passed pickup time is the customer's to fix; anything else may pass on a retry.
    const expired = prices.error === "invalid_search";
    return (
      <div role="alert" className="flex flex-col items-start gap-2 border-t border-muted-light pt-4 text-sm text-red-700">
        <p>
          {expired
            ? "Ten termin odbioru jest już niedostępny. Zmień datę odbioru u góry strony."
            : "Nie udało się pobrać ceny."}
        </p>
        {!expired && prices.onRetry ? (
          <button
            type="button"
            onClick={prices.onRetry}
            className="cursor-pointer font-semibold text-blue-medium underline-offset-2 hover:underline"
          >
            Spróbuj ponownie
          </button>
        ) : null}
      </div>
    );
  }
  if (prices.lines.length === 0) {
    // First quote still loading: placeholders instead of numbers.
    return (
      <div className="flex flex-col gap-2 border-t border-muted-light pt-4" aria-hidden>
        <div className="h-4 w-full animate-pulse rounded bg-muted-light" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted-light" />
        <div className="mt-2 h-6 w-1/2 self-end animate-pulse rounded bg-muted-light" />
      </div>
    );
  }
  // While a newer quote loads, the amounts give way to placeholders and the
  // total to a spinner, so no stale price stays on screen (as on carfree.pl).
  const loading = prices.loading ?? false;
  return (
    <dl className="flex flex-col gap-1.5 border-t border-muted-light pt-4 text-sm">
      {prices.lines.map((line, index) =>
        loading ? (
          // The previous quote's labels may no longer match the choice: placeholders only.
          <div key={index} aria-hidden className="flex h-5 items-center justify-between gap-3">
            <span className="h-3.5 w-28 animate-pulse rounded bg-muted-light motion-reduce:animate-none" />
            <span className="h-3.5 w-14 animate-pulse rounded bg-muted-light motion-reduce:animate-none" />
          </div>
        ) : (
          <div key={line.label} className="flex items-baseline justify-between gap-3">
            <dt className="text-blue-dark/80">{line.label}</dt>
            <dd className="shrink-0 text-right font-semibold text-blue-dark">
              {line.regular ? (
                <s className="mr-1.5 text-xs font-normal text-muted-dark">{formatMoney(line.regular)}</s>
              ) : null}
              {line.amount ? formatMoney(line.amount) : "w cenie"}
            </dd>
          </div>
        ),
      )}
      <div className="mt-2 flex min-h-11 items-center justify-between gap-3 border-t border-muted-light pt-3">
        <dt className="font-semibold text-blue-dark">Razem</dt>
        <dd className="text-xl font-bold text-blue-dark">
          {loading || prices.total === null ? (
            <Spinner label="Liczymy cenę" />
          ) : (
            <>
              {formatMoney(prices.total)}
              {prices.totalSuffix ? <span className="text-xs font-semibold"> {prices.totalSuffix}</span> : null}
            </>
          )}
        </dd>
      </div>
    </dl>
  );
}

/** Bottom bar below `lg`. Hidden until there is a car and an action. */
export function MobileSummaryBar({
  car,
  prices,
  action,
}: Pick<SummaryProps, "car" | "prices" | "action">) {
  if (!car || !action) {
    return null;
  }
  const loading = prices?.loading ?? false;
  return (
    <div
      aria-busy={loading}
      // `globals.css` keeps room for this bar at the end of the page, so it never covers the footer.
      data-mobile-summary-bar
      className="fixed inset-x-0 bottom-0 z-40 border-t border-muted bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(8,48,82,0.08)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xxs text-muted-dark">{car.name} lub podobny</p>
          <p className="flex h-6 items-center text-base font-bold text-blue-dark">
            {prices?.failed ? (
              <span className="text-xs font-semibold text-red-700">Brak ceny</span>
            ) : loading || prices?.total == null ? (
              <Spinner label="Liczymy cenę" />
            ) : (
              <>
                {formatMoney(prices.total)}
                {prices.totalSuffix ? <span className="text-xs font-semibold"> {prices.totalSuffix}</span> : null}
              </>
            )}
          </p>
        </div>
        <ActionButton action={action} disabled={!actionable(action) || loading} />
      </div>
    </div>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <span role="status" className="flex items-center text-blue-medium">
      <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

function ActionButton({
  action,
  disabled,
  className = "",
}: {
  action: SummaryAction;
  disabled: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <button
        type={action.form ? "submit" : "button"}
        form={action.form}
        disabled={disabled}
        onClick={action.onClick}
        title={disabled ? action.hint : undefined}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-medium px-5 text-sm font-bold text-white transition-colors duration-200 ease-out hover:bg-green-dark disabled:cursor-default disabled:bg-muted disabled:text-muted-dark motion-reduce:transition-none"
      >
        {action.label}
        {action.busy ? (
          <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
        ) : (
          <ArrowRight className="size-4" aria-hidden />
        )}
      </button>
      {disabled && action.hint ? (
        <p className="hidden text-center text-xxs text-muted-dark lg:block">{action.hint}</p>
      ) : null}
    </div>
  );
}
