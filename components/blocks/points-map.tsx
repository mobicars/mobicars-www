import Link from "next/link";

/**
 * A light map of the pickup network (catalog C24): Poland's outline as one
 * inline path and one pin per town, each a link to the town's page or to its
 * fold in the list beside it. No map tiles, no script, no request: the whole
 * thing is ~2 KB of HTML. The list next to it carries the same information,
 * so the map is never the only way to a point.
 */

export type MapTown = {
  /** Unique on the page and CSS-safe (`[a-z0-9-]`); ties the pin to its row in the list (`data-town`). */
  key: string;
  name: string;
  href: string;
  /** "Kraków, 3 points": the pin's accessible name. */
  label: string;
  /** Every point there is an airport (Poznań, Katowice): a plane instead of a dot. */
  airportOnly: boolean;
  /** Points with coordinates, [latitude, longitude]. */
  positions: [number, number][];
  /** Larger networks first get a label on phones too. */
  size: number;
};

/** Poland, hand-simplified to a few km (~70 points), in the projection of `project`. */
const OUTLINE =
  "M15 148L77 129L150 107L231 63L276 39L345 11L423 0L469 37L463 39L434 18L431 29L444 52L455 72L494 78L552 63L628 73L717 83L797 83L865 78L901 88L936 129L934 150L965 234L977 275L960 324L978 348L931 373L906 405L950 449L947 519L940 540L965 597L998 649L983 719L945 747L906 779L854 861L874 950L842 937L784 893L715 877L648 885L608 896L575 917L559 882L536 852L506 885L474 865L449 804L420 795L393 779L360 755L332 743L286 719L279 755L253 771L226 722L211 686L191 690L147 660L92 646L74 646L90 608L67 527L53 495L62 446L48 405L55 369L8 324L33 251L20 185Z";

/** Equirectangular over Poland's box; the 1000 × 950 frame already allows for cos 52°. */
function project([lat, lng]: [number, number]): [number, number] {
  return [((lng - 14.07) / (24.15 - 14.07)) * 1000, ((54.84 - lat) / (54.84 - 49.0)) * 950];
}

const PIN = 26;
/** Centre to centre: two pins never touch (Legionowo sits 19 km from Warsaw). */
const MIN_GAP = PIN * 2 + 10;
/** Names drawn on phones; the rest only from `sm`, where there is room. */
const LABELS_ON_PHONE = 5;

type Placed = { town: MapTown; at: [number, number]; pin: [number, number] };

/**
 * The town's spot is its most central point (the medoid), not the average:
 * a far point filed under the town (Ciechanów under Legionowo) would pull an
 * average off into the fields.
 */
function townSpot(positions: [number, number][]): [number, number] {
  const projected = positions.map(project);
  let best = projected[0];
  let bestSum = Infinity;
  for (const a of projected) {
    const sum = projected.reduce((total, b) => total + Math.hypot(a[0] - b[0], a[1] - b[1]), 0);
    if (sum < bestSum) {
      best = a;
      bestSum = sum;
    }
  }
  return best;
}

/** Larger towns keep their spot; a smaller one too close is pushed away and gets a leader line. */
function place(towns: MapTown[]): Placed[] {
  const placed: Placed[] = [];
  for (const town of towns.toSorted((a, b) => b.size - a.size)) {
    const at = townSpot(town.positions);
    let pin: [number, number] = [...at];
    for (let round = 0; round < 4; round += 1) {
      const clash = placed.find((other) => Math.hypot(pin[0] - other.pin[0], pin[1] - other.pin[1]) < MIN_GAP);
      if (!clash) {
        break;
      }
      const dx = pin[0] - clash.pin[0];
      const dy = pin[1] - clash.pin[1];
      const length = Math.hypot(dx, dy);
      // Straight up when two towns share a spot.
      const [ux, uy] = length === 0 ? [0, -1] : [dx / length, dy / length];
      pin = [clash.pin[0] + ux * MIN_GAP, clash.pin[1] + uy * MIN_GAP];
    }
    placed.push({ town, at, pin });
  }
  return placed;
}

export function PointsMap({ towns, caption, className = "" }: { towns: MapTown[]; caption: string; className?: string }) {
  const placed = place(towns.filter((town) => town.positions.length > 0));
  if (placed.length === 0) {
    return null;
  }
  const labelled = new Set(placed.slice(0, LABELS_ON_PHONE).map((entry) => entry.town.key));
  return (
    <figure className={`rounded-card bg-tint/60 p-3 ring-1 ring-line sm:p-5 ${className}`.trim()}>
      <svg viewBox="-30 -30 1060 1010" className="h-auto w-full overflow-visible">
        <path d={OUTLINE} className="fill-white stroke-line-strong" strokeWidth="3" strokeLinejoin="round" />
        {placed.map(({ town, at, pin }) =>
          at[0] === pin[0] && at[1] === pin[1] ? null : (
            <g key={town.key} aria-hidden className="text-blue-dark/40">
              <line x1={at[0]} y1={at[1]} x2={pin[0]} y2={pin[1]} stroke="currentColor" strokeWidth="3" />
              <circle cx={at[0]} cy={at[1]} r="6" fill="currentColor" />
            </g>
          ),
        )}
        {placed.map(({ town, pin: [x, y] }) => {
          // Names near the east edge go on the left of the pin.
          const end = x > 800;
          return (
            <Link key={town.key} href={town.href} aria-label={town.label} data-town={town.key} className="group/pin outline-none">
              {/* A 44 px touch target on a 343 px wide map. */}
              <circle cx={x} cy={y} r={PIN * 2.2} fill="transparent" />
              <circle
                cx={x}
                cy={y}
                r={PIN + 10}
                className="fill-none stroke-blue-medium opacity-0 group-focus-visible/pin:opacity-100"
                strokeWidth="5"
              />
              <circle
                cx={x}
                cy={y}
                r={PIN}
                className="fill-go-strong stroke-white transition-colors duration-150 group-hover/pin:fill-green-dark motion-reduce:transition-none"
                strokeWidth="6"
              />
              {town.airportOnly ? (
                // lucide "plane", drawn inline: one shape, not worth a symbol.
                <svg
                  x={x - 15}
                  y={y - 15}
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="stroke-white"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                </svg>
              ) : (
                <circle cx={x} cy={y} r="8" className="fill-white" />
              )}
              <text
                x={end ? x - PIN - 12 : x + PIN + 12}
                y={y}
                dominantBaseline="central"
                textAnchor={end ? "end" : "start"}
                paintOrder="stroke"
                strokeWidth="8"
                strokeLinejoin="round"
                className={`fill-blue-dark stroke-white text-[40px] font-semibold sm:text-[30px] lg:text-[26px] ${labelled.has(town.key) ? "" : "max-sm:hidden"}`}
              >
                {town.name}
              </text>
            </Link>
          );
        })}
      </svg>
      <figcaption className="sr-only">{caption}</figcaption>
    </figure>
  );
}

/**
 * Hovering a pin outlines its town in the list and the other way round: CSS
 * `:has()` rules per town under `scope`, no JavaScript. Browsers without
 * `:has()` simply show no highlight.
 */
export function PointsMapLinks({ scope, keys }: { scope: string; keys: string[] }) {
  const css = keys
    .map(
      (key) =>
        `#${scope}:has([data-town="${key}"]:is(:hover,:focus-visible)) [data-fold="${key}"]{box-shadow:0 0 0 2px var(--color-go-strong)}` +
        `#${scope}:has([data-fold="${key}"]:hover) [data-town="${key}"] circle:nth-of-type(3){fill:var(--color-green-dark)}`,
    )
    .join("");
  return <style>{css}</style>;
}
