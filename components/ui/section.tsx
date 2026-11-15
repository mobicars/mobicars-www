import Image from "next/image";
import type { ReactNode } from "react";

import { Ornament, Scrim, type OrnamentKind } from "./surface";

/**
 * The page rhythm every CMS block and page section shares ("Clear Road",
 * `app/globals.css`). Server-only markup: no client JavaScript.
 *
 * - `tone`: the band behind the section. `canvas` white, `surface` light grey,
 *   `tint` light blue, `dark` navy (hero, closing call to action), `glow` light
 *   blue fading to white (FAQ and other sections that should feel lighter than a band).
 * - `spacing`: `default` for content sections, `compact` for strips (trust
 *   bar, logos), `none` when the block draws its own padding.
 */
export type SectionTone = "canvas" | "surface" | "tint" | "dark" | "glow";
export type SectionSpacing = "default" | "compact" | "none";

const TONES: Record<SectionTone, string> = {
  canvas: "bg-canvas text-blue-dark",
  surface: "bg-surface text-blue-dark",
  tint: "bg-tint text-blue-dark",
  dark: "bg-blue-dark text-white",
  glow: "bg-linear-to-b from-tint via-tint/40 to-canvas text-blue-dark",
};

const SPACINGS: Record<SectionSpacing, string> = {
  default: "py-section",
  compact: "py-section-sm",
  none: "",
};

/**
 * What sits behind a section besides its tone (catalog C1): `wash` – soft
 * light-blue and green glows; `photo` – an image under a navy layer (white
 * text); `brand` – navy with line art. `photo` and `brand` make the text white.
 */
export type SectionBackdrop =
  | { kind: "none" }
  | { kind: "wash" }
  | { kind: "brand"; ornament?: OrnamentKind | null }
  | { kind: "photo"; image: { url: string }; imageMobile?: { url: string } | null; ornament?: null };

export function Section({
  tone = "canvas",
  spacing = "default",
  anchor,
  labelledBy,
  className = "",
  backdrop,
  children,
}: {
  tone?: SectionTone;
  spacing?: SectionSpacing;
  /** `id` for `#anchor` links; the header's height is kept clear when the page jumps to it. */
  anchor?: string | null;
  labelledBy?: string;
  className?: string;
  backdrop?: SectionBackdrop;
  children: ReactNode;
}) {
  const kind = backdrop?.kind ?? "none";
  const toneClass =
    kind === "wash"
      ? "bg-tint bg-[radial-gradient(60%_50%_at_10%_0%,var(--color-blue-light),transparent),radial-gradient(40%_40%_at_100%_100%,var(--color-green-light),transparent)] text-blue-dark"
      : kind === "brand"
        ? "bg-blue-dark text-white"
        : kind === "photo"
          ? "bg-blue-dark text-white"
          : TONES[tone];
  return (
    <section
      id={anchor ?? undefined}
      aria-labelledby={labelledBy}
      className={`scroll-mt-20 ${kind === "brand" || kind === "photo" ? "relative isolate overflow-hidden" : ""} ${toneClass} ${SPACINGS[spacing]} ${className}`.trim()}
    >
      {backdrop?.kind === "brand" && backdrop.ornament ? <Ornament kind={backdrop.ornament} /> : null}
      {backdrop?.kind === "photo" ? (
        <>
          {/* Decorative and never the LCP: below the first screen, light quality under the navy layer. */}
          <Image
            src={backdrop.image.url}
            alt=""
            fill
            sizes="100vw"
            quality={60}
            className={`-z-20 object-cover ${backdrop.imageMobile ? "hidden md:block" : ""}`}
          />
          {backdrop.imageMobile ? (
            <Image src={backdrop.imageMobile.url} alt="" fill sizes="100vw" quality={60} className="-z-20 object-cover md:hidden" />
          ) : null}
          <Scrim side="even" />
        </>
      ) : null}
      {children}
    </section>
  );
}

/**
 * The page width with the gutter: 16px on phones up to 32px on desktops.
 * `width` follows the CMS section setting: `page`, `reading` (text columns) or
 * `full` (edge to edge, gutter only).
 */
export function Container({
  narrow = false,
  width,
  className = "",
  children,
}: {
  narrow?: boolean;
  width?: "page" | "reading" | "full";
  className?: string;
  children: ReactNode;
}) {
  const size = width ?? (narrow ? "reading" : "page");
  const max = size === "full" ? "" : size === "reading" ? "max-w-reading" : "max-w-page";
  return <div className={`mx-auto w-full px-gutter ${max} ${className}`.trim()}>{children}</div>;
}

/**
 * Small label above a heading. The only place with capitals. `line`: a green
 * dash before it (the old site's accent bar); `pill`: a navy pill with an
 * optional icon (FAQ, blog – a section people scan for).
 */
export function Eyebrow({
  dark = false,
  variant = "line",
  icon,
  children,
}: {
  dark?: boolean;
  variant?: "line" | "pill";
  icon?: ReactNode;
  children: ReactNode;
}) {
  if (variant === "pill") {
    return (
      <p
        className={`flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-eyebrow uppercase ${dark ? "bg-white text-blue-dark" : "bg-blue-dark text-white"}`}
      >
        {icon ? <span aria-hidden className="flex [&>svg]:size-4">{icon}</span> : null}
        {children}
      </p>
    );
  }
  // The green dash carries the old site's accent bar into the new headings.
  return (
    <p className={`flex items-center gap-2.5 text-eyebrow uppercase ${dark ? "text-green-light" : "text-green-dark"}`}>
      <span aria-hidden className={`h-0.5 w-6 rounded-full ${dark ? "bg-green-light" : "bg-green-medium"}`} />
      {children}
    </p>
  );
}

/**
 * Eyebrow, heading and lead of a section. `level` keeps the outline right: the
 * first block of a page passes 1, the others 2. `id` is for the section's
 * `aria-labelledby`.
 */
export function SectionHeader({
  id,
  level = 2,
  eyebrow,
  title,
  lead,
  align = "start",
  dark = false,
  action,
  eyebrowVariant = "line",
  eyebrowIcon,
}: {
  id?: string;
  level?: 1 | 2;
  eyebrow?: string | null;
  title: string;
  lead?: string | null;
  align?: "start" | "center";
  dark?: boolean;
  /** A link beside the heading on desktops, under the lead on phones ("Zobacz wszystkie"). */
  action?: ReactNode;
  /** `Eyebrow` look; `eyebrowIcon` shows only in the pill. */
  eyebrowVariant?: "line" | "pill";
  eyebrowIcon?: ReactNode;
}) {
  const Heading = level === 1 ? "h1" : "h2";
  const centered = align === "center";
  return (
    <div
      className={`mb-8 flex flex-col gap-4 sm:mb-12 ${centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between md:gap-10"}`}
    >
      <div className={`flex max-w-3xl flex-col gap-3 ${centered ? "items-center" : ""}`}>
        {eyebrow ? (
          <Eyebrow dark={dark} variant={eyebrowVariant} icon={eyebrowIcon}>
            {eyebrow}
          </Eyebrow>
        ) : null}
        <Heading id={id} className={`${level === 1 ? "text-display" : "text-title"} text-balance ${dark ? "text-white" : "text-blue-dark"}`}>
          {title}
        </Heading>
        {lead ? <p className={`text-lead text-pretty ${dark ? "text-white/80" : "text-blue-dark/75"}`}>{lead}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
