import { fill } from "@/i18n/fill";
import { intlLocales, type Lang } from "@/i18n/config";
import type { ServicePoint } from "@/lib/rentcarsoft";

import type { SearchDraft } from "./search";

/** What the widget needs about a pickup point. Keeps the client payload small. */
export type PickupPlace = {
  id: number;
  name: string;
  /** The town in Polish, as RentCarSoft files it; for matching. */
  city: string | null;
  /** The town in the page's language, for display. */
  cityName: string | null;
  /** Directions from RentCarSoft, in Polish only (`ServicePoint.addressNote`). */
  addressNote: string | null;
  /** Pickup or delivery fee (`ServicePoint.fee`). */
  fee: ServicePoint["fee"];
  customAddresses: boolean;
  airport: boolean;
  office: boolean;
  trainStation: boolean;
};

export function toPickupPlace(point: ServicePoint): PickupPlace {
  return {
    id: point.id,
    name: point.name,
    city: point.city,
    cityName: point.cityName,
    addressNote: point.addressNote,
    fee: point.fee,
    customAddresses: point.customAddresses,
    airport: point.airport,
    office: point.office,
    trainStation: point.trainStation,
  };
}

/** The fee texts in `messages` (`blocks.locations`). */
type FeeTexts = { fee: string; feeFrom: string; feeNone: string };

/**
 * The line under a point's name: the directions (Polish pages only, since
 * RentCarSoft has them in Polish only) and the fee in the page's language,
 * e.g. "Parking P2 - wjazd obok Renaissance Hotel · Opłata: od 79 zł" or "Gebühr: ab 79 PLN".
 */
export function placeDetails(lang: Lang, place: Pick<PickupPlace, "addressNote" | "fee">, texts: FeeTexts): string {
  const note = lang === "pl" ? place.addressNote : null;
  return [note, place.fee ? feeText(lang, place.fee, texts) : null].filter(Boolean).join(" · ");
}

function feeText(lang: Lang, fee: NonNullable<PickupPlace["fee"]>, texts: FeeTexts): string {
  if (fee.amount === 0) {
    return texts.feeNone;
  }
  // Whole złoty without ",00": "od 79 zł".
  const price = new Intl.NumberFormat(intlLocales[lang], {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: Number.isInteger(fee.amount) ? 0 : 2,
  }).format(fee.amount);
  return fill(fee.from ? texts.feeFrom : texts.fee, { price });
}

/**
 * A page about one place (a city or local page, `Page.pickupId`)
 * starts the search there. The customer's saved search wins only when its pickup
 * is in the same town; otherwise the page's point replaces the pickup (and a
 * different return place), keeping the dates. An id not among `places` changes nothing.
 */
export function withPagePickup(draft: SearchDraft, pickupId: number | null | undefined, places: readonly PickupPlace[]): SearchDraft {
  const point = pickupId ? places.find((place) => place.id === pickupId) : undefined;
  if (!point) {
    return draft;
  }
  const saved = draft.pickup ? places.find((place) => place.id === draft.pickup?.id) : undefined;
  if (saved && saved.city !== null && saved.city === point.city) {
    return draft;
  }
  return { ...draft, pickup: { id: point.id, address: null }, differentReturn: false, dropoff: null };
}
