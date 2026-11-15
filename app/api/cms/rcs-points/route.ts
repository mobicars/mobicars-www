import { NextResponse } from "next/server";

import { listServicePoints, RentCarSoftError, type ServicePoint } from "@/lib/rentcarsoft";
import { revalidateAccess } from "@/lib/revalidate";

/**
 * `GET /api/cms/rcs-points`: the active pickup points for the Strapi custom
 * field that picks a point (the booking search's default pickup) or a town
 * (`blocks.locations`): `{ points: [{ id, name, city, kind, customAddress }],
 * cities: [...] }`, in Polish, as RentCarSoft names them. Strapi has no
 * RentCarSoft key; it asks here with the secret it already shares with the
 * site (`Authorization: Bearer <REVALIDATE_SECRET>`), like `rcs-segments`.
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
    const points = (await listServicePoints({ lang: "pl" })).filter((point) => point.active).map(toCmsPoint);
    const cities = [...new Set(points.flatMap((point) => (point.city ? [point.city] : [])))].sort((a, b) => a.localeCompare(b, "pl"));
    return NextResponse.json({ points, cities }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    // The bridge's error code only (no request details), so the CMS can tell "API down" from "bad setup".
    const code = error instanceof RentCarSoftError ? error.code : "unknown";
    return NextResponse.json({ error: "rcs_unavailable", code }, { status: 502 });
  }
}

/** What the editor needs to recognise a point: its id, name, town and kind. */
function toCmsPoint(point: ServicePoint) {
  const kind = point.airport ? "airport" : point.trainStation ? "station" : point.office ? "office" : point.customAddresses ? "address" : "other";
  return { id: point.id, name: point.name, city: point.city, kind, customAddress: point.customAddresses };
}
