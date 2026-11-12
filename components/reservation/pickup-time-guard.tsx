"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "react-aria-components";
import { Clock } from "lucide-react";
import { today } from "@internationalized/date";

import { DialogHeader, WidgetModal } from "@/components/reservation/dialog-parts";
import {
  earliestPickupPoint,
  formatClock,
  formatSchedulePoint,
  isSlotPast,
  pointFromValue,
  valueFromPoint,
  type SchedulePoint,
} from "@/components/reservation/schedule";
import { currentHrefWith } from "@/components/reservation/url";
import { reservationConfig } from "@/lib/reservation/config";
import { QUERY_KEYS, movePickup, toZonedDateTime } from "@/lib/reservation/search";

/** How often the page looks at the clock while the customer is booking. */
const CHECK_EVERY_MS = 30_000;

type Check = {
  /** The pickup time itself has passed, not only the lead time. */
  passed: boolean;
  next: SchedulePoint;
  moved: { start: string; end: string | null };
};

/**
 * A booking in progress is not thrown out when its pickup gets close (see
 * "Pickup time rules" in `lib/reservation/README.md`). Instead, once the
 * pickup is less than `pickupLeadMinutes` away, or past, this offers to move
 * it to the earliest open slot. "Zmienię termin sam" closes it for that time.
 * The clock is read in the browser only, after mount and every 30 seconds.
 */
export function PickupTimeGuard({ start, end }: { start: string; end: string | null }) {
  const router = useRouter();
  const titleId = useId();
  const [check, setCheck] = useState<Check | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [moving, startMove] = useTransition();

  useEffect(() => {
    const run = () => setCheck(lateCheck(start, end));
    run();
    const timer = window.setInterval(run, CHECK_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [start, end]);

  const open = check !== null && dismissed !== start && !moving;
  const lead = reservationConfig.pickupLeadMinutes;

  function move() {
    if (!check) {
      return;
    }
    startMove(() =>
      router.replace(
        currentHrefWith({ [QUERY_KEYS.start]: check.moved.start, [QUERY_KEYS.end]: check.moved.end }),
        { scroll: false },
      ),
    );
  }

  function close() {
    setDismissed(start);
    // The widget with the dates is at the top of the page.
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const movedEnd = check?.moved.end && check.moved.end !== end ? pointFromValue(check.moved.end) : null;

  return (
    <WidgetModal
      open={open}
      onOpenChange={(value) => (value ? undefined : setDismissed(start))}
      className="w-[min(30rem,calc(100%-1.5rem))] rounded-2xl shadow-2xl"
    >
      <Dialog aria-labelledby={titleId} className="flex flex-col outline-none">
        <DialogHeader
          titleId={titleId}
          title={check?.passed ? "Godzina odbioru już minęła" : `Do odbioru zostało mniej niż ${lead} minut`}
          className="pt-4 pb-1"
        />
        {check ? (
          <div className="flex flex-col items-center gap-4 px-5 pb-5 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-blue-light text-blue-medium">
              <Clock className="size-6" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="text-sm text-blue-dark/80">
              Potrzebujemy co najmniej {lead} minut, żeby przygotować dla Ciebie auto. Proponujemy odbiór{" "}
              <span className="font-semibold text-blue-dark">{formatSchedulePoint(check.next)}</span>.
            </p>
            {movedEnd ? (
              <p className="text-xs text-muted-dark">
                Zwrot przesuniemy tak samo, na {formatSchedulePoint(movedEnd)}, żeby długość wynajmu się nie zmieniła.
              </p>
            ) : null}
            <p className="text-xs text-muted-dark">Wybrane auto, ochronę i dodatki zachowamy, a cenę policzymy od nowa.</p>
            <div className="flex w-full flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={close}
                className="h-12 w-full shrink-0 sm:w-auto sm:flex-1 cursor-pointer rounded-xl border border-blue-dark/15 text-sm font-bold text-blue-dark transition-colors duration-200 ease-out hover:bg-blue-dark/[0.04] motion-reduce:transition-none"
              >
                Zmienię termin sam
              </button>
              <button
                type="button"
                onClick={move}
                className="h-12 w-full shrink-0 sm:w-auto sm:flex-1 cursor-pointer rounded-xl bg-blue-medium px-3 text-sm font-bold text-white transition-colors duration-200 ease-out hover:bg-blue-dark motion-reduce:transition-none"
              >
                Przesuń na {shortPoint(check.next)}
              </button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </WidgetModal>
  );
}

/** "23:30" for today, the full date otherwise. */
function shortPoint(point: SchedulePoint): string {
  return point.date.compare(today(reservationConfig.timeZone)) === 0 ? formatClock(point.time) : formatSchedulePoint(point);
}

/** Null while the pickup is still far enough; otherwise the earliest slot and the moved dates. */
function lateCheck(start: string, end: string | null): Check | null {
  const point = pointFromValue(start);
  if (!point || !isSlotPast(point.date, point.time)) {
    return null;
  }
  const next = earliestPickupPoint();
  const zoned = toZonedDateTime(start);
  if (!next || !zoned) {
    return null;
  }
  return {
    passed: zoned.toDate().getTime() <= Date.now(),
    next,
    moved: movePickup(start, end, valueFromPoint(next.date, next.time)),
  };
}
