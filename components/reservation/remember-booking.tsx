"use client";

import { Suspense, use, useEffect } from "react";

import type { DraftLabels } from "@/lib/reservation/draft-labels";
import type { ReservationSearch } from "@/lib/reservation/search";
import { saveBookingDraft, type BookingDraft, type TripDates } from "@/lib/reservation/storage";

type Props = Omit<BookingDraft, "href" | "dates" | "segmentNames" | "placeNames"> & {
  search: ReservationSearch;
  /** The class and place in every language (`draftLabels`), read on the server without holding up the page. */
  labels: Promise<DraftLabels>;
};

/**
 * On the protection, extras and details steps: keeps the current booking URL
 * for the homepage's "finish your booking" banner. The URL changes as choices
 * are made, so it is saved again whenever the page is left or hidden. It
 * starts saving once the names in every language are there.
 */
export function RememberBooking(props: Props) {
  return (
    <Suspense fallback={null}>
      <Remember {...props} />
    </Suspense>
  );
}

function Remember({ car, segment, image, place, search, labels }: Props) {
  const { segment: segmentNames, place: placeNames } = use(labels);
  // Plain values for the effect's dependencies: `search` is a new object on every render.
  const { term, start } = search;
  const end = search.term === "short" ? search.end : null;
  const months = search.term === "long" ? search.months : null;
  useEffect(() => {
    const dates: TripDates = term === "short" ? { term, start, end: end ?? "" } : { term, start, months: months ?? 1 };
    const save = () =>
      saveBookingDraft({
        href: window.location.pathname + window.location.search,
        car,
        segment,
        image,
        place,
        dates,
        segmentNames,
        placeNames,
      });
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        save();
      }
    };
    save();
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      // Moving to another step or route inside the app also counts as leaving.
      save();
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [car, segment, image, place, term, start, end, months, segmentNames, placeNames]);
  return null;
}
