"use client";

import { Suspense, use, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Check, LoaderCircle, ShieldCheck } from "lucide-react";

import { ConfirmQuestion } from "@/components/reservation/dialog-parts";
import { formatDayCount, formatMoney } from "@/components/reservation/format";
import { currentHrefWith } from "@/components/reservation/url";
import { buttonClass } from "@/components/ui/button";
import { fill } from "@/i18n/fill";
import { useLang } from "@/i18n/lang-context";
import { useMessages } from "@/i18n/messages-context";
import type { ExtensionHint } from "@/lib/reservation/extend";
import type { ProtectionOption } from "@/lib/reservation/protection";
import { QUERY_KEYS } from "@/lib/reservation/search";

/**
 * Small, honest upsells on the booking steps. Each one asks first, then
 * changes the URL; the page then quotes again, so every price shown after the
 * change is RentCarSoft's.
 */

const promiseIds = new WeakMap<object, number>();
let lastPromiseId = 0;

/**
 * `ExtendHint` for a hint still being quoted: the step shows without waiting
 * for its two extra quotes, and the card appears once they arrive. Each new
 * promise (a new server render) gets a fresh boundary, so a navigation never
 * waits for the hint either.
 */
export function ExtendHintSlot({
  hint,
  currentDays,
  className,
}: {
  hint: Promise<ExtensionHint | null>;
  currentDays: number | null;
  className?: string;
}) {
  if (!promiseIds.has(hint)) {
    promiseIds.set(hint, ++lastPromiseId);
  }
  return (
    <Suspense key={promiseIds.get(hint)} fallback={null}>
      <ResolvedExtendHint hint={hint} currentDays={currentDays} className={className} />
    </Suspense>
  );
}

function ResolvedExtendHint({
  hint,
  currentDays,
  className,
}: {
  hint: Promise<ExtensionHint | null>;
  currentDays: number | null;
  className?: string;
}) {
  // A refresh in development can hand over the settled value instead of the promise.
  const value = isThenable(hint) ? use(hint) : (hint as ExtensionHint | null);
  if (!value || !currentDays) {
    return null;
  }
  const card = <ExtendHint hint={value} currentDays={currentDays} />;
  return className ? <div className={className}>{card}</div> : card;
}

function isThenable(value: unknown): value is Promise<ExtensionHint | null> {
  return typeof (value as { then?: unknown } | null)?.then === "function";
}

/** "Weź 4 dni zamiast 3": the next price band is a day or two away (see `extensionHint`). */
export function ExtendHint({ hint, currentDays }: { hint: ExtensionHint; currentDays: number }) {
  const t = useMessages().booking.extend;
  const lang = useLang();
  const days = formatDayCount(lang, hint.days);

  return (
    <NudgeCard
      icon={<CalendarPlus className="size-6" strokeWidth={1.75} aria-hidden />}
      title={fill(t.title, { days, current: formatDayCount(lang, currentDays) })}
      action={
        <NudgeAction
          label={fill(t.button, { days })}
          pendingLabel={t.extending}
          question={t.confirmTitle}
          href={() => currentHrefWith({ [QUERY_KEYS.end]: hint.end })}
        />
      }
    >
      {fill(t.text, { before: formatMoney(lang, hint.dailyBefore), after: formatMoney(lang, hint.dailyAfter) })}{" "}
      <span className="font-semibold text-green-dark">
        {hint.extraCost > 0 ? fill(t.cost, { cost: formatMoney(lang, hint.extraCost) }) : t.free}
      </span>
    </NudgeCard>
  );
}

/**
 * The best package, offered once more on the extras step to someone who chose
 * a lesser one: the price difference per day (or month) and what it adds.
 */
export function ProtectionUpgrade({ from, to }: { from: ProtectionOption; to: ProtectionOption }) {
  const messages = useMessages();
  const t = messages.extras.upgrade;
  const rows = messages.protection.rows;
  const lang = useLang();
  // Covers the better package pays in full where the chosen one does not.
  const gains = to.rows.filter(
    (row) => row.covered && !from.rows.some((other) => other.key === row.key && other.covered),
  );
  const difference = Math.round(((to.price ?? 0) - (from.price ?? 0)) * 100) / 100;

  return (
    <NudgeCard
      icon={<ShieldCheck className="size-6" strokeWidth={1.75} aria-hidden />}
      title={fill(t.title, { name: to.name })}
      action={
        <NudgeAction
          label={fill(t.button, { name: to.name })}
          pendingLabel={t.changing}
          question={t.confirmTitle}
          href={() => currentHrefWith({ [QUERY_KEYS.protection]: String(to.id) })}
        />
      }
    >
      <span className="font-semibold text-green-dark">
        {fill(t.price, { price: formatMoney(lang, difference), unit: to.unit === "month" ? t.perMonth : t.perDay })}
      </span>
      {gains.length > 0 ? (
        <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
          <span className="sr-only">{t.gains}</span>
          {gains.map((row) => (
            <span key={row.key} className="flex items-center gap-1">
              <Check className="size-3.5 shrink-0 text-green-medium" aria-hidden />
              {rows[row.key]}: {row.value}
            </span>
          ))}
        </span>
      ) : null}
    </NudgeCard>
  );
}

/** The card's button: asks `question`, then moves to `href()` (read on confirm, so it keeps the latest URL). */
function NudgeAction({
  label,
  pendingLabel,
  question,
  href,
}: {
  label: string;
  pendingLabel: string;
  question: string;
  href: () => string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [asking, setAsking] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => setAsking(true)}
        className={buttonClass("success", "md", "w-full sm:w-auto")}
      >
        {pending ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : null}
        {pending ? pendingLabel : label}
      </button>
      <ConfirmQuestion
        open={asking}
        title={question}
        onCancel={() => setAsking(false)}
        onConfirm={() => {
          setAsking(false);
          startTransition(() => router.replace(href(), { scroll: false }));
        }}
      />
    </>
  );
}

function NudgeCard({
  icon,
  title,
  action,
  children,
}: {
  icon: ReactNode;
  title: string;
  action: ReactNode;
  children: ReactNode;
}) {
  return (
    <aside className="flex flex-col gap-4 rounded-2xl border-2 border-green-medium/40 bg-green-light/40 p-4 sm:flex-row sm:items-center sm:p-5">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-green-medium">
        {icon}
      </span>
      <div className="min-w-0 flex-1 text-sm text-blue-dark/80">
        <p className="text-base font-semibold text-blue-dark">{title}</p>
        <p className="flex flex-col">{children}</p>
      </div>
      {action}
    </aside>
  );
}
