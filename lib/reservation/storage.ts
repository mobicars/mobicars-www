import { draftFromQuery, type ReservationTerm, type SearchDraft } from "./search";

/**
 * Browser copy of the last search, so a refresh or a return visit keeps the
 * widget filled in. Stored as the term and the same URL query the reservation pages read.
 * Storage can be missing or blocked (private mode), so every call is best effort.
 */

const KEY = "mobicars:reservation-search";
const VERSION = 2;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

type Stored = { v: number; savedAt: number; term: ReservationTerm; query: string };

export function saveSearchQuery(term: ReservationTerm, query: URLSearchParams | string): void {
  const stored: Stored = { v: VERSION, savedAt: Date.now(), term, query: String(query) };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    // Storage is unavailable. The URL still carries the search.
  }
}

export function loadSearchDraft(): SearchDraft | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      return null;
    }
    const stored = JSON.parse(raw) as Partial<Stored>;
    if (
      stored.v !== VERSION ||
      typeof stored.query !== "string" ||
      (stored.term !== "short" && stored.term !== "long") ||
      typeof stored.savedAt !== "number" ||
      Date.now() - stored.savedAt > MAX_AGE_MS
    ) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    return draftFromQuery(new URLSearchParams(stored.query), stored.term);
  } catch {
    return null;
  }
}

/**
 * A booking left on the protection, extras or details step, for the "finish
 * your booking" banner on the homepage. `start` is the raw pickup value, so the
 * banner can hide itself once that time is no longer bookable.
 */
export type BookingDraft = {
  href: string;
  car: string;
  segment: string;
  image: string | null;
  place: string;
  dates: string;
  start: string;
};

const DRAFT_KEY = "mobicars:reservation-draft";
const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function saveBookingDraft(draft: BookingDraft): void {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ v: VERSION, savedAt: Date.now(), ...draft }));
  } catch {
    // Storage is unavailable; the banner is a convenience.
  }
}

export function loadBookingDraft(): BookingDraft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) {
      return null;
    }
    const stored = JSON.parse(raw) as Partial<BookingDraft & { v: number; savedAt: number }>;
    if (
      stored.v !== VERSION ||
      typeof stored.savedAt !== "number" ||
      Date.now() - stored.savedAt > DRAFT_MAX_AGE_MS ||
      typeof stored.href !== "string" ||
      // Only a path on this site: the value comes back into a link.
      !stored.href.startsWith("/") ||
      stored.href.startsWith("//") ||
      typeof stored.car !== "string" ||
      typeof stored.segment !== "string" ||
      (stored.image !== null && typeof stored.image !== "string") ||
      typeof stored.place !== "string" ||
      typeof stored.dates !== "string" ||
      typeof stored.start !== "string"
    ) {
      window.localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return {
      href: stored.href,
      car: stored.car,
      segment: stored.segment,
      image: stored.image ?? null,
      place: stored.place,
      dates: stored.dates,
      start: stored.start,
    };
  } catch {
    return null;
  }
}

export function clearBookingDraft(): void {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Storage is unavailable; nothing was kept.
  }
}

/** After a placed reservation: the next visit starts with an empty widget and no draft. */
export function clearSearch(): void {
  clearBookingDraft();
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Storage is unavailable; nothing was kept.
  }
}
