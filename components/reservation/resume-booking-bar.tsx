"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "react-aria-components";
import { X } from "lucide-react";

import { formatTripDates, isSlotPast, pointFromValue } from "@/components/reservation/schedule";
import { buttonClass } from "@/components/ui/button";
import type { Lang } from "@/i18n/config";
import { useLang } from "@/i18n/lang-context";
import { useMessages } from "@/i18n/messages-context";
import { switchLangHref } from "@/i18n/routes";
import { clearBookingDraft, loadBookingDraft, type BookingDraft } from "@/lib/reservation/storage";

/** Once a session: a closed bar stays closed on the next page of the visit. */
const SEEN_KEY = "mc_resume_seen";
/** Shown once the visitor has scrolled this share of the screen: the hero's search ("Rezerwuj") is then out of the way. */
const SCROLL_SHARE = 0.6;

/**
 * Homepage bar for a booking left part way (see `RememberBooking`), loaded by
 * `ResumeBooking` only when a draft is saved. Not a modal: it does not cover
 * the hero, take the focus or block the page. It slides in at the bottom once
 * the visitor scrolls past the hero's search (never over the LCP or "Pokaż
 * auta"), once a session. "Kontynuuj" opens the booking where it
 * was left; "Nie, dziękuję" forgets it; × only hides it.
 */
export function ResumeBookingBar() {
  const messages = useMessages();
  const t = messages.booking.resume;
  const lang = useLang();
  const router = useRouter();
  const titleId = useId();
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  useEffect(() => {
    if (seen()) return;
    const onScroll = () => {
      if (window.scrollY < window.innerHeight * SCROLL_SHARE) return;
      window.removeEventListener("scroll", onScroll);
      const found = stillBookable();
      if (found) {
        markSeen();
        setDraft(found);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!draft) return null;

  return (
    <aside
      aria-labelledby={titleId}
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-xl animate-[slide-up_250ms_var(--ease-out-soft)] rounded-card bg-white p-3 shadow-float ring-1 ring-line motion-reduce:animate-none sm:p-4"
    >
      <div className="flex items-start gap-3">
        {draft.image ? (
          <span className="relative hidden h-14 w-20 shrink-0 sm:block">
            <Image src={draft.image} alt="" fill sizes="80px" className="object-contain" />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-sm font-bold text-blue-dark">
            {t.title}
          </h2>
          <p className="truncate text-sm text-ink">{draft.car}</p>
          <p className="truncate text-xs text-muted-dark">
            {draft.placeNames[lang] ?? draft.place} · {formatTripDates(lang, messages.search, draft.dates)}
          </p>
        </div>
        <Button
          onPress={() => setDraft(null)}
          aria-label={messages.layout.closeAnnouncement}
          className="-m-1 grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-muted-dark outline-none hover:bg-surface hover:text-blue-dark data-focus-visible:ring-2 data-focus-visible:ring-blue-medium"
        >
          <X className="size-4" aria-hidden />
        </Button>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          onPress={() => {
            clearBookingDraft();
            setDraft(null);
          }}
          className={buttonClass("secondary", "sm", "flex-1 sm:flex-none")}
        >
          {t.decline}
        </Button>
        <Button onPress={() => router.push(inLang(draft.href, lang))} className={buttonClass("primary", "sm", "flex-1 sm:ml-auto sm:flex-none")}>
          {t.back}
        </Button>
      </div>
    </aside>
  );
}

function seen(): boolean {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    window.sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Private mode or blocked storage: the bar may show again on the next page.
  }
}

/** The saved booking URL in the page's language: a draft from `/pl/…` opens as `/de/…` on the German homepage. */
function inLang(href: string, lang: Lang): string {
  const url = new URL(href, window.location.origin);
  return switchLangHref(url.pathname, url.search, lang);
}

function stillBookable(): BookingDraft | null {
  const draft = loadBookingDraft();
  const point = draft ? pointFromValue(draft.dates.start) : null;
  if (!draft || !point || isSlotPast(point.date, point.time)) {
    return null;
  }
  return draft;
}
