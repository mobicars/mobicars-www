import { NextResponse, type NextRequest } from "next/server";

import { isLang } from "@/i18n/config";
import { RentCarSoftError, listServicePoints } from "@/lib/rentcarsoft";
import { normalizePromo, quoteFor, termOfQuery } from "@/lib/reservation/booking";
import { toPickupPlace } from "@/lib/reservation/places";
import { MAX_QUANTITY } from "@/lib/reservation/extras";
import { MAX_QUOTE_ITEMS, QUOTE_KEYS, type QuoteAccessory } from "@/lib/reservation/quote";
import { bookingInProgressStart, draftFromQuery, validateSearch } from "@/lib/reservation/search";

/**
 * Quote for the booking summary: `calculateReservation` for a daily search,
 * a car and its addons. The browser calls it when the customer changes a
 * choice; the page renders the first quote on the server.
 *
 * Query: the search's own keys (as on `/pl/rezerwacja`), plus `lang`, `offer`,
 * `addon` ids, `acc=id-quantity` accessories and an optional `promo` code
 * (sent to calculate as is; RentCarSoft ignores an unknown one). The search is validated here
 * again; nothing the browser sends is trusted as is.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lang = params.get(QUOTE_KEYS.lang) ?? "pl";
  const offerId = positiveInt(params.get(QUOTE_KEYS.offer));
  const addonIds = params.getAll(QUOTE_KEYS.addon).map(positiveInt);
  const accessories = params.getAll(QUOTE_KEYS.accessory).map(parseAccessory);
  const promo = params.has(QUOTE_KEYS.promo) ? normalizePromo(params.get(QUOTE_KEYS.promo)) : undefined;
  if (
    promo === null ||
    !isLang(lang) ||
    offerId === null ||
    addonIds.length > MAX_QUOTE_ITEMS ||
    accessories.length > MAX_QUOTE_ITEMS ||
    addonIds.some((id) => id === null) ||
    accessories.some((item) => item === null)
  ) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const places = (await listServicePoints({ lang })).map(toPickupPlace);
    const term = termOfQuery(params);
    const result = validateSearch(draftFromQuery(params, term), {
      places,
      earliestStart: bookingInProgressStart(),
    });
    if (!result.ok) {
      return NextResponse.json({ error: "invalid_search" }, { status: 400 });
    }
    const quote = await quoteFor(
      lang,
      result.search,
      offerId,
      addonIds as number[],
      accessories as QuoteAccessory[],
      promo ?? null,
    );
    return NextResponse.json(quote, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof RentCarSoftError ? error.code : "api";
    // The code only: no request body or customer data in the log (see the bridge's errors doc).
    console.error(`[reservation quote] failed: ${code}`);
    return NextResponse.json({ error: code }, { status: 502 });
  }
}

function parseAccessory(value: string): QuoteAccessory | null {
  const [id, quantity] = value.split("-").map(positiveInt);
  return id && quantity && quantity <= MAX_QUANTITY ? { id, quantity } : null;
}

function positiveInt(value: string | null | undefined): number | null {
  if (!value || !/^\d{1,9}$/.test(value)) {
    return null;
  }
  const parsed = Number(value);
  return parsed > 0 ? parsed : null;
}
