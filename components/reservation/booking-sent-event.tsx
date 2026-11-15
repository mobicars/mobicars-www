"use client";

import { useEffect } from "react";

import { track } from "@/lib/reservation/analytics";
import type { ReservationTerm } from "@/lib/reservation/search";

/**
 * `generate_lead` for the thank-you page, once per booking: a refresh within
 * the receipt's two hours would count it again, so the sent key is kept in
 * `sessionStorage`. Without storage (private mode) a refresh may repeat it.
 */
export function BookingSentEvent({
  bookingKey,
  total,
  term,
  protection,
  extrasCount,
}: {
  /** The reservation id, or the total and car when create returned none. */
  bookingKey: string;
  total: number;
  term: ReservationTerm;
  protection: string | null;
  extrasCount: number;
}) {
  useEffect(() => {
    const storageKey = `mobicars:lead-sent:${bookingKey}`;
    try {
      if (sessionStorage.getItem(storageKey)) {
        return;
      }
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // Storage blocked: send anyway.
    }
    track("booking_step", { step: "confirmation", term });
    track("generate_lead", {
      currency: "PLN",
      value: total,
      term,
      booking_id: bookingKey,
      protection,
      extras_count: extrasCount,
    });
  }, [bookingKey, total, term, protection, extrasCount]);
  return null;
}
