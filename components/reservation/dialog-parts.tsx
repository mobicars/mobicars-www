"use client";

import { useContext, useEffect, useId, useRef, type ReactElement, type ReactNode } from "react";
import {
  Button,
  Dialog,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarStateContext,
  ListBox,
  ListBoxItem,
  ModalOverlay,
  Modal,
  RangeCalendarStateContext,
} from "react-aria-components";
import type { CalendarDate } from "@internationalized/date";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { buttonClass } from "@/components/ui/button";
import { intlLocales } from "@/i18n/config";
import { useLang } from "@/i18n/lang-context";
import { useMessages } from "@/i18n/messages-context";
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
      className={`pickup-overlay fixed inset-0 flex bg-blue-dark/40 backdrop-blur-[4px] ${layer === "nested" ? "z-[70]" : "z-50"}`}
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
  const texts = useMessages().search;
  return (
    <div className={`relative shrink-0 px-12 ${className}`}>
      <h2 id={titleId} className="text-center text-lg font-semibold">
        {title}
      </h2>
      <Button
        slot="close"
        aria-label={texts.close}
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

/**
 * Vertical list of choices with the selected one scrolled into view: a React
 * Aria list box, so it is one tab stop, arrow keys move through the choices,
 * typing jumps to one ("1" then "4" for 14:00) and the choice is read out as
 * selected. Picking an option, the chosen one too, calls `onSelect`; the
 * caller closes the dialog.
 */
export function OptionList<T>({
  options,
  isSelected,
  getKey,
  format,
  onSelect,
  empty,
  labelledBy,
}: {
  options: readonly T[];
  isSelected: (option: T) => boolean;
  getKey: (option: T) => string | number;
  format: (option: T) => string;
  onSelect: (option: T) => void;
  empty?: string;
  /** Id of the dialog title, which names the list. */
  labelledBy: string;
}) {
  const list = useRef<HTMLDivElement>(null);
  const selected = options.find(isSelected);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      list.current?.querySelector("[aria-selected='true']")?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4">
      {options.length === 0 ? (
        <p className="py-6 text-center text-sm text-blue-dark/60">{empty}</p>
      ) : (
        <ListBox
          ref={list}
          aria-labelledby={labelledBy}
          selectionMode="single"
          selectedKeys={selected === undefined ? [] : [getKey(selected)]}
          onSelectionChange={(keys) => {
            const [key] = keys === "all" ? [] : keys;
            // An empty selection is the chosen option pressed again: it is picked once more.
            const option = key === undefined ? selected : options.find((item) => getKey(item) === key);
            if (option !== undefined) {
              onSelect(option);
            }
          }}
          className="flex flex-col gap-2 outline-none"
        >
          {options.map((option) => (
            <ListBoxItem
              key={getKey(option)}
              id={getKey(option)}
              textValue={format(option)}
              className={({ isSelected: chosen }) =>
                `flex h-12 w-full cursor-pointer items-center justify-center rounded-xl border text-base outline-none transition-colors duration-200 ease-out data-focus-visible:ring-2 data-focus-visible:ring-blue-medium data-focus-visible:ring-offset-2 motion-reduce:transition-none ${
                  chosen
                    ? "border-blue-medium bg-blue-medium font-bold text-white hover:bg-blue-dark"
                    : "border-blue-dark/15 hover:border-blue-dark/25 hover:bg-blue-dark/[0.03]"
                }`
              }
            >
              {format(option)}
            </ListBoxItem>
          ))}
        </ListBox>
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
    <button type="button" disabled={disabled} onClick={onClick} className={buttonClass("primary", "md", "md:px-8")}>
      {children}
    </button>
  );
}

/**
 * The cancel/confirm pair at the bottom of a question dialog. Full width and
 * stacked on phones (confirm on top), side by side from `sm`.
 */
export function DialogActions({
  cancel,
  confirm,
  onCancel,
  onConfirm,
}: {
  cancel: ReactNode;
  confirm: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex w-full flex-col-reverse gap-2 sm:flex-row">
      <button type="button" onClick={onCancel} className={buttonClass("secondary", "md", "w-full sm:w-auto sm:flex-1")}>
        {cancel}
      </button>
      <button type="button" onClick={onConfirm} className={buttonClass("primary", "md", "w-full sm:w-auto sm:flex-1")}>
        {confirm}
      </button>
    </div>
  );
}

/**
 * A yes/no question before a change to the booking, e.g. "Czy chcesz zmienić
 * klasę auta?". Closing it with × or a click outside counts as no.
 */
export function ConfirmQuestion({
  open,
  title,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const t = useMessages().upsell;
  const titleId = useId();
  return (
    <WidgetModal
      open={open}
      onOpenChange={(next) => (next ? undefined : onCancel())}
      className="w-[min(30rem,calc(100%-1.5rem))] rounded-2xl shadow-2xl"
    >
      <Dialog aria-labelledby={titleId} className="flex flex-col outline-none">
        <DialogHeader titleId={titleId} title={title} className="pt-4 pb-4" />
        <div className="px-5 pb-5">
          <DialogActions cancel={t.cancel} confirm={t.confirm} onCancel={onCancel} onConfirm={onConfirm} />
        </div>
      </Dialog>
    </WidgetModal>
  );
}
