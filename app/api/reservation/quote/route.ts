import { NextResponse, type NextRequest } from "next/server";

import { isLang } from "@/i18n/config";
import { RentCarSoftError, calculateReservation, listServicePoints } from "@/lib/rentcarsoft";
import { toPickupPlace } from "@/lib/reservation/places";
import { MAX_QUANTITY } from "@/lib/reservation/extras";
import { MAX_QUOTE_ITEMS, QUOTE_KEYS, toQuoteView, type QuoteAccessory } from "@/lib/reservation/quote";
import {
  bookingInProgressStart,
  draftFromQuery,
  rentalPeriod,
  toRentCarSoftDateTime,
  validateSearch,
} from "@/lib/reservation/search";

/**
 * Quote for the booking summary: `calculateReservation` for a daily search,
 * a car and its addons. The browser calls it when the customer changes a
 * choice; the page renders the first quote on the server.
 *
 * Query: the search's own keys (as on `/pl/rezerwacja`), plus `lang`, `offer`,
 * `addon` ids and `acc=id-quantity` accessories. The search is validated here
 * again; nothing the browser sends is trusted as is.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lang = params.get(QUOTE_KEYS.lang) ?? "pl";
  const offerId = positiveInt(params.get(QUOTE_KEYS.offer));
  const addonIds = params.getAll(QUOTE_KEYS.addon).map(positiveInt);
  const accessories = params.getAll(QUOTE_KEYS.accessory).map(parseAccessory);
  if (
    !isLang(lang) ||
    offerId === null ||
    addonIds.length > MAX_QUOTE_ITEMS ||
    accessories.length > MAX_QUOTE_ITEMS ||
    addonIds.some((id) => id === null) ||
    accessories.some((item) => item === null)
  ) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const places = (await listServicePoints({ lang })).map(toPickupPlace);
  const result = validateSearch(draftFromQuery(params, "short"), {
    places,
    earliestStart: bookingInProgressStart(),
  });
  if (!result.ok || result.search.term !== "short") {
    return NextResponse.json({ error: "invalid_search" }, { status: 400 });
  }

  const { search } = result;
  const { start, end } = rentalPeriod(search);
  try {
    const quote = await calculateReservation({
      offerId,
      pickUpPointId: search.pickup.id,
      returnPointId: (search.dropoff ?? search.pickup).id,
      pickUpDate: toRentCarSoftDateTime(start),
      returnDate: toRentCarSoftDateTime(end),
      lang,
      addonIds: addonIds as number[],
      accessories: accessories as QuoteAccessory[],
    });
    return NextResponse.json(toQuoteView(quote), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof RentCarSoftError ? error.code : "api";
    // The code only: no request body or customer data in the log (see the bridge's errors doc).
    console.error(`[reservation quote] calculate failed: ${code}`);
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
