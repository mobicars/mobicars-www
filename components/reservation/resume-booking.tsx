"use client";

import { lazy, Suspense } from "react";

import { useClientOnlyValue } from "@/components/reservation/use-client-only-value";
import { loadBookingDraft } from "@/lib/reservation/storage";

const ResumeBookingBar = lazy(() =>
  import("@/components/reservation/resume-booking-bar").then((module) => ({ default: module.ResumeBookingBar })),
);

const hasDraft = () => loadBookingDraft() !== null;

/**
 * The homepage's "Masz niedokończoną rezerwację" bar. Most visitors have no
 * saved booking, so only this check ships with the page; the bar's code is
 * loaded when a draft is found.
 */
export function ResumeBooking() {
  const draft = useClientOnlyValue(hasDraft);
  return draft ? (
    <Suspense fallback={null}>
      <ResumeBookingBar />
    </Suspense>
  ) : null;
}
