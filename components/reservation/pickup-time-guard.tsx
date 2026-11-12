"use client";

import { useEffect, useId, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "react-aria-components";
import { Clock } from "lucide-react";
import { today } from "@internationalized/date";

import { DialogActions, DialogHeader, WidgetModal } from "@/components/reservation/dialog-parts";
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
import type { Lang } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { useLang } from "@/i18n/lang-context";
import { useMessages } from "@/i18n/messages-context";
import { plural } from "@/i18n/plural";
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
 * it to the earliest open slot. "I'll change it myself" closes it for that time.
 * The clock is read in the browser only, after mount and every 30 seconds.
 */
export function PickupTimeGuard({ start, end }: { start: string; end: string | null }) {
  const router = useRouter();
  const titleId = useId();
  const lang = useLang();
  const texts = useMessages().search;
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
  const minutes = `${lead} ${plural(lang, lead, texts.minutes)}`;

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
          title={check?.passed ? texts.guardPassed : fill(texts.guardSoon, { minutes })}
          className="pt-4 pb-1"
        />
        {check ? (
          <div className="flex flex-col items-center gap-4 px-5 pb-5 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-blue-light text-blue-medium">
              <Clock className="size-6" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="text-sm text-blue-dark/80">
              <WithPoint
                text={fill(texts.guardOffer, { minutes })}
                point={<span className="font-semibold text-blue-dark">{formatSchedulePoint(lang, check.next)}</span>}
              />
            </p>
            {movedEnd ? (
              <p className="text-xs text-muted-dark">
                {fill(texts.guardReturn, { point: formatSchedulePoint(lang, movedEnd) })}
              </p>
            ) : null}
            <p className="text-xs text-muted-dark">{texts.guardKeep}</p>
            <DialogActions
              cancel={texts.guardSelf}
              confirm={fill(texts.guardMove, { point: shortPoint(lang, check.next) })}
              onCancel={close}
              onConfirm={move}
            />
          </div>
        ) : null}
      </Dialog>
    </WidgetModal>
  );
}

/** `text` with its `{point}` placeholder replaced by an element, e.g. the date in bold. */
function WithPoint({ text, point }: { text: string; point: ReactNode }) {
  const [before, after = ""] = text.split("{point}");
  return (
    <>
      {before}
      {point}
      {after}
    </>
  );
}

/** "23:30" for today, the full date otherwise. */
function shortPoint(lang: Lang, point: SchedulePoint): string {
  return point.date.compare(today(reservationConfig.timeZone)) === 0
    ? formatClock(point.time)
    : formatSchedulePoint(lang, point);
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
