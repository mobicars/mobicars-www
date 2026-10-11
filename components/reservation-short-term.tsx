"use client";

import { useState } from "react";
import { CalendarCheck2, CalendarMinus, Search } from "lucide-react";
import { PlaceFields, type PickupPlace } from "@/components/reservation-places";
import {
  ReservationDatesDialog,
  defaultShortTermSchedule,
  formatSchedulePoint,
  useClientOnlyValue,
  type ReservationSchedule,
} from "@/components/reservation-dates";

export function ShortTermBar({ places }: { places: PickupPlace[] }) {
  const [datesOpen, setDatesOpen] = useState(false);
  const [schedule, setSchedule] = useState<ReservationSchedule | null>(null);
  const defaultSchedule = useClientOnlyValue(defaultShortTermSchedule);
  const activeSchedule = schedule ?? defaultSchedule;

  return (
    <>
      <div className="overflow-hidden rounded-3xl border-4 border-white bg-blue-medium p-0.5 @5xl:rounded-full">
        <div className="grid w-full min-w-0 grid-cols-1 overflow-hidden rounded-[18px] bg-blue-medium @lg:grid-cols-2 @5xl:grid-cols-[minmax(0,2.4fr)_minmax(0,1.15fr)_minmax(0,1.15fr)_auto] @5xl:rounded-full">
          <PlaceFields places={places} />
          <button
            type="button"
            onClick={() => setDatesOpen(true)}
            className="flex min-h-16 min-w-0 cursor-pointer items-center gap-3 border-b-2 border-blue-medium bg-white px-4 py-3 text-left transition-colors duration-200 ease-out hover:bg-[color-mix(in_srgb,var(--color-blue-dark)_4%,white)] motion-reduce:transition-none @lg:border-r-2 @5xl:border-b-0 @5xl:px-5"
          >
            <CalendarCheck2
              className="size-5 shrink-0 text-blue-medium"
              strokeWidth={1.75}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block truncate text-xxs text-blue-dark/55">
                Data i godzina odbioru
              </span>
              <span className="block truncate text-xs font-bold text-blue-dark">
                {activeSchedule
                  ? formatSchedulePoint(activeSchedule.start, activeSchedule.pickup)
                  : "Wybierz datę"}
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setDatesOpen(true)}
            className="flex min-h-16 min-w-0 cursor-pointer items-center gap-3 border-b-2 border-blue-medium bg-white px-4 py-3 text-left transition-colors duration-200 ease-out hover:bg-[color-mix(in_srgb,var(--color-blue-dark)_4%,white)] motion-reduce:transition-none @5xl:border-b-0 @5xl:px-5"
          >
            <CalendarMinus
              className="size-5 shrink-0 text-blue-medium"
              strokeWidth={1.75}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block truncate text-xxs text-blue-dark/55">
                Data i godzina zwrotu
              </span>
              <span className="block truncate text-xs font-bold text-blue-dark">
                {activeSchedule
                  ? formatSchedulePoint(
                      activeSchedule.end,
                      activeSchedule.dropoff,
                    )
                  : "Wybierz datę"}
              </span>
            </span>
          </button>
          <div className="bg-blue-medium @lg:col-span-2 @5xl:col-span-1">
            <div className="flex min-h-12 items-center justify-center gap-2 bg-blue-medium px-5 text-sm font-bold text-white @5xl:h-full @5xl:px-6">
              <Search className="size-5" strokeWidth={1.75} aria-hidden />
              Szukaj
            </div>
          </div>
        </div>
      </div>
      <ReservationDatesDialog
        open={datesOpen}
        schedule={activeSchedule}
        onOpenChange={setDatesOpen}
        onConfirm={setSchedule}
      />
    </>
  );
}
