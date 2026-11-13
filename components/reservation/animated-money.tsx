"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { formatMoney } from "@/components/reservation/format";
import type { Lang } from "@/i18n/config";

const DURATION = 600;

/** The last amount each counter showed, so a counter that remounts (after a spinner) counts on from it. */
const lastShown = new Map<string, number>();

/**
 * An amount that counts to its new value when it changes, like CountUp. React
 * Aria has nothing for this, and a library is not worth one effect. Screen
 * readers get the final amount only (the counting part is hidden from them);
 * with reduced motion the amount changes at once.
 *
 * `id` names the counter (e.g. "summary-total"): two places that show the same
 * total share it, and so does the counter that comes back after loading.
 *
 * With `pending` (a newer quote on its way) the amount stays, greyed, with a
 * spinner before it, and counts on to the new one when it comes. `pendingLabel`
 * tells screen readers it is being recalculated.
 */
export function AnimatedMoney({
  id,
  value,
  lang,
  pending = false,
  pendingLabel,
}: {
  id: string;
  value: number;
  lang: Lang;
  pending?: boolean;
  pendingLabel?: string;
}) {
  const [shown, setShown] = useState(() => lastShown.get(id) ?? value);
  const frame = useRef(0);

  useEffect(() => {
    const from = lastShown.get(id) ?? value;
    lastShown.set(id, value);
    if (from === value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame.current = requestAnimationFrame(() => setShown(value));
      return () => cancelAnimationFrame(frame.current);
    }
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION);
      const eased = 1 - (1 - progress) ** 3;
      setShown(progress === 1 ? value : from + (value - from) * eased);
      if (progress < 1) {
        frame.current = requestAnimationFrame(step);
      }
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [id, value]);

  return (
    <span className="inline-flex items-center gap-1.5">
      {pending ? (
        <span role="status" className="inline-flex text-blue-medium">
          <LoaderCircle className="size-[0.9em] animate-spin motion-reduce:animate-none" aria-hidden />
          {pendingLabel ? <span className="sr-only">{pendingLabel}</span> : null}
        </span>
      ) : null}
      <span
        aria-hidden
        className={`tabular-nums transition-opacity duration-200 ease-out motion-reduce:transition-none ${pending ? "opacity-45" : ""}`}
      >
        {formatMoney(lang, Math.round(shown * 100) / 100)}
      </span>
      <span className="sr-only">{formatMoney(lang, value)}</span>
    </span>
  );
}
