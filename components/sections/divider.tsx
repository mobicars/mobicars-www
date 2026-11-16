import { LogoMark } from "@/components/layout/logo";
import type { DividerSection, DividerTone } from "@/lib/strapi";

/**
 * Divider (`sections.divider`): a break between sections, decorative only.
 * `blank`: space in the chosen colour. `lined`: a line fading out at both
 * ends with the MobiCars mark in the middle, a faint shade of the colour.
 * `slant`: a diagonal from the colour above into the colour below, which
 * `Sections` reads off the neighbouring sections; next to a photo (or a
 * colour it cannot know) and between two sections of one colour it is plain
 * space. Inline SVG and a fixed height: no request, no layout shift.
 */
export function Divider({ section, above, below }: { section: DividerSection; above: DividerTone | null; below: DividerTone | null }) {
  const height = HEIGHT[section.size];
  if (section.style === "slant") {
    if (above && below && above !== below) {
      return (
        <div aria-hidden className={`relative ${BACKGROUND[below]} ${height}`}>
          <svg className={`absolute inset-0 size-full ${FILL[above]}`} viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points={section.direction === "right" ? "0,0 100,0 100,100" : "0,0 100,0 0,100"} />
          </svg>
        </div>
      );
    }
    return <div aria-hidden className={`${BACKGROUND[above ?? below ?? "white"]} ${height}`} />;
  }
  if (section.style === "blank") {
    return <div aria-hidden className={`${BACKGROUND[section.tone]} ${height}`} />;
  }
  const dark = section.tone === "blue" || section.tone === "green" || section.tone === "navy";
  const line = `h-px flex-1 from-transparent ${dark ? "to-white/25" : "to-blue-dark/15"}`;
  return (
    <div aria-hidden className={`flex items-center ${BACKGROUND[section.tone]} ${height}`}>
      <div className="mx-auto flex w-full max-w-page items-center gap-4 px-gutter">
        <span className={`bg-linear-to-r ${line}`} />
        <LogoMark className={`size-6 shrink-0 ${dark ? "fill-white/30" : "fill-blue-dark/20"}`} />
        <span className={`bg-linear-to-l ${line}`} />
      </div>
    </div>
  );
}

/** The same scale as one side of a section's spacing (`SPACING`). */
const HEIGHT: Record<DividerSection["size"], string> = {
  small: "h-8 sm:h-12",
  medium: "h-14 sm:h-24",
  large: "h-20 sm:h-32",
};

const BACKGROUND: Record<DividerTone, string> = {
  white: "bg-white",
  light: "bg-tint",
  blue: "bg-blue-medium",
  green: "bg-green-medium",
  navy: "bg-blue-dark",
};

const FILL: Record<DividerTone, string> = {
  white: "fill-white",
  light: "fill-tint",
  blue: "fill-blue-medium",
  green: "fill-green-medium",
  navy: "fill-blue-dark",
};
