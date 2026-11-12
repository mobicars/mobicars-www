"use client";

import { useEffect } from "react";

import { saveBookingDraft, type BookingDraft } from "@/lib/reservation/storage";

/**
 * On the protection, extras and details steps: keeps the current booking URL
 * for the homepage's "finish your booking" banner. The URL changes as choices
 * are made, so it is saved again whenever the page is left or hidden.
 */
export function RememberBooking({ car, segment, image, place, dates, start }: Omit<BookingDraft, "href">) {
  useEffect(() => {
    const save = () =>
      saveBookingDraft({
        href: window.location.pathname + window.location.search,
        car,
        segment,
        image,
        place,
        dates,
        start,
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
  }, [car, segment, image, place, dates, start]);
  return null;
}
