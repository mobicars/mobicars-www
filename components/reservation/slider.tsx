"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Swipe row for phones: cards snap to the centre, the next one peeks in at
 * the edge, dots below show where you are and jump on tap. It opens on
 * `startIndex` (e.g. the recommended package) without changing the order.
 *
 * `className` decides where it stops being a slider: pass the grid classes
 * for wider screens (e.g. `md:grid md:grid-cols-3`) and hide the dots there
 * with `dotsClassName`, so the same cards serve both layouts.
 */
export function Slider({
  label,
  startIndex = 0,
  className = "",
  itemClassName = "",
  dotsClassName = "",
  children,
}: {
  label: string;
  startIndex?: number;
  className?: string;
  /** Width of a card in the slider, e.g. `w-[82%]`. */
  itemClassName?: string;
  dotsClassName?: string;
  children: ReactNode;
}) {
  const items = Children.toArray(children);
  const list = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(startIndex);

  // Open on the start card, with no animation, once the row has a width: a
  // streamed step can mount while still hidden. Does nothing once it is a grid.
  useEffect(() => {
    const element = list.current;
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
    // Only on mount: later the customer's own position wins.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function nearest(): number {
    const element = list.current;
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
    const element = list.current;
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

  return (
    <div>
      <ul
        ref={list}
        aria-label={label}
        onScroll={() => setActive(nearest())}
        className={`relative flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      >
        {items.map((item, index) => (
          <li key={index} className={`flex shrink-0 snap-center ${itemClassName}`}>
            {item}
          </li>
        ))}
      </ul>
      {items.length > 1 ? (
        <div className={`mt-2 flex justify-center gap-1 ${dotsClassName}`}>
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Pokaż ${index + 1} z ${items.length}`}
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
