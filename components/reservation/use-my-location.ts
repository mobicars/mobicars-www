"use client";

import { useState } from "react";

import { useClientOnlyValue } from "@/components/reservation/use-client-only-value";
import { useLang } from "@/i18n/lang-context";

export type MyPlace = { city: string | null; street: string | null };
type LocationError = "denied" | "failed";

/**
 * "Użyj mojej lokalizacji": asks the browser for the position (it shows its
 * own consent prompt), then `/api/geo/reverse` for the city and street.
 * `supported` is false on the server and where the browser has no geolocation.
 */
export function useMyLocation() {
  const lang = useLang();
  const supported = useClientOnlyValue(() => ("geolocation" in navigator && window.isSecureContext) || null) ?? false;
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);

  function locate(onFound: (place: MyPlace) => void) {
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const params = new URLSearchParams({
            lat: String(coords.latitude),
            lon: String(coords.longitude),
            lang,
          });
          const response = await fetch(`/api/geo/reverse?${params}`);
          if (!response.ok) {
            throw new Error(String(response.status));
          }
          onFound((await response.json()) as MyPlace);
        } catch {
          setError("failed");
        } finally {
          setLocating(false);
        }
      },
      (failure) => {
        setError(failure.code === failure.PERMISSION_DENIED ? "denied" : "failed");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  return { supported, locating, error, locate };
}
