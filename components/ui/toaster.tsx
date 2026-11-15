"use client";

import { Toaster as Sonner } from "sonner";

/** Toast outlet of the booking flow (`app/[lang]/reservation/layout.tsx`). Call `toast()` from `sonner` in its client code. */
export function Toaster() {
  return (
    <Sonner
      position="top-center"
      richColors
      closeButton
      duration={6000}
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
      toastOptions={{ classNames: { title: "text-sm font-semibold", description: "text-xs" } }}
    />
  );
}
