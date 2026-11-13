"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { Button, Dialog } from "react-aria-components";
import { ArrowRight, CalendarDays, LoaderCircle, MapPin } from "lucide-react";

import { AnimatedMoney } from "@/components/reservation/animated-money";
import { DialogHeader, WidgetModal } from "@/components/reservation/dialog-parts";
import { formatDayCount, formatMonths } from "@/components/reservation/format";
import { PromoCode } from "@/components/reservation/promo-code";
import { QuoteLines, Spinner } from "@/components/reservation/quote-lines";
import { ShareBooking } from "@/components/reservation/share-booking";
import type { QuoteState } from "@/components/reservation/use-quote";
import { buttonClass } from "@/components/ui/button";
import { fill } from "@/i18n/fill";
import type { Lang } from "@/i18n/config";
import { useLang } from "@/i18n/lang-context";
import { useMessages } from "@/i18n/messages-context";
import type { OfferCard } from "@/lib/reservation/offers";
import type { MonthlyQuote, QuoteLineView } from "@/lib/reservation/quote";

/**
 * Booking summary beside the steps, like carfree.pl: a sticky panel on the
 * right from `lg`, a bar at the bottom below that. It shows prices exactly as
 * RentCarSoft returns them and adds nothing up.
 *
 * Only the car, the promo code and the total are on top; "Szczegóły ceny"
 * opens a dialog with every quote line and the pick-up and return.
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
  const [details, setDetails] = useState(false);
  const disabled = !car || !action || !actionable(action) || loading;
  return (
    <aside aria-label={t.title} aria-busy={loading} className="hidden lg:block">
      <div className="sticky top-4 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-blue-dark">{t.title}</h2>
          {car ? <ShareBooking car={car.name} variant="text" /> : null}
        </div>

        {car ? (
          <CarBlock car={car} onChangeCar={onChangeCar} />
        ) : (
          <>
            <TripList trip={trip} />
            <p className="border-t border-muted-light pt-4 text-sm text-muted-dark">{t.chooseCar}</p>
          </>
        )}

        {car && searchQuery !== undefined ? (
          <div className="border-t border-muted-light pt-4">
            <PromoCode searchQuery={searchQuery} />
          </div>
        ) : null}
        {car && prices ? <PriceSummary car={car} prices={prices} onDetails={() => setDetails(true)} /> : null}

        {action ? <ActionButton action={action} disabled={disabled} className="w-full" /> : null}
      </div>
      {car && prices ? (
        <PriceDetails
          open={details}
          onOpenChange={setDetails}
          trip={trip}
          car={car}
          prices={prices}
          action={action}
          actionDisabled={disabled}
        />
      ) : null}
    </aside>
  );
}

function CarBlock({ car, onChangeCar }: { car: OfferCard; onChangeCar?: () => void }) {
  const t = useMessages().summary;
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-blue-dark">{car.name}</p>
        <p className="text-xs text-muted-dark">{fill(t.orSimilar, { segment: car.segment })}</p>
        {onChangeCar ? (
          <button
            type="button"
            onClick={onChangeCar}
            className="mt-2 cursor-pointer rounded-full border border-blue-dark/20 px-3 py-1 text-xs font-semibold text-blue-dark transition-colors duration-200 ease-out hover:border-blue-medium hover:text-blue-medium motion-reduce:transition-none"
          >
            {t.change}
          </button>
        ) : null}
      </div>
      {car.image ? (
        <span className="relative block h-16 w-28 shrink-0">
          <Image src={car.image.src} alt="" fill sizes="112px" className="object-contain" />
        </span>
      ) : null}
    </div>
  );
}

function TripList({ trip }: { trip: TripSummary }) {
  const t = useMessages().summary;
  return (
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
  );
}

/** "za 3 dni" or, monthly, the month count; null when the car has neither. */
function periodLabel(lang: Lang, car: OfferCard, prices: SummaryPrices, forPeriod: string): string | null {
  if (prices.monthly) {
    return fill(forPeriod, { period: formatMonths(lang, prices.monthly.months) });
  }
  return car.days ? fill(forPeriod, { period: formatDayCount(lang, car.days) }) : null;
}

/** "Szczegóły ceny" on the left, the period and the counting total on the right. */
function PriceSummary({ car, prices, onDetails }: { car: OfferCard; prices: SummaryPrices; onDetails: () => void }) {
  const messages = useMessages();
  const t = messages.summary;
  const lang = useLang();
  if (prices.failed || prices.lines.length === 0) {
    return <PriceLines prices={prices} />;
  }
  const period = periodLabel(lang, car, prices, t.forPeriod);
  return (
    <div className="flex items-end justify-between gap-3 border-t border-muted-light pt-4">
      <Button
        onPress={onDetails}
        className="shrink-0 cursor-pointer rounded text-sm font-semibold whitespace-nowrap text-blue-medium underline underline-offset-4 outline-none hover:text-blue-dark data-focus-visible:ring-2 data-focus-visible:ring-blue-medium"
      >
        {t.priceDetails}
      </Button>
      <p className="flex min-h-8 flex-wrap items-baseline justify-end gap-x-1.5 text-right">
        {period ? <span className="text-sm whitespace-nowrap text-blue-dark/80">{period}</span> : null}
        <span className="text-xl font-bold whitespace-nowrap text-blue-dark">
          {prices.total === null ? (
            <Spinner label={t.calculating} />
          ) : (
            <>
              <AnimatedMoney id="summary-total" value={prices.total} lang={lang} pending={prices.loading} pendingLabel={t.calculating} />
              {prices.totalSuffix ? <span className="text-xs font-semibold"> {prices.totalSuffix}</span> : null}
            </>
          )}
        </span>
      </p>
    </div>
  );
}

/** Every quote line, the car and the trip, with the step's action at the bottom. */
function PriceDetails({
  open,
  onOpenChange,
  trip,
  car,
  prices,
  action,
  actionDisabled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip?: TripSummary;
  car: OfferCard;
  prices: SummaryPrices;
  action?: SummaryAction;
  actionDisabled: boolean;
}) {
  const t = useMessages().summary;
  const titleId = useId();
  return (
    <WidgetModal
      open={open}
      onOpenChange={onOpenChange}
      className="max-h-[min(44rem,calc(100dvh-1.5rem))] w-[min(32rem,calc(100%-1.5rem))] rounded-2xl shadow-2xl"
    >
      <Dialog aria-labelledby={titleId} className="flex max-h-[inherit] min-h-0 flex-col outline-none">
        <DialogHeader titleId={titleId} title={t.priceDetails} className="py-4" />
        <div className="flex min-h-0 flex-col gap-5 overflow-y-auto overscroll-contain px-5 pb-5">
          <div className="rounded-2xl border border-muted p-4">
            <CarBlock car={car} />
          </div>
          <PriceLines prices={prices} />
          {trip ? (
            <section className="flex flex-col gap-3 border-t border-muted-light pt-4">
              <h3 className="text-sm font-semibold text-blue-dark">{t.tripTitle}</h3>
              <TripList trip={trip} />
            </section>
          ) : null}
        </div>
        {action ? (
          <div className="border-t border-muted-light px-5 py-4">
            <ActionButton
              action={{ ...action, onClick: action.onClick ? () => { onOpenChange(false); action.onClick?.(); } : undefined }}
              disabled={actionDisabled}
              className="w-full"
            />
          </div>
        ) : null}
      </Dialog>
    </WidgetModal>
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
  // While a newer quote loads, the line amounts give way to placeholders and
  // the total stays greyed behind a spinner, then counts to the new one.
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
  trip,
}: Pick<SummaryProps, "car" | "prices" | "action"> & { trip?: TripSummary }) {
  const messages = useMessages();
  const t = messages.summary;
  const lang = useLang();
  const [details, setDetails] = useState(false);
  if (!car || !action) {
    return null;
  }
  const loading = prices?.loading ?? false;
  const canShowDetails = prices && !prices.failed && prices.lines.length > 0;
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
            ) : prices?.total == null ? (
              <Spinner label={t.calculating} />
            ) : (
              <>
                {/* Monthly rental: the bar leads with the monthly amount, the figure people compare. */}
                <AnimatedMoney
                  id={prices.monthly ? "summary-per-month" : "summary-total"}
                  value={prices.monthly ? prices.monthly.perMonth : prices.total}
                  lang={lang}
                  pending={loading}
                  pendingLabel={t.calculating}
                />
                {prices.monthly || prices.totalSuffix ? (
                  <span className="text-xs font-semibold"> {prices.monthly ? messages.quoteLines.perMonth : prices.totalSuffix}</span>
                ) : null}
              </>
            )}
          </p>
          {canShowDetails ? (
            <Button
              onPress={() => setDetails(true)}
              className="cursor-pointer rounded text-xxs font-semibold text-blue-medium underline underline-offset-2 outline-none data-focus-visible:ring-2 data-focus-visible:ring-blue-medium"
            >
              {t.priceDetails}
            </Button>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ShareBooking car={car.name} variant="icon" />
          <ActionButton action={action} disabled={!actionable(action) || loading} />
        </div>
      </div>
      {prices && canShowDetails ? (
        <PriceDetails
          open={details}
          onOpenChange={setDetails}
          trip={trip}
          car={car}
          prices={prices}
          action={action}
          actionDisabled={!actionable(action) || loading}
        />
      ) : null}
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
