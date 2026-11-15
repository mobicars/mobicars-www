"use client";

/**
 * Calendar pieces for the date dialogs (month grid, month name, navigation).
 * Apart from `dialog-parts.tsx`, which every dialog imports, so the calendar
 * code loads only with the date dialogs.
 */

import { useContext, type ReactElement } from "react";
import {
  Button,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarStateContext,
  RangeCalendarStateContext,
} from "react-aria-components";
import type { CalendarDate } from "@internationalized/date";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { intlLocales } from "@/i18n/config";
import { useLang } from "@/i18n/lang-context";
import { useMessages } from "@/i18n/messages-context";
import { reservationConfig } from "@/lib/reservation/config";

const navButton =
  "flex size-9 cursor-pointer items-center justify-center rounded-full border border-blue-dark/15 transition-colors duration-200 ease-out hover:bg-blue-dark/[0.04] disabled:opacity-30 motion-reduce:transition-none";

/** Previous and next month. Must sit inside a `Calendar` or `RangeCalendar`. */
export function CalendarNav() {
  const texts = useMessages().search;
  return (
    <div className="flex shrink-0 justify-end gap-2 px-5 pb-2">
      <Button slot="previous" aria-label={texts.previousMonth} className={navButton}>
        <ChevronLeft className="size-4" aria-hidden />
      </Button>
      <Button slot="next" aria-label={texts.nextMonth} className={navButton}>
        <ChevronRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}

/** Month name above a grid. Works in both `Calendar` and `RangeCalendar`. */
export function MonthLabel({ offsetMonths = 0 }: { offsetMonths?: number }) {
  const range = useContext(RangeCalendarStateContext);
  const single = useContext(CalendarStateContext);
  const lang = useLang();
  const state = range ?? single;
  if (!state) {
    return null;
  }
  const date = state.visibleRange.start.add({ months: offsetMonths });
  const name = new Intl.DateTimeFormat(intlLocales[lang], {
    month: "long",
    timeZone: reservationConfig.timeZone,
  }).format(date.toDate(reservationConfig.timeZone));
  return <h3 className="mb-2 text-lg font-semibold capitalize">{name}</h3>;
}

export function MonthGrid({
  offsetMonths = 0,
  renderDay,
}: {
  offsetMonths?: number;
  renderDay: (date: CalendarDate) => ReactElement;
}) {
  return (
    <CalendarGrid
      weekdayStyle="short"
      offset={offsetMonths ? { months: offsetMonths } : undefined}
      className="w-full table-fixed border-separate border-spacing-x-0 border-spacing-y-0.5 [&_td]:p-0"
    >
      <CalendarGridHeader>
        {(day) => (
          <CalendarHeaderCell className="pb-1 text-center text-xs font-semibold text-blue-dark/45">
            {day}
          </CalendarHeaderCell>
        )}
      </CalendarGridHeader>
      <CalendarGridBody>{renderDay}</CalendarGridBody>
    </CalendarGrid>
  );
}

/** Small dot under today's number. */
export function TodayDot() {
  return <span className="pointer-events-none absolute bottom-1 size-1 rounded-full bg-blue-medium" />;
}
