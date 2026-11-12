import { formatKilometers, formatMonths } from "@/components/reservation/format";
import { formatClock, formatSchedulePoint, pointFromValue } from "@/components/reservation/schedule";
import type { TripSummary } from "@/components/reservation/summary";
import type { PickupPlace } from "@/lib/reservation/places";
import type { ReservationSearch } from "@/lib/reservation/search";

/** Place and dates for the summary panel and the thank-you page, in the customer's words. */
export function tripSummary(search: ReservationSearch, places: PickupPlace[]): TripSummary {
  const placeName = (ref: { id: number; address: string | null }) =>
    ref.address ?? places.find((place) => place.id === ref.id)?.name ?? "";
  const start = pointFromValue(search.start);
  const end = search.term === "short" ? pointFromValue(search.end) : null;
  return {
    pickup: placeName(search.pickup),
    dropoff: search.dropoff ? placeName(search.dropoff) : null,
    start: start ? formatSchedulePoint(start) : search.start,
    end:
      search.term === "short"
        ? end
          ? formatSchedulePoint(end)
          : search.end
        : `${formatMonths(search.months)}, ${formatKilometers(search.km)} / mies.`,
  };
}

/** One-line search for the collapsed widget on phones and tablets: where, and from–to. */
export type CompactTrip = { place: string; dates: string };

export function compactTrip(search: ReservationSearch, places: PickupPlace[]): CompactTrip {
  const name = (ref: { id: number; address: string | null }) =>
    ref.address ?? places.find((place) => place.id === ref.id)?.name ?? "";
  const short = (value: string) => {
    const point = pointFromValue(value);
    if (!point) {
      return value;
    }
    const day = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short", timeZone: "UTC" })
      .format(point.date.toDate("UTC"))
      .replace(".", "");
    return `${day}, ${formatClock(point.time)}`;
  };
  return {
    place: search.dropoff ? `${name(search.pickup)} → ${name(search.dropoff)}` : name(search.pickup),
    dates:
      search.term === "short"
        ? `${short(search.start)} – ${short(search.end)}`
        : `od ${short(search.start)} · ${formatMonths(search.months)}`,
  };
}
