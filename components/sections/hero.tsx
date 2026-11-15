import { getImageProps } from "next/image";
import { Suspense } from "react";

import { CtaLink } from "@/components/blocks/cta-link";
import { ReservationPicker } from "@/components/reservation/picker";
import type { Lang } from "@/i18n/config";
import { listServicePoints } from "@/lib/rentcarsoft";
import { toPickupPlace } from "@/lib/reservation/places";
import type { HeroSection, Media } from "@/lib/strapi";

import { HeroVideo } from "./hero-video";
import { FRAME, SECTION_CTA_SIZE, SPACING } from "./section-shell";
import { frameSizes } from "./image-sizes";


/**
 * Navy over the photo, never flat black; the same at every width. Without a
 * search an even layer; with one (either layout) a layer from the top, darkest
 * behind the copy and lightest under the form. Even "none" keeps a light layer.
 */
const OVERLAYS: Record<"plain" | "search", Record<HeroSection["overlay"], string>> = {
  plain: {
    none: "bg-blue-dark/25",
    light: "bg-blue-dark/50",
    strong: "bg-blue-dark/80",
  },
  search: {
    none: "bg-linear-to-b from-blue-dark/50 to-blue-dark/25",
    light: "bg-linear-to-b from-blue-dark/75 to-blue-dark/25",
    strong: "bg-linear-to-b from-blue-dark/90 to-blue-dark/25",
  },
};

/** Below this the mobile photo (when set) is shown. */
const MOBILE_QUERY = "(max-width: 767px)";
const DESKTOP_QUERY = "(min-width: 768px)";

/**
 * The new hero (`sections.hero`): photo under the whole section (a separate
 * crop on phones) and/or a looping video over it, navy without either, the `<h1>` with badge,
 * subtitle and up to two buttons, and optionally the booking search, vertical
 * beside the copy (left or right from `lg`, under it on phones) or horizontal
 * under it.
 *
 * `priority` (the page's first hero) makes the title the `<h1>`, preloads the
 * photo for the right screen and loads it first: it is the LCP (the title is,
 * without a photo). The section
 * does not wait for RentCarSoft: the search stands in without pickup points
 * and the real one streams in when they are there, at the same size.
 */
export function Hero({ section, lang, priority, pickupId }: { section: HeroSection; lang: Lang; priority: boolean; pickupId: number | null }) {
  const Heading = priority ? "h1" : "h2";
  const frame = FRAME[section.width];
  const search = section.search;
  const vertical = search?.layout === "vertical";
  const searchRight = vertical && search.side === "right";
  const centred = !vertical && section.align === "center";
  const overlay = OVERLAYS[search ? "search" : "plain"][section.overlay];

  return (
    <div className={frame.outer}>
      <section className={`relative isolate overflow-hidden bg-blue-dark ${frame.box}`}>
        {section.image ? <Background image={section.image} imageMobile={section.imageMobile} priority={priority} sizes={frameSizes(section.width)} /> : null}
        {section.video ? <HeroVideo desktop={clip(section.video)} mobile={section.videoMobile ? clip(section.videoMobile) : null} /> : null}
        <div aria-hidden className={`absolute inset-0 ${overlay}`} />

        {/* Layers in markup order, no negative z-index (accessibility checkers misread those): photo, video, overlay, then the content, positioned above them. */}
        <div
          className={`relative mx-auto grid w-full grid-cols-1 gap-8 ${frame.inner} ${SPACING[section.spacing]} ${
            vertical
              ? `lg:items-center lg:gap-x-16 ${searchRight ? "lg:grid-cols-[minmax(0,1fr)_28rem]" : "lg:grid-cols-[28rem_minmax(0,1fr)]"}`
              : ""
          }`}
        >
          {/* The copy comes first on phones and to screen readers; on desktops a left-hand form takes the first column. */}
          <div
            className={`flex flex-col gap-4 text-white ${centred ? "items-center text-center" : ""} ${
              vertical && !searchRight ? "lg:col-start-2 lg:row-start-1" : ""
            }`}
          >
            {section.badge ? <p className="w-fit rounded-full bg-white/95 px-3 py-1 text-eyebrow text-blue-medium uppercase">{section.badge}</p> : null}
            <Heading className="max-w-4xl text-display text-balance break-words hyphens-auto">{section.title}</Heading>
            {section.subtitle ? <p className="max-w-3xl text-lead text-pretty text-white/90">{section.subtitle}</p> : null}
            {section.ctas.length > 0 ? (
              <div className={`mt-2 flex flex-col gap-3 sm:flex-row ${centred ? "sm:justify-center" : ""}`}>
                {section.ctas.map((cta) => (
                  <CtaLink key={`${cta.href}-${cta.label}`} cta={cta} size={SECTION_CTA_SIZE} />
                ))}
              </div>
            ) : null}
          </div>

          {search ? (
            <div className={vertical && !searchRight ? "lg:col-start-1 lg:row-start-1" : undefined}>
              <Suspense
                fallback={
                  <ReservationPicker lang={lang} places={[]} layout={search.layout} defaultTerm={search.term} defaultPickupId={pickupId} sticky={priority} />
                }
              >
                <HeroSearch lang={lang} search={search} pickupId={pickupId} sticky={priority} />
              </Suspense>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function clip(media: Media) {
  return { url: media.url, mime: media.mime };
}

/** The search with the pickup points from RentCarSoft (cached in production); without them when it is down. */
async function HeroSearch({
  lang,
  search,
  pickupId,
  sticky,
}: {
  lang: Lang;
  search: NonNullable<HeroSection["search"]>;
  pickupId: number | null;
  sticky: boolean;
}) {
  // A RentCarSoft outage must not take the page down: the form stays as it was in the fallback.
  const points = await listServicePoints({ lang }).catch((error: unknown) => {
    console.error(`[hero] service points unavailable, form without them: ${error instanceof Error ? error.name : "unknown"}`);
    return [];
  });
  return (
    <ReservationPicker
      lang={lang}
      places={points.map(toPickupPlace)}
      layout={search.layout}
      defaultTerm={search.term}
      defaultPickupId={pickupId}
      sticky={sticky}
    />
  );
}

function Background({ image, imageMobile, priority, sizes }: { image: Media; imageMobile: Media | null; priority: boolean; sizes: string }) {
  const common = {
    alt: image.alt,
    sizes,
    quality: 75,
    ...(priority ? { loading: "eager" as const, fetchPriority: "high" as const } : {}),
  };
  const { props: desktop } = getImageProps({ ...common, src: image.url, width: image.width ?? 1920, height: image.height ?? 1080 });
  const mobile = imageMobile
    ? getImageProps({ ...common, src: imageMobile.url, width: imageMobile.width ?? 768, height: imageMobile.height ?? 1024 }).props
    : null;

  return (
    <picture>
      {/*
        A preload per crop, each for its own screens, so the browser starts the one it will show from the first bytes of
        the HTML. Rendered as `<link>` elements, which React hoists into `<head>`: `preload()` from react-dom reaches the
        browser only in the RSC data of a cached page, so the request waited for the scripts.
      */}
      {priority ? (
        <link rel="preload" as="image" href={desktop.src} imageSrcSet={desktop.srcSet} imageSizes={desktop.sizes} fetchPriority="high" media={mobile ? DESKTOP_QUERY : undefined} />
      ) : null}
      {priority && mobile ? (
        <link rel="preload" as="image" href={mobile.src} imageSrcSet={mobile.srcSet} imageSizes={mobile.sizes} fetchPriority="high" media={MOBILE_QUERY} />
      ) : null}
      {mobile ? <source media={MOBILE_QUERY} srcSet={mobile.srcSet} sizes={mobile.sizes} /> : null}
      {/* Decorative: the title carries the meaning. */}
      <img {...desktop} alt="" className="absolute inset-0 size-full object-cover" />
    </picture>
  );
}
