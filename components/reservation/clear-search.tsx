"use client";

import { useEffect } from "react";

import { clearSearch } from "@/lib/reservation/storage";

/** On the thank-you page: the booked search is not offered again on the next visit. */
export function ClearSearch() {
  useEffect(() => clearSearch(), []);
  return null;
}
