"use client";

import { useId, useState } from "react";
import { Calendar, CalendarCell, Dialog, I18nProvider } from "react-aria-components";
import { today, type CalendarDate } from "@internationalized/date";
import { Timer } from "lucide-react";

import { TimeField } from "@/components/reservation/dates-dialog";
import {
  CalendarNav,
  ConfirmButton,
  DialogHeader,
  MonthGrid,
  MonthLabel,
  TodayDot,
  WidgetModal,
} from "@/components/reservation/dialog-parts";
import {
  isSlotPast,
  nextOpenSlot,
  type ClockTime,
  type SchedulePoint,
} from "@/components/reservation/schedule";
import { reservationConfig } from "@/lib/reservation/config";

type StartDateDialogProps = {
  open: boolean;
  start: SchedulePoint | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (start: SchedulePoint) => void;
};

/** Pickup day and hour, for the monthly rental. It has no return date. */
export function StartDateDialog({ open, ...props }: StartDateDialogProps) {
  return (
    <WidgetModal
      open={open}
      onOpenChange={props.onOpenChange}
      className="h-dvh max-h-dvh w-full max-w-none sm:h-auto sm:max-h-[calc(100dvh-1.5rem)] sm:w-[min(24rem,calc(100%-1.5rem))] sm:rounded-2xl sm:shadow-2xl"
    >
      <StartDateBody {...props} />
    </WidgetModal>
  );
}

function StartDateBody({ start, onOpenChange, onConfirm }: Omit<StartDateDialogProps, "open">) {
  const titleId = useId();
  const [date, setDate] = useState<CalendarDate | null>(start?.date ?? null);
  const [time, setTime] = useState<ClockTime | null>(() => {
    if (!start) {
      return null;
    }
    return isSlotPast(start.date, start.time) ? nextOpenSlot(start.date) : start.time;
  });

  const canAccept = Boolean(date && time && !isSlotPast(date, time));

  return (
    <I18nProvider locale="pl-PL">
      <Dialog
        aria-labelledby={titleId}
        className="grid h-full max-h-[inherit] min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden outline-none"
      >
        <DialogHeader titleId={titleId} title="Data i godzina odbioru" />
        <Calendar
          aria-label="Data odbioru"
          minValue={today(reservationConfig.timeZone)}
          value={date}
          onChange={(next) => {
            setDate(next);
            if (time && isSlotPast(next, time)) {
              setTime(nextOpenSlot(next));
            }
          }}
          className="mx-auto flex min-h-0 w-full flex-col overflow-hidden outline-none"
        >
          <CalendarNav />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-2">
            <div className="mx-auto w-full max-w-[17.5rem]">
              <MonthLabel />
              <MonthGrid renderDay={(day) => <StartDay date={day} />} />
            </div>
          </div>
        </Calendar>
        <div className="flex shrink-0 flex-col gap-3 border-t border-blue-dark/10 bg-white px-5 pt-3 pb-4 sm:flex-row sm:items-end">
          <div className="min-w-0 sm:flex-1">
            <TimeField
              label="Godzina odbioru"
              icon={Timer}
              date={date}
              value={time}
              onChange={setTime}
              isBlocked={(slot) => (date ? isSlotPast(date, slot) : false)}
            />
          </div>
          <ConfirmButton
            disabled={!canAccept}
            onClick={() => {
              if (!date || !time) {
                return;
              }
              onConfirm({ date, time });
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

function StartDay({ date }: { date: CalendarDate }) {
  return (
    <CalendarCell
      date={date}
      className={(cell) => {
        if (cell.isOutsideMonth) {
          return "pointer-events-none invisible aspect-square w-full";
        }
        return [
          "relative flex aspect-square w-full items-center justify-center rounded-full text-sm outline-none transition-colors duration-200 ease-out motion-reduce:transition-none",
          cell.isDisabled ? "cursor-default text-blue-dark/30" : "cursor-pointer text-blue-dark",
          cell.isSelected ? "bg-blue-medium font-semibold text-white" : "",
          !cell.isSelected && !cell.isDisabled ? "hover:bg-blue-dark/[0.04]" : "",
          cell.isFocusVisible ? "z-10 ring-2 ring-blue-medium ring-offset-2" : "",
        ].join(" ");
      }}
    >
      {(cell) => (
        <>
          {cell.formattedDate}
          {cell.isToday && !cell.isSelected && !cell.isOutsideMonth ? <TodayDot /> : null}
        </>
      )}
    </CalendarCell>
  );
}
