import type { OfferCard } from "./offers";

/**
 * "Potrzebujesz większego komfortu?" on the extras step: a few cars from
 * higher classes than the chosen one. Every rule works on fields the API
 * sends, so a new class or car needs no code change:
 *
 * 1. Same family: a delivery van (`isDeliveryCar`) is never offered to a car
 *    customer, nor the other way round.
 * 2. Always dearer: the period price (with promotions) is higher.
 * 3. Not a step down: at least as many seats; an automatic stays automatic.
 * 4. Another class, one car per class, free for the dates, popular first.
 * 5. The smallest price increases first: a reasonable step up. The page shows
 *    them two per row, so the count is 4, 2 or 1 (3 candidates show 2).
 */

export type UpsellOption = {
  car: OfferCard;
  /** Per day, from the two cars' API daily prices. Always above 0. */
  dailyIncrease: number;
  /** For the whole period, from the two cars' API period prices. */
  totalIncrease: number;
};

/** Most suggestions shown. */
export const UPSELL_COUNT = 4;

export function upsellOptions(current: OfferCard, offers: OfferCard[], count = UPSELL_COUNT): UpsellOption[] {
  if (current.totalPrice === null || current.dailyPrice === null) {
    return [];
  }
  const currentTotal = current.totalPrice;
  const currentDaily = current.dailyPrice;
  const family = isDelivery(current);
  const seats = seatCount(current);
  const perClass = new Map<string, OfferCard>();

  for (const offer of offers) {
    if (
      classKey(offer) === classKey(current) ||
      !offer.available ||
      offer.totalPrice === null ||
      offer.dailyPrice === null ||
      offer.totalPrice <= currentTotal ||
      isDelivery(offer) !== family ||
      (current.automatic === true && offer.automatic !== true) ||
      seatCount(offer) < seats
    ) {
      continue;
    }
    const key = classKey(offer);
    const kept = perClass.get(key);
    if (!kept || (offer.popular && !kept.popular)) {
      perClass.set(key, offer);
    }
  }

  return [...perClass.values()]
    .map((car) => ({
      car,
      dailyIncrease: cents(car.dailyPrice! - currentDaily),
      totalIncrease: cents(car.totalPrice! - currentTotal),
    }))
    .filter((option) => option.dailyIncrease > 0)
    .toSorted((left, right) => left.totalIncrease - right.totalIncrease)
    .slice(0, shownCount(count, perClass.size));
}

/** Full rows of two, or one card on its own: 4, 2 or 1 (never 3). */
function shownCount(limit: number, available: number): number {
  const count = Math.min(limit, available);
  return count <= 1 ? count : count - (count % 2);
}

function isDelivery(car: OfferCard): boolean {
  return car.categories.includes("delivery");
}

function seatCount(car: OfferCard): number {
  return Number.parseInt(car.seats ?? "", 10) || 0;
}

function classKey(car: OfferCard): string {
  return car.segmentId ?? car.segment;
}

function cents(value: number): number {
  return Math.round(value * 100) / 100;
}
