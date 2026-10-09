"use client";

import { useContext, useEffect, useId, useRef, useState } from "react";
import {
  Button,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Dialog,
  I18nProvider,
  Modal,
  ModalOverlay,
  RangeCalendar,
  RangeCalendarStateContext,
} from "react-aria-components";
import {
  getDayOfWeek,
  isSameMonth,
  now,
  today,
  type CalendarDate,
} from "@internationalized/date";
import { ChevronLeft, ChevronRight, Timer, TimerReset, X, type LucideIcon } from "lucide-react";

const ZONE = "Europe/Warsaw";
const MINUTES = [0, 30] as const;
const MOBILE_MONTHS = 5;
const DESKTOP_MONTHS = 2;
const SLOTS: ClockTime[] = Array.from({ length: 24 }, (_, hour) =>
  MINUTES.map((minute) => ({ hour, minute })),
).flat();

export type ClockTime = {
  hour: number;
  minute: number;
};

export type ReservationSchedule = {
  start: CalendarDate;
  end: CalendarDate;
  pickup: ClockTime;
  dropoff: ClockTime;
};

type ReservationDatesDialogProps = {
  open: boolean;
  schedule: ReservationSchedule | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (schedule: ReservationSchedule) => void;
};

export function ReservationDatesDialog({
  open,
  schedule,
  onOpenChange,
  onConfirm,
}: ReservationDatesDialogProps) {
  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={onOpenChange}
      isDismissable
      className="pickup-overlay fixed inset-0 z-50 flex bg-black/50"
    >
      <Modal className="pickup-modal m-auto flex h-dvh max-h-dvh w-full max-w-none flex-col overflow-hidden bg-white text-blue-dark outline-none sm:h-auto sm:max-h-[calc(100dvh-1.5rem)] sm:w-[min(42rem,calc(100%-1.5rem))] sm:rounded-2xl sm:shadow-2xl">
        <DatesDialogBody
          schedule={schedule}
          onOpenChange={onOpenChange}
          onConfirm={onConfirm}
        />
      </Modal>
    </ModalOverlay>
  );
}

export function formatSchedulePoint(date: CalendarDate, time: ClockTime): string {
  const formatted = new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: ZONE,
  }).format(date.toDate(ZONE));
  return `${formatted.replace(".", "")}, ${formatClock(time)}`;
}

function DatesDialogBody({
  schedule,
  onOpenChange,
  onConfirm,
}: Omit<ReservationDatesDialogProps, "open">) {
  const titleId = useId();
  const [wide, setWide] = useState(false);
  const [range, setRange] = useState<{ start: CalendarDate; end: CalendarDate } | null>(
    schedule ? { start: schedule.start, end: schedule.end } : null,
  );
  const [pickup, setPickup] = useState<ClockTime | null>(
    schedule?.pickup ? normalizeSlot(schedule.pickup) : null,
  );
  const [dropoff, setDropoff] = useState<ClockTime | null>(
    schedule?.dropoff ? normalizeSlot(schedule.dropoff) : null,
  );
  const monthCount = wide ? DESKTOP_MONTHS : MOBILE_MONTHS;

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!range?.start || !pickup) {
      return;
    }
    if (!isSlotPast(range.start, pickup)) {
      return;
    }
    setPickup(nextOpenSlot(range.start));
  }, [range?.start, pickup]);

  useEffect(() => {
    if (!range?.start || !range.end || !pickup || !dropoff) {
      return;
    }
    if (!isDropoffTooEarly(range.start, range.end, pickup, dropoff)) {
      return;
    }
    setDropoff(nextSlotAfter(range.end, pickup, range.start));
  }, [range, pickup, dropoff]);

  const canAccept = Boolean(
    range?.start &&
      range.end &&
      pickup &&
      dropoff &&
      !isSlotPast(range.start, pickup) &&
      !isDropoffTooEarly(range.start, range.end, pickup, dropoff),
  );

  return (
    <I18nProvider locale="pl-PL">
      <Dialog aria-labelledby={titleId} className="grid h-full max-h-[inherit] min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden outline-none">
        <div className="relative shrink-0 px-12 pt-4 pb-2">
          <h2 id={titleId} className="text-center text-lg font-semibold">
            Data i godzina
          </h2>
          <Button
            slot="close"
            aria-label="Zamknij"
            className="absolute top-3.5 right-4 flex size-8 cursor-pointer items-center justify-center rounded-full bg-muted-light text-muted-dark transition-colors duration-200 ease-out hover:bg-muted motion-reduce:transition-none"
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>
        <RangeCalendar
          aria-label="Zakres wynajmu"
          minValue={today(ZONE)}
          value={range}
          onChange={setRange}
          visibleDuration={{ months: monthCount }}
          className="mx-auto flex min-h-0 w-full max-w-4xl flex-col overflow-hidden outline-none"
        >
          <div className="flex shrink-0 justify-end gap-2 px-5 pb-2">
            <Button
              slot="previous"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-blue-dark/15 transition-colors duration-200 ease-out hover:bg-blue-dark/[0.04] disabled:opacity-30 motion-reduce:transition-none"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </Button>
            <Button
              slot="next"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-blue-dark/15 transition-colors duration-200 ease-out hover:bg-blue-dark/[0.04] disabled:opacity-30 motion-reduce:transition-none"
            >
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-2">
            <div className={wide ? "mx-auto grid w-fit grid-cols-2 gap-8" : "mx-auto flex w-full flex-col items-center gap-6"}>
              {Array.from({ length: monthCount }, (_, index) => (
                <div key={index} className="w-full max-w-[17.5rem]">
                  <MonthLabel offsetMonths={index} />
                  <MonthGrid offsetMonths={index} />
                </div>
              ))}
            </div>
          </div>
        </RangeCalendar>
        <div className="flex shrink-0 flex-col gap-3 border-t border-blue-dark/10 bg-white px-5 pt-3 pb-4 sm:flex-row sm:items-end">
          <div className="grid flex-1 grid-cols-2 gap-3">
            <TimeField
              label="Godzina odbioru"
              icon={Timer}
              date={range?.start ?? null}
              value={pickup}
              onChange={(slot) => {
                setPickup(slot);
                if (dropoff || !range?.start || !range.end) {
                  return;
                }
                setDropoff(suggestedDropoff(range.start, range.end, slot));
              }}
              isBlocked={(slot) => (range?.start ? isSlotPast(range.start, slot) : false)}
            />
            <TimeField
              label="Godzina zwrotu"
              icon={TimerReset}
              date={range?.end ?? null}
              value={dropoff}
              onChange={setDropoff}
              isBlocked={(slot) => {
                if (!range?.end) {
                  return false;
                }
                if (!range.start || !pickup) {
                  return isSlotPast(range.end, slot);
                }
                return isDropoffTooEarly(range.start, range.end, pickup, slot);
              }}
            />
          </div>
          <button
            type="button"
            disabled={!canAccept}
            onClick={() => {
              if (!range?.start || !range.end || !pickup || !dropoff) {
                return;
              }
              onConfirm({ start: range.start, end: range.end, pickup, dropoff });
              onOpenChange(false);
            }}
            className="h-12 shrink-0 rounded-xl bg-blue-medium px-6 text-base font-bold text-white transition-colors duration-200 ease-out hover:bg-blue-dark disabled:opacity-40 disabled:hover:bg-blue-medium motion-reduce:transition-none md:px-8"
          >
            Zatwierdź wybór
          </button>
        </div>
      </Dialog>
    </I18nProvider>
  );
}

function MonthLabel({ offsetMonths }: { offsetMonths: number }) {
  const state = useContext(RangeCalendarStateContext);
  if (!state) {
    return null;
  }
  const date = state.visibleRange.start.add({ months: offsetMonths });
  const name = new Intl.DateTimeFormat("pl-PL", { month: "long", timeZone: ZONE }).format(
    date.toDate(ZONE),
  );
  return <h3 className="mb-2 text-lg font-semibold capitalize">{name}</h3>;
}

function MonthGrid({ offsetMonths = 0 }: { offsetMonths?: number }) {
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
      <CalendarGridBody>{(date) => <RangeDay date={date} />}</CalendarGridBody>
    </CalendarGrid>
  );
}

function RangeDay({ date }: { date: CalendarDate }) {
  const calendar = useContext(RangeCalendarStateContext);
  const preview = Boolean(calendar?.anchorDate);

  return (
    <CalendarCell
      date={date}
      className={(cell) => {
        if (cell.isOutsideMonth) {
          return "pointer-events-none invisible aspect-square w-full";
        }
        const { continuesLeft, continuesRight } = segmentEdges(cell);
        const hollow = preview && cell.isSelected && (cell.isSelectionStart || cell.isSelectionEnd);
        return [
          "relative flex aspect-square w-full items-center justify-center text-sm outline-none transition-colors duration-200 ease-out motion-reduce:transition-none",
          cell.isDisabled ? "cursor-default text-blue-dark/30" : "cursor-pointer text-blue-dark",
          cell.isSelected ? "bg-blue-medium font-semibold text-white" : "",
          cell.isSelected && !continuesLeft ? "rounded-l-full" : "",
          cell.isSelected && !continuesRight ? "rounded-r-full" : "",
          !cell.isSelected && !cell.isDisabled ? "rounded-full hover:bg-blue-dark/[0.04]" : "",
          cell.isFocusVisible ? "z-10 ring-2 ring-blue-medium ring-offset-2" : "",
          hollow ? "z-[1]" : "",
        ].join(" ");
      }}
    >
      {(cell) => {
        const hollow =
          preview && cell.isSelected && (cell.isSelectionStart || cell.isSelectionEnd) && !cell.isOutsideMonth;
        if (hollow) {
          return (
            <span className="absolute inset-[3px] z-10 flex items-center justify-center rounded-full bg-white font-semibold text-blue-dark">
              {cell.formattedDate}
              {cell.isToday ? (
                <span className="absolute bottom-1 size-1 rounded-full bg-blue-medium" />
              ) : null}
            </span>
          );
        }
        return (
          <>
            {cell.formattedDate}
            {cell.isToday && !cell.isSelected && !cell.isOutsideMonth ? (
              <span className="pointer-events-none absolute bottom-1 size-1 rounded-full bg-blue-medium" />
            ) : null}
          </>
        );
      }}
    </CalendarCell>
  );
}

function segmentEdges(cell: {
  date: CalendarDate;
  isSelected: boolean;
  isSelectionStart: boolean;
  isSelectionEnd: boolean;
}) {
  const dow = getDayOfWeek(cell.date, "pl-PL");
  const continuesLeft =
    cell.isSelected &&
    !cell.isSelectionStart &&
    dow !== 0 &&
    isSameMonth(cell.date, cell.date.subtract({ days: 1 }));
  const continuesRight =
    cell.isSelected &&
    !cell.isSelectionEnd &&
    dow !== 6 &&
    isSameMonth(cell.date, cell.date.add({ days: 1 }));
  return { continuesLeft, continuesRight };
}

export function TimeField({
  label,
  icon: Icon,
  date,
  value,
  onChange,
  isBlocked,
}: {
  label: string;
  icon: LucideIcon;
  date: CalendarDate | null;
  value: ClockTime | null;
  onChange: (value: ClockTime) => void;
  isBlocked: (slot: ClockTime) => boolean;
}) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const available = SLOTS.filter((slot) => !isBlocked(slot));

  useEffect(() => {
    if (!open) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      selectedRef.current?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  return (
    <>
      <button
        type="button"
        disabled={!date}
        onClick={() => setOpen(true)}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-blue-dark/15 bg-white px-3 py-2 text-left outline-none transition-[border-color,background-color] duration-200 ease-out hover:border-blue-dark/25 hover:bg-blue-dark/[0.03] disabled:cursor-default disabled:opacity-40 disabled:hover:border-blue-dark/15 disabled:hover:bg-white motion-reduce:transition-none"
      >
        <Icon className="size-5 shrink-0 text-blue-medium" strokeWidth={1.75} aria-hidden />
        <span className="min-w-0">
          <span className="block truncate text-xxs text-blue-dark/55">{label}</span>
          <span className="block truncate text-sm font-bold">{value ? formatClock(value) : "--:--"}</span>
        </span>
      </button>
      <ModalOverlay
        isOpen={open}
        onOpenChange={setOpen}
        isDismissable
        className="pickup-overlay fixed inset-0 z-[70] flex bg-black/50"
      >
        <Modal className="pickup-modal m-auto flex max-h-[min(36rem,calc(100dvh-1.5rem))] w-[min(24rem,calc(100%-1.5rem))] flex-col overflow-hidden rounded-2xl bg-white text-blue-dark shadow-2xl outline-none">
          <Dialog aria-labelledby={titleId} className="grid max-h-[inherit] min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden outline-none">
            <div className="relative shrink-0 px-12 py-4">
              <h2 id={titleId} className="text-center text-lg font-semibold">
                {label}
              </h2>
              <Button
                slot="close"
                aria-label="Zamknij"
                className="absolute top-3.5 right-4 flex size-8 cursor-pointer items-center justify-center rounded-full bg-muted-light text-muted-dark transition-colors duration-200 ease-out hover:bg-muted motion-reduce:transition-none"
              >
                <X className="size-4" aria-hidden />
              </Button>
            </div>
            <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4">
              {available.length === 0 ? (
                <p className="py-6 text-center text-sm text-blue-dark/60">Brak dostępnych godzin.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {available.map((slot) => {
                    const selected = value?.hour === slot.hour && value.minute === slot.minute;
                    return (
                      <button
                        key={`${slot.hour}:${slot.minute}`}
                        ref={selected ? selectedRef : undefined}
                        type="button"
                        onClick={() => {
                          onChange(slot);
                          setOpen(false);
                        }}
                        className={`flex h-12 w-full items-center justify-center rounded-xl border text-base transition-colors duration-200 ease-out motion-reduce:transition-none ${
                          selected
                            ? "border-blue-medium bg-blue-medium font-bold text-white hover:bg-blue-dark"
                            : "border-blue-dark/15 hover:border-blue-dark/25 hover:bg-blue-dark/[0.03]"
                        }`}
                      >
                        {formatClock(slot)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}

function normalizeSlot(slot: ClockTime): ClockTime {
  if (slot.minute === 0 || slot.minute === 30) {
    return slot;
  }
  if (slot.minute < 30) {
    return { hour: slot.hour, minute: 30 };
  }
  return slot.hour < 23 ? { hour: slot.hour + 1, minute: 0 } : { hour: 23, minute: 30 };
}

function formatClock(time: ClockTime): string {
  return `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
}

export function isSlotPast(date: CalendarDate, slot: ClockTime): boolean {
  const current = now(ZONE);
  const todayDate = today(ZONE);
  const compared = date.compare(todayDate);
  if (compared > 0) {
    return false;
  }
  if (compared < 0) {
    return true;
  }
  if (slot.hour < current.hour) {
    return true;
  }
  if (slot.hour > current.hour) {
    return false;
  }
  return slot.minute <= current.minute;
}

export function nextOpenSlot(date: CalendarDate): ClockTime | null {
  for (const slot of SLOTS) {
    if (!isSlotPast(date, slot)) {
      return slot;
    }
  }
  return null;
}

function isDropoffTooEarly(
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

function suggestedDropoff(
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

function nextSlotAfter(end: CalendarDate, pickup: ClockTime, start: CalendarDate): ClockTime | null {
  for (const slot of SLOTS) {
    if (!isDropoffTooEarly(start, end, pickup, slot)) {
      return slot;
    }
  }
  return null;
}
