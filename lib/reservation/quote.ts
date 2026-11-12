import type { ReservationQuote } from "@/lib/rentcarsoft";

/**
 * The booking summary's prices. They always come from RentCarSoft's
 * `calculateReservation`; the site adds nothing up itself, because only the
 * quote knows the place fees (delivery to an address, return elsewhere).
 */

/**
 * What a line is. Its label is `summary.lines.<kind>` in messages/{lang}.json;
 * `item` lines (protection, extras) show the API's `name` in the page language.
 */
export type QuoteLineKind = "rent" | "monthlyRent" | "pickup" | "return" | "relocation" | "item";

export type QuoteLineView = {
  kind: QuoteLineKind;
  /** `item`: the addon or accessory name from RentCarSoft. */
  name?: string | null;
  /** `rent`: rental days, for "Wynajem (2 doby)". */
  days?: number | null;
  /** 0 shows "w cenie". */
  amount: number;
  /** Price before a promotion, struck through. */
  regular: number | null;
};

export type QuoteView = {
  /** Daily rental: every line. Monthly rental: the lines charged every month. */
  lines: QuoteLineView[];
  /** The whole rental, as RentCarSoft totals it. */
  total: number;
  deposit: number | null;
  /** Monthly rental only. All amounts come from calculate; nothing is summed here. */
  monthly?: MonthlyQuote;
};

export type MonthlyQuote = {
  months: number;
  /** `razem_miesiecznie_najem_akcesoria_dodatki`: rent plus monthly extras. */
  perMonth: number;
  /** Fees and extras paid once (delivery, one-time addons). */
  oneTimeLines: QuoteLineView[];
  oneTimeTotal: number;
  kmPerMonth: number | null;
  kmTotal: number | null;
  /** Price of each kilometre over the limit. */
  overLimitFee: number | null;
};

/** Query keys of `GET /api/reservation/quote`, next to the search keys. */
export const QUOTE_KEYS = { lang: "lang", offer: "offer", addon: "addon", accessory: "acc", promo: "promo" } as const;

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
  promoCode: string | null = null,
): string {
  const query = new URLSearchParams(searchQuery);
  if (promoCode) {
    query.set(QUOTE_KEYS.promo, promoCode);
  }
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

/**
 * Summary lines from a quote. Throws when the quote has no total. `months`:
 * monthly rental; passed in because calculate does not always echo
 * `iloscMiesiecy` (live API, 12 November 2026: missing once a one-time addon
 * was added).
 */
export function toQuoteView(quote: ReservationQuote, months: number | null = null): QuoteView {
  if (quote.total === null) {
    throw new Error("Quote without a total.");
  }
  const monthCount = months ?? (quote.term === "long" ? quote.months : null);
  if (monthCount) {
    return toMonthlyView(quote, quote.total, monthCount);
  }
  const rent = quote.rent ?? quote.priceDiscounted ?? quote.price ?? 0;
  const regular = quote.priceWithoutDiscount;
  const lines: QuoteLineView[] = [
    {
      kind: "rent",
      days: quote.days,
      amount: rent,
      regular: regular !== null && regular > rent ? regular : null,
    },
  ];
  const fees: [number | null, QuoteLineKind][] = [
    [quote.pickUpPrice, "pickup"],
    [quote.returnPrice, "return"],
    [quote.relocationPrice, "relocation"],
  ];
  for (const [amount, kind] of fees) {
    if (amount) {
      lines.push({ kind, amount, regular: null });
    }
  }
  for (const line of [...quote.addons, ...quote.accessories]) {
    lines.push({ kind: "item", name: line.name, amount: line.price ?? 0, regular: null });
  }
  return { lines, total: quote.total, deposit: quote.deposit };
}

/**
 * Monthly rental. Live API, 12 November 2026 (offer 5196, 3 months): addon
 * and accessory lines carry the whole-period `price` and `isOneTime`;
 * `total` 8950 = `razem_miesiecznie…` 2950 × 3 + `razem_jednorazowo` 100.
 */
function toMonthlyView(quote: ReservationQuote, total: number, months: number): QuoteView {
  const monthly: QuoteLineView[] = [{ kind: "monthlyRent", amount: quote.monthlyRent ?? 0, regular: null }];
  const oneTime: QuoteLineView[] = [];
  const fees: [number | null, QuoteLineKind][] = [
    [quote.pickUpPrice, "pickup"],
    [quote.returnPrice, "return"],
    [quote.relocationPrice, "relocation"],
  ];
  for (const [amount, kind] of fees) {
    if (amount) {
      oneTime.push({ kind, amount, regular: null });
    }
  }
  for (const line of [...quote.addons, ...quote.accessories]) {
    const price = line.price ?? 0;
    if (line.isOneTime) {
      oneTime.push({ kind: "item", name: line.name, amount: price, regular: null });
    } else {
      monthly.push({ kind: "item", name: line.name, amount: Math.round((price / months) * 100) / 100, regular: null });
    }
  }
  return {
    lines: monthly,
    total,
    deposit: quote.deposit,
    monthly: {
      months,
      perMonth: quote.monthlyWithExtras ?? quote.monthlyRent ?? 0,
      oneTimeLines: oneTime,
      oneTimeTotal: quote.oneTimeTotal ?? 0,
      kmPerMonth: quote.monthlyKmLimit,
      kmTotal: quote.totalKmLimit,
      overLimitFee: quote.mileageLimitFee,
    },
  };
}
