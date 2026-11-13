import { icons, type LucideIcon } from "lucide-react";
import { getImageProps } from "next/image";
import Link from "next/link";
import { createElement } from "react";

import { ReservationPicker } from "@/components/reservation/picker";
import { buttonClass } from "@/components/ui/button";
import type { Lang } from "@/i18n/config";
import { listServicePoints } from "@/lib/rentcarsoft";
import { toPickupPlace } from "@/lib/reservation/places";
import type { Cta, HeroBlock, Media } from "@/lib/strapi";

const HEIGHTS: Record<HeroBlock["height"], string> = {
  compact: "py-12 sm:py-16",
  default: "min-h-[30rem] py-12 sm:min-h-[38rem] sm:py-16",
  fullscreen: "min-h-svh py-12 sm:py-16",
};

const OVERLAYS: Record<HeroBlock["overlay"], string> = {
  none: "",
  light: "bg-black/20",
  medium: "bg-black/40",
  strong: "bg-black/60",
};

/** Below this the mobile image (when set) is shown and the video is not loaded. */
const MOBILE_QUERY = "(max-width: 767px)";

/**
 * The CMS hero: background photo (a separate crop on phones), an optional
 * looping video on larger screens, copy, up to two buttons and optionally the
 * booking form. As the first block it is the page's `<h1>` and its photo is
 * the LCP element, so `first` loads it eagerly with high priority.
 */
export async function Hero({ block, lang, first }: { block: HeroBlock; lang: Lang; first: boolean }) {
  const Heading = first ? "h1" : "h2";
  const places = block.reservation ? (await listServicePoints({ lang })).map(toPickupPlace) : [];
  const vertical = block.reservation?.layout === "vertical";

  return (
    <section className={`relative isolate flex items-center overflow-hidden bg-blue-dark ${HEIGHTS[block.height]}`}>
      <Background image={block.image} imageMobile={block.imageMobile} first={first} />
      {block.video ? <Video video={block.video} /> : null}
      {OVERLAYS[block.overlay] ? <div className={`absolute inset-0 -z-10 ${OVERLAYS[block.overlay]}`} aria-hidden /> : null}

      <div
        className={`mx-auto grid w-full max-w-7xl gap-8 px-3 sm:px-6 ${vertical ? "lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-center" : ""}`}
      >
        <div className={`flex flex-col gap-4 text-white ${vertical ? "" : "items-center text-center"}`}>
          {block.badge ? (
            <p className="w-fit rounded-lg bg-white px-2 py-1 text-xs font-bold tracking-wide text-blue-medium uppercase sm:text-sm">
              {block.badge}
            </p>
          ) : null}
          <Heading className="max-w-4xl text-3xl leading-tight font-bold text-balance sm:text-4xl lg:text-5xl">
            {block.title}
          </Heading>
          {block.subtitle ? <p className="max-w-3xl text-lg text-pretty sm:text-xl">{block.subtitle}</p> : null}
          {block.ctas.length > 0 ? (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              {block.ctas.map((cta) => (
                <CtaLink key={`${cta.href}-${cta.label}`} cta={cta} />
              ))}
            </div>
          ) : null}
        </div>

        {block.reservation ? (
          <ReservationPicker
            lang={lang}
            places={places}
            layout={block.reservation.layout}
            defaultTerm={block.reservation.defaultTerm}
          />
        ) : null}
      </div>
    </section>
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

function CtaLink({ cta }: { cta: Cta }) {
  const className = buttonClass(cta.variant, "md", "w-full sm:w-auto");
  const content = (
    <>
      {cta.label}
      {cta.icon ? <CtaIcon name={cta.icon} /> : null}
    </>
  );
  if (cta.newTab) {
    return (
      <a href={cta.href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }
  if (/^(https?:|mailto:|tel:)/i.test(cta.href)) {
    return (
      <a href={cta.href} className={className}>
        {content}
      </a>
    );
  }
  return (
    <Link href={cta.href} className={className}>
      {content}
    </Link>
  );
}

/**
 * A Lucide icon by the name strapi-lucide-icons saves (`arrow-right` →
 * `ArrowRight`). Rendered on the server, so the icon set stays out of the
 * browser bundle. An unknown name shows no icon.
 */
function CtaIcon({ name }: { name: string }) {
  const key = name.replace(/(^|-)([a-z0-9])/g, (_, __, char: string) => char.toUpperCase());
  const icon = (icons as Record<string, LucideIcon | undefined>)[key];
  return icon ? createElement(icon, { className: "size-4", "aria-hidden": true }) : null;
}
