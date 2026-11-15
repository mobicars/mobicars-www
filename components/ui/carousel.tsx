"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "react-aria-components";
import type { EmblaCarouselType } from "embla-carousel";

import { buttonClass } from "@/components/ui/button";
import { fill } from "@/i18n/fill";
import { useMessages } from "@/i18n/messages-context";

import { cancelPressOnDrag } from "./embla-press";

export type CarouselTexts = {
  previous: string;
  next: string;
  /** A dot's name, with `{index}` and `{count}`: "Opinia 3 z 12". */
  goTo: string;
};

/**
 * The one carousel (catalog C7, round 5): the slides are server markup in
 * `children` (a `ul` of `li`), so every item is in the HTML and the row
 * already swipes with native scroll-snap before any script runs. When the row
 * nears the screen, Embla (~7 KB, loaded then, not with the page) takes it
 * over: drag with the mouse too, momentum, a real loop, dots and arrows.
 *
 * Put the scroll-snap fallback on `className` (`overflow-x-auto snap-x …`):
 * once Embla runs, `[data-embla]` in `app/globals.css` turns it off. An inset
 * (the page gutter) goes on `className` as padding too, not on the list:
 * Embla lines cards up with the list's edge, and the padding keeps them clear
 * of the screen edge (overflow clips outside the padding, so cards still
 * slide under it). With
 * `spotlight` every slide fully in view gets `data-active` (one on phones,
 * more on wider screens) and the list `data-carousel`, for CSS that dims
 * the cut-off ones at the edges. With `gridFrom="lg"` the
 * row is a grid from `lg` (`Rail`): Embla, dots and arrows run only below it.
 * Never moves on its own (WCAG 2.2.2).
 */
export function Carousel({
  label,
  count,
  texts,
  loop = false,
  align = "start",
  spotlight = false,
  tone = "light",
  gridFrom,
  bleed = false,
  className = "",
  children,
}: {
  label: string;
  /** Number of slides (2 or more: arrows and the dots' row). */
  count: number;
  /** Defaults to the generic "Previous" / "Next" / "Item 3 of 8". */
  texts?: CarouselTexts;
  loop?: boolean;
  align?: "start" | "center";
  spotlight?: boolean;
  /** `dark`: on navy or a photo (white dots). */
  tone?: "light" | "dark";
  /** From this breakpoint the row is a grid and no carousel (`Rail`). */
  gridFrom?: "lg";
  /**
   * Slides past the content width stay visible in the page margins (dimmed, with
   * `spotlight`) instead of being cut at the container's edge, as on the old
   * site's car slider: the row overflows the container and the section around
   * it clips at the screen edge. Slide widths are then fractions of the container.
   */
  bleed?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const t = useMessages().blocks;
  const words = texts ?? { previous: t.carouselPrevious, next: t.carouselNext, goTo: t.carouselGoTo };
  const viewport = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<EmblaCarouselType | null>(null);
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState(count);
  // Without a loop the arrow towards an end turns grey there.
  const [canPrev, setCanPrev] = useState(true);
  const [canNext, setCanNext] = useState(true);

  useEffect(() => {
    const root = viewport.current;
    if (!root || count < 2) return;
    let embla: EmblaCarouselType | null = null;
    let observer: IntersectionObserver | null = null;
    let releasePress: (() => void) | null = null;
    let cancelled = false;
    let touched = false;
    const onTouch = () => {
      touched = true;
    };
    for (const type of ["pointerdown", "wheel", "keydown"]) root.addEventListener(type, onTouch, { once: true, passive: true });
    const onSideClick = (event: MouseEvent) => {
      if (!embla) return;
      const slide = (event.target as HTMLElement).closest("li");
      const index = slide ? embla.slideNodes().indexOf(slide) : -1;
      if (index < 0 || slide?.hasAttribute("data-active") || (event.target as HTMLElement).closest("a, button, summary")) return;
      // Positions can hold several slides: go to the one that holds the tapped slide.
      const position = embla.internalEngine().slideRegistry.findIndex((group) => group.includes(index));
      if (position >= 0) embla.scrollTo(position);
    };
    const start = async () => {
      const { default: EmblaCarousel } = await import("embla-carousel");
      if (cancelled || embla) return;
      // If the customer already swiped the native row, Embla starts from the slide they were on. Otherwise from the
      // first: the browser's own snapping (centred slides) may have moved the untouched row to the second.
      const startIndex = touched ? nearestSlide(root, align) : 0;
      root.scrollLeft = 0;
      root.setAttribute("data-embla", "");
      // A spotlight steps one slide at a time. On phones (one slide)
      // every position is kept, so the first and last can stand in the middle; from `lg`, where three show, the
      // positions are trimmed, so the row starts with the first three lit and moves on one at a time.
      embla = EmblaCarousel(root, {
        loop,
        align,
        startIndex,
        containScroll: loop || spotlight ? false : "trimSnaps",
        // From the start edge there: the row fills the width, so each step is exactly one slide (centred, four in view
        // would stop half a slide in).
        ...(spotlight && !loop ? { breakpoints: { "(min-width: 64rem)": { containScroll: "trimSnaps" as const, align: "start" as const } } } : {}),
      });
      const list = embla.containerNode();
      const sync = (instance: EmblaCarouselType) => {
        setSelected(instance.selectedScrollSnap());
        setSnaps(instance.scrollSnapList().length);
        setCanPrev(instance.canScrollPrev());
        setCanNext(instance.canScrollNext());
        if (spotlight) {
          light(instance);
          list.setAttribute("data-carousel", "");
        }
      };
      // Every slide at least 90% inside the carousel is lit; only the cut-off ones at the edges step back. Measured
      // here (once a frame while it moves, and when it settles): Embla's own in-view list lags a step behind.
      const light = (instance: EmblaCarouselType) => {
        const box = root.getBoundingClientRect();
        instance.slideNodes().forEach((slide) => {
          const rect = slide.getBoundingClientRect();
          const shown = rect.width > 0 ? (Math.min(rect.right, box.right) - Math.max(rect.left, box.left)) / rect.width : 0;
          slide.toggleAttribute("data-active", shown >= 0.9);
        });
      };
      let frame = 0;
      const onScroll = (instance: EmblaCarouselType) => {
        if (!spotlight || frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          light(instance);
        });
      };
      embla.on("init", sync).on("reInit", sync).on("select", sync).on("scroll", onScroll).on("settle", sync);
      sync(embla);
      // A swipe that starts on a React Aria button (copy a promo code) must not leave it pressed.
      releasePress = cancelPressOnDrag(embla, root);
      // A tap on a side card brings it to the middle (Embla swallows the click that ends a drag).
      if (spotlight) list.addEventListener("click", onSideClick);
      setApi(embla);
    };
    const attach = () => {
      cancelled = false;
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect();
            void start();
          }
        },
        { rootMargin: "200px 0px" },
      );
      observer.observe(root);
    };
    const detach = () => {
      cancelled = true;
      for (const type of ["pointerdown", "wheel", "keydown"]) root.removeEventListener(type, onTouch);
      observer?.disconnect();
      releasePress?.();
      releasePress = null;
      if (embla) {
        const list = embla.containerNode();
        list.removeEventListener("click", onSideClick);
        list.removeAttribute("data-carousel");
        embla.slideNodes().forEach((slide) => slide.removeAttribute("data-active"));
        embla.destroy();
        embla = null;
      }
      root.removeAttribute("data-embla");
      setApi(null);
    };
    // A grid from `gridFrom` up: no Embla there, and it starts or stops when the window crosses it.
    const grid = gridFrom ? window.matchMedia("(min-width: 64rem)") : null;
    const onGridChange = () => (grid?.matches ? detach() : attach());
    onGridChange();
    grid?.addEventListener("change", onGridChange);
    return () => {
      grid?.removeEventListener("change", onGridChange);
      detach();
    };
  }, [count, loop, align, spotlight, gridFrom]);

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const goTo = (index: number) => {
    if (api) {
      api.scrollTo(index, reduced());
      return;
    }
    // Before Embla: the native row.
    const slide = viewport.current?.querySelectorAll(":scope > * > li")[index];
    slide?.scrollIntoView({
      behavior: reduced() ? "auto" : "smooth",
      block: "nearest",
      inline: align === "center" ? "center" : "start",
    });
  };
  const step = (direction: 1 | -1) => {
    if (api) {
      if (direction === 1) api.scrollNext(reduced());
      else api.scrollPrev(reduced());
      return;
    }
    const current = viewport.current ? nearestSlide(viewport.current, align) : 0;
    goTo((current + direction + count) % count);
  };

  const dot = tone === "dark" ? "bg-white/40 group-data-[current]/dot:bg-white" : "bg-blue-dark/25 group-data-[current]/dot:bg-go-strong";
  const ring = tone === "dark" ? "data-focus-visible:ring-white" : "data-focus-visible:ring-blue-medium";
  const gridHidden = gridFrom ? "lg:hidden" : "";
  const previousButton = (
    <Button aria-label={words.previous} isDisabled={api !== null && !canPrev} onPress={() => step(-1)} className={ARROW}>
      <ChevronLeft aria-hidden className="size-5" />
    </Button>
  );
  const nextButton = (
    <Button aria-label={words.next} isDisabled={api !== null && !canNext} onPress={() => step(1)} className={ARROW}>
      <ChevronRight aria-hidden className="size-5" />
    </Button>
  );
  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className="relative">
      {/* The arrows sit on the slides' row (not the dots), at its sides like carfree.pl's: in the margin with
          `bleed` (level with the page's content edge), inside the page gutter otherwise. Mice only, from `md`; phones swipe. */}
      {/* `bleed`: the whole row keeps a 64 px margin from `md`, and the arrows step back out into it (negative margin), level
          with the page's content edge. The scrolling viewport itself has no margin or padding, so Embla and the lit-slide
          measure share its edges (a padding there left the last slide under the arrow and the third one dimmed). */}
      <div className={`relative ${bleed ? "md:mx-16" : ""}`}>
        <div ref={viewport} data-bleed={bleed ? "" : undefined} className={className}>
          {children}
        </div>
        {count > 1 ? (
          <div
            className={`pointer-events-none absolute inset-0 hidden items-center justify-between pointer-coarse:hidden ${
              bleed ? "md:-mx-16" : "mx-auto max-w-page px-gutter"
            } ${api && snaps < 2 ? "" : "md:flex"} ${gridHidden}`}
          >
            {/* At an end (no loop) the arrow that way is grey, fainter and a little smaller. */}
            <span className={ARROW_HOLDER}>{previousButton}</span>
            <span className={ARROW_HOLDER}>{nextButton}</span>
          </div>
        ) : null}
      </div>
      {count > 1 ? (
        // 24 px targets (WCAG 2.5.8) around 8 px dots. The row is kept empty in the HTML (no markup for hidden tabs)
        // and filled once Embla runs; its height is fixed, so nothing moves.
        <div className={`mt-2 flex h-6 flex-wrap justify-center gap-x-1 ${gridHidden}`}>
          {Array.from({ length: api && snaps > 1 ? snaps : 0 }, (_, index) => (
            <Button
              key={index}
              aria-label={fill(words.goTo, { index: String(index + 1), count: String(snaps) })}
              aria-current={index === selected ? "true" : undefined}
              data-current={index === selected ? "" : undefined}
              onPress={() => goTo(index)}
              className={`group/dot grid size-6 cursor-pointer place-items-center rounded-full outline-none data-focus-visible:ring-2 ${ring}`}
            >
              <span
                aria-hidden
                className={`block h-2 w-2 rounded-full transition-[width,background-color] duration-250 ease-out-soft group-data-[current]/dot:w-5 motion-reduce:transition-none ${dot}`}
              />
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** The site's own button (blue circle, white chevron, the hover fill), with a shadow to lift it off the slides. */
const ARROW = buttonClass("primary", "icon", "shadow-float");
const ARROW_HOLDER =
  "pointer-events-auto transition-[opacity,scale] duration-250 ease-out-soft has-[button:disabled]:scale-90 has-[button:disabled]:opacity-40 motion-reduce:transition-none";

/** The slide nearest the row's centre (`center`) or its start edge (`start`). */
function nearestSlide(root: HTMLElement, align: "start" | "center"): number {
  const slides = [...root.querySelectorAll(":scope > * > li")];
  const box = root.getBoundingClientRect();
  const anchor = align === "center" ? box.left + box.width / 2 : box.left;
  let best = 0;
  let bestDistance = Infinity;
  slides.forEach((slide, index) => {
    const rect = slide.getBoundingClientRect();
    const distance = Math.abs((align === "center" ? rect.left + rect.width / 2 : rect.left) - anchor);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}
