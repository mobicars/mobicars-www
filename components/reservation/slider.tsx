"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import type { EmblaCarouselType } from "embla-carousel";

import { fill } from "@/i18n/fill";
import { useMessages } from "@/i18n/messages-context";
import { cancelPressOnDrag } from "@/components/ui/embla-press";

/**
 * Swipe row for phones: cards snap to the centre, the next one peeks in at
 * the edge, dots below show where you are and jump on tap. It opens on
 * `startIndex` (e.g. the recommended package) without changing the order.
 *
 * The row swipes natively (scroll-snap) from the first paint; when it nears
 * the screen, Embla (the site's carousel, `components/ui/carousel.tsx`) takes
 * it over: momentum and a smoother swipe. It drags with a finger only: a
 * mouse picks a React Aria card on press, so a mouse drag would choose it
 * (mice use the dots, and wider screens get the grid). A finger picks on the
 * click, which Embla swallows at the end of a drag; `cancelPressOnDrag`
 * then ends that card's press, so the next tap still picks.
 *
 * `frameClassName` is the scrolling frame: the bleed to the panel's edge
 * (`-mx-3 px-3 scroll-px-3`), its padding, and where it stops scrolling
 * (`@xl:mx-0 @xl:px-0 @xl:overflow-visible`). `className` is the row of
 * cards: pass the grid classes for wider screens (e.g. `@xl:grid
 * @xl:grid-cols-2`) and hide the dots there with `dotsClassName`, so the
 * same cards serve both layouts. While the row is a grid, Embla stays off.
 *
 * Plain children become a list. A collection that brings its own element (a
 * `GridList` of selectable cards) is passed as `list` instead: it gets the
 * ref, the row classes and the class for each item, and `count` says how many
 * items it renders.
 */
export function Slider({
  label,
  startIndex = 0,
  frameClassName = "",
  className = "",
  itemClassName = "",
  dotsClassName = "",
  children,
  list,
  count,
}: {
  label: string;
  startIndex?: number;
  frameClassName?: string;
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
  const frame = useRef<HTMLDivElement>(null);
  // State, not a ref: the row can be a collection that is handed the setter.
  const [row, setRow] = useState<HTMLElement | null>(null);
  const [active, setActive] = useState(startIndex);
  const [embla, setEmbla] = useState<EmblaCarouselType | null>(null);

  // Open on the start card, with no animation, once the frame has a width: a
  // streamed step can mount while still hidden. Does nothing once it is a grid.
  useEffect(() => {
    const element = frame.current;
    if (!element || !row) {
      return;
    }
    const observer = new ResizeObserver(() => {
      if (element.clientWidth === 0) {
        return;
      }
      observer.disconnect();
      const item = row.children[startIndex] as HTMLElement | undefined;
      if (item && element.scrollWidth > element.clientWidth) {
        element.scrollLeft += offsetToCentre(element, item);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
    // Only once the row is there: later the customer's own position wins.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row]);

  // Before Embla: follow the native swipe.
  useEffect(() => {
    const element = frame.current;
    if (!element || !row) {
      return;
    }
    const onScroll = () => {
      if (!element.hasAttribute("data-embla")) setActive(nearest(element, row));
    };
    element.addEventListener("scroll", onScroll, { passive: true });
    return () => element.removeEventListener("scroll", onScroll);
  }, [row]);

  // Embla, below the breakpoint where the row turns into a grid.
  useEffect(() => {
    const root = frame.current;
    if (!root || !row || total < 2) {
      return;
    }
    let instance: EmblaCarouselType | null = null;
    let releasePress: (() => void) | null = null;
    let visible = false;
    let cancelled = false;
    const isGrid = () => getComputedStyle(row).display === "grid";
    const start = async () => {
      const { default: EmblaCarousel } = await import("embla-carousel");
      if (cancelled || instance || isGrid()) {
        return;
      }
      const from = nearest(root, row);
      root.scrollLeft = 0;
      root.setAttribute("data-embla", "");
      instance = EmblaCarousel(root, {
        // Named, not "the first child": a React Aria GridList puts a <template> and hidden spans before its row.
        container: row,
        align: "center",
        startIndex: from,
        // One position per card, so a dot is a card even where the first ones cannot reach the middle.
        containScroll: "keepSnaps",
        // Touch only: a React Aria card picks itself on mouse *down* (before Embla can tell it was a drag),
        // so a mouse drag would choose a package. With a finger it picks on the click, which Embla swallows.
        watchDrag: (_api, event) => event.type === "touchstart",
      });
      instance.on("select", (api) => setActive(api.selectedScrollSnap()));
      releasePress = cancelPressOnDrag(instance, root);
      setActive(instance.selectedScrollSnap());
      setEmbla(instance);
    };
    const stop = () => {
      releasePress?.();
      releasePress = null;
      instance?.destroy();
      instance = null;
      root.removeAttribute("data-embla");
      setEmbla(null);
    };
    const update = () => {
      if (isGrid()) stop();
      else if (visible) void start();
    };
    const seen = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        update();
      },
      { rootMargin: "200px 0px" },
    );
    // The grid switch is a container query: watch the frame's width, not the window.
    const resized = new ResizeObserver(update);
    seen.observe(root);
    resized.observe(root);
    return () => {
      cancelled = true;
      seen.disconnect();
      resized.disconnect();
      stop();
    };
  }, [row, total]);

  function show(index: number) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (embla) {
      embla.scrollTo(index, reduce);
      return;
    }
    const element = frame.current;
    const item = row?.children[index] as HTMLElement | undefined;
    if (!element || !item) {
      return;
    }
    element.scrollTo({ left: element.scrollLeft + offsetToCentre(element, item), behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div>
      <div ref={frame} className={`${frameClass} ${frameClassName}`}>
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
      </div>
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

/** How far the frame must scroll to put `item` in its middle. */
function offsetToCentre(frame: HTMLElement, item: HTMLElement): number {
  const box = frame.getBoundingClientRect();
  const rect = item.getBoundingClientRect();
  return rect.left + rect.width / 2 - (box.left + box.width / 2);
}

/** The card nearest the middle of the frame. */
function nearest(frame: HTMLElement, row: HTMLElement): number {
  let best = 0;
  let distance = Infinity;
  [...row.children].forEach((child, index) => {
    const gap = Math.abs(offsetToCentre(frame, child as HTMLElement));
    if (gap < distance) {
      distance = gap;
      best = index;
    }
  });
  return best;
}

const frameClass = "snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const rowClass = "relative flex gap-3";
const itemClass = "flex shrink-0 snap-center";
