"use client";

import { useEffect, useState, type RefObject } from "react";
import { CalendarDays, MapPin, Search } from "lucide-react";

import { buttonClass } from "@/components/ui/button";
import { useMessages } from "@/i18n/messages-context";

/**
 * Phones only: once the search form has scrolled up out of sight, a slim bar
 * stays pinned under the header with the chosen place and dates and "Pokaż
 * auta", which submits that form. Tapping the place and dates brings the form
 * back and focuses its first field. One IntersectionObserver, no scroll
 * listener. The header is `sticky top-0 z-40` and 64px high (`.site-header`),
 * so the bar sits at `top-16` one layer below it.
 */
export function StickySearch({
  form,
  formId,
  place,
  dates,
  onEdit,
}: {
  form: RefObject<HTMLFormElement | null>;
  formId: string;
  place: string;
  dates: string;
  onEdit: () => void;
}) {
  const texts = useMessages().search;
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = form.current;
    if (!element) {
      return;
    }
    // Shown only once the form is above the screen, not while it is still below it.
    const observer = new IntersectionObserver(([entry]) => {
      setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [form]);

  return (
    <div
      aria-hidden={!shown}
      inert={!shown}
      className={`fixed inset-x-0 top-16 z-30 border-b border-line bg-white/95 px-gutter py-2 shadow-card backdrop-blur transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none lg:hidden ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5 rounded-control px-1 py-1 text-left text-blue-dark outline-none focus-visible:ring-2 focus-visible:ring-blue-medium"
        >
          <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold">
            <MapPin className="size-4 shrink-0 text-blue-medium" strokeWidth={1.75} aria-hidden />
            <span className="truncate">{place}</span>
          </span>
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-blue-dark/75">
            <CalendarDays className="size-4 shrink-0 text-blue-medium" strokeWidth={1.75} aria-hidden />
            <span className="truncate">{dates}</span>
          </span>
          <span className="sr-only">{texts.changeTrip}</span>
        </button>
        <button type="submit" form={formId} className={buttonClass("primary", "sm", "shrink-0 px-4")}>
          <Search className="size-4" aria-hidden />
          {texts.submit}
        </button>
      </div>
    </div>
  );
}
