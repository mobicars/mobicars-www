"use client";

import { X } from "lucide-react";

export function AnnouncementClose({
  barId,
  storageKey,
  version,
  label,
}: {
  barId: string;
  storageKey: string;
  version: string;
  label: string;
}) {
  const close = () => {
    try {
      window.localStorage.setItem(storageKey, version);
    } catch {
      // Storage is unavailable: the bar closes for this page view only.
    }
    const bar = document.getElementById(barId);
    if (bar) {
      bar.hidden = true;
    }
    // The button just disappeared with the bar: keep keyboard focus at the top
    // of the page instead of letting it fall back to <body>.
    document.querySelector<HTMLElement>("header a")?.focus();
  };
  return (
    <button
      type="button"
      onClick={close}
      className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white sm:right-4"
    >
      <X className="size-4" aria-hidden />
      <span className="sr-only">{label}</span>
    </button>
  );
}
