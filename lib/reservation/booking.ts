import "server-only";

import { calculateReservation, listAccessories, listAddons, listAllOffers, type Extra } from "@/lib/rentcarsoft";
import {
  selectedAccessories,
  selectedAddonIds,
  toExtrasView,
  type ExtrasSelection,
  type ExtrasView,
} from "@/lib/reservation/extras";
import { toOfferCards, type OfferCard } from "@/lib/reservation/offers";
import { toProtectionOptions, type ProtectionOption } from "@/lib/reservation/protection";
import { toQuoteView, type QuoteAccessory, type QuoteView } from "@/lib/reservation/quote";
import {
  QUERY_KEYS,
  rentalPeriod,
  toRentCarSoftDateTime,
  type ReservationSearch,
  type ReservationTerm,
} from "@/lib/reservation/search";

/**
 * Server steps shared by the booking page, the quote endpoint and the
 * "Rezerwuj" Server Action, so all three ask RentCarSoft the same way.
 */

/** Which rental a search query describes: a month count means monthly rental. */
export function termOfQuery(query: URLSearchParams | Record<string, unknown>): ReservationTerm {
  const months = query instanceof URLSearchParams ? query.get(QUERY_KEYS.months) : query[QUERY_KEYS.months];
  return months ? "long" : "short";
}

/**
 * Every car of the pickup point for the search: daily prices for the dates,
 * or monthly prices for the months and kilometre limit.
 */
export async function listOfferCards(lang: string, search: ReservationSearch): Promise<OfferCard[]> {
  const { start, end } = rentalPeriod(search);
  return toOfferCards(
    await listAllOffers({
      lang,
      term: search.term,
      servicePointIds: [search.pickup.id],
      pickUpDate: toRentCarSoftDateTime(start),
      returnDate: toRentCarSoftDateTime(end),
      longTermQuote: search.term === "long" ? { months: search.months, monthlyKmLimit: search.km } : undefined,
    }),
  );
}

/** A chosen extra with its name, for the last step's review and the receipt. */
export type ChosenExtra = { id: number; name: string; quantity: number };

/** `calculateReservation` for a search, a car and its addons. Throws when the API fails. */
export async function quoteFor(
  lang: string,
  search: ReservationSearch,
  offerId: number,
  addonIds: number[],
  accessories: QuoteAccessory[] = [],
  promoCode: string | null = null,
): Promise<QuoteView> {
  const { start, end } = rentalPeriod(search);
  return toQuoteView(
    await calculateReservation({
      offerId,
      pickUpPointId: search.pickup.id,
      returnPointId: (search.dropoff ?? search.pickup).id,
      pickUpDate: toRentCarSoftDateTime(start),
      returnDate: toRentCarSoftDateTime(end),
      lang,
      addonIds,
      accessories,
      promoCode: promoCode ?? undefined,
      // Monthly rental: the calculate call needs the month count and the km limit.
      longTerm: search.term === "long" ? { months: search.months, monthlyKmLimit: search.km } : undefined,
    }),
    search.term === "long" ? search.months : null,
  );
}

/** A discount code as typed: trimmed and upper-case, or null when empty or not code-like. */
export function normalizePromo(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const code = value.trim().toUpperCase();
  return /^[A-Z0-9_-]{2,40}$/.test(code) ? code : null;
}

/**
 * What can be added to a car for the search: the protection packages and the
 * extras step's view. Addons and accessories are listed in parallel.
 *
 * Daily rental lists them for the dates, priced per day and for the window.
 * Monthly rental lists the long-term catalogue (`longTerm`), priced per month
 * (`monthlyPrice`); see `forMonths`.
 */
export async function loadBookingChoices(
  lang: string,
  search: ReservationSearch,
  car: OfferCard,
): Promise<{ options: ProtectionOption[]; extrasView: ExtrasView }> {
  const priceSegmentIds = car.segmentId ? [Number(car.segmentId)] : undefined;
  if (search.term === "long") {
    const input = { lang, priceSegmentIds, longTerm: true };
    const [addons, accessories] = await Promise.all([listAddons(input), listAccessories(input)]);
    const monthlyAddons = forMonths(addons, search.months);
    return {
      options: toProtectionOptions(monthlyAddons, "month"),
      extrasView: toExtrasView(monthlyAddons, forMonths(accessories, search.months), "month"),
    };
  }
  const { start, end } = rentalPeriod(search);
  const input = {
    lang,
    priceSegmentIds,
    pickUpDate: toRentCarSoftDateTime(start),
    returnDate: toRentCarSoftDateTime(end),
  };
  const [addons, accessories] = await Promise.all([listAddons(input), listAccessories(input)]);
  return { options: toProtectionOptions(addons), extrasView: toExtrasView(addons, accessories) };
}

/**
 * The long-term catalogue in the shape the daily views read: `monthlyPrice`
 * becomes the price (per month, or once with `oneTimeFee`), and the whole
 * rental is that price times the months. Items without a monthly price are
 * daily-only (e.g. the zones "limit 400 km/ doba") and are left out, as on the
 * old site. Live API, 12 November 2026: calculate charged exactly these sums.
 */
function forMonths(extras: Extra[], months: number): Extra[] {
  return extras.flatMap((extra) => {
    if (extra.monthlyPrice === null) {
      return [];
    }
    const whole = extra.oneTimeFee ? extra.monthlyPrice : extra.monthlyPrice * months;
    return [
      {
        ...extra,
        price: extra.monthlyPrice,
        isDiscounted: false,
        priceDiscounted: null,
        calculatedPrice: whole,
        discountedCalculatedPrice: null,
      },
    ];
  });
}

/** The selected addons, then the accessories, with their names; `fallback` for one without a name. */
export function chosenExtras(selection: ExtrasSelection, view: ExtrasView, fallback: string): ChosenExtra[] {
  const names = new Map(
    [...view.zones, ...view.groups.flatMap((group) => group.items)].map((item) => [item.id, item.name]),
  );
  return [
    ...selectedAddonIds(selection).map((id) => ({ id, name: names.get(id) ?? fallback, quantity: 1 })),
    ...selectedAccessories(selection).map(({ id, quantity }) => ({ id, name: names.get(id) ?? fallback, quantity })),
  ];
}
