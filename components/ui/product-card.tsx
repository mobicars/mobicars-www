import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * One look for every product card of the site: a car (the fleet, the booking's
 * list, "Większe samochody"), a car class, an add-on, a promotion's class.
 * Decided 21 November 2026, when the cards had drifted apart (2px frames next
 * to 1px ones, photos on grey, on blue and on nothing, some lifting on hover,
 * a round arrow on some):
 *
 * - Frame: 1px `line`, white, `rounded-card`, no shadow. A card that is a link
 *   or a choice darkens its frame on hover (`blue-medium/40`); a chosen card
 *   (the booking) turns green with a 1px ring on top, so nothing moves.
 * - Photo: edge to edge on `surface` grey, 16:10, the picture fitted with a
 *   margin; on hover of a link card it zooms in a little.
 * - Badges on the photo, top left (`ProductBadge`).
 * - The class or segment small and blue over the name (18px bold); a price
 *   "od X zł / doba" never larger than 20px (`ProductPrice`).
 * - A link card ends with "Szczegóły ›" (`ProductMore`), the blog's "Czytaj
 *   więcej ›", never a round arrow; buttons sit inside the card's padding.
 */
export function productCardClass({ interactive = false, selected = false, extra = "" }: { interactive?: boolean; selected?: boolean; extra?: string } = {}): string {
  const state = selected ? "border-green-medium ring-1 ring-green-medium" : interactive ? "border-line hover:border-blue-medium/40" : "border-line";
  return `group relative flex w-full min-w-0 flex-col overflow-hidden rounded-card border bg-white text-blue-dark transition-[border-color,box-shadow] duration-200 ease-out has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-blue-medium has-[a:focus-visible]:ring-offset-2 motion-reduce:transition-none ${state} ${extra}`.trim();
}

/** The photo's box: edge to edge, 16:10, grey. Put the `Image` (with `PRODUCT_IMAGE`) and the badges inside. */
export const PRODUCT_PHOTO = "relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-surface";

/** The picture in `PRODUCT_PHOTO`: fitted with a margin, zooming in a little on hover of the card. */
export const PRODUCT_IMAGE =
  "object-contain p-4 transition-transform duration-500 ease-out-soft group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100";

/** Where the badges go on the photo. */
export const PRODUCT_BADGES = "absolute top-3 left-3 flex flex-wrap gap-1.5";

/** The class or segment over the name. */
export const PRODUCT_EYEBROW = "text-xs font-semibold text-blue-medium";

/** The card's name. */
export const PRODUCT_TITLE = "text-lg leading-snug font-bold text-blue-dark text-balance";

const BADGE_TONES = {
  /** Promotion, discount: green. */
  promo: "bg-go-strong text-white",
  /** Popular and other plain facts: white on the grey photo. */
  plain: "bg-white text-blue-dark",
};

export function ProductBadge({ icon: Icon, tone, children }: { icon?: LucideIcon; tone: keyof typeof BADGE_TONES; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${BADGE_TONES[tone]}`}>
      {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
      {children}
    </span>
  );
}

/**
 * "od 84,55 zł / doba": the word and the unit small, the amount 20px bold
 * (18px with `small`); green during a promotion. `regular` is struck through
 * after it, with its own text for screen readers.
 */
export function ProductPrice({
  from,
  amount,
  unit,
  promotion = false,
  regular = null,
  small = false,
}: {
  from: string;
  amount: string;
  unit: string;
  promotion?: boolean;
  regular?: { text: string; label: string } | null;
  small?: boolean;
}) {
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 ${promotion ? "text-green-dark" : "text-blue-dark"}`}>
      <span className="text-sm whitespace-nowrap">
        {from} <span className={`font-bold tracking-tight tabular-nums ${small ? "text-lg" : "text-xl"}`}>{amount}</span>{" "}
        <span className="text-xs font-semibold">{unit}</span>
      </span>
      {regular ? (
        <s className="text-xs text-muted-dark">
          <span className="sr-only">{regular.label}</span>
          <span aria-hidden>{regular.text}</span>
        </s>
      ) : null}
    </p>
  );
}

/** "Szczegóły ›" at the end of a link card: part of the card's link, so hidden from screen readers. */
export function ProductMore({ label }: { label: string }) {
  return (
    <span aria-hidden className="inline-flex items-center gap-1 text-sm font-bold text-blue-medium">
      {label}
      <ChevronRight className="size-4 transition-transform duration-150 ease-out-soft group-hover:translate-x-0.5 motion-reduce:transition-none" />
    </span>
  );
}
