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
