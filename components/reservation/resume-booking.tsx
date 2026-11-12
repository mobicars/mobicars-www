"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarClock, X } from "lucide-react";

import { pointFromValue, isSlotPast } from "@/components/reservation/schedule";
import { useClientOnlyValue } from "@/components/reservation/use-client-only-value";
import { buttonClass } from "@/components/ui/button";
import { useMessages } from "@/i18n/messages-context";
import { clearBookingDraft, loadBookingDraft, type BookingDraft } from "@/lib/reservation/storage";

/**
 * Homepage banner for a booking left part way (see `RememberBooking`). Shown
 * only while its pickup can still be booked; hiding it forgets the draft.
 */
export function ResumeBooking() {
  const t = useMessages().booking.resume;
  const [hidden, setHidden] = useState(false);
  const draft = useClientOnlyValue(stillBookable);

  if (!draft || hidden) {
    return null;
  }

  return (
    <aside className="relative mb-4 flex flex-col gap-3 rounded-2xl bg-white p-4 pr-12 shadow-lg sm:flex-row sm:items-center sm:gap-4 sm:pr-14">
      <span className="hidden size-11 shrink-0 items-center justify-center rounded-full bg-green-light text-green-medium sm:flex">
        <CalendarClock className="size-6" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-blue-dark">{t.title}</p>
        <p className="text-sm text-muted-dark">
          {draft.car} · {draft.dates}
        </p>
      </div>
      <Link href={draft.href} className={buttonClass("success", "md", "w-full sm:w-auto")}>
        {t.button}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
      <button
        type="button"
        onClick={() => {
          clearBookingDraft();
          setHidden(true);
        }}
        aria-label={t.dismiss}
        title={t.dismiss}
        className="absolute top-2 right-2 flex size-9 items-center justify-center rounded-full text-muted-dark hover:bg-gray-100 hover:text-blue-dark"
      >
        <X className="size-5" aria-hidden />
      </button>
    </aside>
  );
}

function stillBookable(): BookingDraft | null {
  const draft = loadBookingDraft();
  const point = draft ? pointFromValue(draft.start) : null;
  if (!draft || !point || isSlotPast(point.date, point.time)) {
    return null;
  }
  return draft;
}
