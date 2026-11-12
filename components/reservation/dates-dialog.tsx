"use client";

import { useContext, useEffect, useId, useState } from "react";
import {
  CalendarCell,
  Dialog,
  I18nProvider,
  RangeCalendar,
  RangeCalendarStateContext,
} from "react-aria-components";
import { getDayOfWeek, isSameMonth, today, type CalendarDate } from "@internationalized/date";
import { Timer, TimerReset, type LucideIcon } from "lucide-react";

import {
  CalendarNav,
  ConfirmButton,
  DialogHeader,
  MonthGrid,
  MonthLabel,
  OptionList,
  TodayDot,
  WidgetModal,
} from "@/components/reservation/dialog-parts";
import {
  SLOTS,
  formatClock,
  isDropoffTooEarly,
  isSlotPast,
  nextOpenSlot,
  nextSlotAfter,
  openedTimes,
  suggestedDropoff,
  type ClockTime,
  type ReservationSchedule,
} from "@/components/reservation/schedule";
import { reservationConfig } from "@/lib/reservation/config";

type ReservationDatesDialogProps = {
  open: boolean;
  schedule: ReservationSchedule | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (schedule: ReservationSchedule) => void;
};

/** Pickup and return day with their hours, for the daily rental. */
export function ReservationDatesDialog({ open, ...props }: ReservationDatesDialogProps) {
  return (
    <WidgetModal
      open={open}
      onOpenChange={props.onOpenChange}
      className="h-dvh max-h-dvh w-full max-w-none sm:h-auto sm:max-h-[calc(100dvh-1.5rem)] sm:w-[min(42rem,calc(100%-1.5rem))] sm:rounded-2xl sm:shadow-2xl"
    >
      <DatesDialogBody {...props} />
    </WidgetModal>
  );
}

function DatesDialogBody({ schedule, onOpenChange, onConfirm }: Omit<ReservationDatesDialogProps, "open">) {
  const titleId = useId();
  const [wide, setWide] = useState(false);
  const [range, setRange] = useState<{ start: CalendarDate; end: CalendarDate } | null>(
    schedule ? { start: schedule.start, end: schedule.end } : null,
  );
  const [pickup, setPickup] = useState<ClockTime | null>(() => openedTimes(schedule).pickup);
  const [dropoff, setDropoff] = useState<ClockTime | null>(() => openedTimes(schedule).dropoff);
  const monthCount = wide
    ? reservationConfig.shortTermCalendarMonths.desktop
    : reservationConfig.shortTermCalendarMonths.mobile;

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const canAccept = Boolean(
    range &&
      pickup &&
      dropoff &&
      !isSlotPast(range.start, pickup) &&
      !isDropoffTooEarly(range.start, range.end, pickup, dropoff),
  );

  return (
    <I18nProvider locale="pl-PL">
      <Dialog
        aria-labelledby={titleId}
        className="grid h-full max-h-[inherit] min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden outline-none"
      >
        <DialogHeader titleId={titleId} title="Data i godzina" />
        <RangeCalendar
          aria-label="Zakres wynajmu"
          minValue={today(reservationConfig.timeZone)}
          value={range}
          onChange={(next) => {
            setRange(next);
            if (!next) {
              return;
            }
            const nextPickup =
              pickup && isSlotPast(next.start, pickup) ? nextOpenSlot(next.start) : pickup;
            if (nextPickup !== pickup) {
              setPickup(nextPickup);
            }
            if (nextPickup && dropoff && isDropoffTooEarly(next.start, next.end, nextPickup, dropoff)) {
              setDropoff(nextSlotAfter(next.end, nextPickup, next.start));
            }
          }}
          visibleDuration={{ months: monthCount }}
          className="mx-auto flex min-h-0 w-full max-w-4xl flex-col overflow-hidden outline-none"
        >
          <CalendarNav />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-2">
            <div
              className={
                wide
                  ? "mx-auto grid w-fit grid-cols-2 gap-8"
                  : "mx-auto flex w-full flex-col items-center gap-6"
              }
            >
              {Array.from({ length: monthCount }, (_, index) => (
                <div key={index} className="w-full max-w-[17.5rem]">
                  <MonthLabel offsetMonths={index} />
                  <MonthGrid offsetMonths={index} renderDay={(date) => <RangeDay date={date} />} />
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
                if (!range) {
                  return;
                }
                if (!dropoff) {
                  setDropoff(suggestedDropoff(range.start, range.end, slot));
                  return;
                }
                if (isDropoffTooEarly(range.start, range.end, slot, dropoff)) {
                  setDropoff(nextSlotAfter(range.end, slot, range.start));
                }
              }}
              isBlocked={(slot) => (range ? isSlotPast(range.start, slot) : false)}
            />
            <TimeField
              label="Godzina zwrotu"
              icon={TimerReset}
              date={range?.end ?? null}
              value={dropoff}
              onChange={setDropoff}
              isBlocked={(slot) => {
                if (!range) {
                  return false;
                }
                if (!pickup) {
                  return isSlotPast(range.end, slot);
                }
                return isDropoffTooEarly(range.start, range.end, pickup, slot);
              }}
            />
          </div>
          <ConfirmButton
            disabled={!canAccept}
            onClick={() => {
              if (!range || !pickup || !dropoff) {
                return;
              }
              onConfirm({ start: range.start, end: range.end, pickup, dropoff });
              onOpenChange(false);
            }}
          >
            Zatwierdź wybór
          </ConfirmButton>
        </div>
      </Dialog>
    </I18nProvider>
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
              {cell.isToday ? <TodayDot /> : null}
            </span>
          );
        }
        return (
          <>
            {cell.formattedDate}
            {cell.isToday && !cell.isSelected && !cell.isOutsideMonth ? <TodayDot /> : null}
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

/** Hour picker: a field that opens the list of open slots for `date`. */
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
      <WidgetModal
        open={open}
        onOpenChange={setOpen}
        layer="nested"
        className="max-h-[min(36rem,calc(100dvh-1.5rem))] w-[min(24rem,calc(100%-1.5rem))] rounded-2xl shadow-2xl"
      >
        <Dialog
          aria-labelledby={titleId}
          className="grid max-h-[inherit] min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden outline-none"
        >
          <DialogHeader titleId={titleId} title={label} className="py-4" />
          <OptionList
            options={SLOTS.filter((slot) => !isBlocked(slot))}
            isSelected={(slot) => value?.hour === slot.hour && value.minute === slot.minute}
            getKey={formatClock}
            format={formatClock}
            onSelect={(slot) => {
              onChange(slot);
              setOpen(false);
            }}
            empty="Brak dostępnych godzin."
          />
        </Dialog>
      </WidgetModal>
    </>
  );
}
