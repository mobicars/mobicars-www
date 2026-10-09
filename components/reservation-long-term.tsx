"use client";

import { useContext, useEffect, useId, useRef, useState } from "react";
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarStateContext,
  Dialog,
  I18nProvider,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { today, type CalendarDate } from "@internationalized/date";
import { CalendarCheck2, CalendarRange, ChevronLeft, ChevronRight, Gauge, Search, Timer, X, type LucideIcon } from "lucide-react";
import { PlaceFields, type PickupPlace } from "@/components/reservation-places";
import {
  TimeField,
  formatSchedulePoint,
  isSlotPast,
  nextOpenSlot,
  type ClockTime,
} from "@/components/reservation-dates";

const ZONE = "Europe/Warsaw";
const MONTH_COUNTS = [1, 2, 3, 4, 5, 6, 12, 24, 36] as const;
const KILOMETER_LIMITS = [1000, 2000, 3000, 4000, 5000, 6000] as const;

type LongTermStart = {
  date: CalendarDate;
  time: ClockTime;
};

export function LongTermBar({ places }: { places: PickupPlace[] }) {
  const [datesOpen, setDatesOpen] = useState(false);
  const [start, setStart] = useState<LongTermStart | null>(null);
  const [months, setMonths] = useState<number | null>(null);
  const [kilometers, setKilometers] = useState<number | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-3xl border-4 border-white bg-blue-medium p-0.5 @5xl:rounded-full">
        <div className="grid w-full min-w-0 grid-cols-1 overflow-hidden rounded-[18px] bg-blue-medium @lg:grid-cols-2 @5xl:grid-cols-[minmax(0,2.2fr)_repeat(3,minmax(0,1fr))_auto] @5xl:rounded-full">
          <PlaceFields places={places} />
          <div className="grid grid-cols-1 @lg:col-span-2 @lg:grid-cols-3 @5xl:contents">
            <BarField
              icon={CalendarCheck2}
              label="Data i godzina odbioru"
              value={start ? formatSchedulePoint(start.date, start.time) : "Wybierz datę"}
              onClick={() => setDatesOpen(true)}
              className="border-b-2 @lg:border-r-2 @5xl:border-b-0"
            />
            <OptionField
              icon={CalendarRange}
              label="Liczba miesięcy"
              title="Liczba miesięcy"
              value={months}
              empty="Wybierz"
              options={MONTH_COUNTS}
              format={formatMonths}
              onChange={setMonths}
              className="border-b-2 @lg:border-r-2 @5xl:border-b-0"
            />
            <OptionField
              icon={Gauge}
              label="Limit kilometrów"
              title="Limit kilometrów"
              value={kilometers}
              empty="Wybierz"
              options={KILOMETER_LIMITS}
              format={formatKilometers}
              onChange={setKilometers}
              className="border-b-2 @5xl:border-r-2 @5xl:border-b-0"
            />
          </div>
          <div className="bg-blue-medium @lg:col-span-2 @5xl:col-span-1">
            <div className="flex min-h-12 items-center justify-center gap-2 bg-blue-medium px-5 text-sm font-bold text-white @5xl:h-full @5xl:px-6">
              <Search className="size-5" strokeWidth={1.75} aria-hidden />
              Szukaj
            </div>
          </div>
        </div>
      </div>
      <StartDateDialog open={datesOpen} start={start} onOpenChange={setDatesOpen} onConfirm={setStart} />
    </>
  );
}

function BarField({
  icon: Icon,
  label,
  value,
  onClick,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-16 min-w-0 cursor-pointer items-center gap-3 border-blue-medium bg-white px-4 py-3 text-left transition-colors duration-200 ease-out hover:bg-[color-mix(in_srgb,var(--color-blue-dark)_4%,white)] motion-reduce:transition-none @5xl:px-5 ${className}`}
    >
      <Icon className="size-5 shrink-0 text-blue-medium" strokeWidth={1.75} aria-hidden />
      <span className="min-w-0">
        <span className="block truncate text-xxs text-blue-dark/55">{label}</span>
        <span className="block truncate text-xs font-bold text-blue-dark">{value}</span>
      </span>
    </button>
  );
}

function OptionField<T extends number>({
  icon,
  label,
  title,
  value,
  empty,
  options,
  format,
  onChange,
  className,
}: {
  icon: LucideIcon;
  label: string;
  title: string;
  value: T | null;
  empty: string;
  options: readonly T[];
  format: (value: T) => string;
  onChange: (value: T) => void;
  className: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <BarField
        icon={icon}
        label={label}
        value={value === null ? empty : format(value)}
        onClick={() => setOpen(true)}
        className={className}
      />
      <OptionDialog
        open={open}
        title={title}
        options={options}
        value={value}
        format={format}
        onOpenChange={setOpen}
        onSelect={onChange}
      />
    </>
  );
}

function OptionDialog<T extends number>({
  open,
  title,
  options,
  value,
  format,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  title: string;
  options: readonly T[];
  value: T | null;
  format: (value: T) => string;
  onOpenChange: (open: boolean) => void;
  onSelect: (value: T) => void;
}) {
  const titleId = useId();
  const selectedRef = useRef<HTMLButtonElement>(null);

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
    <ModalOverlay
      isOpen={open}
      onOpenChange={onOpenChange}
      isDismissable
      className="pickup-overlay fixed inset-0 z-50 flex bg-black/50"
    >
      <Modal className="pickup-modal m-auto flex max-h-[min(36rem,calc(100dvh-1.5rem))] w-[min(24rem,calc(100%-1.5rem))] flex-col overflow-hidden rounded-2xl bg-white text-blue-dark shadow-2xl outline-none">
        <Dialog aria-labelledby={titleId} className="grid max-h-[inherit] min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden outline-none">
          <div className="relative shrink-0 px-12 py-4">
            <h2 id={titleId} className="text-center text-lg font-semibold">
              {title}
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
            <div className="flex flex-col gap-2">
              {options.map((option) => {
                const selected = option === value;
                return (
                  <button
                    key={option}
                    ref={selected ? selectedRef : undefined}
                    type="button"
                    onClick={() => {
                      onSelect(option);
                      onOpenChange(false);
                    }}
                    className={`flex h-12 w-full cursor-pointer items-center justify-center rounded-xl border text-base transition-colors duration-200 ease-out motion-reduce:transition-none ${
                      selected
                        ? "border-blue-medium bg-blue-medium font-bold text-white hover:bg-blue-dark"
                        : "border-blue-dark/15 hover:border-blue-dark/25 hover:bg-blue-dark/[0.03]"
                    }`}
                  >
                    {format(option)}
                  </button>
                );
              })}
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

function StartDateDialog({
  open,
  start,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  start: LongTermStart | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (start: LongTermStart) => void;
}) {
  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={onOpenChange}
      isDismissable
      className="pickup-overlay fixed inset-0 z-50 flex bg-black/50"
    >
      <Modal className="pickup-modal m-auto flex h-dvh max-h-dvh w-full max-w-none flex-col overflow-hidden bg-white text-blue-dark outline-none sm:h-auto sm:max-h-[calc(100dvh-1.5rem)] sm:w-[min(24rem,calc(100%-1.5rem))] sm:rounded-2xl sm:shadow-2xl">
        <StartDateBody start={start} onOpenChange={onOpenChange} onConfirm={onConfirm} />
      </Modal>
    </ModalOverlay>
  );
}

function StartDateBody({
  start,
  onOpenChange,
  onConfirm,
}: {
  start: LongTermStart | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (start: LongTermStart) => void;
}) {
  const titleId = useId();
  const [date, setDate] = useState<CalendarDate | null>(start?.date ?? null);
  const [time, setTime] = useState<ClockTime | null>(start?.time ?? null);

  useEffect(() => {
    if (!date || !time || !isSlotPast(date, time)) {
      return;
    }
    setTime(nextOpenSlot(date));
  }, [date, time]);

  const canAccept = Boolean(date && time && !isSlotPast(date, time));

  return (
    <I18nProvider locale="pl-PL">
      <Dialog
        aria-labelledby={titleId}
        className="grid h-full max-h-[inherit] min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden outline-none"
      >
        <div className="relative shrink-0 px-12 pt-4 pb-2">
          <h2 id={titleId} className="text-center text-lg font-semibold">
            Data i godzina odbioru
          </h2>
          <Button
            slot="close"
            aria-label="Zamknij"
            className="absolute top-3.5 right-4 flex size-8 cursor-pointer items-center justify-center rounded-full bg-muted-light text-muted-dark transition-colors duration-200 ease-out hover:bg-muted motion-reduce:transition-none"
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>
        <Calendar
          aria-label="Data odbioru"
          minValue={today(ZONE)}
          value={date}
          onChange={setDate}
          className="mx-auto flex min-h-0 w-full flex-col overflow-hidden outline-none"
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
            <div className="mx-auto w-full max-w-[17.5rem]">
              <MonthLabel />
              <MonthGrid />
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
          <button
            type="button"
            disabled={!canAccept}
            onClick={() => {
              if (!date || !time) {
                return;
              }
              onConfirm({ date, time });
              onOpenChange(false);
            }}
            className="h-12 shrink-0 cursor-pointer rounded-xl bg-blue-medium px-6 text-base font-bold text-white transition-colors duration-200 ease-out hover:bg-blue-dark disabled:cursor-default disabled:opacity-40 disabled:hover:bg-blue-medium motion-reduce:transition-none md:px-8"
          >
            Zatwierdź wybór
          </button>
        </div>
      </Dialog>
    </I18nProvider>
  );
}

function MonthLabel({ offsetMonths = 0 }: { offsetMonths?: number }) {
  const state = useContext(CalendarStateContext);
  if (!state) {
    return null;
  }
  const date = state.visibleRange.start.add({ months: offsetMonths });
  const name = new Intl.DateTimeFormat("pl-PL", { month: "long", timeZone: ZONE }).format(date.toDate(ZONE));
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
      <CalendarGridBody>{(date) => <StartDay date={date} />}</CalendarGridBody>
    </CalendarGrid>
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
          {cell.isToday && !cell.isSelected && !cell.isOutsideMonth ? (
            <span className="pointer-events-none absolute bottom-1 size-1 rounded-full bg-blue-medium" />
          ) : null}
        </>
      )}
    </CalendarCell>
  );
}

function formatMonths(count: number): string {
  if (count === 1) {
    return "1 miesiąc";
  }
  const last = count % 10;
  const lastTwo = count % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return `${count} miesiące`;
  }
  return `${count} miesięcy`;
}

function formatKilometers(count: number): string {
  const grouped = String(count).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  return `${grouped} km`;
}
