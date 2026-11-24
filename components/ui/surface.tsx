import type { ReactNode } from "react";

/**
 * Small shared pieces, so an icon badge, a photo overlay or line art looks the
 * same wherever it appears
 * (`redesign/component-catalog.md`, P1–P8). Server markup only.
 */

const BADGES = {
  light: "bg-white text-blue-dark",
  go: "bg-green-medium text-white",
  brand: "bg-blue-dark text-white",
  soft: "bg-blue-light text-blue-medium",
} as const;

/** P4 – an icon in a circle. Decorative: the text beside it carries the meaning. */
export function IconBadge({ tone = "light", size = "md", children }: { tone?: keyof typeof BADGES; size?: "sm" | "md"; children: ReactNode }) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full ${size === "sm" ? "size-8 [&>svg]:size-4" : "size-12 [&>svg]:size-6"} ${BADGES[tone]}`}
    >
      {children}
    </span>
  );
}

export type ScrimSide = "top" | "bottom" | "start" | "end" | "even";

const SCRIMS: Record<ScrimSide, string> = {
  top: "bg-linear-to-b from-blue-dark/90 via-blue-dark/60 to-blue-dark/15",
  bottom: "bg-linear-to-t from-blue-dark/85 via-blue-dark/35 to-blue-dark/5",
  start: "bg-blue-dark/60 lg:bg-transparent lg:bg-linear-to-r lg:from-blue-dark/90 lg:via-blue-dark/50 lg:to-blue-dark/10",
  end: "bg-blue-dark/60 lg:bg-transparent lg:bg-linear-to-l lg:from-blue-dark/90 lg:via-blue-dark/50 lg:to-blue-dark/10",
  even: "bg-blue-dark/65",
};

/** P5 – navy over a photo where white text sits on it (never flat black). */
export function Scrim({ side }: { side: ScrimSide }) {
  return <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 ${SCRIMS[side]}`} />;
}

export type OrnamentKind = "road" | "contour" | "grid";

/**
 * P6 – thin line art over a brand-colour band (the orange card's squiggle on
 * carfree.pl, in our colours). Inline SVG, `currentColor`, no request.
 */
export function Ornament({ kind, className = "text-white/15" }: { kind: OrnamentKind; className?: string }) {
  const common = {
    "aria-hidden": true,
    className: `pointer-events-none absolute inset-0 -z-10 size-full ${className}`,
    fill: "none",
    stroke: "currentColor",
    preserveAspectRatio: "xMidYMid slice",
    viewBox: "0 0 400 400",
  } as const;
  if (kind === "grid") {
    // CSS lines rather than an SVG <pattern>: no id to clash when two bands use it.
    return (
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] bg-[size:32px_32px] ${className}`}
      />
    );
  }
  if (kind === "contour") {
    return (
      <svg {...common} strokeWidth="1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            vectorEffect="non-scaling-stroke"
            d={`M-20 ${300 - i * 46} C 60 ${250 - i * 46}, 120 ${360 - i * 46}, 200 ${290 - i * 46} S 340 ${220 - i * 46}, 420 ${270 - i * 46}`}
          />
        ))}
      </svg>
    );
  }
  // "Clear Road": two bends of a road with its broken centre line.
  return (
    <svg {...common} strokeWidth="2">
      <path vectorEffect="non-scaling-stroke" d="M-20 330 C 80 330, 110 210, 200 200 S 330 80, 420 70" />
      <path vectorEffect="non-scaling-stroke" d="M-20 390 C 90 390, 140 270, 230 255 S 360 140, 420 135" />
      <path vectorEffect="non-scaling-stroke" strokeDasharray="10 14" d="M-20 360 C 85 360, 125 240, 215 228 S 345 110, 420 102" />
    </svg>
  );
}

/**
 * The round icon of a question that opens something: outlined, filled navy
 * when it is open (`active`) or its row (`group`) is hovered: the FAQ. Cards
 * end with "Szczegóły ›" instead (`components/ui/product-card.tsx`). Decorative.
 */
export function roundIconClass(active = false): string {
  const state = active
    ? "bg-blue-dark text-white ring-blue-dark"
    : "text-blue-dark ring-line-strong group-hover:bg-blue-dark group-hover:text-white group-hover:ring-blue-dark";
  return `flex size-9 shrink-0 items-center justify-center rounded-full ring-1 transition-colors duration-150 ease-out-soft motion-reduce:transition-none ${state}`;
}
