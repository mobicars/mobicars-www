import type { CarsBlock, CarsCategory, CarsSection } from "@/lib/strapi";

import { collectionCars } from "./car-collection";
import type { FleetCard } from "./cars";

/**
 * Which cars a CMS fleet block (`blocks.cars`, `CarsBlock` from the Strapi
 * bridge) shows. The CMS stores only the choice (which cars, how many, which
 * layout), never names, prices or photos: those come from RentCarSoft
 * (`lib/fleet/cars.ts`).
 */

/** Value id of "Elektryczny" on the fuel key (9); 202 is the hybrid. `redesign/rcs-analysis.md` §4. */
const ELECTRIC_FUEL = 110;

/** Seats from which a car counts as a family car (the 7-seat vans and the SUV+). */
const FAMILY_SEATS = 7;

const CATEGORY_MATCH: Record<CarsCategory, (car: FleetCard) => boolean> = {
  electric: (car) => car.fuel?.id === ELECTRIC_FUEL,
  delivery: (car) => car.categories.includes("delivery"),
  family: (car) => (car.seats ?? 0) >= FAMILY_SEATS && !car.categories.includes("delivery"),
  automatic: (car) => car.automatic === true,
};

/**
 * The block's cars from the one cached catalog list, in the catalog's order.
 * `classes` with no class picked shows them all.
 * Returns the class ids the catalog no longer has, so the page can warn
 * about them (the editor's choice outlived a change in RentCarSoft).
 */
export function selectBlockCars(
  block: Pick<CarsBlock, "source" | "segmentIds" | "category" | "limit"> & {
    layout?: CarsBlock["layout"];
    onlyPromotions?: CarsBlock["onlyPromotions"];
  },
  cars: FleetCard[],
): { cars: FleetCard[]; missingSegmentIds: number[] } {
  // "Tylko promocje": `promotion` comes from the same cached prices as the
  // promotional price, so the list and the price change together.
  let selected = block.onlyPromotions ? cars.filter((car) => car.promotion) : cars;
  let missingSegmentIds: number[] = [];
  // No class picked means every class (the fleet page's catalog).
  if (block.source === "classes" && block.segmentIds.length > 0) {
    const wanted = new Set(block.segmentIds.map(String));
    selected = selected.filter((car) => car.segmentId !== null && wanted.has(car.segmentId));
    const present = new Set(cars.map((car) => car.segmentId));
    missingSegmentIds = block.segmentIds.filter((id) => !present.has(String(id)));
  } else if (block.source === "category" && block.category) {
    selected = selected.filter(CATEGORY_MATCH[block.category]);
  }
  // Class tiles summarise every class of the selection: a limit would let the
  // cheaper classes crowd out the dearer ones.
  const limit = block.layout === "categories" ? null : block.limit;
  return {
    cars: limit !== null && limit > 0 ? selected.slice(0, limit) : selected,
    missingSegmentIds,
  };
}

const SECTION_CATEGORY: Record<CarsSection["category"], (car: FleetCard) => boolean> = {
  // RentCarSoft's "delivery car" field (131); passenger = every other car.
  passenger: (car) => !car.categories.includes("delivery"),
  delivery: (car) => car.categories.includes("delivery"),
  // RentCarSoft's "popular" field (71).
  popular: (car) => car.popular,
};

/**
 * The cars of a Cars section (`sections.cars`): in RentCarSoft's order, or
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
