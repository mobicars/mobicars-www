import { OFFER_CATEGORIES, type OfferCategory } from "@/lib/reservation/offers";

import type { FleetCard } from "./cars";

/**
 * Each class that has cars with its cheapest car by the daily "from" price.
 * The classes picked in the CMS, in that order, or every class in
 * `OFFER_CATEGORIES` order. The header's "Samochody" panel and the Car
 * classes section show its photo and price.
 */
export function carClasses(cars: readonly FleetCard[], picked: readonly OfferCategory[] = []): { id: OfferCategory; cheapest: FleetCard }[] {
  const order = picked.length > 0 ? picked : OFFER_CATEGORIES.map(({ id }) => id);
  return order.flatMap((id) => {
    const cheapest = cheapestCar(cars.filter((car) => car.categories.includes(id)));
    return cheapest ? [{ id, cheapest }] : [];
  });
}

/** The car with the lowest daily "from" price (one without a price only when none has one); `null` for no cars. */
export function cheapestCar(cars: readonly FleetCard[]): FleetCard | null {
  return cars.reduce<FleetCard | null>((best, car) => (best === null || (car.dailyFrom ?? Infinity) < (best.dailyFrom ?? Infinity) ? car : best), null);
}
