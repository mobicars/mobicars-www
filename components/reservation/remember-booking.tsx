"use client";

import { Suspense, use, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

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
 * are made, so it is saved again with each change and whenever the page is
 * left or hidden. It starts saving once the names in every language are there.
 *
 * The URL comes from the router, not `window.location`: when the visitor
 * leaves the booking inside the app (the menu's "Samochody"), the window
 * already shows the next page by the time this unmounts, and the banner's
 * button then led to `/flota` instead of the booking.
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
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const href = query ? `${pathname}?${query}` : pathname;
  useEffect(() => {
    const dates: TripDates = term === "short" ? { term, start, end: end ?? "" } : { term, start, months: months ?? 1 };
    const save = () =>
      saveBookingDraft({
        href,
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
  }, [href, car, segment, image, place, term, start, end, months, segmentNames, placeNames]);
  return null;
}
