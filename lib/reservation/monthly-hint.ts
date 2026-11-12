import { reservationConfig } from "./config";
import { QUERY_KEYS, rentalPeriod, searchToQuery, type ReservationSearch } from "./search";

/**
 * A long daily search (4 weeks or more) is usually cheaper as monthly rental.
 * Returns the monthly search to suggest instead: the same pickup place and
 * time, the month count nearest to the days (rounded down to an offered one,
 * at least 1) and the starting kilometre limit. Null for shorter searches,
 * for monthly searches and for a different return place (monthly rental
 * returns where it starts).
 */
export function monthlyAlternative(
  search: ReservationSearch,
): { months: number; days: number; query: URLSearchParams } | null {
  if (search.term !== "short" || search.dropoff) {
    return null;
  }
  const { start, end } = rentalPeriod(search);
  const days = Math.round(
    (Date.UTC(end.year, end.month - 1, end.day, end.hour, end.minute) -
      Date.UTC(start.year, start.month - 1, start.day, start.hour, start.minute)) /
      86_400_000,
  );
  if (days < reservationConfig.monthlyHintDays) {
    return null;
  }
  const wanted = Math.max(1, Math.round(days / 30));
  const months = reservationConfig.longTermMonthCounts.filter((count) => count <= wanted).at(-1) ?? 1;
  const query = searchToQuery({
    term: "long",
    pickup: search.pickup,
    dropoff: null,
    start: search.start,
    months,
    km: reservationConfig.monthlyHintKm,
  });
  query.delete(QUERY_KEYS.end);
  return { months, days, query };
}
