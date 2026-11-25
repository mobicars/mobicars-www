import { getImageProps } from "next/image";
import type { ReactNode } from "react";

import { isDarkBackground, type SectionBackground, type ShortText } from "@/lib/strapi";

import { frameSizes } from "./image-sizes";
import { Pattern } from "./pattern";
import { ShortTextView } from "@/components/sections/rich-blocks";

/**
 * What the new sections share: the inside space (one CMS value for top and
 * bottom, smaller on phones), the background (`parts.background`) and the
 * heading. The hero uses `SPACING` too, so the page keeps one rhythm.
 */
export const SPACING: Record<"small" | "medium" | "large", string> = {
  small: "py-8 sm:py-12",
  medium: "py-14 sm:py-24",
  large: "py-20 sm:py-32",
};

/** One button size for every new section (the hero's): `lg`, 56 px. */
export const SECTION_CTA_SIZE = "lg" as const;

export type SectionWidth = "full" | "boxed" | "contained";

/**
 * The frame around a section (hero, features, …). `full` runs edge to edge;
 * `boxed` keeps a margin on every side and rounds the corners; `contained` is
 * the width of the page's content, rounded too. On phones both framed widths
 * keep the page gutter, so they line up with the content below.
 */
export const FRAME: Record<SectionWidth, { outer: string; box: string; inner: string }> = {
  full: { outer: "", box: "", inner: "max-w-page px-gutter" },
  boxed: { outer: "px-gutter pt-4 pb-2 sm:px-6 sm:pt-6", box: "rounded-[1.5rem] sm:rounded-[2rem]", inner: "max-w-page px-5 sm:px-10" },
  contained: { outer: "mx-auto w-full max-w-page px-gutter pt-4 pb-2 sm:pt-6", box: "rounded-[1.5rem] sm:rounded-[2rem]", inner: "px-5 sm:px-10 lg:px-12" },
};

const TONES: Record<SectionBackground["tone"], string> = {
  white: "bg-white",
  light: "bg-tint",
  fade: "bg-linear-to-b from-tint to-white",
  navy: "bg-blue-dark",
  blue: "bg-blue-medium",
  green: "bg-green-medium",
  // Navy under the photo while it loads, and the colour it falls back to.
  image: "bg-blue-dark",
};

/** The frame's outer margin (`boxed`, `contained`); a full-width section needs none, so no empty wrapper is rendered. */
export function FrameOuter({ className, children }: { className: string; children: ReactNode }) {
  return className ? <div className={className}>{children}</div> : children;
}

export function SectionShell({
  background,
  spacing,
  width = "full",
  labelledBy,
  strongOverlay = false,
  children,
}: {
  background: SectionBackground;
  spacing: keyof typeof SPACING;
  width?: SectionWidth;
  labelledBy?: string;
  /** A darker layer over the background photo, for text set straight on it (the Reviews spotlight). */
  strongOverlay?: boolean;
  children: ReactNode;
}) {
  const frame = FRAME[width];
  return (
    <FrameOuter className={frame.outer}>
      {/* `overflow-clip`, not `hidden`: it still clips the rounded corners and the photo, but makes no scroll container, so `sticky` inside (the FAQ menu) works. */}
      <section aria-labelledby={labelledBy} className={`relative isolate overflow-clip ${TONES[background.tone]} ${SPACING[spacing]} ${frame.box}`}>
        {background.tone === "image" ? <BackgroundPhoto image={background.image} imageMobile={background.imageMobile} sizes={frameSizes(width)} strong={strongOverlay} /> : null}
        {"pattern" in background && background.pattern ? <Pattern tone={background.tone} place="section" /> : null}
        {/* Above the photo and its layer by markup order (no negative z-index, which accessibility checkers misread). */}
        <div className={`relative mx-auto w-full ${frame.inner}`}>{children}</div>
      </section>
    </FrameOuter>
  );
}

/** Below the fold: loaded lazily, at the lower quality, under a strong navy layer so white text reads on any photo. */
function BackgroundPhoto({
  image,
  imageMobile,
  sizes,
  strong,
}: {
  image: { url: string; width: number | null; height: number | null };
  imageMobile: typeof image | null;
  sizes: string;
  strong: boolean;
}) {
  const common = { alt: "", sizes, quality: 60 };
  const { props: desktop } = getImageProps({ ...common, src: image.url, width: image.width ?? 1920, height: image.height ?? 1080 });
  const mobile = imageMobile
    ? getImageProps({ ...common, src: imageMobile.url, width: imageMobile.width ?? 768, height: imageMobile.height ?? 1024 }).props
    : null;
  return (
    <>
      <picture>
        {mobile ? <source media="(max-width: 767px)" srcSet={mobile.srcSet} sizes={mobile.sizes} /> : null}
        <img {...desktop} alt="" className="absolute inset-0 size-full object-cover" />
      </picture>
      <div aria-hidden className={`absolute inset-0 ${strong ? "bg-blue-dark/85" : "bg-blue-dark/75"}`} />
    </>
  );
}

/**
 * The optional heading of a section: badge, `<h2>` title and a short text;
 * `children` under them (the Reviews section's score).
 * On a dark background the title is white and the text larger (20 px, bold:
 * large text in WCAG terms), so it passes even on green; the badge stays white with coloured text.
 */
export function SectionHeading({
  id,
  badge,
  title,
  text,
  align,
  background,
  children,
}: {
  id: string;
  badge: string | null;
  title: string | null;
  text: ShortText | null;
  align: "center" | "start";
  background: SectionBackground;
  children?: ReactNode;
}) {
  if (!badge && !title && !text && !children) {
    return null;
  }
  const dark = isDarkBackground(background);
  const pill = dark
    ? `bg-white ${background.tone === "green" ? "text-go-strong" : "text-blue-medium"}`
    : `${background.tone === "white" ? "bg-tint" : "bg-white"} text-blue-medium`;
  return (
    <div className={`mb-10 flex max-w-3xl flex-col gap-4 sm:mb-12 ${align === "center" ? "mx-auto items-center text-center" : ""}`}>
      {badge ? <p className={`w-fit rounded-full px-3 py-1 text-eyebrow uppercase ${pill}`}>{badge}</p> : null}
      {title ? (
        <h2 id={id} className={`text-title text-balance ${dark ? "text-white" : "text-blue-dark"}`}>
          {title}
        </h2>
      ) : null}
      {text ? <ShortTextView text={text} className={`text-pretty ${dark ? "text-xl font-bold text-white" : "text-lead text-blue-dark/80"}`} /> : null}
      {children}
    </div>
  );
}
