"use client";

import { SelectionIndicator, Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { LongTermBar } from "@/components/reservation-long-term";
import type { PickupPlace } from "@/components/reservation-places";
import { ShortTermBar } from "@/components/reservation-short-term";

export type { PickupPlace } from "@/components/reservation-places";

export type ReservationPickerLayout = "vertical" | "horizontal";
export type ReservationTerm = "short" | "long";

type ReservationPickerProps = {
  layout?: ReservationPickerLayout;
  places?: PickupPlace[];
  /** Bez tej wartości widać przełącznik i oba paski. */
  type?: ReservationTerm;
};

const tabClassName =
  "relative flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-full px-3 text-xs font-bold tracking-wide text-blue-dark/65 outline-none transition-colors duration-200 ease-out hover:bg-muted-light data-selected:text-white data-selected:hover:bg-transparent data-focus-visible:ring-2 data-focus-visible:ring-blue-medium data-focus-visible:ring-inset motion-reduce:transition-none @5xl:flex-none @5xl:px-6";

export function ReservationPicker({
  layout = "vertical",
  places = [],
  type,
}: ReservationPickerProps) {
  const shell = layout === "horizontal" ? "w-full" : "mx-auto w-full max-w-[28rem]";

  return (
    <div className={`@container min-w-0 ${shell}`}>
      {type ? (
        <SingleTerm places={places} type={type} />
      ) : (
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
      )}
    </div>
  );
}

function SingleTerm({ places, type }: { places: PickupPlace[]; type: ReservationTerm }) {
  return type === "short" ? <ShortTermBar places={places} /> : <LongTermBar places={places} />;
}
