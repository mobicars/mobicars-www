import { OFFER_CATEGORIES, type OfferCategory } from "@/lib/reservation/offers";

import type { FleetCard } from "./cars";

/**
 * Each class that has cars, in `OFFER_CATEGORIES` order, with its cheapest
 * car by the daily "from" price (a car without one only when the class has
 * no priced car). The header's "Samochody" panel and the Car classes section
 * show its photo and price.
 */
export function carClasses(cars: readonly FleetCard[]): { id: OfferCategory; cheapest: FleetCard }[] {
  return OFFER_CATEGORIES.flatMap(({ id }) => {
    const inClass = cars.filter((car) => car.categories.includes(id));
    if (inClass.length === 0) {
      return [];
    }
    const cheapest = inClass.reduce((best, car) => ((car.dailyFrom ?? Infinity) < (best.dailyFrom ?? Infinity) ? car : best));
    return [{ id, cheapest }];
  });
}
