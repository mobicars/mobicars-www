"use client";

import { useContext, useEffect, useRef, type ReactElement, type ReactNode } from "react";
import {
  Button,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarStateContext,
  ModalOverlay,
  Modal,
  RangeCalendarStateContext,
} from "react-aria-components";
import type { CalendarDate } from "@internationalized/date";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { reservationConfig } from "@/lib/reservation/config";

/** Building blocks shared by the widget dialogs: place, dates, start date, options. */

export function WidgetModal({
  open,
  onOpenChange,
  className,
  layer = "base",
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className: string;
  /** `nested` stacks above another widget dialog, e.g. the hour list over the calendar. */
  layer?: "base" | "nested";
  children: ReactNode;
}) {
  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={onOpenChange}
      isDismissable
      className={`pickup-overlay fixed inset-0 flex bg-black/50 ${layer === "nested" ? "z-[70]" : "z-50"}`}
    >
      <Modal className={`pickup-modal m-auto flex flex-col overflow-hidden bg-white text-blue-dark outline-none ${className}`}>
        {children}
      </Modal>
    </ModalOverlay>
  );
}

export function DialogHeader({
  titleId,
  title,
  className = "pt-4 pb-2",
}: {
  titleId: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={`relative shrink-0 px-12 ${className}`}>
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
  );
}

const navButton =
  "flex size-9 cursor-pointer items-center justify-center rounded-full border border-blue-dark/15 transition-colors duration-200 ease-out hover:bg-blue-dark/[0.04] disabled:opacity-30 motion-reduce:transition-none";

/** Previous and next month. Must sit inside a `Calendar` or `RangeCalendar`. */
export function CalendarNav() {
  return (
    <div className="flex shrink-0 justify-end gap-2 px-5 pb-2">
      <Button slot="previous" aria-label="Poprzedni miesiąc" className={navButton}>
        <ChevronLeft className="size-4" aria-hidden />
      </Button>
      <Button slot="next" aria-label="Następny miesiąc" className={navButton}>
        <ChevronRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}

/** Month name above a grid. Works in both `Calendar` and `RangeCalendar`. */
export function MonthLabel({ offsetMonths = 0 }: { offsetMonths?: number }) {
  const range = useContext(RangeCalendarStateContext);
  const single = useContext(CalendarStateContext);
  const state = range ?? single;
  if (!state) {
    return null;
  }
  const date = state.visibleRange.start.add({ months: offsetMonths });
  const name = new Intl.DateTimeFormat("pl-PL", {
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

/**
 * Vertical list of choices with the selected one scrolled into view.
 * Picking an option calls `onSelect`; the caller closes the dialog.
 */
export function OptionList<T>({
  options,
  isSelected,
  getKey,
  format,
  onSelect,
  empty,
}: {
  options: readonly T[];
  isSelected: (option: T) => boolean;
  getKey: (option: T) => string | number;
  format: (option: T) => string;
  onSelect: (option: T) => void;
  empty?: string;
}) {
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      selectedRef.current?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4">
      {options.length === 0 ? (
        <p className="py-6 text-center text-sm text-blue-dark/60">{empty}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {options.map((option) => {
            const selected = isSelected(option);
            return (
              <button
                key={getKey(option)}
                ref={selected ? selectedRef : undefined}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(option)}
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
      )}
    </div>
  );
}

/** Primary dialog action, e.g. "Zatwierdź wybór". */
export function ConfirmButton({
  disabled,
  onClick,
  children,
}: {
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="h-12 shrink-0 cursor-pointer rounded-xl bg-blue-medium px-6 text-base font-bold text-white transition-colors duration-200 ease-out hover:bg-blue-dark disabled:cursor-default disabled:opacity-40 disabled:hover:bg-blue-medium motion-reduce:transition-none md:px-8"
    >
      {children}
    </button>
  );
}
