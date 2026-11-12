"use client";

import { useId } from "react";
import Image from "next/image";
import { ArrowRight, CalendarDays, LoaderCircle, MapPin } from "lucide-react";

import { formatMoney } from "@/components/reservation/format";
import { PromoCode } from "@/components/reservation/promo-code";
import { QuoteLines, Spinner } from "@/components/reservation/quote-lines";
import { ShareBooking } from "@/components/reservation/share-booking";
import type { QuoteState } from "@/components/reservation/use-quote";
import { buttonClass } from "@/components/ui/button";
import { fill } from "@/i18n/fill";
import { useLang } from "@/i18n/lang-context";
import { useMessages } from "@/i18n/messages-context";
import type { OfferCard } from "@/lib/reservation/offers";
import type { MonthlyQuote, QuoteLineView } from "@/lib/reservation/quote";

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

export type SummaryPrices = {
  lines: QuoteLineView[];
  total: number | null;
  /** Monthly rental: the per-month and one-time parts of the quote. */
  monthly?: MonthlyQuote;
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
  /** The step's search query; with it the panel offers "Masz kod rabatowy?" once a car is chosen. */
  searchQuery?: string;
};

/** Summary prices from a calculate quote. */
export function quotePrices(state: QuoteState): SummaryPrices {
  return {
    lines: state.quote?.lines ?? [],
    total: state.quote?.total ?? null,
    monthly: state.quote?.monthly,
    loading: state.loading,
    failed: state.failed,
    error: state.error,
    onRetry: state.retry,
  };
}

export function SummaryPanel({ trip, car, prices, action, onChangeCar, searchQuery }: SummaryProps) {
  const t = useMessages().summary;
  const loading = prices?.loading ?? false;
  return (
    <aside aria-label={t.title} aria-busy={loading} className="hidden lg:block">
      <div className="sticky top-4 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-blue-dark">{t.title}</h2>
          {car ? <ShareBooking car={car.name} variant="text" /> : null}
        </div>
        <dl className="flex flex-col gap-2 text-xs text-blue-dark/80">
          <div className="flex gap-2">
            <MapPin className="mt-px size-4 shrink-0 text-blue-medium" strokeWidth={1.75} aria-hidden />
            <div className="min-w-0">
              <dt className="sr-only">{t.place}</dt>
              <dd>{trip.pickup}</dd>
              {trip.dropoff ? <dd className="text-muted-dark">{fill(t.returnAt, { place: trip.dropoff })}</dd> : null}
            </div>
          </div>
          <div className="flex gap-2">
            <CalendarDays className="mt-px size-4 shrink-0 text-blue-medium" strokeWidth={1.75} aria-hidden />
            <div>
              <dt className="sr-only">{t.dates}</dt>
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
                <p className="text-xs text-muted-dark">{fill(t.orSimilar, { segment: car.segment })}</p>
              </div>
              {onChangeCar ? (
                <button
                  type="button"
                  onClick={onChangeCar}
                  className="shrink-0 cursor-pointer rounded-full border border-blue-dark/20 px-3 py-1 text-xs font-semibold text-blue-dark transition-colors duration-200 ease-out hover:border-blue-medium hover:text-blue-medium motion-reduce:transition-none"
                >
                  {t.change}
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
            {t.chooseCar}
          </p>
        )}

        {car && searchQuery !== undefined ? (
          <div className="border-t border-muted-light pt-4">
            <PromoCode searchQuery={searchQuery} />
          </div>
        ) : null}
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
  const messages = useMessages();
  const lang = useLang();
  const t = messages.summary;
  if (prices.failed) {
    // A passed pickup time is the customer's to fix; anything else may pass on a retry.
    const expired = prices.error === "invalid_search";
    return (
      <div role="alert" className="flex flex-col items-start gap-2 border-t border-muted-light pt-4 text-sm text-red-700">
        <p>{expired ? t.expired : t.failed}</p>
        {!expired && prices.onRetry ? (
          <button
            type="button"
            onClick={prices.onRetry}
            className="cursor-pointer font-semibold text-blue-medium underline-offset-2 hover:underline"
          >
            {t.retry}
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
  return (
    <QuoteLines
      lines={prices.lines}
      total={prices.total}
      totalSuffix={prices.totalSuffix}
      monthly={prices.monthly}
      loading={prices.loading}
      messages={messages}
      lang={lang}
      className="border-t border-muted-light pt-4"
    />
  );
}

/** Bottom bar below `lg`. Hidden until there is a car and an action. */
export function MobileSummaryBar({
  car,
  prices,
  action,
}: Pick<SummaryProps, "car" | "prices" | "action">) {
  const messages = useMessages();
  const t = messages.summary;
  const lang = useLang();
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
          <p className="truncate text-xxs text-muted-dark">{fill(t.carOrSimilar, { name: car.name })}</p>
          <p className="flex h-6 items-center text-base font-bold text-blue-dark">
            {prices?.failed ? (
              <span className="text-xs font-semibold text-red-700">{t.noPrice}</span>
            ) : loading || prices?.total == null ? (
              <Spinner label={t.calculating} />
            ) : (
              <>
                {/* Monthly rental: the bar leads with the monthly amount, the figure people compare. */}
                {formatMoney(lang, prices.monthly ? prices.monthly.perMonth : prices.total)}
                {prices.monthly || prices.totalSuffix ? (
                  <span className="text-xs font-semibold"> {prices.monthly ? messages.quoteLines.perMonth : prices.totalSuffix}</span>
                ) : null}
              </>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ShareBooking car={car.name} variant="icon" />
          <ActionButton action={action} disabled={!actionable(action) || loading} />
        </div>
      </div>
    </div>
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
  const hintId = useId();
  const hint = disabled && action.hint ? action.hint : null;
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <button
        type={action.form ? "submit" : "button"}
        form={action.form}
        disabled={disabled}
        onClick={action.onClick}
        aria-describedby={hint ? hintId : undefined}
        className={buttonClass("success", "md", "w-full")}
      >
        {action.label}
        {action.busy ? (
          <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
        ) : (
          <ArrowRight className="size-4" aria-hidden />
        )}
      </button>
      {/* Visible on every screen, so a phone shows why the button is grey too; narrow enough for the bottom bar. */}
      {hint ? (
        <p id={hintId} className="max-w-56 self-center text-center text-xxs text-muted-dark">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
