import "server-only";

import { fromAbsolute, toCalendarDateTime } from "@internationalized/date";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";

import type { Lang } from "@/i18n/config";
import { cacheEnabled } from "@/lib/cache";
import { CACHE_TAGS, getOffer, listAllOffers, RentCarSoftError, type Offer, type OfferImage } from "@/lib/rentcarsoft";
import { reservationConfig } from "@/lib/reservation/config";
import { OFFER_CATEGORIES, type OfferCategory } from "@/lib/reservation/offers";
import { toRentCarSoftDateTime } from "@/lib/reservation/search";

import { bandsAt, dailyFrom, nextPriceChange, type DailyFrom } from "./daily-price";
import { monthlyPricesFrom, type MonthlyFrom } from "./price-from";
import { promotionClasses, type PromotionClass } from "./promotions";
import { isBlankHtml, sanitizeDescription } from "./sanitize";
import { carSlug } from "./slug";

/**
 * Data for the fleet pages, built on the server from the RentCarSoft catalog
 * (short-term list and `getOffer`, both from now: `catalogPickup`), so the
 * client gets only what it shows. Prices are the segment's base price list; a quote for real dates
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
  /** RentCarSoft value id of the body (key 2), for the car collections' rules. */
  bodyId: number | null;
  seats: number | null;
  doors: number | null;
  /** Large and small suitcases. */
  suitcases: { large: number | null; small: number | null };
  transmission: string | null;
  /** `null` when the offer has no transmission key. */
  automatic: boolean | null;
  /** RentCarSoft value id of the transmission (13 manual, 14 automatic), for the car collections' rules. */
  gearboxId: number | null;
  fuel: { id: number | null; label: string } | null;
  categories: OfferCategory[];
  /**
   * Daily "from" price (`daily-price.ts`): the lowest band price a customer
   * can book now, with the rental length it needs and the 1-day price.
   */
  daily: DailyFrom | null;
  /** `daily.price`, for sorting and structured data. */
  dailyFrom: number | null;
  /**
   * Monthly price "from": the lowest long-term calculator quote over every
   * rental length (`price-from.ts`), not the catalog's `monthly_price`.
   */
  monthlyFrom: number | null;
  /** Rental length and kilometres of `monthlyFrom`. */
  monthlyTerms: Omit<MonthlyFrom, "price"> | null;
  /** Only a real deposit; 0 is `null`. */
  deposit: number | null;
  /** A promotion of the car's class runs now. */
  promotion: boolean;
  /** When that promotion ends (RentCarSoft date), only while it runs. */
  promotionEndsAt: string | null;
  /** RentCarSoft lets it be booked (`rentable`). Others are listed but never set a class's "from" price. */
  rentable: boolean;
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
  /** `studio`: the default studio shot on white, shown whole; the car's own photos fill the frame. */
  gallery: { src: string; thumb: string; alt: string; studio: boolean }[];
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
  /**
   * RentCarSoft could not give the details (5xx, timeout): the card from the
   * catalog list stands in, without specs, equipment, description and the
   * price table (`partialFleetCar`), cached for minutes only.
   */
  partial: boolean;
};

/** Every car of the daily catalog, in the API's default order. */
export async function listFleetCars(lang: Lang): Promise<FleetCard[]> {
  return (await fleetCatalog(lang)).cars;
}

/**
 * The classes with a promotion running now (`lib/fleet/promotions.ts`), from
 * the same catalog read as the cars: no RentCarSoft call of their own.
 */
export async function listPromotionClasses(lang: Lang): Promise<PromotionClass[]> {
  return (await fleetCatalog(lang)).promotions;
}

type FleetCatalog = { cars: FleetCard[]; promotions: PromotionClass[] };

function fleetCatalog(lang: Lang): Promise<FleetCatalog> {
  return cacheEnabled() ? cachedFleetCatalog(lang) : loadFleetCatalog(lang);
}

/**
 * Cached like the catalog, but never past the next promotion start or end:
 * a promotional price must appear and disappear on time.
 */
async function cachedFleetCatalog(lang: Lang): Promise<FleetCatalog> {
  "use cache";
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.catalog);
  const { cars, promotions, changesAt } = await buildFleetCars(lang);
  setPriceLife(changesAt);
  return { cars, promotions };
}

/**
 * Without the cache the prices are read per request. No `connection()` here:
 * `generateStaticParams` reads this list too, where it is not allowed. A page
 * that renders the list without the cache awaits `connection()` itself
 * (`components/blocks/cars.tsx`), keeping the clock out of a prerender.
 */
async function loadFleetCatalog(lang: Lang): Promise<FleetCatalog> {
  const { cars, promotions } = await buildFleetCars(lang);
  return { cars, promotions };
}

async function buildFleetCars(lang: Lang): Promise<FleetCatalog & { changesAt: number | null }> {
  const now = Date.now();
  const [offers, monthly] = await Promise.all([
    listAllOffers({ lang, term: "short", offerKeyIds: LIST_KEYS, pickUpDate: catalogPickup(now) }),
    monthlyPricesFrom(lang),
  ]);
  return {
    cars: offers.map((offer) => toCard(offer, monthly.get(offer.id) ?? null, now)),
    promotions: promotionClasses(offers, now),
    changesAt: nextPriceChange(offers.map((offer) => offer.promotion), now),
  };
}

/**
 * RentCarSoft sends a class's promotion (`promocja`, `promocja_od`, `promocja_do`)
 * only with a pickup date: the catalog asks as of now, Warsaw time, as the old
 * site did. Without a return date the list's `days` and totals mean nothing;
 * the fleet pages read only the price bands and the promotion window.
 */
function catalogPickup(now: number): string {
  return toRentCarSoftDateTime(toCalendarDateTime(fromAbsolute(now, reservationConfig.timeZone)));
}

/** The `hours` profile, shortened to end when a promotion starts or ends. */
function setPriceLife(changesAt: number | null) {
  const hour = 3600;
  const untilChange = changesAt === null ? hour : Math.max(60, Math.ceil((changesAt - Date.now()) / 1000));
  const revalidate = Math.min(hour, untilChange);
  cacheLife({ stale: Math.min(300, revalidate), revalidate, expire: Math.max(revalidate, untilChange === hour ? 86400 : untilChange) });
}

/**
 * One car, or `null` when RentCarSoft does not know the id. A car page in
 * another language than Polish shows only texts the API translated: a
 * description or SEO text equal to the Polish one is the API's silent
 * fallback (`lib/rentcarsoft/docs/quirks.md`) and is left out.
 */
export async function getFleetCar(lang: Lang, id: number): Promise<FleetCar | null> {
  return withCatalogFallback(
    id,
    () => (cacheEnabled() ? cachedFleetCar(lang, id) : loadFleetCar(lang, id)),
    () => (cacheEnabled() ? cachedPartialCar(lang, id) : loadPartialCar(lang, id)),
  );
}

/**
 * The details, `null` for an id RentCarSoft does not know, or on any other
 * RentCarSoft failure (5xx, timeout) the catalog card from `fallback`. When
 * that cannot be read either, or the car is not in the catalog, the original
 * error stands. Errors that are not RentCarSoft's are never hidden.
 */
export async function withCatalogFallback(
  id: number,
  load: () => Promise<FleetCar>,
  fallback: () => Promise<FleetCar | null>,
): Promise<FleetCar | null> {
  try {
    return await load();
  } catch (error) {
    if (!(error instanceof RentCarSoftError)) {
      throw error;
    }
    if (error.code === "not_found") {
      return null;
    }
    const card = await fallback().catch(() => null);
    if (!card) {
      throw error;
    }
    console.error(`[fleet] car ${id} details unavailable (${error.code}), showing the catalog card`);
    return card;
  }
}

/** Minutes, not hours: once RentCarSoft answers again the full page replaces it soon. */
async function cachedPartialCar(lang: Lang, id: number): Promise<FleetCar | null> {
  "use cache";
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.catalog);
  cacheLife("minutes");
  return loadPartialCar(lang, id);
}

async function loadPartialCar(lang: Lang, id: number): Promise<FleetCar | null> {
  const card = (await listFleetCars(lang)).find((each) => each.id === id);
  return card ? partialFleetCar(card) : null;
}

/** A catalog card as a car page: its photo and list facts, nothing the details call gives. */
export function partialFleetCar(card: FleetCard): FleetCar {
  return {
    ...card,
    gallery: card.image ? [{ src: card.image.src, thumb: card.image.src, alt: card.image.alt, studio: true }] : [],
    specs: [],
    features: [],
    equipment: [],
    description: null,
    priceBands: [],
    promotionInfo: null,
    metaTitle: null,
    metaDescription: null,
    partial: true,
  };
}

async function cachedFleetCar(lang: Lang, id: number): Promise<FleetCar> {
  "use cache";
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.catalog);
  const { car, changesAt } = await buildFleetCar(lang, id);
  setPriceLife(changesAt);
  return car;
}

async function loadFleetCar(lang: Lang, id: number): Promise<FleetCar> {
  await connection();
  return (await buildFleetCar(lang, id)).car;
}

async function buildFleetCar(lang: Lang, id: number): Promise<{ car: FleetCar; changesAt: number | null }> {
  const now = Date.now();
  const [offer, polish, monthly] = await Promise.all([
    getOffer(id, { lang, offerKeyIds: DETAIL_KEYS, pickUpDate: catalogPickup(now) }),
    lang === "pl" ? null : getOffer(id, { lang: "pl", offerKeyIds: [10, 79, 80] }),
    monthlyPricesFrom(lang),
  ]);
  return {
    car: toCar(offer, lang, polish, monthly.get(offer.id) ?? null, now),
    changesAt: nextPriceChange([offer.promotion], now),
  };
}

/**
 * Ids of the catalog cars RentCarSoft offers at one pickup point (`servicePoints`
 * in the offer's configuration; no dates needed). A city or local page shows
 * only these (`page.pickupId`). Cached with the catalog.
 */
export async function listFleetCarIdsAt(pointId: number): Promise<ReadonlySet<number>> {
  return new Set(await (cacheEnabled() ? cachedCarIdsAt(pointId) : loadCarIdsAt(pointId)));
}

async function cachedCarIdsAt(pointId: number): Promise<number[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.catalog);
  return loadCarIdsAt(pointId);
}

async function loadCarIdsAt(pointId: number): Promise<number[]> {
  // The ids are the same in every language; one key keeps the answer small.
  const offers = await listAllOffers({ lang: "pl", term: "short", servicePointIds: [pointId], offerKeyIds: [1] });
  return offers.map((offer) => offer.id);
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

function toCard(offer: Offer, monthly: MonthlyFrom | null, now: number): FleetCard {
  // The live list swaps make and model, so the name comes from key 1 when set.
  const name = text(offer, "name") ?? [offer.model, offer.brand].filter(Boolean).join(" ");
  const main = offer.gallery.find((item) => item.main) ?? offer.gallery.find((item) => item.cover) ?? offer.gallery[0];
  const src = imageUrl(main);
  const transmission = offer.attributes.transmission ?? null;
  const fuel = offer.attributes.fuelType ?? null;
  const bands = bandsAt(offer.priceList?.bands ?? [], offer.promotion, now);
  // Without bands (never seen on the live API) the catalog's `minPrice` stands in, with no condition known.
  const daily = dailyFrom(bands) ?? (offer.minPrice ? { price: offer.minPrice, fromDays: 1, oneDay: null, promotional: false } : null);

  return {
    id: offer.id,
    slug: carSlug(name, offer.id),
    name,
    segment: offer.segmentName,
    segmentId: offer.segmentId,
    image: src ? { src, alt: main?.alt || name } : null,
    body: text(offer, "body"),
    bodyId: offer.attributes.body?.valueId ?? null,
    seats: count(offer, "seats"),
    doors: count(offer, "doors"),
    suitcases: { large: count(offer, "suitcasesXl"), small: count(offer, "suitcasesXs") },
    transmission: transmission?.value.trim() || null,
    automatic: transmission ? transmission.valueId === AUTOMATIC_TRANSMISSION : null,
    gearboxId: transmission?.valueId ?? null,
    fuel: fuel?.value.trim() ? { id: fuel.valueId, label: fuel.value.trim() } : null,
    categories: OFFER_CATEGORIES.filter(
      (category) => offer.attributes[category.key]?.valueId === category.yes,
    ).map((category) => category.id),
    daily,
    dailyFrom: daily?.price ?? null,
    monthlyFrom: monthly?.price ?? null,
    monthlyTerms: monthly ? { months: monthly.months, kmPerMonth: monthly.kmPerMonth } : null,
    deposit: (offer.priceList?.deposit ?? offer.deposit) || null,
    promotion: bands.some((band) => band.promotionalPrice !== null),
    promotionEndsAt: bands.some((band) => band.promotionalPrice !== null) ? (offer.promotion?.endsAt ?? null) : null,
    rentable: offer.rentable,
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

function toCar(offer: Offer, lang: Lang, polish: Offer | null, monthly: MonthlyFrom | null, now: number): FleetCar {
  const card = toCard(offer, monthly, now);
  const translated = (key: string) => {
    const value = text(offer, key);
    return value && (!polish || value !== text(polish, key)) ? value : null;
  };
  // English pages fall back to the legacy English field (key 133).
  const html = translated("description") ?? (lang === "en" ? text(offer, "descriptionEn") : null);
  const description = html ? sanitizeDescription(html) : null;

  // As on the old site: the photos marked "cover" in RentCarSoft, without the default
  // studio shot (the cards' photo) and the unmarked ones; the studio shot only for a car with none.
  const photos = offer.gallery.filter((image) => image.cover && !image.main);
  const chosen = photos.length > 0 ? photos : offer.gallery.filter((image) => image.main);
  const gallery = chosen.flatMap((image, index) => {
    const thumb = imageUrl(image);
    const src = image.largeWebp ?? image.largeStandard ?? thumb;
    if (!src || !thumb) {
      return [];
    }
    return [{ src, thumb, alt: image.alt || `${card.name} – ${index + 1}`, studio: image.main }];
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
    priceBands: bandsAt(offer.priceList?.bands ?? [], offer.promotion, now).flatMap((band) =>
      band.price === null ? [] : [{ ...band, price: band.price }],
    ),
    promotionInfo: card.promotion && offer.promotion ? { name: offer.promotion.name, endsAt: offer.promotion.endsAt } : null,
    metaTitle: translated("metaTitle"),
    metaDescription: translated("metaDescription"),
    partial: false,
  };
}
