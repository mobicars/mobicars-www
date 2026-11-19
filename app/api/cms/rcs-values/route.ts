import { NextResponse } from "next/server";

import { getMessages } from "@/i18n/messages";
import { collectionValues } from "@/lib/fleet/car-collection";
import { listFleetCars } from "@/lib/fleet/cars";
import { RentCarSoftError } from "@/lib/rentcarsoft";
import { revalidateAccess } from "@/lib/revalidate";

/**
 * `GET /api/cms/rcs-values`: what the car collection pickers in Strapi offer
 * (categories, fuels, bodies, gearboxes: id, Polish label, car count). Asked
 * with the shared secret like `/api/cms/rcs-segments`; built from the cached
 * fleet list (`rcs:catalog`), so no RentCarSoft call of its own.
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
    const values = collectionValues(await listFleetCars("pl"), getMessages("pl").cars.categories);
    return NextResponse.json(values, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof RentCarSoftError ? error.code : "unknown";
    return NextResponse.json({ error: "rcs_unavailable", code }, { status: 502 });
  }
}
