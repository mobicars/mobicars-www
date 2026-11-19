import type { CarCollection } from "@/lib/strapi";

import type { FleetCard } from "./cars";

/**
 * The cars of a car collection (`api::car-collection`), from the one cached
 * fleet list, so a collection costs no RentCarSoft call. An empty rule does
 * not filter; within a rule any picked value matches (segment A or B); every
 * filled rule must match (segment A or B, and automatic). Then the order:
 * RentCarSoft's (`default`), the daily "from" price, cheapest first (`price`),
 * or the cars marked popular first (`popular`); ties keep RentCarSoft's order.
 */
export function collectionCars(rules: Omit<CarCollection, "documentId" | "title">, cars: readonly FleetCard[]): FleetCard[] {
  const any = <T,>(picked: readonly T[], value: T | null) => picked.length === 0 || (value !== null && picked.includes(value));
  const matches = (car: FleetCard) =>
    any(rules.segmentIds.map(String), car.segmentId) &&
    (rules.categories.length === 0 || rules.categories.some((category) => car.categories.includes(category))) &&
    any(rules.fuels, car.fuel?.id ?? null) &&
    any(rules.bodies, car.bodyId) &&
    any(rules.gearboxes, car.gearboxId) &&
    (rules.minSeats === null || (car.seats ?? 0) >= rules.minSeats) &&
    (!rules.onlyPromotion || car.promotion) &&
    (!rules.onlyPopular || car.popular);
  return [...cars.filter(matches)].sort(ORDER[rules.sort]);
}

const ORDER: Record<CarCollection["sort"], (left: FleetCard, right: FleetCard) => number> = {
  default: () => 0,
  price: (left, right) => (left.dailyFrom ?? Infinity) - (right.dailyFrom ?? Infinity),
  popular: (left, right) => Number(right.popular) - Number(left.popular),
};

export type CollectionValue = { id: string | number; label: string; cars: number };

/**
 * What the CMS pickers of a car collection offer (`/api/cms/rcs-values`): the
 * fuels, bodies and gearboxes the fleet has, by RentCarSoft value id with its
 * Polish label, and the five categories, each with how many cars have it.
 */
export function collectionValues(
  cars: readonly FleetCard[],
  categoryLabels: Record<FleetCard["categories"][number], string>,
): Record<"categories" | "fuels" | "bodies" | "gearboxes", CollectionValue[]> {
  const tally = (pick: (car: FleetCard) => { id: number | null; label: string | null }) => {
    const found = new Map<number, CollectionValue>();
    for (const car of cars) {
      const { id, label } = pick(car);
      if (id === null || !label) continue;
      const value = found.get(id) ?? { id, label, cars: 0 };
      value.cars += 1;
      found.set(id, value);
    }
    return [...found.values()].sort((left, right) => left.label.localeCompare(right.label, "pl"));
  };
  return {
    categories: (Object.keys(categoryLabels) as FleetCard["categories"]).map((id) => ({
      id,
      label: categoryLabels[id],
      cars: cars.filter((car) => car.categories.includes(id)).length,
    })),
    fuels: tally((car) => ({ id: car.fuel?.id ?? null, label: car.fuel?.label ?? null })),
    bodies: tally((car) => ({ id: car.bodyId, label: car.body })),
    gearboxes: tally((car) => ({ id: car.gearboxId, label: car.transmission })),
  };
}
