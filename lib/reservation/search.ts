import {
  CalendarDateTime,
  now,
  parseDateTime,
  toCalendarDateTime,
  toZoned,
  today,
  type ZonedDateTime,
} from "@internationalized/date";

import { reservationConfig } from "./config";

/**
 * The reservation search: what the homepage widget collects and what the
 * reservation pages read back. The URL is the only serialized form: the path
 * picks the term (`reservationHref`), the query holds the fields. The widget,
 * the reservation pages and the browser copy in `storage.ts` all go through
 * `draftFromQuery` / `searchToQuery`, so they cannot drift apart.
 *
 * Dates are wall-clock times in `reservationConfig.timeZone`, `YYYY-MM-DDTHH:mm`.
 */

export type ReservationTerm = "short" | "long";

export type PlaceRef = {
  id: number;
  /** Customer address, only for points that accept one. */
  address: string | null;
};

type SearchBase = {
  pickup: PlaceRef;
  /** `null` returns the car where it was picked up. */
  dropoff: PlaceRef | null;
  start: string;
};

export type ShortTermSearch = SearchBase & { term: "short"; end: string };
export type LongTermSearch = SearchBase & { term: "long"; months: number; km: number };
export type ReservationSearch = ShortTermSearch | LongTermSearch;

/** Widget state. Every field may still be empty. */
export type SearchDraft = {
  term: ReservationTerm;
  pickup: PlaceRef | null;
  differentReturn: boolean;
  dropoff: PlaceRef | null;
  start: string | null;
  end: string | null;
  months: number | null;
  km: number | null;
};

export type SearchField = "pickup" | "dropoff" | "start" | "end" | "months" | "km";

export type SearchIssue = {
  field: SearchField;
  code: "missing" | "address" | "unknown" | "past" | "beforeStart" | "notOffered";
};

/** What validation needs to know about a pickup point. */
export type PlaceRule = { id: number; customAddresses: boolean };

export const QUERY_KEYS = {
  pickup: "pickup",
  pickupAddress: "pickupAddress",
  dropoff: "dropoff",
  dropoffAddress: "dropoffAddress",
  start: "from",
  end: "to",
  months: "months",
  km: "km",
  offer: "offer",
  /** Daily list layout: absent for classes, `cars` for one card per car. */
  view: "view",
  /** Booking step after the search: absent for the car list, then `protection`, `extras`. */
  step: "step",
  /** Chosen insurance addon id. */
  protection: "protection",
  /** Extras step: the border zone addon id. */
  zone: "zone",
  /** Extras step: switched-on addon ids, comma separated. */
  extras: "extras",
  /** Extras step: accessories as `id-quantity`, comma separated. */
  accessories: "acc",
} as const;

const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const ADDRESS_MAX = 200;

export function emptyDraft(term: ReservationTerm = "short"): SearchDraft {
  return {
    term,
    pickup: null,
    differentReturn: false,
    dropoff: null,
    start: null,
    end: null,
    months: null,
    km: null,
  };
}

type QueryInput = URLSearchParams | Record<string, string | string[] | undefined>;

/**
 * Reads a draft from a URL query. The term is not in the query: each term has
 * its own page, so the caller passes it. Unknown or malformed values become empty fields.
 */
export function draftFromQuery(input: QueryInput, term: ReservationTerm): SearchDraft {
  const get = (key: string): string | null => {
    const value = input instanceof URLSearchParams ? input.get(key) : input[key];
    const first = Array.isArray(value) ? value[0] : value;
    return first?.trim() || null;
  };
  const dropoff = placeFromQuery(get(QUERY_KEYS.dropoff), get(QUERY_KEYS.dropoffAddress));

  return {
    term,
    pickup: placeFromQuery(get(QUERY_KEYS.pickup), get(QUERY_KEYS.pickupAddress)),
    differentReturn: dropoff !== null,
    dropoff,
    start: dateTimeFromQuery(get(QUERY_KEYS.start)),
    end: dateTimeFromQuery(get(QUERY_KEYS.end)),
    months: positiveInt(get(QUERY_KEYS.months)),
    km: positiveInt(get(QUERY_KEYS.km)),
  };
}

/** The canonical query for a search. Only fields of its term are written; the page path carries the term. */
export function searchToQuery(search: ReservationSearch): URLSearchParams {
  const query = new URLSearchParams();
  query.set(QUERY_KEYS.pickup, String(search.pickup.id));
  if (search.pickup.address) {
    query.set(QUERY_KEYS.pickupAddress, search.pickup.address);
  }
  if (search.dropoff) {
    query.set(QUERY_KEYS.dropoff, String(search.dropoff.id));
    if (search.dropoff.address) {
      query.set(QUERY_KEYS.dropoffAddress, search.dropoff.address);
    }
  }
  query.set(QUERY_KEYS.start, search.start);
  if (search.term === "short") {
    query.set(QUERY_KEYS.end, search.end);
  } else {
    query.set(QUERY_KEYS.months, String(search.months));
    query.set(QUERY_KEYS.km, String(search.km));
  }
  return query;
}

/**
 * Checks a draft and returns the complete search, or every problem found.
 * `earliestStart` defaults to the current moment in the reservation time zone.
 */
export function validateSearch(
  draft: SearchDraft,
  options: { places: readonly PlaceRule[]; earliestStart?: ZonedDateTime },
): { ok: true; search: ReservationSearch } | { ok: false; issues: SearchIssue[] } {
  const issues: SearchIssue[] = [];
  const earliest = options.earliestStart ?? now(reservationConfig.timeZone);

  const pickupIssue = placeIssue(draft.pickup, options.places);
  if (pickupIssue) {
    issues.push({ field: "pickup", code: pickupIssue });
  }
  const dropoff = draft.differentReturn ? draft.dropoff : null;
  if (draft.differentReturn) {
    const dropoffIssue = placeIssue(draft.dropoff, options.places);
    if (dropoffIssue) {
      issues.push({ field: "dropoff", code: dropoffIssue });
    }
  }

  const start = draft.start ? toZonedDateTime(draft.start) : null;
  if (!start) {
    issues.push({ field: "start", code: "missing" });
  } else if (start.compare(earliest) < 0) {
    issues.push({ field: "start", code: "past" });
  }

  if (draft.term === "short") {
    const end = draft.end ? toZonedDateTime(draft.end) : null;
    if (!end) {
      issues.push({ field: "end", code: "missing" });
    } else if (start && end.compare(start) <= 0) {
      issues.push({ field: "end", code: "beforeStart" });
    }
  } else {
    if (draft.months === null) {
      issues.push({ field: "months", code: "missing" });
    } else if (!reservationConfig.longTermMonthCounts.some((count) => count === draft.months)) {
      issues.push({ field: "months", code: "notOffered" });
    }
    if (draft.km === null) {
      issues.push({ field: "km", code: "missing" });
    } else if (!reservationConfig.kilometerLimits.some((limit) => limit === draft.km)) {
      issues.push({ field: "km", code: "notOffered" });
    }
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  // Every field below was checked above.
  const base = { pickup: draft.pickup!, dropoff, start: draft.start! };
  const search: ReservationSearch =
    draft.term === "short"
      ? { ...base, term: "short", end: draft.end! }
      : { ...base, term: "long", months: draft.months!, km: draft.km! };
  return { ok: true, search };
}

/**
 * The earliest pickup a booking in progress may still have: the start of
 * today. The lead time (`pickupLeadMinutes`) applies when the customer picks a
 * time; once they are on the reservation page, the pickup minute passing must
 * not throw them out. A pickup on an earlier day (an old link, a return the
 * next day) is still rejected.
 */
export function bookingInProgressStart(): ZonedDateTime {
  return toZoned(today(reservationConfig.timeZone), reservationConfig.timeZone);
}

/**
 * Moves the pickup to `newStart`. The return stays as it is while it still
 * follows the new pickup; otherwise it moves by the same amount, so the
 * rental keeps its length. Values are `YYYY-MM-DDTHH:mm`.
 */
export function movePickup(
  start: string,
  end: string | null,
  newStart: string,
): { start: string; end: string | null } {
  const oldStart = toZonedDateTime(start);
  const oldEnd = end ? toZonedDateTime(end) : null;
  const moved = toZonedDateTime(newStart);
  if (!oldStart || !oldEnd || !moved || oldEnd.compare(moved) > 0) {
    return { start: newStart, end };
  }
  const shiftedEnd = moved.add({ milliseconds: oldEnd.toDate().getTime() - oldStart.toDate().getTime() });
  return { start: newStart, end: formatQueryDateTime(toCalendarDateTime(shiftedEnd)) };
}

/** Start and end of the rental. A long-term rental ends after its month count. */
export function rentalPeriod(search: ReservationSearch): {
  start: CalendarDateTime;
  end: CalendarDateTime;
} {
  const start = parseDateTime(search.start);
  const end =
    search.term === "short"
      ? parseDateTime(search.end)
      : start.add({ months: search.months });
  return { start, end };
}

/** `YYYY-MM-DDTHH:mm` for a calendar date-time. */
export function formatQueryDateTime(value: CalendarDateTime): string {
  return value.toString().slice(0, 16);
}

/** RentCarSoft wants `YYYY-MM-DD HH:mm`. */
export function toRentCarSoftDateTime(value: CalendarDateTime): string {
  return formatQueryDateTime(value).replace("T", " ");
}

export function toZonedDateTime(value: string): ZonedDateTime | null {
  if (!DATE_TIME.test(value)) {
    return null;
  }
  try {
    return toZoned(parseDateTime(value), reservationConfig.timeZone);
  } catch {
    return null;
  }
}

function placeIssue(
  place: PlaceRef | null,
  places: readonly PlaceRule[],
): SearchIssue["code"] | null {
  if (!place) {
    return "missing";
  }
  const rule = places.find((item) => item.id === place.id);
  if (!rule) {
    return "unknown";
  }
  if (rule.customAddresses && !place.address) {
    return "address";
  }
  return null;
}

function placeFromQuery(id: string | null, address: string | null): PlaceRef | null {
  const parsed = positiveInt(id);
  if (parsed === null) {
    return null;
  }
  return { id: parsed, address: address ? address.slice(0, ADDRESS_MAX) : null };
}

function dateTimeFromQuery(value: string | null): string | null {
  return value && toZonedDateTime(value) ? value : null;
}

function positiveInt(value: string | null): number | null {
  if (!value || !/^\d{1,9}$/.test(value)) {
    return null;
  }
  const parsed = Number(value);
  return parsed > 0 ? parsed : null;
}
