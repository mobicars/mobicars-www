import { formatKilometers, formatMonths } from "@/components/reservation/format";
import { formatSchedulePoint, formatTripDates, pointFromValue } from "@/components/reservation/schedule";
import type { TripSummary } from "@/components/reservation/summary";
import type { Lang } from "@/i18n/config";
import { fill, getMessages } from "@/i18n/messages";
import type { PickupPlace } from "@/lib/reservation/places";
import { formatQueryDateTime, rentalPeriod, type ReservationSearch } from "@/lib/reservation/search";

/** Place and dates for the summary panel and the thank-you page, in the customer's words. Server only. */
export function tripSummary(lang: Lang, search: ReservationSearch, places: PickupPlace[]): TripSummary {
  const placeName = (ref: { id: number; address: string | null }) =>
    ref.address ?? places.find((place) => place.id === ref.id)?.name ?? "";
  const start = pointFromValue(search.start);
  // Monthly rental has no return field: it is the pickup plus the months.
  const end = pointFromValue(formatQueryDateTime(rentalPeriod(search).end));
  const returnAt = end ? formatSchedulePoint(lang, end) : search.term === "short" ? search.end : "";
  return {
    pickup: placeName(search.pickup),
    dropoff: search.dropoff ? placeName(search.dropoff) : null,
    start: start ? formatSchedulePoint(lang, start) : search.start,
    end:
      search.term === "short"
        ? returnAt
        : `${returnAt} (${fill(getMessages(lang).search.monthlyPlan, {
            months: formatMonths(lang, search.months),
            km: formatKilometers(lang, search.km),
          })})`,
  };
}

/** One-line search for the collapsed widget on phones and tablets: where, and from–to. */
export type CompactTrip = { place: string; dates: string };

/** Server only; client code uses `formatTripDates` with `useMessages()`. */
export function compactTrip(lang: Lang, search: ReservationSearch, places: PickupPlace[]): CompactTrip {
  const name = (ref: { id: number; address: string | null }) =>
    ref.address ?? places.find((place) => place.id === ref.id)?.name ?? "";
  return {
    place: search.dropoff ? `${name(search.pickup)} → ${name(search.dropoff)}` : name(search.pickup),
    dates: formatTripDates(lang, getMessages(lang).search, search),
  };
}
