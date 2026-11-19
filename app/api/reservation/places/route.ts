import { NextResponse, type NextRequest } from "next/server";

import { isLang } from "@/i18n/config";
import { listServicePoints } from "@/lib/rentcarsoft";
import { toPickupPlace } from "@/lib/reservation/places";

/**
 * `GET /api/reservation/places?lang=pl`: the pickup and return points for a
 * booking form opened on demand, the car card's "Rezerwuj" dialog. Pages with
 * a form render the points themselves; a list of cards would carry them once
 * per page for a dialog most visitors never open. Same cache as the pages.
 */
export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang") ?? "pl";
  if (!isLang(lang)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  try {
    const points = await listServicePoints({ lang });
    return NextResponse.json(points.map(toPickupPlace), { headers: { "Cache-Control": "public, max-age=300" } });
  } catch (error) {
    console.error(`[reservation places] unavailable: ${error instanceof Error ? error.name : "unknown"}`);
    return NextResponse.json({ error: "api" }, { status: 502 });
  }
}
