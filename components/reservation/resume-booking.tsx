"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dialog } from "react-aria-components";
import { CalendarDays, MapPin } from "lucide-react";

import { DialogActions, DialogHeader, WidgetModal } from "@/components/reservation/dialog-parts";
import { isSlotPast, pointFromValue } from "@/components/reservation/schedule";
import { useClientOnlyValue } from "@/components/reservation/use-client-only-value";
import { fill } from "@/i18n/fill";
import { useMessages } from "@/i18n/messages-context";
import { clearBookingDraft, loadBookingDraft, type BookingDraft } from "@/lib/reservation/storage";

/**
 * Homepage popup for a booking left part way (see `RememberBooking`). Shown
 * only while its pickup can still be booked. "Wróć" opens the booking where it
 * was left; "Nie, dziękuję" forgets it. Closing with × or outside only hides it
 * for this visit.
 */
export function ResumeBooking() {
  const t = useMessages().booking.resume;
  const router = useRouter();
  const titleId = useId();
  const [closed, setClosed] = useState(false);
  const draft = useClientOnlyValue(stillBookable);

  function decline() {
    clearBookingDraft();
    setClosed(true);
  }

  return (
    <WidgetModal
      open={draft !== null && !closed}
      onOpenChange={(open) => setClosed(!open)}
      className="w-[min(28rem,calc(100%-1.5rem))] rounded-2xl shadow-2xl"
    >
      <Dialog aria-labelledby={titleId} className="flex flex-col outline-none">
        <DialogHeader titleId={titleId} title={t.title} className="pt-4 pb-1" />
        {draft ? (
          <div className="flex flex-col gap-4 px-5 pb-5">
            {draft.image ? (
              <span className="relative block h-40 w-full">
                <Image src={draft.image} alt="" fill sizes="(min-width: 640px) 400px, 90vw" className="object-contain" />
              </span>
            ) : null}
            <div className="text-center">
              <p className="text-lg font-semibold">{draft.car}</p>
              <p className="text-xs text-muted-dark">{fill(t.orSimilar, { segment: draft.segment })}</p>
            </div>
            <dl className="flex flex-col gap-2 rounded-xl bg-blue-dark/[0.03] p-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-blue-medium" aria-hidden />
                <dt className="sr-only">{t.pickup}</dt>
                <dd>{draft.place}</dd>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-blue-medium" aria-hidden />
                <dt className="sr-only">{t.dates}</dt>
                <dd>{draft.dates}</dd>
              </div>
            </dl>
            <p className="text-center text-sm text-blue-dark/80">{t.text}</p>
            <DialogActions
              cancel={t.decline}
              confirm={t.back}
              onCancel={decline}
              onConfirm={() => router.push(draft.href)}
            />
          </div>
        ) : null}
      </Dialog>
    </WidgetModal>
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
