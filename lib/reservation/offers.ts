import type { Offer } from "@/lib/rentcarsoft";

/**
 * Car groups the old site filtered by. Each comes from a yes/no offer key.
 * Matched by value id: the value text is translated per `lang` ("Tak" / "Yes").
 * Ids checked on the live API on 11 November 2026, see `lib/rentcarsoft/docs/quirks.md`.
 */
export const OFFER_CATEGORIES = [
  { id: "small", key: "isSmallCar", yes: 83, label: "Małe" },
  { id: "compact", key: "isCompactCar", yes: 85, label: "Kompaktowe" },
  { id: "large", key: "isLargeCar", yes: 87, label: "Duże" },
  { id: "eco", key: "isEcoCar", yes: 89, label: "Eko" },
  { id: "delivery", key: "isDeliveryCar", yes: 182, label: "Dostawcze" },
] as const;

/** Value id of "Automatyczna" on the transmission key (13 is "Manualna"). */
const AUTOMATIC_TRANSMISSION = 14;

export type OfferCategory = (typeof OFFER_CATEGORIES)[number]["id"];

/** What a car card shows. Built on the server so the client gets no raw offer. */
export type OfferCard = {
  id: number;
  name: string;
  segment: string;
  /** Price segment. Cars in one segment share a price; the daily list groups by it. */
  segmentId: string | null;
  image: { src: string; alt: string } | null;
  seats: string | null;
  transmission: string | null;
  /** `null` when the offer has no transmission key. */
  automatic: boolean | null;
  categories: OfferCategory[];
  fuelType: string | null;
  /** Price per day the customer pays: the promotional one when a promotion applies. */
  dailyPrice: number | null;
  /** Price for the whole searched period the customer pays. Daily rental only. */
  totalPrice: number | null;
  /** Rental days the API counted for the search; the price reads "/ 2 dni". Null on monthly lists. */
  days: number | null;
  /** Total before the promotion, to strike through. Null without a promotion. */
  regularTotalPrice: number | null;
  promotion: { name: string | null; endsAt: string | null } | null;
  /** Monthly rental only: price per month for the asked months and kilometre limit. */
  monthlyPrice: number | null;
  deposit: number | null;
  /** Free for the dates. Every car is listed either way; the upsell offers free ones only. */
  available: boolean;
  popular: boolean;
};

/**
 * Cards for every car the list returns, including ones booked for the window
 * (`available: false`). A customer books a class, "X or similar", and the team
 * confirms the car, as on the old site. See `lib/reservation/README.md`.
 */
export function toOfferCards(offers: Offer[]): OfferCard[] {
  return offers.map(toOfferCard);
}

function toOfferCard(offer: Offer): OfferCard {
  const attribute = (key: string) => offer.attributes[key]?.value.trim() || null;
  // The live list returns the model in `mark` and the make in `model`,
  // so the full name comes from the `name` key when it is set.
  const name = attribute("name") ?? [offer.model, offer.brand].filter(Boolean).join(" ");
  // The main photo, as on the old site; then a cover photo; then the first one.
  const image =
    offer.gallery.find((item) => item.main) ??
    offer.gallery.find((item) => item.cover) ??
    offer.gallery[0];
  const src = image?.webp ?? image?.standard ?? null;
  const transmission = offer.attributes.transmission ?? null;

  return {
    id: offer.id,
    name,
    segment: offer.segmentName,
    segmentId: offer.segmentId,
    image: src ? { src, alt: image?.alt || name } : null,
    seats: attribute("seats"),
    transmission: transmission?.value.trim() || null,
    automatic: transmission ? transmission.valueId === AUTOMATIC_TRANSMISSION : null,
    categories: OFFER_CATEGORIES.filter(
      (category) => offer.attributes[category.key]?.valueId === category.yes,
    ).map((category) => category.id),
    fuelType: attribute("fuelType"),
    ...prices(offer),
    days: offer.days,
    monthlyPrice: offer.monthlyPrice,
    deposit: offer.deposit,
    available: offer.available !== false && offer.rentable,
    popular: offer.isPopular,
  };
}

/**
 * Every price here is one the API sent; nothing is multiplied or divided.
 * With a promotion the list carries both totals (`discountedCalculatedPrice`
 * matched the calculate total) and the band's promotional per-day price.
 */
function prices(offer: Offer) {
  const discounted = offer.isDiscounted ? offer.discountedCalculatedPrice : null;
  if (discounted === null) {
    return {
      dailyPrice: offer.dailyPrice,
      totalPrice: offer.calculatedPrice,
      regularTotalPrice: null,
      promotion: null,
    };
  }
  return {
    dailyPrice: offer.promotion?.dailyPrice ?? null,
    totalPrice: discounted,
    regularTotalPrice: offer.calculatedPrice,
    promotion: offer.promotion
      ? { name: offer.promotion.name, endsAt: offer.promotion.endsAt }
      : { name: null, endsAt: null },
  };
}
