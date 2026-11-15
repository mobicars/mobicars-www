"use client";

import { CarFront, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { EmblaCarouselType } from "embla-carousel";

import { fill } from "@/i18n/fill";

type GalleryTexts = { photo: string; showPhoto: string; previousPhoto: string; nextPhoto: string; noPhoto: string };

/**
 * The car's photos: a swipeable frame (arrows, a counter) and a thumbnail
 * row. The first photo is the studio shot on white (shown whole,
 * `object-contain`); the car's own photos fill the frame.
 *
 * The frame swipes natively (scroll-snap) from the first paint. Once the page
 * is idle, Embla (the site's carousel, ~7 KB, shared with `Carousel`) takes
 * it over: drag with the mouse, momentum, a loop. Only the first photo loads
 * with the page (it is the LCP); a photo is mounted when it or its neighbour
 * is shown, so the others never compete with it for bandwidth.
 */
export function CarGallery({
  images,
  name,
  t,
}: {
  images: { src: string; thumb: string; alt: string }[];
  name: string;
  t: GalleryTexts;
}) {
  const count = images.length;
  const viewport = useRef<HTMLDivElement>(null);
  const thumbs = useRef<HTMLUListElement>(null);
  const embla = useRef<EmblaCarouselType | null>(null);
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState<ReadonlySet<number>>(() => new Set([0]));

  // The shown photo and its neighbours, so the next swipe lands on a photo, not a blank frame.
  const reveal = (shown: number) =>
    setMounted((previous) => {
      const wanted = [shown, (shown + 1) % count, (shown - 1 + count) % count];
      return wanted.every((photo) => previous.has(photo)) ? previous : new Set([...previous, ...wanted]);
    });

  useEffect(() => {
    const root = viewport.current;
    if (!root || count < 2) return;
    let cancelled = false;
    // Before Embla: follow the native swipe.
    const onScroll = () => {
      if (embla.current || root.clientWidth === 0) return;
      const shown = Math.round(root.scrollLeft / root.clientWidth);
      setIndex(shown);
      reveal(shown);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    const start = async () => {
      const { default: EmblaCarousel } = await import("embla-carousel");
      if (cancelled || embla.current) return;
      const startIndex = root.clientWidth ? Math.round(root.scrollLeft / root.clientWidth) : 0;
      root.scrollLeft = 0;
      root.setAttribute("data-embla", "");
      const instance = EmblaCarousel(root, { loop: true, startIndex });
      const sync = () => {
        const shown = instance.selectedScrollSnap();
        setIndex(shown);
        reveal(shown);
      };
      instance.on("select", sync);
      embla.current = instance;
      sync();
    };
    // After the page has loaded and gone quiet: never on the LCP's critical path.
    // Safari has no requestIdleCallback.
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle ? window.requestIdleCallback(() => void start(), { timeout: 3000 }) : setTimeout(() => void start(), 2000);
    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(idle as number);
      else clearTimeout(idle);
      root.removeEventListener("scroll", onScroll);
      embla.current?.destroy();
      embla.current = null;
      root.removeAttribute("data-embla");
    };
    // `reveal` only sets state; the effect runs once per gallery.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  // Keep the current thumbnail in view in its own row (never scrolls the page).
  useEffect(() => {
    const row = thumbs.current;
    const thumb = row?.children[index] as HTMLElement | undefined;
    if (!row || !thumb) return;
    const left = thumb.offsetLeft - row.offsetLeft;
    if (left < row.scrollLeft || left + thumb.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollTo({ left: left - (row.clientWidth - thumb.offsetWidth) / 2, behavior: "smooth" });
    }
  }, [index]);

  if (count === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-card border border-line bg-white text-muted-dark">
        <CarFront className="size-16" strokeWidth={1} aria-hidden />
        <span className="sr-only">{t.noPhoto}</span>
      </div>
    );
  }

  const go = (target: number) => {
    const next = (target + count) % count;
    reveal(next);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (embla.current) {
      embla.current.scrollTo(next, reduced);
      return;
    }
    const root = viewport.current;
    root?.scrollTo({ left: next * root.clientWidth, behavior: reduced ? "auto" : "smooth" });
  };

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(index + 1);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={name}
        onKeyDown={onKeyDown}
        className="relative overflow-hidden rounded-card border border-line bg-white"
      >
        <div ref={viewport} className="snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex">
            {images.map((image, photo) => (
              <li
                key={image.src}
                aria-hidden={photo !== index}
                className="relative aspect-[4/3] w-full shrink-0 snap-center"
              >
                {mounted.has(photo) ? (
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    priority={photo === 0}
                    draggable={false}
                    sizes="(min-width: 1024px) 720px, 100vw"
                    className={photo === 0 ? "object-contain p-4" : "object-cover"}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        </div>
        <p className="sr-only" aria-live="polite">
          {fill(t.photo, { index: index + 1, count })}
        </p>
        {count > 1 ? (
          <>
            <ArrowButton side="left" label={t.previousPhoto} onClick={() => go(index - 1)} />
            <ArrowButton side="right" label={t.nextPhoto} onClick={() => go(index + 1)} />
            <span
              aria-hidden
              className="absolute right-3 bottom-3 rounded-full bg-blue-dark/75 px-2 py-0.5 text-xs font-semibold text-white"
            >
              {index + 1} / {count}
            </span>
          </>
        ) : null}
      </div>
      {count > 1 ? (
        <ul ref={thumbs} className="flex snap-x gap-2 overflow-x-auto p-1 [scrollbar-width:thin]">
          {images.map((image, thumbIndex) => (
            <li key={image.src} className="shrink-0 snap-start">
              <button
                type="button"
                aria-label={fill(t.showPhoto, { index: thumbIndex + 1 })}
                aria-current={thumbIndex === index}
                onClick={() => go(thumbIndex)}
                className={`relative block h-16 w-24 cursor-pointer overflow-hidden rounded-control border border-line bg-white outline-none ring-offset-2 transition focus-visible:ring-2 focus-visible:ring-blue-medium sm:h-20 sm:w-28 ${
                  thumbIndex === index ? "ring-2 ring-blue-medium" : "opacity-75 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.thumb}
                  alt=""
                  fill
                  sizes="112px"
                  className={thumbIndex === 0 ? "object-contain p-1" : "object-cover"}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ArrowButton({ side, label, onClick }: { side: "left" | "right"; label: string; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`absolute top-1/2 ${side === "left" ? "left-3" : "right-3"} flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-blue-dark shadow-card outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-blue-medium`}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}
