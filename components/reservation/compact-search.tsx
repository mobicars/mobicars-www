"use client";

import { useState, type ReactNode } from "react";
import { CalendarDays, ChevronUp, MapPin, Pencil } from "lucide-react";

import type { CompactTrip } from "@/components/reservation/trip";

/**
 * Below `lg` the search widget on a results page folds into one tappable line
 * (place, dates), so the cars and the steps start on the first screen. A tap
 * unfolds the full widget; from `lg` it is always open. The widget stays
 * mounted either way, so its live updates and dialogs keep working.
 */
export function CompactSearch({ trip, children }: { trip: CompactTrip; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open ? null : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left text-blue-dark shadow-lg transition-shadow duration-200 ease-out active:shadow-md motion-reduce:transition-none lg:hidden"
        >
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
              <MapPin className="size-4 shrink-0 text-blue-medium" strokeWidth={1.75} aria-hidden />
              <span className="truncate">{trip.place}</span>
            </span>
            <span className="flex min-w-0 items-center gap-2 text-sm">
              <CalendarDays className="size-4 shrink-0 text-blue-medium" strokeWidth={1.75} aria-hidden />
              <span className="truncate">{trip.dates}</span>
            </span>
          </span>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-light text-blue-medium">
            <Pencil className="size-4" aria-hidden />
            <span className="sr-only">Zmień miejsce lub termin</span>
          </span>
        </button>
      )}
      <div className={open ? "" : "hidden lg:block"}>
        {children}
        {open ? (
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-expanded
            className="mx-auto mt-3 flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold text-white/90 hover:text-white lg:hidden"
          >
            <ChevronUp className="size-4" aria-hidden />
            Zwiń
          </button>
        ) : null}
      </div>
    </>
  );
}
