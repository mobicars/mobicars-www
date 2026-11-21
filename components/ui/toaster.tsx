"use client";

import { Toaster as Sonner } from "sonner";

/**
 * Toast outlet of the booking flow (`app/[lang]/reservation/layout.tsx`). Call `toast()` from `sonner` in its client code.
 *
 * Under the sticky header, whatever its height (`--site-header`: the top bar and the announcement come and go), not
 * over it: at sonner's own 24px the toast covered the menu and read as part of the header. On phones too, as the
 * booking's price bar holds the bottom of the screen.
 *
 * In the site's look rather than sonner's pastel `richColors`: a white card with the cards' 1px frame and radius,
 * navy text, the icon in the state's colour (green for done, red for an error).
 */
const OFFSET = { top: "calc(var(--site-header, 5rem) + 0.75rem)" };

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      offset={OFFSET}
      mobileOffset={{ ...OFFSET, left: "1rem", right: "1rem" }}
      closeButton
      duration={6000}
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
      toastOptions={{
        classNames: {
          toast: "items-start! gap-3! rounded-card! border! border-line! bg-white! px-4! py-3.5! text-blue-dark! shadow-card!",
          title: "text-sm! leading-snug! font-semibold! text-blue-dark!",
          description: "text-xs! text-blue-dark/75!",
          icon: "mt-0.5",
          success: "[&_[data-icon]]:text-go-strong",
          error: "[&_[data-icon]]:text-red-600",
          info: "[&_[data-icon]]:text-blue-medium",
          warning: "[&_[data-icon]]:text-amber-600",
          closeButton: "border-line! bg-white! text-blue-dark/60! hover:text-blue-dark!",
        },
      }}
    />
  );
}
