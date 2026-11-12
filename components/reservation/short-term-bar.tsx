"use client";

import { useState } from "react";
import { CalendarCheck2, CalendarMinus } from "lucide-react";

import { BarField, SearchButton, type TermBarProps } from "@/components/reservation/bar-field";
import { ReservationDatesDialog } from "@/components/reservation/dates-dialog";
import { PlaceFields } from "@/components/reservation/place-fields";
import {
  formatSchedulePoint,
  pointFromValue,
  valueFromPoint,
  type ReservationSchedule,
} from "@/components/reservation/schedule";
import { useLang } from "@/i18n/lang-context";
import { useMessages } from "@/i18n/messages-context";

/** Daily rental: place, pickup and return date. */
export function ShortTermBar({ places, draft, onChange, invalid, fieldRef }: TermBarProps) {
  const lang = useLang();
  const texts = useMessages().search;
  const [datesOpen, setDatesOpen] = useState(false);
  const start = pointFromValue(draft.start);
  const end = pointFromValue(draft.end);
  const schedule: ReservationSchedule | null =
    start && end ? { start: start.date, end: end.date, pickup: start.time, dropoff: end.time } : null;

  return (
    <>
      <div className="overflow-hidden rounded-3xl border-4 border-white bg-blue-medium p-0.5 @5xl:rounded-full">
        <div className="grid w-full min-w-0 grid-cols-1 overflow-hidden rounded-[18px] bg-blue-medium @lg:grid-cols-2 @5xl:grid-cols-[minmax(0,2.4fr)_minmax(0,1.15fr)_minmax(0,1.15fr)_auto] @5xl:rounded-full">
          <PlaceFields
            places={places}
            value={draft}
            onChange={onChange}
            invalid={{ pickup: invalid.has("pickup"), dropoff: invalid.has("dropoff") }}
            pickupRef={fieldRef("pickup")}
            dropoffRef={fieldRef("dropoff")}
          />
          <BarField
            buttonRef={fieldRef("start")}
            icon={CalendarCheck2}
            label={texts.pickupDateTime}
            value={start ? formatSchedulePoint(lang, start) : texts.chooseDate}
            onClick={() => setDatesOpen(true)}
            invalid={invalid.has("start")}
            className="border-b-2 @lg:border-r-2 @5xl:border-b-0"
          />
          <BarField
            buttonRef={fieldRef("end")}
            icon={CalendarMinus}
            label={texts.returnDateTime}
            value={end ? formatSchedulePoint(lang, end) : texts.chooseDate}
            onClick={() => setDatesOpen(true)}
            invalid={invalid.has("end")}
            className="border-b-2 @5xl:border-b-0"
          />
          <SearchButton />
        </div>
      </div>
      <ReservationDatesDialog
        open={datesOpen}
        schedule={schedule}
        onOpenChange={setDatesOpen}
        onConfirm={(next) =>
          onChange({
            start: valueFromPoint(next.start, next.pickup),
            end: valueFromPoint(next.end, next.dropoff),
          })
        }
      />
    </>
  );
}
