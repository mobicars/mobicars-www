import type { SectionWidth } from "./section-shell";

/**
 * `sizes` for the sections' pictures, computed from the same widths the CSS
 * lays out (`FRAME` in section-shell.tsx), so the browser picks the smallest
 * file that is still sharp, PageSpeed's two devices included (phone 412 px at
 * 1.75×, desktop 1350 px at 1×; the file widths are `images` in next.config.ts).
 *
 * The content's width per frame and screen: the window less the gutters
 * (`px-gutter`, clamp(1rem, 0.5rem + 2vw, 2rem) a side: 32 px on phones,
 * 96vw − 16px above), at most 80rem (1280 px); `boxed` sits 16 px (24 px from
 * 640 px) off the window's sides and pads its content 20 px (40 px); `contained`
 * is the page's width less the gutters, padded 20 px, 40 px, then 48 px.
 */
const CONTENT: Record<SectionWidth, { phone: string; tablet: string; desktop: string }> = {
  full: { phone: "100vw - 32px", tablet: "96vw - 16px", desktop: "min(96vw - 16px, 1280px)" },
  boxed: { phone: "100vw - 72px", tablet: "100vw - 128px", desktop: "min(100vw - 48px, 1344px) - 80px" },
  contained: { phone: "100vw - 72px", tablet: "96vw - 96px", desktop: "min(96vw - 16px, 1280px) - 96px" },
};

/** One of `n` columns `gap` px apart in `content`. */
const column = (content: string, n: number, gap: number) => (n === 1 ? `calc(${content})` : `calc((${content} - ${gap * (n - 1)}px) / ${n})`);

/**
 * A picture in a grid of cards or a carousel (`gap-6`): `desktop` per row from
 * 1024 px, `tablet` per row from 640 px, one on phones. `slide`: a carousel
 * slide, 85% of the content on phones and inside the arrows' margins from
 * 768 px; `phone`: a fixed phone size (a thumbnail).
 */
export function cardSizes(
  width: SectionWidth,
  { desktop, tablet = 2, slide = false, wide, phone }: { desktop: number; tablet?: number; slide?: boolean; wide?: number; phone?: string },
): string {
  const c = CONTENT[width];
  // A carousel keeps 64 px on each side from 768 px for its arrows (`bleed` in components/ui/carousel.tsx).
  const inset = (content: string) => (slide ? `${content} - 128px` : content);
  return [
    // From 1280 px a grid may hold one more card per row (the Cars grid).
    ...(wide ? [`(min-width: 1280px) ${column(inset(c.desktop), wide, 24)}`] : []),
    `(min-width: 1024px) ${column(inset(c.desktop), desktop, 24)}`,
    ...(slide ? [`(min-width: 768px) ${column(inset(c.tablet), tablet, 24)}`] : []),
    `(min-width: 640px) ${column(c.tablet, tablet, 24)}`,
    phone ?? (slide ? `calc((${c.phone}) * 0.85)` : `calc(${c.phone})`),
  ].join(", ");
}

/**
 * A picture in a half of Two columns (`lg:grid-cols-2 lg:gap-16`), one column
 * below 1024 px. `share`: the part of that half it fills (the collage's big
 * photo 0.86, its small one 0.48 of the half).
 */
export function halfSizes(width: SectionWidth, share = 1): string {
  const c = CONTENT[width];
  const part = (value: string) => (share === 1 ? value : `calc(${value} * ${share})`);
  return [`(min-width: 1024px) ${part(column(c.desktop, 2, 64))}`, `(min-width: 640px) ${part(`calc(${c.tablet})`)}`, part(`calc(${c.phone})`)].join(", ");
}

/** The Blog section's lead post: the wider of two columns (`1.15fr 1fr`, `gap-10`) from 1024 px, the content's width below. */
export function leadPostSizes(width: SectionWidth): string {
  const c = CONTENT[width];
  return `(min-width: 1024px) calc((${c.desktop} - 40px) * 1.15 / 2.15), (min-width: 640px) calc(${c.tablet}), calc(${c.phone})`;
}

/** A photo behind a whole section or hero: the window (`full`), the window less the box's margins (`boxed`) or the page's width less the gutters (`contained`). */
export function frameSizes(width: SectionWidth): string {
  if (width === "boxed") return "(min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)";
  if (width === "contained") return `(min-width: 1024px) ${CONTENT.full.desktop}, (min-width: 640px) calc(96vw - 16px), calc(100vw - 32px)`;
  return "100vw";
}
