"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "react-aria-components";
import { Clock } from "lucide-react";

import { ReservationDatesDialog } from "@/components/reservation/dates-dialog";
import { WidgetModal } from "@/components/reservation/dialog-parts";
import { EmptyState } from "@/components/reservation/empty-state";
import {
  formatSchedulePoint,
  formatTripDates,
  pickupTimeCheck,
  pointFromValue,
  valueFromPoint,
  type PickupTimeCheck,
} from "@/components/reservation/schedule";
import { StartDateDialog } from "@/components/reservation/start-date-dialog";
import { currentHrefWith } from "@/components/reservation/url";
import { buttonClass } from "@/components/ui/button";
import { fill } from "@/i18n/fill";
import { useLang } from "@/i18n/lang-context";
import { useMessages } from "@/i18n/messages-context";
import { plural } from "@/i18n/plural";
import { reservationConfig } from "@/lib/reservation/config";
import { QUERY_KEYS, type ReservationSearch } from "@/lib/reservation/search";

/** How often the page looks at the clock while the customer is booking. */
const CHECK_EVERY_MS = 30_000;

/** "Zacznij od nowa" keeps only the places: the dates and everything chosen after them go. */
const CLEARED_ON_RESTART = [
  QUERY_KEYS.start,
  QUERY_KEYS.end,
  QUERY_KEYS.offer,
  QUERY_KEYS.step,
  QUERY_KEYS.protection,
  QUERY_KEYS.zone,
  QUERY_KEYS.extras,
  QUERY_KEYS.accessories,
  QUERY_KEYS.promo,
];

/**
 * Asks for a new pickup time once the URL's is closer than
 * `pickupLeadMinutes` or past (see "Pickup time rules" in
 * `lib/reservation/README.md`), with three answers:
 * - "Przesuń na najbliższy termin": the earliest open slot, its dates shown on
 *   the button; the car, protection, extras and the code stay.
 * - "Wybierz inny termin": the widget's calendar, the same choices kept.
 * - "Zacznij od nowa" (a red link, like "Wyloguj"): only the places stay; the
 *   page then offers the widget's default dates.
 *
 * Two ways of showing it:
 * - `expired` (the page found the time too early and rendered no offers): a
 *   card in the page, like "Brak wyników", so the header and the widget stay
 *   usable and nobody is stuck on an old link.
 * - Otherwise the clock catches up while the customer books (checked after
 *   mount and every 30 seconds): a dialog over the step that cannot be closed,
 *   as it would come back and "Rezerwuj" refuses the time anyway. None of the
 *   answers reloads the page, so the details step keeps what was typed.
 */
export function PickupTimeGuard({
  search,
  hasCar,
  expired = false,
  initial = null,
}: {
  search: ReservationSearch;
  /** A car is chosen (`offer`): "we keep your car, protection and extras". */
  hasCar: boolean;
  expired?: boolean;
  /** The page's own check for an expired search, so the card renders complete on the server. */
  initial?: PickupTimeCheck | null;
}) {
  const router = useRouter();
  const titleId = useId();
  const textId = useId();
  const lang = useLang();
  const texts = useMessages().search;
  const [check, setCheck] = useState<PickupTimeCheck | null>(initial);
  const [picking, setPicking] = useState(false);
  const [moving, startMove] = useTransition();

  useEffect(() => {
    const run = () => setCheck(pickupTimeCheck(search, expired));
    run();
    const timer = window.setInterval(run, CHECK_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [search, expired]);

  const current = check?.start === search.start ? check : null;
  const lead = reservationConfig.pickupLeadMinutes;
  const minutes = `${lead} ${plural(lang, lead, texts.minutes)}`;
  const planned = pointFromValue(search.start);
  const title = current && !current.passed ? fill(texts.guardSoon, { minutes }) : texts.guardPassed;

  /** Changes the URL without a reload; the page then quotes (or asks) again. */
  function go(changes: Record<string, string | null>) {
    setPicking(false);
    startMove(() => router.replace(currentHrefWith(changes), { scroll: false }));
  }

  function moveTo(start: string, end: string | null) {
    go({ [QUERY_KEYS.start]: start, [QUERY_KEYS.end]: end });
  }

  function restart() {
    go(Object.fromEntries(CLEARED_ON_RESTART.map((key) => [key, null])));
  }

  const answers = (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <div id={textId} className="flex flex-col gap-1 text-sm text-blue-dark/80">
        <p>
          {current?.passed && planned
            ? fill(texts.guardPassedText, { point: formatSchedulePoint(lang, planned) })
            : fill(texts.guardSoonText, { minutes })}
        </p>
        {hasCar ? <p className="text-xs text-muted-dark">{texts.guardKeep}</p> : null}
      </div>
      <div className="flex w-full flex-col gap-2">
        {current ? (
          <button
            type="button"
            autoFocus={!expired}
            disabled={moving}
            onClick={() => moveTo(current.moved.start, current.moved.term === "short" ? current.moved.end : null)}
            className={buttonClass("primary", "lg", "w-full flex-col gap-0 leading-tight")}
          >
            <span className="text-sm">{texts.guardMove}</span>
            <span className="text-xs font-semibold text-white/85">{formatTripDates(lang, texts, current.moved)}</span>
          </button>
        ) : null}
        <button
          type="button"
          disabled={moving}
          onClick={() => setPicking(true)}
          className={buttonClass("secondary", "md", "w-full")}
        >
          {texts.guardPick}
        </button>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <button
          type="button"
          disabled={moving}
          onClick={restart}
          className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium text-red-700 underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-blue-medium disabled:cursor-default"
        >
          {texts.guardRestart}
        </button>
        <p className="text-xs text-muted-dark">{texts.guardRestartNote}</p>
      </div>
    </div>
  );

  const proposed = current ? pointFromValue(current.moved.start) : null;
  const proposedEnd = current?.moved.term === "short" ? pointFromValue(current.moved.end) : null;

  return (
    <>
      {expired ? (
        <EmptyState icon={Clock} title={title}>
          {answers}
        </EmptyState>
      ) : (
        <WidgetModal
          open={current !== null && !picking && !moving}
          onOpenChange={() => undefined}
          dismissable={false}
          className="mb-0 w-full rounded-t-card pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-float sm:mb-auto sm:w-[min(30rem,calc(100%-1.5rem))] sm:rounded-card sm:pb-5"
        >
          <Dialog
            role="alertdialog"
            aria-labelledby={titleId}
            aria-describedby={textId}
            className="flex flex-col items-center gap-4 px-5 pt-6 text-center outline-none"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-blue-light text-blue-medium">
              <Clock className="size-6" strokeWidth={1.75} aria-hidden />
            </span>
            <h2 id={titleId} className="text-lg font-semibold text-balance">
              {title}
            </h2>
            {answers}
          </Dialog>
        </WidgetModal>
      )}
      {search.term === "short" ? (
        <ReservationDatesDialog
          open={current !== null && picking}
          schedule={
            proposed && proposedEnd
              ? { start: proposed.date, end: proposedEnd.date, pickup: proposed.time, dropoff: proposedEnd.time }
              : null
          }
          onOpenChange={setPicking}
          onConfirm={(next) => moveTo(valueFromPoint(next.start, next.pickup), valueFromPoint(next.end, next.dropoff))}
        />
      ) : (
        <StartDateDialog
          open={current !== null && picking}
          start={proposed}
          onOpenChange={setPicking}
          onConfirm={(next) => moveTo(valueFromPoint(next.date, next.time), null)}
        />
      )}
    </>
  );
}
