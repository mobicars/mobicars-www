"use client";

import { useEffect, useRef, useState } from "react";

type Clip = { url: string; mime: string };

/**
 * The hero's looping background video, over the photo. It is fetched only
 * after the page has loaded and gone quiet, and only while the hero is near
 * the screen, so it never competes with the photo (the LCP) for the
 * connection; it fades in once it plays. Skipped
 * for visitors who ask for less motion or for data saving: they keep the
 * photo. Phones play `mobile` when there is one, else the desktop clip.
 * Without a photo the same wait holds (the page's scripts come first, for a
 * quick first tap); the hero is navy until the clip plays.
 */
export function HeroVideo({ desktop, mobile }: { desktop: Clip; mobile: Clip | null }) {
  const area = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const [clip, setClip] = useState<Clip | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const element = area.current;
    if (reduced || saveData || !element) return;
    const choose = () => setClip(mobile && window.matchMedia("(max-width: 767px)").matches ? mobile : desktop);
    let idle: number | undefined;
    // Only a hero near the screen fetches its clip (one far down the page waits until it is scrolled to).
    const seen = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        seen.disconnect();
        idle = typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(choose, { timeout: 2500 }) : window.setTimeout(choose, 1500);
      },
      { rootMargin: "200px 0px" },
    );
    const later = () => seen.observe(element);
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });
    return () => {
      window.removeEventListener("load", later);
      seen.disconnect();
      if (idle === undefined) return;
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [desktop, mobile]);

  // `muted` must be set on the element itself for autoplay to be allowed everywhere.
  useEffect(() => {
    const video = ref.current;
    if (!video || !clip) return;
    video.muted = true;
    void video.play().catch(() => undefined);
  }, [clip]);

  return (
    <div ref={area} aria-hidden className="pointer-events-none absolute inset-0">
      {clip ? (
        <video
          ref={ref}
          className={`size-full object-cover transition-opacity duration-700 ease-out-soft motion-reduce:transition-none ${playing ? "opacity-100" : "opacity-0"}`}
          src={clip.url}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
        />
      ) : null}
    </div>
  );
}
