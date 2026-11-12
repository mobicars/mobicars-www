"use client";

import { Toaster as Sonner } from "sonner";

/** Toast outlet for the whole site. Call `toast()` from `sonner` anywhere on the client. */
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
