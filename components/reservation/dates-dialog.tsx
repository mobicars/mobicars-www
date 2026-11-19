"use client";

import { lazy, Suspense } from "react";

import { WidgetModal } from "@/components/reservation/dialog-parts";
import { DialogLoading, useIdlePreload } from "@/components/reservation/lazy-dialog";
import type { ReservationDatesDialogProps } from "@/components/reservation/dates-dialog-body";

const load = () => import("@/components/reservation/dates-dialog-body");
/** The calendar is loaded on the first open (or when the browser is idle), not with the page. */
const DatesDialogBody = lazy(() => load().then((module) => ({ default: module.DatesDialogBody })));

/** Pickup and return day with their hours, for the daily rental. */
export function ReservationDatesDialog({ open, ...props }: ReservationDatesDialogProps) {
  useIdlePreload(load);
  return (
    <WidgetModal
      open={open}
      onOpenChange={props.onOpenChange}
      className="h-dvh max-h-dvh w-full max-w-none sm:h-auto sm:max-h-[calc(100dvh-1.5rem)] sm:w-[min(42rem,calc(100%-1.5rem))] sm:rounded-card sm:shadow-float"
    >
      <Suspense fallback={<DialogLoading />}>
        <DatesDialogBody {...props} />
      </Suspense>
    </WidgetModal>
  );
}
