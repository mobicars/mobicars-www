"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Car, CircleCheck, Package, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";

import { currentHrefWith } from "@/components/reservation/url";
import { QUERY_KEYS } from "@/lib/reservation/search";

/** Step labels, icons and the `step` value that opens each one (`null`: the car list). */
const STEPS: { label: string; icon: LucideIcon; step: string | null }[] = [
  { label: "Samochód", icon: Car, step: null },
  { label: "Ochrona", icon: ShieldCheck, step: "protection" },
  { label: "Dodatki", icon: Package, step: "extras" },
  { label: "Twoje dane", icon: UserRound, step: "details" },
];

/**
 * The step shown last in this page visit. A full load starts at `null`, so a
 * refresh or a shared link stays where the browser put it.
 */
let shownStep: number | null = null;

/**
 * Booking progress above the step content, like the old site: an icon per
 * step (a check once done) joined by lines across the width. Below `md` only
 * the current step keeps its label. `current` counts from 0. A step already
 * done is a button back to it; the choices in the URL (car, protection,
 * extras) stay, so going back loses nothing.
 */
export function ReservationSteps({ current }: { current: number }) {
  const router = useRouter();
  const list = useRef<HTMLOListElement>(null);

  // Step changes navigate with `scroll: false`; the new step starts here, not at
  // the top of the page under the search widget.
  useEffect(() => {
    if (shownStep !== null && shownStep !== current) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      list.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    }
    shownStep = current;
  }, [current]);

  return (
    <ol ref={list} aria-label="Etapy rezerwacji" className="mb-8 flex w-full scroll-mt-4 items-center">
      {STEPS.map(({ label, icon: Icon, step }, index) => {
        const done = index < current;
        const active = index === current;
        const content = (
          <>
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-full border md:size-10 transition-colors duration-200 ease-out motion-reduce:transition-none ${
                done
                  ? "border-green-medium bg-green-medium text-white"
                  : active
                    ? "border-blue-medium bg-blue-medium text-white"
                    : "border-blue-medium/30 text-blue-medium/50"
              }`}
            >
              {done ? (
                <CircleCheck className="size-5" strokeWidth={1.75} aria-hidden />
              ) : (
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              )}
            </span>
            <span
              // Below `md` the other labels stay for screen readers only.
              className={`${active ? "text-blue-medium" : "sr-only text-blue-medium/50 md:not-sr-only"} ${
                done ? "md:text-blue-dark/70" : ""
              }`}
            >
              {label}
            </span>
          </>
        );
        const last = index === STEPS.length - 1;
        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className={`flex items-center text-sm font-semibold md:text-base ${last ? "" : "flex-1"}`}
          >
            {done ? (
              <button
                type="button"
                onClick={() => router.push(currentHrefWith({ [QUERY_KEYS.step]: step }), { scroll: false })}
                className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full md:gap-3 outline-none focus-visible:ring-2 focus-visible:ring-blue-medium focus-visible:ring-offset-2 [&>span:last-child]:underline-offset-2 hover:[&>span:last-child]:underline"
              >
                <span className="sr-only">Wróć do kroku: </span>
                {content}
              </button>
            ) : (
              <span className="flex shrink-0 items-center gap-2 md:gap-3">
                {content}
              </span>
            )}
            {last ? null : (
              <span
                aria-hidden
                className={`mx-1.5 h-px min-w-3 flex-1 sm:mx-3 md:mx-6 xl:mx-10 ${done ? "bg-green-medium/40" : "bg-muted"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
