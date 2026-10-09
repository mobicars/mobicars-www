"use client";

import { useState } from "react";
import { SelectionIndicator, Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { CalendarCheck2, CalendarMinus, Search } from "lucide-react";
import { LongTermBar } from "@/components/reservation-long-term";
import { PlaceFields, type PickupPlace } from "@/components/reservation-places";
import {
  ReservationDatesDialog,
  formatSchedulePoint,
  type ReservationSchedule,
} from "@/components/reservation-dates";

export type { PickupPlace } from "@/components/reservation-places";

export type ReservationPickerLayout = "vertical" | "horizontal";

type ReservationPickerProps = {
  layout?: ReservationPickerLayout;
  places?: PickupPlace[];
};

const tabClassName =
  "relative flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-full px-3 text-xs font-bold tracking-wide text-blue-dark/65 outline-none transition-colors duration-200 ease-out hover:bg-muted-light data-selected:text-white data-selected:hover:bg-transparent data-focus-visible:ring-2 data-focus-visible:ring-blue-medium data-focus-visible:ring-inset motion-reduce:transition-none @5xl:flex-none @5xl:px-6";

export function ReservationPicker({ layout = "vertical", places = [] }: ReservationPickerProps) {
  return (
    <div
      className={`@container min-w-0 ${
        layout === "horizontal" ? "w-full" : "mx-auto w-full max-w-[28rem]"
      }`}
    >
      <Tabs className="flex w-full min-w-0 flex-col gap-3 outline-none">
        <TabList
          aria-label="Rodzaj wynajmu"
          className="flex w-full rounded-full bg-white p-1 @5xl:inline-flex @5xl:w-fit"
        >
          <Tab id="days" className={tabClassName}>
            <span className="relative z-10">NA DNI</span>
            <SelectionIndicator className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full rounded-full bg-blue-medium transition-[translate,width,height] duration-200 ease-out motion-reduce:transition-none" />
          </Tab>
          <Tab id="months" className={tabClassName}>
            <span className="relative z-10">NA MIESIĄCE</span>
            <SelectionIndicator className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full rounded-full bg-blue-medium transition-[translate,width,height] duration-200 ease-out motion-reduce:transition-none" />
          </Tab>
        </TabList>
        <TabPanel id="days" shouldForceMount className="data-inert:hidden">
          <ShortTermBar places={places} />
        </TabPanel>
        <TabPanel id="months" shouldForceMount className="data-inert:hidden">
          <LongTermBar places={places} />
        </TabPanel>
      </Tabs>
    </div>
  );
}

function ShortTermBar({ places }: { places: PickupPlace[] }) {
  const [datesOpen, setDatesOpen] = useState(false);
  const [schedule, setSchedule] = useState<ReservationSchedule | null>(null);

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
            <CalendarCheck2 className="size-5 shrink-0 text-blue-medium" strokeWidth={1.75} aria-hidden />
            <span className="min-w-0">
              <span className="block truncate text-xxs text-blue-dark/55">Data i godzina odbioru</span>
              <span className="block truncate text-xs font-bold text-blue-dark">
                {schedule ? formatSchedulePoint(schedule.start, schedule.pickup) : "Wybierz datę"}
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setDatesOpen(true)}
            className="flex min-h-16 min-w-0 cursor-pointer items-center gap-3 border-b-2 border-blue-medium bg-white px-4 py-3 text-left transition-colors duration-200 ease-out hover:bg-[color-mix(in_srgb,var(--color-blue-dark)_4%,white)] motion-reduce:transition-none @5xl:border-b-0 @5xl:px-5"
          >
            <CalendarMinus className="size-5 shrink-0 text-blue-medium" strokeWidth={1.75} aria-hidden />
            <span className="min-w-0">
              <span className="block truncate text-xxs text-blue-dark/55">Data i godzina zwrotu</span>
              <span className="block truncate text-xs font-bold text-blue-dark">
                {schedule ? formatSchedulePoint(schedule.end, schedule.dropoff) : "Wybierz datę"}
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
        schedule={schedule}
        onOpenChange={setDatesOpen}
        onConfirm={setSchedule}
      />
    </>
  );
}
