"use client";

import { useEffect, useId, useState } from "react";
import { Dialog } from "react-aria-components";
import { LoaderCircle } from "lucide-react";

import { loadPlaces } from "@/components/fleet/load-places";
import { DialogHeader } from "@/components/reservation/dialog-parts";
import { ReservationPicker } from "@/components/reservation/picker";
import { useLang } from "@/i18n/lang-context";
import { useMessages } from "@/i18n/messages-context";
import type { PickupPlace } from "@/lib/reservation/places";
import type { ReservationTerm } from "@/lib/reservation/search";

/**
 * The dialog of "Rezerwuj" (`BookCarButton`): the car's name and the search
 * for this car (`offerId`), locked to `term` when it is set, so its
 * "Rezerwuj" opens the booking on the car's next step.
 */
export function BookCarDialog({
  offerId,
  name,
  term,
  title,
  lead,
}: {
  offerId: number;
  name: string;
  term: ReservationTerm | null;
  title: string;
  lead: string;
}) {
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
          <ReservationPicker lang={lang} places={places} term={term ?? undefined} offerId={offerId} />
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
