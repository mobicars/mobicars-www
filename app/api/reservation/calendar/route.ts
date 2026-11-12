import { NextResponse, type NextRequest } from "next/server";

import { isLang } from "@/i18n/config";
import { fill, getMessages } from "@/i18n/messages";
import { toIcs } from "@/lib/reservation/calendar";
import { readReceipt } from "@/lib/reservation/receipt";

/** How long the pickup and the return take in the calendar. */
const EVENT_MINUTES = 30;

/**
 * `GET /api/reservation/calendar?lang=pl`: the reservation just placed as an
 * .ics file (pickup and return). It reads the same short-lived encrypted
 * receipt as the thank-you page, so it only ever describes the visitor's own
 * booking, and nothing about it travels in the URL.
 */
export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang") ?? "pl";
  const receipt = await readReceipt();
  if (!isLang(lang) || !receipt?.at) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const t = getMessages(lang).confirmation.calendar;
  const values = { car: receipt.car.name, id: receipt.id ?? "—" };
  const description = fill(t.description, values);
  const uid = `${receipt.id ?? receipt.at.pickup.replace(/\D/g, "")}@mobicars.pl`;
  const ics = toIcs(
    [
      {
        uid: `pickup-${uid}`,
        start: receipt.at.pickup,
        minutes: EVENT_MINUTES,
        title: fill(t.pickupTitle, values),
        location: receipt.trip.pickup,
        description,
      },
      {
        uid: `return-${uid}`,
        start: receipt.at.return,
        minutes: EVENT_MINUTES,
        title: fill(t.returnTitle, values),
        location: receipt.trip.dropoff ?? receipt.trip.pickup,
        description,
      },
    ],
    new Date(),
  );

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mobicars-rezerwacja.ics"',
      "Cache-Control": "private, no-store",
    },
  });
}
