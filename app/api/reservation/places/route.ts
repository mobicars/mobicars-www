import { NextResponse, type NextRequest } from "next/server";

import { isLang } from "@/i18n/config";
import { listServicePoints } from "@/lib/rentcarsoft";
import { toPickupPlace } from "@/lib/reservation/places";

/**
 * `GET /api/reservation/places?lang=pl`: the pickup and return points for a
 * booking form opened on demand, the car card's "Rezerwuj" dialog. Pages with
 * a form render the points themselves; a list of cards would carry them once
 * per page for a dialog most visitors never open. The same list for everyone in
 * a language, so Vercel's CDN keeps it an hour (as the catalog behind it) and
 * serves the old one for a day while fetching the new: no function, no wait.
 */
const CACHE_CONTROL = "public, max-age=300";
const CDN_CACHE_CONTROL = "max-age=3600, stale-while-revalidate=86400";
export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang") ?? "pl";
  if (!isLang(lang)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  try {
    const points = await listServicePoints({ lang });
    return NextResponse.json(points.map(toPickupPlace), {
      headers: { "Cache-Control": CACHE_CONTROL, "CDN-Cache-Control": CDN_CACHE_CONTROL },
    });
  } catch (error) {
    console.error(`[reservation places] unavailable: ${error instanceof Error ? error.name : "unknown"}`);
    return NextResponse.json({ error: "api" }, { status: 502 });
  }
}
