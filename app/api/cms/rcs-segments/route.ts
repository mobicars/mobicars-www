import { NextResponse } from "next/server";

import { listSegments, RentCarSoftError } from "@/lib/rentcarsoft";
import { revalidateAccess } from "@/lib/revalidate";

/**
 * `GET /api/cms/rcs-segments`: the car classes for the Strapi custom field
 * that picks classes for a fleet block (`[{ id, names, cars, terms }]`).
 * Strapi has no RentCarSoft key; it asks here with the secret it already
 * shares with the site (`Authorization: Bearer <REVALIDATE_SECRET>`). The
 * data comes from the cached offer lists (`rcs:catalog`).
 */
export async function GET(request: Request) {
  const access = revalidateAccess(request);
  if (access === "not_configured") {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  if (access === "unauthorized") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ segments: await listSegments() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    // The bridge's error code only (no request details), so the CMS can tell "API down" from "bad setup".
    const code = error instanceof RentCarSoftError ? error.code : "unknown";
    return NextResponse.json({ error: "rcs_unavailable", code }, { status: 502 });
  }
}
