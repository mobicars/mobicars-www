import { ChevronRight } from "lucide-react";
import { Children, type ReactNode } from "react";

import { Carousel } from "./carousel";

/**
 * The small shared pieces every block builds its cards and bands from, so a
 * card, a label or a photo overlay looks the same wherever it appears
 * (`redesign/component-catalog.md`, P1–P8). Server markup only.
 */

/** P1 – the one card surface. `interactive` lifts it on hover (a card that is a link). */
export function cardClass(tone: "light" | "dark" = "light", interactive = false, extra = ""): string {
  const base =
    tone === "dark" ? "rounded-card bg-blue-dark text-white ring-1 ring-white/10" : "rounded-card bg-white text-blue-dark shadow-card ring-1 ring-line";
  const hover = interactive
    ? "transition-[box-shadow,transform] duration-250 ease-out-soft hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    : "";
  return `${base} ${hover} ${extra}`.trim();
}

export type PillTone = "neutral" | "go" | "brand" | "glass" | "outline";

const PILLS: Record<PillTone, string> = {
  neutral: "bg-blue-light text-blue-dark",
  go: "bg-green-light text-green-dark",
  brand: "bg-blue-dark text-white",
  // On a photo: near-opaque white keeps the label readable on any frame.
  glass: "bg-white/90 text-blue-dark",
  outline: "ring-1 ring-current",
};

/** P2 – a short label: a blog category, a rental length, an FAQ category. */
export function Pill({ tone = "neutral", icon, className = "", children }: { tone?: PillTone; icon?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${PILLS[tone]} ${className}`.trim()}>
      {icon ? <span aria-hidden className="flex [&>svg]:size-3.5">{icon}</span> : null}
      {children}
    </span>
  );
}

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
 * The round icon of a card or question that opens something: outlined, filled
 * navy when it is open (`active`) or its card (`group`) is hovered. One look
 * for the card arrows and the FAQ's questions. Decorative.
 */
export function roundIconClass(active = false): string {
  const state = active
    ? "bg-blue-dark text-white ring-blue-dark"
    : "text-blue-dark ring-line-strong group-hover:bg-blue-dark group-hover:text-white group-hover:ring-blue-dark";
  return `flex size-9 shrink-0 items-center justify-center rounded-full ring-1 transition-colors duration-150 ease-out-soft motion-reduce:transition-none ${state}`;
}

/** The arrow of a card that is a link (`roundIconClass`). */
export function CardArrow({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`${roundIconClass()} ${className}`}>
      <ChevronRight className="size-4" />
    </span>
  );
}

/**
 * P8 – a row of cards that swipes on phones (a peek of the next one) and
 * becomes a grid from `lg`. Use `RailItem` for each card. Below `lg` it is a
 * `Carousel`: native scroll-snap at first, then Embla with drag, momentum
 * and dots once the row nears the screen; from `lg` no script runs.
 */
export function Rail({ label, columns = 3, className = "", children }: { label: string; columns?: 3 | 4; className?: string; children: ReactNode }) {
  return (
    <Carousel
      label={label}
      count={Children.toArray(children).length}
      gridFrom="lg"
      className="-mx-gutter snap-x snap-mandatory scroll-px-gutter overflow-x-auto px-gutter [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {/* Named by the carousel region around it. */}
      <ul
        className={`flex gap-4 pb-2 lg:grid lg:gap-6 lg:pb-0 ${columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} ${className}`.trim()}
      >
        {children}
      </ul>
    </Carousel>
  );
}

export function RailItem({ className = "", children }: { className?: string; children: ReactNode }) {
  return <li className={`flex w-[78%] max-w-80 shrink-0 snap-start sm:w-[45%] lg:w-auto lg:max-w-none ${className}`.trim()}>{children}</li>;
}
