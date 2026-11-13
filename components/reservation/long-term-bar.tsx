"use client";

import { useId, useState, type Ref } from "react";
import { Dialog } from "react-aria-components";
import { CalendarCheck2, CalendarRange, Gauge, type LucideIcon } from "lucide-react";

import { BarField, SearchButton, type TermBarProps } from "@/components/reservation/bar-field";
import { DialogHeader, OptionList, WidgetModal } from "@/components/reservation/dialog-parts";
import { PlaceFields } from "@/components/reservation/place-fields";
import { formatSchedulePoint, pointFromValue, valueFromPoint } from "@/components/reservation/schedule";
import { formatKilometers, formatMonths } from "@/components/reservation/format";
import { StartDateDialog } from "@/components/reservation/start-date-dialog";
import { useLang } from "@/i18n/lang-context";
import { useMessages } from "@/i18n/messages-context";
import { reservationConfig } from "@/lib/reservation/config";

/** Monthly rental: place, pickup date, month count and kilometer limit. */
export function LongTermBar({ places, draft, onChange, invalid, fieldRef }: TermBarProps) {
  const lang = useLang();
  const texts = useMessages().search;
  const [datesOpen, setDatesOpen] = useState(false);
  const start = pointFromValue(draft.start);

  return (
    <>
      <div className="overflow-hidden rounded-3xl border-4 border-white bg-blue-medium p-0.5 @5xl:rounded-full">
        <div className="grid w-full min-w-0 grid-cols-1 overflow-hidden rounded-[18px] bg-blue-medium @lg:grid-cols-2 @5xl:grid-cols-[minmax(0,2.2fr)_repeat(3,minmax(0,1fr))_auto] @5xl:rounded-full">
          <PlaceFields
            places={places}
            value={draft}
            onChange={onChange}
            invalid={{ pickup: invalid.has("pickup"), dropoff: invalid.has("dropoff") }}
            pickupRef={fieldRef("pickup")}
            dropoffRef={fieldRef("dropoff")}
          />
          <div className="grid grid-cols-1 @lg:col-span-2 @lg:grid-cols-3 @5xl:contents">
            <BarField
              buttonRef={fieldRef("start")}
              icon={CalendarCheck2}
              label={texts.pickupDateTime}
              value={start ? formatSchedulePoint(lang, start) : texts.chooseDate}
              onClick={() => setDatesOpen(true)}
              invalid={invalid.has("start")}
              className="border-b-2 @lg:border-r-2 @5xl:border-b-0"
            />
            <OptionField
              buttonRef={fieldRef("months")}
              icon={CalendarRange}
              label={texts.monthCount}
              value={draft.months}
              options={reservationConfig.longTermMonthCounts}
              format={(count) => formatMonths(lang, count)}
              onChange={(months) => onChange({ months })}
              invalid={invalid.has("months")}
              className="border-b-2 @lg:border-r-2 @5xl:border-b-0"
            />
            <OptionField
              buttonRef={fieldRef("km")}
              icon={Gauge}
              label={texts.kmLimit}
              value={draft.km}
              options={reservationConfig.kilometerLimits}
              format={(count) => formatKilometers(lang, count)}
              onChange={(km) => onChange({ km })}
              invalid={invalid.has("km")}
              className="border-b-2 @5xl:border-r-2 @5xl:border-b-0"
            />
          </div>
          <SearchButton />
        </div>
      </div>
      <StartDateDialog
        open={datesOpen}
        start={start}
        onOpenChange={setDatesOpen}
        onConfirm={(next) => onChange({ start: valueFromPoint(next.date, next.time) })}
      />
    </>
  );
}

function OptionField({
  buttonRef,
  icon,
  label,
  value,
  options,
  format,
  onChange,
  invalid,
  className,
}: {
  buttonRef: Ref<HTMLButtonElement>;
  icon: LucideIcon;
  label: string;
  value: number | null;
  options: readonly number[];
  format: (value: number) => string;
  onChange: (value: number) => void;
  invalid: boolean;
  className: string;
}) {
  const titleId = useId();
  const texts = useMessages().search;
  const [open, setOpen] = useState(false);

  return (
    <>
      <BarField
        buttonRef={buttonRef}
        icon={icon}
        label={label}
        value={value === null ? texts.choose : format(value)}
        onClick={() => setOpen(true)}
        invalid={invalid}
        className={className}
      />
      <WidgetModal
        open={open}
        onOpenChange={setOpen}
        className="max-h-[min(36rem,calc(100dvh-1.5rem))] w-[min(24rem,calc(100%-1.5rem))] rounded-2xl shadow-2xl"
      >
        <Dialog
          aria-labelledby={titleId}
          className="grid max-h-[inherit] min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden outline-none"
        >
          <DialogHeader titleId={titleId} title={label} className="py-4" />
          <OptionList
            labelledBy={titleId}
            options={options}
            isSelected={(option) => option === value}
            getKey={String}
            format={format}
            onSelect={(option) => {
              onChange(option);
              setOpen(false);
            }}
          />
        </Dialog>
      </WidgetModal>
    </>
  );
}
