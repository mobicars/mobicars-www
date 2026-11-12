import {
  Time,
  now,
  parseDateTime,
  toCalendarDate,
  toCalendarDateTime,
  toZoned,
  today,
  type CalendarDate,
} from "@internationalized/date";

import { formatMonths } from "@/components/reservation/format";
import { intlLocales, type Lang } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import type { Messages } from "@/i18n/messages";
import { reservationConfig } from "@/lib/reservation/config";
import { formatQueryDateTime, type ReservationSearch } from "@/lib/reservation/search";

/** Pickup and return slot math for the widget. No React here. */

export type ClockTime = {
  hour: number;
  minute: number;
};

export type SchedulePoint = {
  date: CalendarDate;
  time: ClockTime;
};

export type ReservationSchedule = {
  start: CalendarDate;
  end: CalendarDate;
  pickup: ClockTime;
  dropoff: ClockTime;
};

export const SLOTS: ClockTime[] = buildSlots(reservationConfig.slotMinutes);

/** `YYYY-MM-DDTHH:mm` from the search draft, split for the calendar and the hour list. */
export function pointFromValue(value: string | null): SchedulePoint | null {
  if (!value) {
    return null;
  }
  const dateTime = parseDateTime(value);
  return {
    date: toCalendarDate(dateTime),
    time: { hour: dateTime.hour, minute: dateTime.minute },
  };
}

export function valueFromPoint(date: CalendarDate, time: ClockTime): string {
  return formatQueryDateTime(toCalendarDateTime(date, new Time(time.hour, time.minute)));
}

/** "05 wrz 2026, 10:00"; "05 Sept 2026, 10:00"; "05. Sept. 2026, 10:00". */
export function formatSchedulePoint(lang: Lang, point: SchedulePoint): string {
  const formatted = new Intl.DateTimeFormat(intlLocales[lang], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: reservationConfig.timeZone,
  }).format(point.date.toDate(reservationConfig.timeZone));
  // Polish short months take no dot; other languages keep their own punctuation.
  return `${lang === "pl" ? formatted.replace(".", "") : formatted}, ${formatClock(point.time)}`;
}

/**
 * Short from–to of a search, e.g. "5 wrz, 10:00 – 8 wrz, 10:00" or
 * "od 5 wrz, 10:00 · 3 miesiące". Takes the texts, so client code can use it
 * without loading every language (`compactTrip` is the server shortcut).
 */
export function formatTripDates(lang: Lang, texts: Messages["search"], search: ReservationSearch): string {
  const short = (value: string) => {
    const point = pointFromValue(value);
    if (!point) {
      return value;
    }
    const day = new Intl.DateTimeFormat(intlLocales[lang], { day: "numeric", month: "short", timeZone: "UTC" }).format(
      point.date.toDate("UTC"),
    );
    return `${lang === "pl" ? day.replace(".", "") : day}, ${formatClock(point.time)}`;
  };
  return search.term === "short"
    ? `${short(search.start)} – ${short(search.end)}`
    : `${fill(texts.fromDate, { date: short(search.start) })} · ${formatMonths(lang, search.months)}`;
}

export function formatClock(time: ClockTime): string {
  return `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
}

/** The moment before which no pickup can start: now plus the configured lead time. */
export function earliestPickup() {
  return now(reservationConfig.timeZone).add({
    minutes: reservationConfig.pickupLeadMinutes,
  });
}

export function isSlotPast(date: CalendarDate, slot: ClockTime): boolean {
  return zonedSlot(date, slot).compare(earliestPickup()) <= 0;
}

export function nextOpenSlot(date: CalendarDate): ClockTime | null {
  for (const slot of SLOTS) {
    if (!isSlotPast(date, slot)) {
      return slot;
    }
  }
  return null;
}

/** First pickup the widget offers, or null when `prefillDates` is off. */
export function defaultPickupPoint(): SchedulePoint | null {
  return reservationConfig.prefillDates ? earliestPickupPoint() : null;
}

/** The earliest slot that respects `pickupLeadMinutes`: today, or the next day after the last slot. */
export function earliestPickupPoint(): SchedulePoint | null {
  let date = today(reservationConfig.timeZone);
  const limit = Math.max(2, Math.ceil(reservationConfig.pickupLeadMinutes / (24 * 60)) + 2);
  for (let day = 0; day < limit; day += 1) {
    const time = nextOpenSlot(date);
    if (time) {
      return { date, time };
    }
    date = date.add({ days: 1 });
  }
  return null;
}

export function defaultShortTermSchedule(): ReservationSchedule | null {
  const pickup = defaultPickupPoint();
  if (!pickup) {
    return null;
  }
  const days = reservationConfig.defaultRentalDays;
  if (days > 0) {
    return {
      start: pickup.date,
      end: pickup.date.add({ days }),
      pickup: pickup.time,
      dropoff: pickup.time,
    };
  }
  const sameDayDropoff = nextSlotAfter(pickup.date, pickup.time, pickup.date);
  if (sameDayDropoff) {
    return { start: pickup.date, end: pickup.date, pickup: pickup.time, dropoff: sameDayDropoff };
  }
  return {
    start: pickup.date,
    end: pickup.date.add({ days: 1 }),
    pickup: pickup.time,
    dropoff: pickup.time,
  };
}

/** Times to show when the dialog opens: past or off-grid values move to the next open slot. */
export function openedTimes(schedule: ReservationSchedule | null): {
  pickup: ClockTime | null;
  dropoff: ClockTime | null;
} {
  if (!schedule) {
    return { pickup: null, dropoff: null };
  }
  let pickup: ClockTime | null = normalizeSlot(schedule.pickup);
  if (isSlotPast(schedule.start, pickup)) {
    pickup = nextOpenSlot(schedule.start);
  }
  let dropoff: ClockTime | null = normalizeSlot(schedule.dropoff);
  if (pickup && isDropoffTooEarly(schedule.start, schedule.end, pickup, dropoff)) {
    dropoff = nextSlotAfter(schedule.end, pickup, schedule.start);
  }
  return { pickup, dropoff };
}

export function isDropoffTooEarly(
  start: CalendarDate,
  end: CalendarDate,
  pickup: ClockTime,
  dropoff: ClockTime,
): boolean {
  if (end.compare(start) > 0) {
    return isSlotPast(end, dropoff);
  }
  if (dropoff.hour < pickup.hour) {
    return true;
  }
  if (dropoff.hour === pickup.hour && dropoff.minute <= pickup.minute) {
    return true;
  }
  return isSlotPast(end, dropoff);
}

export function suggestedDropoff(
  start: CalendarDate,
  end: CalendarDate,
  pickup: ClockTime,
): ClockTime | null {
  if (end.compare(start) > 0) {
    return isDropoffTooEarly(start, end, pickup, pickup) ? null : pickup;
  }
  for (let index = SLOTS.length - 1; index >= 0; index -= 1) {
    const slot = SLOTS[index];
    if (!isDropoffTooEarly(start, end, pickup, slot)) {
      return slot;
    }
  }
  return null;
}

export function nextSlotAfter(
  end: CalendarDate,
  pickup: ClockTime,
  start: CalendarDate,
): ClockTime | null {
  for (const slot of SLOTS) {
    if (!isDropoffTooEarly(start, end, pickup, slot)) {
      return slot;
    }
  }
  return null;
}

function buildSlots(step: number): ClockTime[] {
  if (step <= 0) {
    return [];
  }
  const slots: ClockTime[] = [];
  for (let minuteOfDay = 0; minuteOfDay < 24 * 60; minuteOfDay += step) {
    slots.push({ hour: Math.floor(minuteOfDay / 60), minute: minuteOfDay % 60 });
  }
  return slots;
}

function normalizeSlot(slot: ClockTime): ClockTime {
  const step = reservationConfig.slotMinutes;
  if (step <= 0) {
    return slot;
  }
  const total = slot.hour * 60 + slot.minute;
  const snapped = Math.ceil(total / step) * step;
  if (snapped >= 24 * 60) {
    const last = 24 * 60 - step;
    return { hour: Math.floor(last / 60), minute: last % 60 };
  }
  return { hour: Math.floor(snapped / 60), minute: snapped % 60 };
}

function zonedSlot(date: CalendarDate, slot: ClockTime) {
  return toZoned(toCalendarDateTime(date, new Time(slot.hour, slot.minute)), reservationConfig.timeZone);
}

