import { getImageProps } from "next/image";
import { Suspense } from "react";
import { preload } from "react-dom";

import { ReservationPicker } from "@/components/reservation/picker";
import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { listServicePoints } from "@/lib/rentcarsoft";
import { toPickupPlace } from "@/lib/reservation/places";
import type { HeroBlock, Media } from "@/lib/strapi";

import { CtaIcon, CtaLink } from "./cta-link";
import { PageHero, type Crumb } from "./page-hero";
import { TrustBar } from "./trust-bar";

const HEIGHTS: Record<HeroBlock["height"], string> = {
  compact: "py-12 sm:py-16",
  default: "min-h-[30rem] py-12 sm:min-h-[38rem] sm:py-16",
  fullscreen: "min-h-svh py-12 sm:py-16",
};

/**
 * Navy instead of flat black: the photo stays alive where there is no text.
 * Phones get an even layer (the copy sits at the top, the form below it); from
 * `lg` a gradient from the copy's side, so the far side of the photo stays bright.
 */
const OVERLAYS: Record<HeroBlock["overlay"], { aside: string; centred: string }> = {
  none: { aside: "", centred: "" },
  light: {
    aside: "bg-blue-dark/35 lg:bg-transparent lg:bg-linear-to-r lg:from-blue-dark/60 lg:to-transparent",
    centred: "bg-blue-dark/35",
  },
  medium: {
    aside: "bg-blue-dark/55 lg:bg-transparent lg:bg-linear-to-r lg:from-blue-dark/80 lg:via-blue-dark/40 lg:to-blue-dark/5",
    centred: "bg-blue-dark/55",
  },
  strong: {
    aside: "bg-blue-dark/70 lg:bg-transparent lg:bg-linear-to-r lg:from-blue-dark/90 lg:via-blue-dark/55 lg:to-blue-dark/15",
    centred: "bg-blue-dark/70",
  },
};

/** Below this the mobile image (when set) is shown and the video is not loaded. */
const MOBILE_QUERY = "(max-width: 767px)";
const DESKTOP_QUERY = "(min-width: 768px)";

/**
 * The CMS hero: background photo (a separate crop on phones), an optional
 * looping video on larger screens, copy, up to two buttons and optionally the
 * booking form with a line of advantages (`highlights`) under it. The `split`
 * layout (B2B pages) has no booking form: the copy sits on the left and the
 * advantages in an "At a glance" card on the right (under the copy on phones). As the first block it is the page's `<h1>` and its photo is
 * the LCP element, so `first` preloads it (the right crop for the screen) and
 * loads it with high priority.
 *
 * The hero does not wait for RentCarSoft: the photo, heading and buttons go
 * out at once, and the booking form streams in when the pickup points are
 * there (`HeroPicker`). Until then the same form stands in without the points,
 * so nothing moves when they arrive.
 */
export function Hero({
  block,
  lang,
  first,
  pickupId = null,
  breadcrumbs = [],
}: {
  block: HeroBlock;
  lang: Lang;
  first: boolean;
  /** The page's pickup point: the search starts there. */
  pickupId?: number | null;
  /** The page's breadcrumbs, for the `page` layout. */
  breadcrumbs?: Crumb[];
}) {
  if (block.layout === "page") {
    return <PageHero block={block} lang={lang} first={first} breadcrumbs={breadcrumbs} />;
  }
  const Heading = first ? "h1" : "h2";
  const split = block.layout === "split";
  const reservation = split ? null : block.reservation;
  const vertical = reservation?.layout === "vertical";
  const aside = split || vertical;
  const t = getMessages(lang).blocks;
  // The gradient starts on the copy's side: the left for `split`, the right when the vertical form stands on the left.
  const overlay = OVERLAYS[block.overlay][aside ? "aside" : "centred"];
  // The form card needs no layer of its own, so the copy side gets a deeper one (the photo is busiest there).
  const overlayClass =
    vertical && block.overlay !== "none"
      ? "bg-blue-dark/60 lg:bg-transparent lg:bg-linear-to-l lg:from-blue-dark/90 lg:via-blue-dark/70 lg:to-blue-dark/15"
      : overlay;

  return (
    <section className={`relative isolate flex items-center overflow-hidden bg-blue-dark ${HEIGHTS[block.height]}`}>
      <Background image={block.image} imageMobile={block.imageMobile} first={first} />
      {block.video ? <Video video={block.video} /> : null}
      {block.overlay !== "none" ? (
        <div
          className={`absolute inset-0 -z-10 ${overlayClass}`}
          aria-hidden
        />
      ) : null}

      <div
        className={`mx-auto grid w-full max-w-page grid-cols-1 gap-8 px-gutter ${
          split
            ? "lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center"
            : vertical
              ? // The vertical form stands on the left on desktops (the copy keeps coming first on phones and to screen readers).
                "lg:grid-cols-[28rem_minmax(0,1fr)] lg:items-center lg:gap-x-16"
              : ""
        }`}
      >
        <div className={`flex flex-col gap-4 text-white ${aside ? "" : "items-center text-center"} ${vertical ? "lg:col-start-2 lg:row-start-1" : ""}`}>
          {block.badge ? (
            <p className="w-fit rounded-full bg-white/95 px-3 py-1 text-eyebrow text-blue-dark uppercase">
              {block.badge}
            </p>
          ) : null}
          <Heading className="max-w-4xl text-display text-balance break-words hyphens-auto">
            {block.title}
          </Heading>
          {block.subtitle ? <p className="max-w-3xl text-lead text-pretty text-white/90">{block.subtitle}</p> : null}
          {block.ctas.length > 0 ? (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              {block.ctas.map((cta) => (
                <CtaLink key={`${cta.href}-${cta.label}`} cta={cta} size="lg" />
              ))}
            </div>
          ) : null}
        </div>

        {split ? (
          block.highlights.length > 0 ? (
            <AtGlance id={`hero-${block.id}-glance`} title={t.heroAtGlance} highlights={block.highlights} level={first ? "h2" : "h3"} />
          ) : null
        ) : (
          <>
            {reservation ? (
              <div className={vertical ? "lg:col-start-1 lg:row-start-1" : undefined}>
              <Suspense
                fallback={
                  <ReservationPicker
                    lang={lang}
                    places={[]}
                    layout={reservation.layout}
                    defaultTerm={reservation.defaultTerm}
                    defaultPickupId={pickupId}
                    sticky
                  />
                }
              >
                <HeroPicker lang={lang} reservation={reservation} pickupId={pickupId} />
              </Suspense>
              {/* Rating and claims right under "Rezerwuj": inside the first screen on phones (catalog C4, C5). */}
              {block.trust ? (
                <div className={`mt-4 ${vertical ? "" : "flex justify-center"}`}>
                  <TrustBar block={{ ...block.trust, variant: "inline" }} lang={lang} dark />
                </div>
              ) : null}
              </div>
            ) : block.trust ? (
              <TrustBar block={{ ...block.trust, variant: "inline" }} lang={lang} dark />
            ) : null}
            {block.highlights.length > 0 ? (
              <HighlightRow label={t.heroHighlights} highlights={block.highlights} centered={!vertical} />
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

type Highlight = HeroBlock["highlights"][number];

/**
 * The advantages under the booking form: two by two on a phone, one line from
 * `sm`. Plain markup, so it costs no JavaScript.
 */
function HighlightRow({ label, highlights, centered }: { label: string; highlights: Highlight[]; centered: boolean }) {
  return (
    <ul
      aria-label={label}
      className={`grid grid-cols-2 gap-2 text-sm font-semibold text-white sm:flex sm:flex-wrap sm:gap-3 lg:col-span-full ${
        centered ? "sm:justify-center" : ""
      }`}
    >
      {highlights.map((item) => (
        <li key={item.text} className="flex items-center gap-2.5 rounded-full bg-blue-dark/55 py-1.5 pr-4 pl-1.5 ring-1 ring-white/15">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-green-medium text-white">
            <CtaIcon name={item.icon ?? "check"} className="size-4" />
          </span>
          <span className="min-w-0 text-pretty">{item.text}</span>
        </li>
      ))}
    </ul>
  );
}

/** The `split` hero's card: the advantages as a short list. */
function AtGlance({ id, title, highlights, level }: { id: string; title: string; highlights: Highlight[]; level: "h2" | "h3" }) {
  const Title = level;
  return (
    <aside aria-labelledby={id} className="rounded-card bg-white p-6 text-blue-dark shadow-card sm:p-8">
      <Title id={id} className="text-eyebrow text-muted-dark uppercase">
        {title}
      </Title>
      <ul className="mt-4 flex flex-col gap-4">
        {highlights.map((item) => (
          <li key={item.text} className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-light text-blue-medium">
              <CtaIcon name={item.icon ?? "check"} className="size-5" />
            </span>
            <span className="pt-1.5 font-medium text-pretty">{item.text}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** The booking form with the pickup points, which come from RentCarSoft (cached in production); without them when it is down. */
async function HeroPicker({
  lang,
  reservation,
  pickupId,
}: {
  lang: Lang;
  reservation: NonNullable<HeroBlock["reservation"]>;
  pickupId: number | null;
}) {
  // A RentCarSoft outage must not take the page down: the form stays as it was in the fallback.
  const points = await listServicePoints({ lang }).catch((error: unknown) => {
    console.error(`[hero] service points unavailable, form without them: ${error instanceof Error ? error.name : "unknown"}`);
    return [];
  });
  const places = points.map(toPickupPlace);
  return (
    <ReservationPicker
      lang={lang}
      places={places}
      layout={reservation.layout}
      defaultTerm={reservation.defaultTerm}
      defaultPickupId={pickupId}
      sticky
    />
  );
}

function Background({ image, imageMobile, first }: { image: Media; imageMobile: Media | null; first: boolean }) {
  const common = {
    alt: image.alt,
    sizes: "100vw",
    ...(first ? { loading: "eager" as const, fetchPriority: "high" as const } : {}),
  };
  const { props: desktop } = getImageProps({
    ...common,
    src: image.url,
    width: image.width ?? 1920,
    height: image.height ?? 1080,
  });
  const mobile = imageMobile
    ? getImageProps({
        ...common,
        src: imageMobile.url,
        width: imageMobile.width ?? 768,
        height: imageMobile.height ?? 1024,
      }).props
    : null;

  if (first) {
    // A `<link rel="preload">` in the head per crop, each for its own screens, so the
    // browser starts the one it will show before it reaches the `<picture>`.
    preload(desktop.src, {
      as: "image",
      fetchPriority: "high",
      imageSrcSet: desktop.srcSet,
      imageSizes: desktop.sizes,
      ...(mobile ? { media: DESKTOP_QUERY } : {}),
    });
    if (mobile) {
      preload(mobile.src, { as: "image", fetchPriority: "high", imageSrcSet: mobile.srcSet, imageSizes: mobile.sizes, media: MOBILE_QUERY });
    }
  }

  return (
    <picture>
      {mobile ? <source media={MOBILE_QUERY} srcSet={mobile.srcSet} sizes={mobile.sizes} /> : null}
      <img {...desktop} alt={image.alt} className="absolute inset-0 -z-20 size-full object-cover" />
    </picture>
  );
}

/**
 * Plain `<video>`, no player library. The source only matches larger screens
 * with motion allowed, so phones and reduced-motion visitors keep the photo and
 * do not download the file.
 */
function Video({ video }: { video: Media }) {
  return (
    <video
      className="absolute inset-0 -z-20 hidden size-full object-cover md:block motion-reduce:hidden"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
    >
      <source src={video.url} type={video.mime} media="(min-width: 768px) and (prefers-reduced-motion: no-preference)" />
    </video>
  );
}
