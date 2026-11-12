import type { ReservationQuote } from "@/lib/rentcarsoft";

import { formatDays } from "@/components/reservation/format";

/**
 * The booking summary's prices. They always come from RentCarSoft's
 * `calculateReservation`; the site adds nothing up itself, because only the
 * quote knows the place fees (delivery to an address, return elsewhere).
 */

export type QuoteLineView = {
  label: string;
  /** 0 shows "w cenie". */
  amount: number;
  /** Price before a promotion, struck through. */
  regular: number | null;
};

export type QuoteView = {
  lines: QuoteLineView[];
  total: number;
  deposit: number | null;
};

/** Query keys of `GET /api/reservation/quote`, next to the search keys. */
export const QUOTE_KEYS = { lang: "lang", offer: "offer", addon: "addon", accessory: "acc" } as const;

/** Most addon ids, and most accessories, a quote request may carry. */
export const MAX_QUOTE_ITEMS = 15;

export type QuoteAccessory = { id: number; quantity: number };

/**
 * Query for the quote endpoint: the search's own query plus the car, the addon
 * ids (insurance, zone, toggles) and the accessories as `acc=id-quantity`.
 */
export function quoteQuery(
  lang: string,
  searchQuery: string,
  offerId: number,
  addonIds: number[],
  accessories: QuoteAccessory[] = [],
): string {
  const query = new URLSearchParams(searchQuery);
  query.set(QUOTE_KEYS.lang, lang);
  query.set(QUOTE_KEYS.offer, String(offerId));
  for (const id of addonIds) {
    query.append(QUOTE_KEYS.addon, String(id));
  }
  for (const { id, quantity } of accessories) {
    query.append(QUOTE_KEYS.accessory, `${id}-${quantity}`);
  }
  return query.toString();
}

/** Summary lines from a quote. Throws when the quote has no total. */
export function toQuoteView(quote: ReservationQuote): QuoteView {
  if (quote.total === null) {
    throw new Error("Quote without a total.");
  }
  const rent = quote.rent ?? quote.priceDiscounted ?? quote.price ?? 0;
  const regular = quote.priceWithoutDiscount;
  const lines: QuoteLineView[] = [
    {
      label: quote.days ? `Wynajem (${formatDays(quote.days)})` : "Wynajem",
      amount: rent,
      regular: regular !== null && regular > rent ? regular : null,
    },
  ];
  const fees: [number | null, string][] = [
    [quote.pickUpPrice, "Podstawienie auta"],
    [quote.returnPrice, "Odbiór auta"],
    [quote.relocationPrice, "Zwrot w innym miejscu"],
  ];
  for (const [amount, label] of fees) {
    if (amount) {
      lines.push({ label, amount, regular: null });
    }
  }
  for (const line of [...quote.addons, ...quote.accessories]) {
    lines.push({ label: line.name ?? "Dodatek", amount: line.price ?? 0, regular: null });
  }
  return { lines, total: quote.total, deposit: quote.deposit };
}
