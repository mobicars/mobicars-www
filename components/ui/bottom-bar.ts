/**
 * One look for the bars docked to the bottom of the screen (decided 21 November 2026, when three had drifted apart:
 * a floating card, two full-width bars with different frames, shadows, paddings and type):
 *
 * - `MobileSummaryBar`: the booking's price and "Dalej";
 * - `StickyBookBar`: the car page's "from" price and "Rezerwuj";
 * - `ResumeBookingBar`: the homepage's "Masz niedokończoną rezerwację".
 *
 * Full width, white (solid: no see-through blur to read through), a 1px `line` frame on top and a soft shadow
 * upwards; the content in the page's width, the safe area kept under it. Two lines on the left, the small one grey
 * over the main one navy, and on the right the 48px buttons (`buttonClass(…, "md")`), green for moving on.
 * Mark the bar with `data-mobile-summary-bar`: `globals.css` then keeps room for it at the end of the page and lifts
 * it above the preview banner.
 */
export const BOTTOM_BAR =
  "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-gutter pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgb(8_48_82/0.08)]";

/** The bar's content row, in the page's width. */
export const BOTTOM_BAR_ROW = "mx-auto flex max-w-page items-center justify-between gap-3";

/** The small grey line: the car, or what the bar is about. */
export const BOTTOM_BAR_LABEL = "line-clamp-2 text-xs leading-tight break-words text-muted-dark";

/** The main navy line: the price, or the message. */
export const BOTTOM_BAR_VALUE = "text-lg leading-tight font-bold text-blue-dark";
