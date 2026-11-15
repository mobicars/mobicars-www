import { NextResponse } from "next/server";

import { listFleetCars } from "@/lib/fleet/cars";
import { RentCarSoftError } from "@/lib/rentcarsoft";
import { revalidateAccess } from "@/lib/revalidate";

/**
 * `GET /api/cms/rcs-cars`: the cars for the Strapi custom field that picks
 * and orders cars for a Cars section (`[{ id, name, segment, image }]`, in the
 * fleet's order). Same access as `rcs-segments`: the secret Strapi shares with
 * the site (`Authorization: Bearer <REVALIDATE_SECRET>`). The data comes from
 * the cached fleet list; `image` is the RentCarSoft photo for the thumbnail.
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
    const cars = (await listFleetCars("pl")).map((car) => ({ id: car.id, name: car.name, segment: car.segment, image: car.image?.src ?? null }));
    return NextResponse.json({ cars }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    // The bridge's error code only (no request details), so the CMS can tell "API down" from "bad setup".
    const code = error instanceof RentCarSoftError ? error.code : "unknown";
    return NextResponse.json({ error: "rcs_unavailable", code }, { status: 502 });
  }
}
