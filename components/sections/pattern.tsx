import type { CSSProperties } from "react";

/**
 * The thin line art that goes with each brand colour: navy a winding road
 * with its broken centre line (the trip), green a looping scribble (freedom,
 * no stress), blue a dotted route with a map pin (pickup, getting there).
 * White at low opacity, decorative only, no request.
 *
 * `section`: a seamless tile repeated over the whole background (a pattern,
 * as large or small as the section is), a CSS background from an inline SVG.
 * `card`: one drawing over the whole card (`cover`), as on the brand's
 * original cards. Drawn in markup order, before the content (no negative
 * z-index, which accessibility checkers misread).
 */
export type PatternTone = "navy" | "blue" | "green";

/** Tiles: each line leaves the right edge where and as it entered the left one, so the rows join up. */
const TILES: Record<PatternTone, { width: number; height: number; body: string }> = {
  navy: {
    width: 240,
    height: 160,
    body: `<path d="M0 66 C 60 6, 180 126, 240 66"/><path d="M0 94 C 60 34, 180 154, 240 94"/><path stroke-dasharray="8 10" d="M0 80 C 60 20, 180 140, 240 80"/>`,
  },
  green: {
    width: 240,
    height: 200,
    body: `<path d="M0 120 C 40 120, 60 50, 105 60 S 140 170, 95 165 S 110 95, 160 100 S 210 120, 240 120"/>`,
  },
  blue: {
    width: 240,
    height: 200,
    body: `<path stroke-width="2.5" stroke-dasharray="0.1 9" d="M0 150 C 80 90, 160 210, 240 150"/><path stroke-linejoin="round" d="M180 84 C 174 76, 169 71, 169 64 A 11 11 0 0 1 191 64 C 191 71, 186 76, 180 84 Z"/><circle cx="180" cy="64" r="4"/>`,
  },
};

const tile = (tone: PatternTone): CSSProperties => {
  const { width, height, body } = TILES[tone];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" fill="none" stroke="#fff" stroke-opacity="0.09" stroke-width="1.5" stroke-linecap="round">${body}</svg>`;
  return { backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, backgroundSize: `${width}px ${height}px` };
};

export function Pattern({ tone, place }: { tone: PatternTone; place: "section" | "card" }) {
  if (place === "section") {
    return <div aria-hidden className="pointer-events-none absolute inset-0" style={tile(tone)} />;
  }
  return (
    <svg
      aria-hidden
      viewBox="0 0 300 400"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
      className="pointer-events-none absolute inset-0 size-full text-white/15"
    >
      {tone === "navy" ? <Road /> : tone === "green" ? <Scribble /> : <Route />}
    </svg>
  );
}

/** A road from the bottom left bending up to the top right: two edges and the broken centre line. */
function Road() {
  return (
    <>
      <path vectorEffect="non-scaling-stroke" d="M-20 360 C 80 360, 120 230, 190 215 S 290 110, 330 100" />
      <path vectorEffect="non-scaling-stroke" d="M-20 420 C 100 420, 150 290, 220 272 S 320 170, 340 165" />
      <path vectorEffect="non-scaling-stroke" strokeDasharray="10 12" d="M-20 390 C 90 390, 135 260, 205 243 S 305 140, 335 132" />
    </>
  );
}

/** One line wandering across in loose loops, as if drawn without lifting the pen, and a quieter echo of it. */
function Scribble() {
  return (
    <>
      <path vectorEffect="non-scaling-stroke" d="M-20 250 C 40 200, 120 260, 100 310 S 20 340, 60 280 C 100 220, 200 240, 190 300 S 130 380, 200 370 C 270 360, 250 260, 330 250" />
      <path vectorEffect="non-scaling-stroke" strokeOpacity="0.6" d="M-20 140 C 50 110, 90 180, 160 160 S 260 100, 330 130" />
    </>
  );
}

/** A dotted route from a start point, bending across to a map pin in the lower half. */
function Route() {
  return (
    <>
      <path vectorEffect="non-scaling-stroke" strokeWidth="3" strokeDasharray="0.1 11" d="M30 370 C 110 360, 90 290, 160 282 S 250 300, 240 236" />
      <circle vectorEffect="non-scaling-stroke" cx="30" cy="370" r="7" />
      {/* The pin: a drop with a hole, its tip on the route's end. */}
      <path vectorEffect="non-scaling-stroke" strokeLinejoin="round" d="M240 232 C 229 215, 216 204, 216 188 A 24 24 0 0 1 264 188 C 264 204, 251 215, 240 232 Z" />
      <circle vectorEffect="non-scaling-stroke" cx="240" cy="188" r="9" />
    </>
  );
}
