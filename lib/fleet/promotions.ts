import type { Offer } from "@/lib/rentcarsoft";

import { bandsAt } from "./daily-price";

/** One band of a class's price list while a promotion runs: the regular and the promotional price per day. */
export type PromotionBand = { from: number | null; to: number | null; price: number; promotionalPrice: number };

/**
 * A price class (RentCarSoft segment) with a promotion running now. RentCarSoft
 * keeps promotions in the class price list (`cennik[segmentId]`): its name and
 * window, and a promotional price per band. `price` is the lowest promotional
 * price per day and `regularPrice` the same band's regular one.
 */
export type PromotionClass = {
  segmentId: string;
  segment: string;
  /** As RentCarSoft names it, in Polish only. */
  name: string | null;
  /** RentCarSoft date-time, Warsaw wall time. */
  endsAt: string | null;
  bands: PromotionBand[];
  price: number;
  regularPrice: number;
  /** The class's cars that can be booked by the day, in the catalog's order. */
  carIds: number[];
};

/** The classes of the catalog with a promotion running at `now`, in the catalog's order. */
export function promotionClasses(offers: readonly Offer[], now: number): PromotionClass[] {
  const classes = new Map<string, PromotionClass>();
  for (const offer of offers) {
    if (!offer.segmentId || !offer.rentable || !offer.shortTerm) {
      continue;
    }
    const known = classes.get(offer.segmentId);
    if (known) {
      known.carIds.push(offer.id);
      continue;
    }
    const bands = bandsAt(offer.priceList?.bands ?? [], offer.promotion, now).flatMap((band) =>
      band.price !== null && band.promotionalPrice !== null && band.promotionalPrice < band.price
        ? [{ from: band.from, to: band.to, price: band.price, promotionalPrice: band.promotionalPrice }]
        : [],
    );
    if (bands.length === 0) {
      continue;
    }
    const best = bands.reduce((min, band) => (band.promotionalPrice < min.promotionalPrice ? band : min));
    classes.set(offer.segmentId, {
      segmentId: offer.segmentId,
      segment: offer.segmentName,
      name: offer.promotion?.name?.trim() || null,
      endsAt: offer.promotion?.endsAt ?? null,
      bands: [...bands].sort((left, right) => (left.from ?? 0) - (right.from ?? 0)),
      price: best.promotionalPrice,
      regularPrice: best.price,
      carIds: [offer.id],
    });
  }
  return [...classes.values()];
}

/** The soonest to end first (RentCarSoft date-times sort as text), a class without an end last; then the cheapest. */
export function sortPromotions(classes: readonly PromotionClass[]): PromotionClass[] {
  return [...classes].sort(
    (left, right) => (left.endsAt ?? "9999").localeCompare(right.endsAt ?? "9999") || left.price - right.price,
  );
}
