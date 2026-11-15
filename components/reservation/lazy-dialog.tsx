"use client";

import { useEffect } from "react";
import { Dialog } from "react-aria-components";
import { LoaderCircle } from "lucide-react";

import { useMessages } from "@/i18n/messages-context";

/** The first signs of a visitor about to use the page: a touch (also the start of a scroll), a key, a focus. */
const INTENT_EVENTS = ["pointerdown", "keydown", "focusin"] as const;

/**
 * Loads a dialog's module at the visitor's first interaction with the page,
 * so the first open does not wait for it, while the page's own load (what
 * PageSpeed measures on a phone) does not carry it. On a phone the first touch
 * is usually a scroll, well before a tap on the form. Calling the loader again
 * later is free (the module is cached).
 */
export function useIdlePreload(load: () => Promise<unknown>) {
  useEffect(() => {
    const run = () => {
      stop();
      void load().catch(() => undefined);
    };
    const stop = () => INTENT_EVENTS.forEach((type) => window.removeEventListener(type, run, true));
    INTENT_EVENTS.forEach((type) => window.addEventListener(type, run, { capture: true, passive: true }));
    return stop;
  }, [load]);
}

/**
 * What an open dialog shows while its content loads (on a slow connection,
 * when the preload at the first interaction has not finished). A dialog itself, so focus moves into it at once;
 * the content's own dialog takes focus when it arrives.
 */
export function DialogLoading() {
  const texts = useMessages().search;
  return (
    <Dialog aria-label={texts.loading} aria-busy className="flex min-h-48 flex-1 items-center justify-center outline-none">
      <LoaderCircle className="size-6 animate-spin text-blue-medium motion-reduce:animate-none" aria-hidden />
      <span className="sr-only">{texts.loading}</span>
    </Dialog>
  );
}
