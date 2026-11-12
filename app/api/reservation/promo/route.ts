import { toCalendarDateTime } from "@internationalized/date";
import { NextResponse, type NextRequest } from "next/server";

import { isRateLimited, recordFailure, requestIp } from "@/lib/auth/rate-limit";
import { RentCarSoftError, verifyPromoCode } from "@/lib/rentcarsoft";
import { normalizePromo } from "@/lib/reservation/booking";
import { toRentCarSoftDateTime, toZonedDateTime } from "@/lib/reservation/search";

/** Checks per address in the limiter's 15-minute window, so codes cannot be guessed in bulk. */
const MAX_CHECKS_PER_IP = 20;

/**
 * `GET /api/reservation/promo?code=…&from=YYYY-MM-DDTHH:mm`: is this discount
 * code valid for a pickup at `from`? Answers `{ valid }`. The code itself only
 * changes prices through `calculateReservation`, which gets it with every
 * quote; this check is for the customer's "Zastosuj" button.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = normalizePromo(params.get("code"));
  const start = toZonedDateTime(params.get("from") ?? "");
  if (!code || !start) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const limit = [{ key: `promo-ip:${await requestIp()}`, max: MAX_CHECKS_PER_IP }];
  if (isRateLimited(limit)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  recordFailure(limit);

  try {
    const check = await verifyPromoCode({ code, startDate: toRentCarSoftDateTime(toCalendarDateTime(start)) });
    return NextResponse.json({ valid: check.valid, code }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const reason = error instanceof RentCarSoftError ? error.code : "api";
    console.error(`[reservation promo] check failed: ${reason}`);
    return NextResponse.json({ error: reason }, { status: 502 });
  }
}
