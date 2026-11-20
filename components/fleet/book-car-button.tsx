"use client";

import { CalendarDays } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { loadPlaces } from "@/components/fleet/load-places";
import { WidgetModal } from "@/components/reservation/dialog-parts";
import { DialogLoading } from "@/components/reservation/lazy-dialog";
import { useLang } from "@/i18n/lang-context";
import { useMessages } from "@/i18n/messages-context";

const loadDialog = () => import("@/components/fleet/book-car-dialog");
const BookCarDialog = dynamic(() => loadDialog().then((module) => module.BookCarDialog), {
  ssr: false,
  loading: () => <DialogLoading />,
});

/**
 * The car card's "Rezerwuj": opens the short-term search for this car in a
 * dialog; its "Rezerwuj" goes straight to the booking's next step with the car
 * chosen. The dialog's module and the pickup points load together on the first
 * hover, touch or focus of the button, so the cards cost the page nothing and
 * the dialog opens with its form.
 */
export function BookCarButton({
  offerId,
  name,
  title,
  lead,
  className,
}: {
  offerId: number;
  name: string;
  /** The dialog's heading and line under the name (`fleet` texts, which the browser does not get on every page). */
  title: string;
  lead: string;
  className: string;
}) {
  const texts = useMessages().search;
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const preload = () => {
    void loadDialog().catch(() => undefined);
    void loadPlaces(lang).catch(() => undefined);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} onPointerEnter={preload} onFocus={preload} className={className}>
        <CalendarDays className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
        {texts.submit}
        {/* Every card has one: screen readers hear which car ("Rezerwuj Toyota Aygo"). */}
        <span className="sr-only">{name}</span>
      </button>
      <WidgetModal
        open={open}
        onOpenChange={setOpen}
        className="max-h-[calc(100dvh-1rem)] w-full max-sm:mt-auto max-sm:mb-0 max-sm:rounded-t-card max-sm:pb-[env(safe-area-inset-bottom)] sm:max-h-[calc(100dvh-3rem)] sm:w-[min(30rem,calc(100%-2rem))] sm:rounded-card sm:shadow-float"
      >
        {open ? <BookCarDialog offerId={offerId} name={name} title={title} lead={lead} /> : null}
      </WidgetModal>
    </>
  );
}
