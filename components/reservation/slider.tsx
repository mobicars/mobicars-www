"use client";

import { Children, useEffect, useState, type ReactNode } from "react";

import { fill } from "@/i18n/fill";
import { useMessages } from "@/i18n/messages-context";

/**
 * Swipe row for phones: cards snap to the centre, the next one peeks in at
 * the edge, dots below show where you are and jump on tap. It opens on
 * `startIndex` (e.g. the recommended package) without changing the order.
 *
 * `className` decides where it stops being a slider: pass the grid classes
 * for wider screens (e.g. `md:grid md:grid-cols-3`) and hide the dots there
 * with `dotsClassName`, so the same cards serve both layouts.
 *
 * Plain children become a list. A collection that brings its own element (a
 * `GridList` of selectable cards) is passed as `list` instead: it gets the
 * ref, the row classes and the class for each item, and `count` says how many
 * items it renders.
 */
export function Slider({
  label,
  startIndex = 0,
  className = "",
  itemClassName = "",
  dotsClassName = "",
  children,
  list,
  count,
}: {
  label: string;
  startIndex?: number;
  className?: string;
  /** Width of a card in the slider, e.g. `w-[82%]`. */
  itemClassName?: string;
  dotsClassName?: string;
  children?: ReactNode;
  list?: (props: { ref: (element: HTMLDivElement | null) => void; className: string; itemClassName: string }) => ReactNode;
  count?: number;
}) {
  const { steps } = useMessages();
  const items = Children.toArray(children);
  const total = list ? (count ?? 0) : items.length;
  // State, not a ref: the row can be a collection that is handed the setter.
  const [row, setRow] = useState<HTMLElement | null>(null);
  const [active, setActive] = useState(startIndex);

  // Open on the start card, with no animation, once the row has a width: a
  // streamed step can mount while still hidden. Does nothing once it is a grid.
  useEffect(() => {
    const element = row;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(() => {
      if (element.clientWidth === 0) {
        return;
      }
      observer.disconnect();
      const item = element.children[startIndex] as HTMLElement | undefined;
      if (item && element.scrollWidth > element.clientWidth) {
        element.scrollLeft = item.offsetLeft - (element.clientWidth - item.offsetWidth) / 2;
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
    // Only once the row is there: later the customer's own position wins.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row]);

  function nearest(): number {
    const element = row;
    if (!element) {
      return active;
    }
    const middle = element.scrollLeft + element.clientWidth / 2;
    let best = 0;
    let distance = Infinity;
    [...element.children].forEach((child, index) => {
      const item = child as HTMLElement;
      const gap = Math.abs(item.offsetLeft + item.offsetWidth / 2 - middle);
      if (gap < distance) {
        distance = gap;
        best = index;
      }
    });
    return best;
  }

  function show(index: number) {
    const element = row;
    const item = element?.children[index] as HTMLElement | undefined;
    if (!element || !item) {
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollTo({
      left: item.offsetLeft - (element.clientWidth - item.offsetWidth) / 2,
      behavior: reduce ? "auto" : "smooth",
    });
  }

  // Scroll is listened to here, so a collection need not pass `onScroll` on.
  useEffect(() => {
    const element = row;
    if (!element) {
      return;
    }
    const onScroll = () => setActive(nearest());
    element.addEventListener("scroll", onScroll, { passive: true });
    return () => element.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row]);

  return (
    <div>
      {list ? (
        list({ ref: setRow, className: `${rowClass} ${className}`, itemClassName: `${itemClass} ${itemClassName}` })
      ) : (
        <ul ref={setRow} aria-label={label} className={`${rowClass} ${className}`}>
          {items.map((item, index) => (
            <li key={index} className={`${itemClass} ${itemClassName}`}>
              {item}
            </li>
          ))}
        </ul>
      )}
      {total > 1 ? (
        <div className={`mt-2 flex justify-center gap-1 ${dotsClassName}`}>
          {Array.from({ length: total }, (_, index) => (
            <button
              key={index}
              type="button"
              aria-label={fill(steps.slide, { index: index + 1, count: total })}
              aria-current={index === active || undefined}
              onClick={() => show(index)}
              className="flex size-6 cursor-pointer items-center justify-center"
            >
              <span
                className={`block h-2 rounded-full transition-[width,background-color] duration-200 ease-out motion-reduce:transition-none ${
                  index === active ? "w-5 bg-blue-medium" : "w-2 bg-blue-dark/20"
                }`}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const rowClass =
  "relative flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const itemClass = "flex shrink-0 snap-center";
