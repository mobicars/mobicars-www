import { LoaderCircle } from "lucide-react";

import { formatKilometers, formatMoney, formatMonths } from "@/components/reservation/format";
import type { Lang } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { fill } from "@/i18n/fill";
import type { MonthlyQuote, QuoteLineView } from "@/lib/reservation/quote";
import { quoteLineLabel } from "@/lib/reservation/quote-label";

/**
 * Quote lines and the total, as RentCarSoft sent them. No hooks, so the
 * summary panel, the last step's review and the thank-you page (a server
 * component) share one markup.
 */
export function QuoteLines({
  lines,
  total,
  totalSuffix,
  loading = false,
  messages,
  lang,
  className = "",
  monthly,
}: {
  lines: QuoteLineView[];
  /** Monthly rental: `lines` are the monthly ones; this adds the one-time part and the km limit. */
  monthly?: MonthlyQuote;
  /** Null shows a spinner, as while loading. */
  total: number | null;
  /** After the total, e.g. "/ mies.". */
  totalSuffix?: string;
  /** A newer quote is on its way: placeholders instead of amounts, a spinner instead of the total. */
  loading?: boolean;
  messages: Messages;
  lang: Lang;
  className?: string;
}) {
  const t = messages.quoteLines;
  const rows = (items: QuoteLineView[]) =>
    items.map((line, index) =>
      loading ? (
        <Placeholder key={index} />
      ) : (
        <Line key={index} label={quoteLineLabel(line, t, lang)} line={line} free={t.free} lang={lang} />
      ),
    );

  if (monthly) {
    return (
      <dl className={`flex flex-col gap-1.5 text-sm ${className}`}>
        <dt className="text-xs font-bold tracking-wide text-muted-dark uppercase">{t.everyMonth}</dt>
        {rows(lines)}
        <Subtotal label={t.perMonthTotal} amount={loading ? null : monthly.perMonth} suffix={t.perMonth} lang={lang} />
        {monthly.oneTimeLines.length > 0 ? (
          <>
            <dt className="mt-3 text-xs font-bold tracking-wide text-muted-dark uppercase">{t.oneTime}</dt>
            {rows(monthly.oneTimeLines)}
            <Subtotal label={t.oneTimeTotal} amount={loading ? null : monthly.oneTimeTotal} lang={lang} />
          </>
        ) : null}
        {monthly.kmPerMonth ? (
          <dd className="mt-2 text-xs text-muted-dark">
            {fill(t.kmLimit, {
              perMonth: formatKilometers(lang, monthly.kmPerMonth).replace(/\s*km$/, ""),
              total: formatKilometers(lang, monthly.kmTotal ?? monthly.kmPerMonth * monthly.months).replace(/\s*km$/, ""),
            })}
            {monthly.overLimitFee ? <> · {fill(t.overLimit, { fee: formatMoney(lang, monthly.overLimitFee) })}</> : null}
          </dd>
        ) : null}
        <TotalRow
          label={fill(t.totalFor, { months: formatMonths(lang, monthly.months) })}
          total={total}
          loading={loading}
          messages={messages}
          lang={lang}
        />
      </dl>
    );
  }

  return (
    <dl className={`flex flex-col gap-1.5 text-sm ${className}`}>
      {rows(lines)}
      <TotalRow
        label={messages.summary.total}
        total={total}
        suffix={totalSuffix}
        loading={loading}
        messages={messages}
        lang={lang}
      />
    </dl>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <span role="status" className="flex items-center text-blue-medium">
      <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

function Line({ label, line, free, lang }: { label: string; line: QuoteLineView; free: string; lang: Lang }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-blue-dark/80">{label}</dt>
      <dd className="shrink-0 text-right font-semibold text-blue-dark">
        {line.regular ? (
          <s className="mr-1.5 text-xs font-normal text-muted-dark">{formatMoney(lang, line.regular)}</s>
        ) : null}
        {line.amount ? formatMoney(lang, line.amount) : free}
      </dd>
    </div>
  );
}

function Placeholder() {
  // The previous quote's labels may no longer match the choice: placeholders only.
  return (
    <div aria-hidden className="flex h-5 items-center justify-between gap-3">
      <span className="h-3.5 w-28 animate-pulse rounded bg-muted-light motion-reduce:animate-none" />
      <span className="h-3.5 w-14 animate-pulse rounded bg-muted-light motion-reduce:animate-none" />
    </div>
  );
}

/** A section's sum (per month, or once), lighter than the grand total. */
function Subtotal({ label, amount, suffix, lang }: { label: string; amount: number | null; suffix?: string; lang: Lang }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-dashed border-muted-light pt-1.5">
      <dt className="font-semibold text-blue-dark">{label}</dt>
      <dd className="shrink-0 font-bold text-blue-dark">
        {amount === null ? "…" : formatMoney(lang, amount)}
        {suffix && amount !== null ? <span className="text-xs font-semibold"> {suffix}</span> : null}
      </dd>
    </div>
  );
}

function TotalRow({
  label,
  total,
  suffix,
  loading,
  messages,
  lang,
}: {
  label: string;
  total: number | null;
  suffix?: string;
  loading: boolean;
  messages: Messages;
  lang: Lang;
}) {
  return (
    <div className="mt-2 flex min-h-11 items-center justify-between gap-3 border-t border-muted-light pt-3">
      <dt className="font-semibold text-blue-dark">{label}</dt>
      <dd className="text-xl font-bold text-blue-dark">
        {loading || total === null ? (
          <Spinner label={messages.summary.calculating} />
        ) : (
          <>
            {formatMoney(lang, total)}
            {suffix ? <span className="text-xs font-semibold"> {suffix}</span> : null}
          </>
        )}
      </dd>
    </div>
  );
}
