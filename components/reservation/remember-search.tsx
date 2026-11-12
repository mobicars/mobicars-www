"use client";

import { useEffect } from "react";

import type { ReservationTerm } from "@/lib/reservation/search";
import { saveSearchQuery } from "@/lib/reservation/storage";

/** Saves a search opened from a link, so the homepage widget shows it next time. */
export function RememberSearch({ term, query }: { term: ReservationTerm; query: string }) {
  useEffect(() => {
    saveSearchQuery(term, query);
  }, [term, query]);
  return null;
}
