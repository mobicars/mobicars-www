import "server-only";

import { langs, type Lang } from "@/i18n/config";
import { listSegments, listServicePoints } from "@/lib/rentcarsoft";

import type { ReservationSearch } from "./search";
import type { Localized } from "./storage";

/** The car class and the place of a booking draft in every language, so the homepage popup can show them in its own. */
export type DraftLabels = { segment: Localized; place: Localized };

/**
 * Names for the "finish your booking" draft (`RememberBooking`). The class
 * comes from the segment list (cached with the catalog), the points from the
 * pickup point list, which has every language's name. A customer address is
 * the same in every language. Best effort: a failed read gives empty names and
 * the draft keeps the text of the language it was saved in.
 */
export async function draftLabels(search: ReservationSearch, segmentId: string | null): Promise<DraftLabels> {
  try {
    const [segments, points] = await Promise.all([segmentId ? listSegments() : [], listServicePoints()]);
    const segment = segments.find((each) => String(each.id) === segmentId);
    const byId = new Map(points.map((point) => [point.id, point]));
    const name = (ref: { id: number; address: string | null }, lang: Lang) =>
      ref.address ?? byId.get(ref.id)?.names[lang] ?? null;

    const place: Localized = {};
    for (const lang of langs) {
      const pickup = name(search.pickup, lang);
      const dropoff = search.dropoff ? name(search.dropoff, lang) : null;
      if (pickup && (!search.dropoff || dropoff)) {
        place[lang] = dropoff ? `${pickup} → ${dropoff}` : pickup;
      }
    }
    return { segment: segment ? Object.fromEntries(Object.entries(segment.names).filter(([, text]) => text)) : {}, place };
  } catch {
    return { segment: {}, place: {} };
  }
}
