import { NextResponse, type NextRequest } from "next/server";

import { isRateLimited, recordFailure, requestIp } from "@/lib/auth/rate-limit";
import { isLang } from "@/i18n/config";

/** Lookups per address in the limiter's 15-minute window. */
const MAX_LOOKUPS_PER_IP = 30;
const NOMINATIM = "https://nominatim.openstreetmap.org/reverse";

type Place = { city: string | null; street: string | null };

/**
 * `GET /api/geo/reverse?lat=…&lon=…&lang=pl`: the city and "street number"
 * for the customer's location, for "Użyj mojej lokalizacji" in the place
 * dialog. OpenStreetMap (Nominatim) answers; the request goes from here, so the
 * customer's IP address does not reach it. Coordinates are rounded to about
 * 10 m and never logged.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lat = Number(params.get("lat"));
  const lon = Number(params.get("lon"));
  const lang = params.get("lang") ?? "pl";
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180 || !isLang(lang)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const limit = [{ key: `geo-ip:${await requestIp()}`, max: MAX_LOOKUPS_PER_IP }];
  if (isRateLimited(limit)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  recordFailure(limit);

  const url = new URL(NOMINATIM);
  url.search = new URLSearchParams({
    lat: lat.toFixed(4),
    lon: lon.toFixed(4),
    format: "jsonv2",
    addressdetails: "1",
    zoom: "18",
    "accept-language": lang,
  }).toString();
  try {
    const response = await fetch(url, {
      // Nominatim's usage policy asks for an identifying User-Agent.
      headers: { "User-Agent": "mobicars-www/1.0 (+https://mobicars.pl)" },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) {
      throw new Error(String(response.status));
    }
    const place = toPlace(await response.json());
    return NextResponse.json(place, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("[geo reverse] lookup failed");
    return NextResponse.json({ error: "lookup_failed" }, { status: 502 });
  }
}

function toPlace(payload: unknown): Place {
  const address =
    payload && typeof payload === "object" && "address" in payload && payload.address && typeof payload.address === "object"
      ? (payload.address as Record<string, unknown>)
      : {};
  const text = (...keys: string[]) => {
    for (const key of keys) {
      const value = address[key];
      if (typeof value === "string" && value.trim() !== "") {
        return value.trim();
      }
    }
    return null;
  };
  const road = text("road", "pedestrian", "footway", "square", "neighbourhood");
  const number = text("house_number");
  return {
    city: text("city", "town", "village", "municipality"),
    street: road ? (number ? `${road} ${number}` : road) : null,
  };
}
