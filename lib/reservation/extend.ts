import type { OfferCard } from "./offers";

/** Furthest a "one more day" suggestion may reach. */
export const MAX_EXTRA_DAYS = 2;

export type ExtensionCandidate = {
  /** Days to add to the return. */
  addDays: number;
  /** Rental days after adding them. */
  days: number;
  /** Price per day now and after: from the price bands here, from the two quotes in `extensionHint`. */
  dailyBefore: number;
  dailyAfter: number;
};

/** A cheaper-per-day longer rental, priced by RentCarSoft for both lengths (`extensionHint`). */
export type ExtensionHint = ExtensionCandidate & {
  /** The new return, `YYYY-MM-DDTHH:mm`, for the `to` key. */
  end: string;
  /** Whole-rental difference for the car alone (calculate, both lengths). Can be 0 or less. */
  extraCost: number;
};

/**
 * "Weź 4 dni zamiast 3, a każda doba stanieje": the nearest price band that
 * starts at most `MAX_EXTRA_DAYS` after the current rental length and has a
 * lower daily price. Null when there is none, or the car has no bands or day
 * count (monthly rental). Only picks the length; the price of the longer
 * rental always comes from a calculate quote (`extensionHint`).
 */
export function extensionCandidate(car: OfferCard): ExtensionCandidate | null {
  if (car.days === null || car.dailyPrice === null) {
    return null;
  }
  const current = car.dailyPrice;
  const days = car.days;
  const next = car.bands
    .filter((band) => band.from !== null && band.from > days && band.from <= days + MAX_EXTRA_DAYS)
    .filter((band) => band.daily < current)
    .toSorted((left, right) => left.from! - right.from!)[0];
  if (!next) {
    return null;
  }
  return { addDays: next.from! - days, days: next.from!, dailyBefore: current, dailyAfter: next.daily };
}
