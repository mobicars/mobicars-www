/**
 * One look for buttons across the booking flow. Use the class on a `<button>`
 * or a link: `className={buttonClass("primary")}`.
 *
 * - primary: blue, the main action of a dialog or form (Szukaj, Zaloguj się).
 * - success: green, moving on or booking (DALEJ, Rezerwuj, Wybrany, Dodaj).
 * - secondary: outlined, the alternative (Anuluj, Wyloguj).
 * - danger: red, removing (Usuń).
 * - inverse: white, the main action on a navy band (hero, closing call to action).
 * - outline-inverse: outlined in white, the alternative on a navy band.
 *
 * Sizes: `md` 48px, the default everywhere; `sm` 40px only inside dense rows;
 * `lg` 56px for the one call to action of a section (hero, closing band);
 * `icon` a 40px circle for a button that is only an icon (carousel and FAQ arrows).
 * Every button is a full pill, like the booking search's tabs and "Pokaż auta",
 * and sinks slightly while pressed, for touch feedback. On hover (and keyboard
 * focus) a circle grows from its centre and leaves a gentle, slightly deeper
 * shade of its own colour: CSS only, on the button's `::before`, so every
 * button with this class has it and no markup is needed.
 * Disabled buttons are always grey, so "not now" reads the same on every step.
 */
export type ButtonVariant = "primary" | "success" | "secondary" | "danger" | "inverse" | "outline-inverse";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const BASE =
  "relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full font-bold transition-[color,background-color,border-color,transform] duration-150 ease-out-soft outline-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-blue-medium focus-visible:ring-offset-2 disabled:cursor-default disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100";

/**
 * The hover fill: a 20px circle in the middle, under the label (`-z-10` inside
 * the button's own stacking context, above its background), scaled up just
 * enough to cover a full-width phone button (×20), so the growth reads
 * evenly. In: 600 ms, eased both ways; out: 300 ms, quick to clear. Never on
 * a disabled button.
 */
const FILL =
  "before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:-z-10 before:-mt-2.5 before:-ml-2.5 before:size-5 before:scale-0 before:rounded-full before:transition-[scale] before:duration-300 before:ease-out before:content-[''] hover:before:scale-[20] hover:before:duration-600 hover:before:ease-in-out focus-visible:before:scale-[20] focus-visible:before:duration-600 focus-visible:before:ease-in-out disabled:before:hidden motion-reduce:before:duration-150 motion-reduce:hover:before:duration-200";

// The fill (`before:bg-…`) replaces an instant hover colour, which would hide the growing circle.
const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-blue-medium text-white before:bg-blue-dark/35 disabled:bg-muted disabled:text-muted-dark",
  success: "bg-go-strong text-white before:bg-green-dark/35 disabled:bg-muted disabled:text-muted-dark",
  // White buttons carry blue-medium text, and their fill stays opaque: on a photo or a navy band a see-through tint read as no button.
  secondary: "border border-blue-dark/15 bg-white text-blue-medium before:bg-tint disabled:text-muted-dark",
  danger: "bg-red-500 text-white before:bg-red-900/25 disabled:bg-muted disabled:text-muted-dark",
  inverse: "bg-white text-blue-medium before:bg-tint focus-visible:ring-white focus-visible:ring-offset-blue-dark",
  "outline-inverse":
    "border border-white/40 text-white before:bg-white/10 hover:border-white focus-visible:ring-white focus-visible:ring-offset-blue-dark",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-10 px-5 text-sm",
  md: "h-12 px-5 text-sm",
  lg: "h-14 px-7 text-base",
  icon: "size-10 shrink-0",
};

export function buttonClass(variant: ButtonVariant, size: ButtonSize = "md", extra = ""): string {
  return `${BASE} ${FILL} ${VARIANTS[variant]} ${SIZES[size]} ${extra}`.trim();
}
