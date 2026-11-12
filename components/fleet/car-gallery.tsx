"use client";

import { CarFront, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, type KeyboardEvent } from "react";

import { fill } from "@/i18n/fill";

type GalleryTexts = { photo: string; showPhoto: string; previousPhoto: string; nextPhoto: string; noPhoto: string };

/**
 * The car's photos: one large photo, arrows, and a thumbnail row. Own code, no
 * slider library. The first photo is the studio shot on white (shown whole,
 * `object-contain`); the car's own photos fill the frame.
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
  const [index, setIndex] = useState(0);
  const count = images.length;

  if (count === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-surface text-muted-dark">
        <CarFront className="size-16" strokeWidth={1} aria-hidden />
        <span className="sr-only">{t.noPhoto}</span>
      </div>
    );
  }

  const current = images[index];
  const go = (next: number) => setIndex((next + count) % count);

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
        className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface"
      >
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 720px, 100vw"
          className={index === 0 ? "object-contain p-4" : "object-cover"}
        />
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
        <ul className="flex snap-x gap-2 overflow-x-auto p-1 [scrollbar-width:thin]">
          {images.map((image, thumbIndex) => (
            <li key={image.src} className="shrink-0 snap-start">
              <button
                type="button"
                aria-label={fill(t.showPhoto, { index: thumbIndex + 1 })}
                aria-current={thumbIndex === index}
                onClick={() => setIndex(thumbIndex)}
                className={`relative block h-16 w-24 cursor-pointer overflow-hidden rounded-lg bg-surface outline-none ring-offset-2 transition focus-visible:ring-2 focus-visible:ring-blue-medium sm:h-20 sm:w-28 ${
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
      className={`absolute top-1/2 ${side === "left" ? "left-3" : "right-3"} flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-blue-dark shadow-md outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-blue-medium`}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}
