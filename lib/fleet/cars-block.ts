import type { CarsSection } from "@/lib/strapi";

import { collectionCars } from "./car-collection";
import type { FleetCard } from "./cars";

const SECTION_CATEGORY: Record<CarsSection["category"], (car: FleetCard) => boolean> = {
  // RentCarSoft's "delivery car" field (131); passenger = every other car.
  passenger: (car) => !car.categories.includes("delivery"),
  delivery: (car) => car.categories.includes("delivery"),
  // RentCarSoft's "popular" field (71).
  popular: (car) => car.popular,
};

/**
 * The cars of a Cars section (`sections.cars`). The CMS stores only the choice
 * (which cars, how many, which layout), never names, prices or photos: those
 * come from RentCarSoft (`lib/fleet/cars.ts`). In RentCarSoft's order, or
 * for picked cars in the editor's; picked cars RentCarSoft no longer lists are
 * left out. `classes` with none picked is every class; `collection` the car
 * collection's cars in its order, none without a collection. Then the limit.
 */
export function selectSectionCars(
  section: Pick<CarsSection, "source" | "category" | "segmentIds" | "carIds" | "collection" | "limit">,
  cars: FleetCard[],
): FleetCard[] {
  let selected = cars;
  if (section.source === "category") {
    selected = cars.filter(SECTION_CATEGORY[section.category]);
  } else if (section.source === "classes" && section.segmentIds.length > 0) {
    const wanted = new Set(section.segmentIds.map(String));
    selected = cars.filter((car) => car.segmentId !== null && wanted.has(car.segmentId));
  } else if (section.source === "cars") {
    const byId = new Map(cars.map((car) => [car.id, car]));
    selected = section.carIds.flatMap((id) => byId.get(id) ?? []);
  } else if (section.source === "collection") {
    selected = section.collection ? collectionCars(section.collection, cars) : [];
  }
  return section.limit !== null ? selected.slice(0, section.limit) : selected;
}
