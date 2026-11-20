import type { PickupPlace } from "@/lib/reservation/places";

/** Points per language, fetched once per page view: every card's dialog shares them. */
const placesByLang = new Map<string, Promise<PickupPlace[]>>();

/**
 * The pickup points for the car card's "Rezerwuj" dialog (`/api/reservation/places`).
 * Its button calls this on hover, touch or focus, so the list is usually here by
 * the time the dialog opens.
 */
export function loadPlaces(lang: string): Promise<PickupPlace[]> {
  let places = placesByLang.get(lang);
  if (!places) {
    places = fetch(`/api/reservation/places?lang=${lang}`).then((response) =>
      response.ok ? (response.json() as Promise<PickupPlace[]>) : Promise.reject(new Error(String(response.status))),
    );
    // A failed fetch is not kept, so the next open tries again.
    places.catch(() => placesByLang.delete(lang));
    placesByLang.set(lang, places);
  }
  return places;
}
