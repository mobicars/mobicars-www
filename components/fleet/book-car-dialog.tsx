"use client";

import { useEffect, useId, useState } from "react";
import { Dialog } from "react-aria-components";
import { LoaderCircle } from "lucide-react";

import { DialogHeader } from "@/components/reservation/dialog-parts";
import { ReservationPicker } from "@/components/reservation/picker";
import { useLang } from "@/i18n/lang-context";
import { useMessages } from "@/i18n/messages-context";
import type { PickupPlace } from "@/lib/reservation/places";

/** Points per language, fetched once per page view: every card's dialog shares them. */
const placesByLang = new Map<string, Promise<PickupPlace[]>>();

function loadPlaces(lang: string): Promise<PickupPlace[]> {
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

/**
 * The dialog of the car card's "Rezerwuj" (`BookCarButton`): the car's name
 * and the short-term search, locked to days, for this car (`offerId`), so its
 * "Rezerwuj" opens the booking on the protection step.
 */
export function BookCarDialog({ offerId, name, title, lead }: { offerId: number; name: string; title: string; lead: string }) {
  const titleId = useId();
  const lang = useLang();
  const messages = useMessages();
  const [places, setPlaces] = useState<PickupPlace[] | null>(null);

  useEffect(() => {
    let active = true;
    // Without the points the form still works: the place field then says there are none.
    loadPlaces(lang)
      .catch(() => [])
      .then((loaded) => {
        if (active) {
          setPlaces(loaded);
        }
      });
    return () => {
      active = false;
    };
  }, [lang]);

  return (
    <Dialog aria-labelledby={titleId} className="flex min-h-0 flex-1 flex-col overflow-hidden outline-none">
      <DialogHeader titleId={titleId} title={title} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <p className="text-center text-sm font-semibold text-blue-medium">{name}</p>
        <p className="mt-1 mb-5 text-center text-sm text-muted-dark">{lead}</p>
        {places ? (
          <ReservationPicker lang={lang} places={places} term="short" offerId={offerId} />
        ) : (
          <div className="flex min-h-40 items-center justify-center">
            <LoaderCircle className="size-6 animate-spin text-blue-medium motion-reduce:animate-none" aria-hidden />
            <span className="sr-only">{messages.search.loading}</span>
          </div>
        )}
      </div>
    </Dialog>
  );
}
