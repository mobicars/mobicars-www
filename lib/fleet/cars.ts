import "server-only";

import type { Lang } from "@/i18n/config";
import { getOffer, listAllOffers, RentCarSoftError, type Offer, type OfferImage } from "@/lib/rentcarsoft";
import { OFFER_CATEGORIES, type OfferCategory } from "@/lib/reservation/offers";

import { isBlankHtml, sanitizeDescription } from "./sanitize";
import { carSlug } from "./slug";

/**
 * Data for the fleet pages, built on the server from the RentCarSoft catalog
 * (undated short-term list and `getOffer`), so the client gets only what it
 * shows. Prices are the segment's base price list; a quote for real dates
 * comes from the reservation flow. See `lib/fleet/README.md`.
 */

/** Offer keys the list needs: name, body, seats, doors, luggage, gearbox, fuel, trunk, groups. */
const LIST_KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 64, 71, 72, 73, 74, 75, 131];

/** The list keys plus everything the car page shows, its SEO texts and both descriptions. */
const DETAIL_KEYS = [
  ...LIST_KEYS,
  10, 11, 16, 17, 18, 20, 21, 22, 65, 67, 68, 69, 76, 77, 79, 80, 128, 129, 130, 133,
];

/** Value id of "Automatyczna" on the transmission key (13 is "Manualna"). */
const AUTOMATIC_TRANSMISSION = 14;

/**
 * "No" / "None" value ids of the equipment select keys (live dictionary,
 * 12 November 2026): air conditioning 12, central lock 66, Bluetooth 90,
 * cruise control 92, Android Auto 167, parking sensors 173, rear camera 176.
 */
const NO_VALUES = new Set([12, 66, 90, 92, 167, 173, 176]);

export type FleetImage = { src: string; alt: string };

export type FleetCard = {
  id: number;
  slug: string;
  name: string;
  /** Price class, e.g. "Klasa B". Translated by the API. */
  segment: string;
  segmentId: string | null;
  image: FleetImage | null;
  body: string | null;
  seats: number | null;
  doors: number | null;
  /** Large and small suitcases. */
  suitcases: { large: number | null; small: number | null };
  transmission: string | null;
  /** `null` when the offer has no transmission key. */
  automatic: boolean | null;
  fuel: { id: number | null; label: string } | null;
  categories: OfferCategory[];
  /** Lowest base price per day: the cheapest band, promotional when a band has one. */
  dailyFrom: number | null;
  /** Monthly price "from" for long-term cars. */
  monthlyFrom: number | null;
  /** Only a real deposit; 0 is `null`. */
  deposit: number | null;
  /** A band of the price list has a promotional price. */
  promotion: boolean;
  popular: boolean;
  shortTerm: boolean;
  longTerm: boolean;
};

export type FleetSpec = { key: SpecKey; value: string };

export type SpecKey =
  | "engine"
  | "power"
  | "fuelConsumptionCity"
  | "fuelConsumptionHighway"
  | "acceleration"
  | "maxSpeed"
  | "body"
  | "doors"
  | "seats"
  | "trunk"
  | "year";

export type FeatureKey =
  | "airConditioningType"
  | "cruiseControl"
  | "bluetooth"
  | "androidAuto"
  | "parkingSensors"
  | "rearCamera"
  | "windowType"
  | "mirrorType"
  | "centralLock";

export type FleetPriceBand = {
  from: number | null;
  to: number | null;
  price: number;
  promotionalPrice: number | null;
};

export type FleetCar = FleetCard & {
  gallery: { src: string; thumb: string; alt: string }[];
  specs: FleetSpec[];
  /** Equipment from select keys, e.g. cruise control "Tak", rear camera "360 °". */
  features: { key: FeatureKey; value: string }[];
  /** Free-text equipment lines (`details`). Polish only in the API. */
  equipment: string[];
  /** Sanitized HTML, or `null` when there is no text in the page's language. */
  description: string | null;
  priceBands: FleetPriceBand[];
  promotionInfo: { name: string | null; endsAt: string | null } | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

/** Every car of the daily catalog, in the API's default order. */
export async function listFleetCars(lang: Lang): Promise<FleetCard[]> {
  const offers = await listAllOffers({ lang, term: "short", offerKeyIds: LIST_KEYS });
  return offers.map(toCard);
}

/**
 * One car, or `null` when RentCarSoft does not know the id. A car page in
 * another language than Polish shows only texts the API translated: a
 * description or SEO text equal to the Polish one is the API's silent
 * fallback (`lib/rentcarsoft/docs/quirks.md`) and is left out.
 */
export async function getFleetCar(lang: Lang, id: number): Promise<FleetCar | null> {
  try {
    const [offer, polish] = await Promise.all([
      getOffer(id, { lang, offerKeyIds: DETAIL_KEYS }),
      lang === "pl" ? null : getOffer(id, { lang: "pl", offerKeyIds: [10, 79, 80] }),
    ]);
    return toCar(offer, lang, polish);
  } catch (error) {
    if (error instanceof RentCarSoftError && error.code === "not_found") {
      return null;
    }
    throw error;
  }
}

/**
 * Up to `count` cars like this one: the same group (small, compact, …) first,
 * then the closest daily price. Never the car itself.
 */
export function similarCars(car: FleetCard, cars: FleetCard[], count = 4): FleetCard[] {
  const price = car.dailyFrom ?? 0;
  return cars
    .filter((other) => other.id !== car.id)
    .map((other) => ({
      other,
      shared: other.categories.filter((category) => car.categories.includes(category)).length,
      distance: Math.abs((other.dailyFrom ?? price) - price),
    }))
    .sort((left, right) => right.shared - left.shared || left.distance - right.distance)
    .slice(0, count)
    .map(({ other }) => other);
}

function text(offer: Offer, key: string): string | null {
  return offer.attributes[key]?.value.replace(/\s+/g, " ").trim() || null;
}

function count(offer: Offer, key: string): number | null {
  const value = Number(text(offer, key));
  return Number.isFinite(value) && value > 0 ? value : null;
}

function imageUrl(image: OfferImage | undefined): string | null {
  return image?.webp ?? image?.standard ?? null;
}

function toCard(offer: Offer): FleetCard {
  // The live list swaps make and model, so the name comes from key 1 when set.
  const name = text(offer, "name") ?? [offer.model, offer.brand].filter(Boolean).join(" ");
  const main = offer.gallery.find((item) => item.main) ?? offer.gallery.find((item) => item.cover) ?? offer.gallery[0];
  const src = imageUrl(main);
  const transmission = offer.attributes.transmission ?? null;
  const fuel = offer.attributes.fuelType ?? null;
  const bands = offer.priceList?.bands ?? [];
  const bandPrices = bands.flatMap((band) => {
    const price = band.promotionalPrice ?? band.price;
    return price === null ? [] : [price];
  });

  return {
    id: offer.id,
    slug: carSlug(name, offer.id),
    name,
    segment: offer.segmentName,
    segmentId: offer.segmentId,
    image: src ? { src, alt: main?.alt || name } : null,
    body: text(offer, "body"),
    seats: count(offer, "seats"),
    doors: count(offer, "doors"),
    suitcases: { large: count(offer, "suitcasesXl"), small: count(offer, "suitcasesXs") },
    transmission: transmission?.value.trim() || null,
    automatic: transmission ? transmission.valueId === AUTOMATIC_TRANSMISSION : null,
    fuel: fuel?.value.trim() ? { id: fuel.valueId, label: fuel.value.trim() } : null,
    categories: OFFER_CATEGORIES.filter(
      (category) => offer.attributes[category.key]?.valueId === category.yes,
    ).map((category) => category.id),
    dailyFrom: bandPrices.length > 0 ? Math.min(...bandPrices) : offer.minPrice,
    monthlyFrom: offer.longTerm ? (offer.priceList?.monthlyFrom || null) : null,
    deposit: (offer.priceList?.deposit ?? offer.deposit) || null,
    promotion: bands.some((band) => band.promotionalPrice !== null),
    popular: offer.isPopular,
    shortTerm: offer.shortTerm,
    longTerm: offer.longTerm,
  };
}

const SPEC_KEYS: SpecKey[] = [
  "engine",
  "power",
  "fuelConsumptionCity",
  "fuelConsumptionHighway",
  "acceleration",
  "maxSpeed",
  "body",
  "doors",
  "seats",
  "trunk",
  "year",
];

const FEATURE_KEYS: FeatureKey[] = [
  "airConditioningType",
  "cruiseControl",
  "bluetooth",
  "androidAuto",
  "parkingSensors",
  "rearCamera",
  "windowType",
  "mirrorType",
  "centralLock",
];

function toCar(offer: Offer, lang: Lang, polish: Offer | null): FleetCar {
  const card = toCard(offer);
  const translated = (key: string) => {
    const value = text(offer, key);
    return value && (!polish || value !== text(polish, key)) ? value : null;
  };
  // English pages fall back to the legacy English field (key 133).
  const html = translated("description") ?? (lang === "en" ? text(offer, "descriptionEn") : null);
  const description = html ? sanitizeDescription(html) : null;

  // The main photo is a studio shot on white; the rest are the car's own photos.
  const ordered = [...offer.gallery].sort((left, right) => Number(right.main) - Number(left.main));
  const gallery = ordered.flatMap((image, index) => {
    const thumb = imageUrl(image);
    const src = image.largeWebp ?? image.largeStandard ?? thumb;
    if (!src || !thumb) {
      return [];
    }
    return [{ src, thumb, alt: image.alt || `${card.name} – ${index + 1}` }];
  });

  return {
    ...card,
    gallery,
    specs: SPEC_KEYS.flatMap((key) => {
      const value = text(offer, key);
      return value ? [{ key, value }] : [];
    }),
    features: FEATURE_KEYS.flatMap((key) => {
      const attribute = offer.attributes[key];
      const value = attribute?.value.trim();
      if (!attribute || !value || (attribute.valueId !== null && NO_VALUES.has(attribute.valueId))) {
        return [];
      }
      return [{ key, value }];
    }),
    equipment: offer.details,
    description: description && !isBlankHtml(description) ? description : null,
    priceBands: (offer.priceList?.bands ?? []).flatMap((band) =>
      band.price === null ? [] : [{ ...band, price: band.price }],
    ),
    promotionInfo: offer.promotion ? { name: offer.promotion.name, endsAt: offer.promotion.endsAt } : null,
    metaTitle: translated("metaTitle"),
    metaDescription: translated("metaDescription"),
  };
}
