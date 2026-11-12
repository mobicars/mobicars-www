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

/** After a placed reservation: the next visit starts with an empty widget. */
export function clearSearch(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Storage is unavailable; nothing was kept.
  }
}
