import { OFFER_CATEGORIES, type OfferCategory } from "@/lib/reservation/offers";

/**
 * Fleet list filters in the query string, one value per group, the same in
 * every language: `?category=eco&gearbox=automatic&fuel=18&seats=7&sort=price_asc`.
 * `fuel` is the RentCarSoft value id of key 9 (18 hybrid, 110 electric, …).
 * `collection` is the slug of a CMS car collection marked "Show in fleet", in
 * the page's language (`?collection=dla-rodzin`); the list knows its rules.
 * Unknown or broken values are ignored, not errors.
 */
export type FleetSort = "default" | "price_asc" | "price_desc";

export type FleetFilters = {
  category: OfferCategory | null;
  gearbox: "manual" | "automatic" | null;
  fuel: number | null;
  /** At least this many seats. */
  seats: number | null;
  /** A car collection's slug (`FleetCollection`). */
  collection: string | null;
  sort: FleetSort;
};

/** The query key of a car collection, shared by the menu's shortcuts and the list. */
export const COLLECTION_KEY = "collection";

const SORTS: readonly FleetSort[] = ["default", "price_asc", "price_desc"];

export function parseFleetFilters(query: URLSearchParams): FleetFilters {
  const category = query.get("category");
  const gearbox = query.get("gearbox");
  const sort = query.get("sort");
  return {
    category: OFFER_CATEGORIES.find((each) => each.id === category)?.id ?? null,
    gearbox: gearbox === "manual" || gearbox === "automatic" ? gearbox : null,
    fuel: positiveInteger(query.get("fuel")),
    seats: positiveInteger(query.get("seats")),
    collection: slug(query.get(COLLECTION_KEY)),
    sort: SORTS.includes(sort as FleetSort) ? (sort as FleetSort) : "default",
  };
}

export function fleetFiltersToQuery(filters: FleetFilters): URLSearchParams {
  const query = new URLSearchParams();
  if (filters.category) query.set("category", filters.category);
  if (filters.gearbox) query.set("gearbox", filters.gearbox);
  if (filters.fuel !== null) query.set("fuel", String(filters.fuel));
  if (filters.seats !== null) query.set("seats", String(filters.seats));
  if (filters.collection) query.set(COLLECTION_KEY, filters.collection);
  if (filters.sort !== "default") query.set("sort", filters.sort);
  return query;
}

/** A Strapi uid: letters, digits and `-_.~`, as Strapi allows in one. */
function slug(value: string | null): string | null {
  return value && /^[A-Za-z0-9_.~-]{1,120}$/.test(value) ? value : null;
}

function positiveInteger(value: string | null): number | null {
  if (!value || !/^\d{1,6}$/.test(value)) {
    return null;
  }
  const number = Number(value);
  return number > 0 ? number : null;
}
