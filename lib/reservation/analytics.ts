import { useEffect } from "react";

import type { ExtrasSelection, ExtrasView } from "@/lib/reservation/extras";
import type { ReservationTerm } from "@/lib/reservation/search";

/**
 * Booking events for GA4, pushed to `window.dataLayer` and nothing else.
 *
 * No tag is loaded here: the GA4 / GTM id and the cookie consent are the
 * client's decision. Until a container reads the layer, pushing costs nothing
 * and sets no cookie. Payloads never carry personal data (no name, email,
 * phone, NIP or comment), only cars, packages, extras and amounts.
 *
 * | Event | When | Params |
 * | --- | --- | --- |
 * | `booking_step` | a step is shown | `step`, `term` |
 * | `select_item` | a car is chosen on the list | `item_list_name`, `items` |
 * | `select_protection` | a package is chosen | `protection_id`, `protection_name` |
 * | `extra_add` / `extra_remove` | an extra, zone or quantity changes | `extra_id`, `extra_name`, `kind`, `quantity` |
 * | `generate_lead` | "Rezerwacja wysłana" is shown | `currency`, `value`, `term`, `booking_id`, `protection`, `extras_count` |
 *
 * `generate_lead`, not `purchase`: the team still confirms the booking and
 * nothing is paid yet. Mark it as a key event in GA4.
 */
export type BookingStep = "car" | "protection" | "extras" | "details" | "confirmation";

type DataLayerEvent = { event: string } & Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

export function track(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}

/** Daily or monthly from a search's query string (`months` means monthly). */
export function termOfSearchQuery(searchQuery: string): ReservationTerm {
  return new URLSearchParams(searchQuery).has("months") ? "long" : "short";
}

/** `booking_step` once per mount of a step. */
export function useBookingStep(step: BookingStep, term: ReservationTerm): void {
  useEffect(() => {
    track("booking_step", { step, term });
  }, [step, term]);
}

/** `extra_add` / `extra_remove` for what differs between two extras selections. */
export function trackExtrasChange(view: ExtrasView, before: ExtrasSelection, after: ExtrasSelection): void {
  const names = new Map<number, string>();
  for (const option of [...view.zones, ...view.groups.flatMap((group) => group.items)]) {
    names.set(option.id, option.name);
  }
  const send = (added: boolean, id: number, kind: string, quantity = 1) =>
    track(added ? "extra_add" : "extra_remove", { extra_id: id, extra_name: names.get(id) ?? null, kind, quantity });

  if (before.zone !== after.zone) {
    if (before.zone !== null) {
      send(false, before.zone, "zone");
    }
    if (after.zone !== null) {
      send(true, after.zone, "zone");
    }
  }
  for (const id of after.addons.filter((addon) => !before.addons.includes(addon))) {
    send(true, id, "addon");
  }
  for (const id of before.addons.filter((addon) => !after.addons.includes(addon))) {
    send(false, id, "addon");
  }
  for (const id of new Set([...before.accessories.keys(), ...after.accessories.keys()])) {
    const was = before.accessories.get(id) ?? 0;
    const now = after.accessories.get(id) ?? 0;
    if (now !== was) {
      send(now > was, id, "accessory", now);
    }
  }
}
