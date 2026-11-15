"use client";

import { lazy, Suspense } from "react";

import { WidgetModal } from "@/components/reservation/dialog-parts";
import { DialogLoading, useIdlePreload } from "@/components/reservation/lazy-dialog";
import type { StartDateDialogProps } from "@/components/reservation/start-date-dialog-body";

const load = () => import("@/components/reservation/start-date-dialog-body");
/** The calendar is loaded on the first open (or when the browser is idle), not with the page. */
const StartDateDialogBody = lazy(() => load().then((module) => ({ default: module.StartDateDialogBody })));

/** Pickup day and hour, for the monthly rental. It has no return date. */
export function StartDateDialog({ open, ...props }: StartDateDialogProps) {
  useIdlePreload(load);
  return (
    <WidgetModal
      open={open}
      onOpenChange={props.onOpenChange}
      className="h-dvh max-h-dvh w-full max-w-none sm:h-auto sm:max-h-[calc(100dvh-1.5rem)] sm:w-[min(24rem,calc(100%-1.5rem))] sm:rounded-2xl sm:shadow-2xl"
    >
      <Suspense fallback={<DialogLoading />}>
        <StartDateDialogBody {...props} />
      </Suspense>
    </WidgetModal>
  );
}
