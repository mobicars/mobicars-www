/**
 * One look for buttons across the booking flow. Use the class on a `<button>`
 * or a link: `className={buttonClass("primary")}`.
 *
 * - primary: blue, the main action of a dialog or form (Szukaj, Zaloguj się).
 * - success: green, moving on or booking (DALEJ, Rezerwuj, Wybrany, Dodaj).
 * - secondary: outlined, the alternative (Anuluj, Wyloguj).
 * - danger: red, removing (Usuń).
 *
 * Sizes: `md` 48px, the default everywhere; `sm` 40px only inside dense rows.
 * Disabled buttons are always grey, so "not now" reads the same on every step.
 */
export type ButtonVariant = "primary" | "success" | "secondary" | "danger";
export type ButtonSize = "sm" | "md";

const BASE =
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 font-bold transition-colors duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-blue-medium focus-visible:ring-offset-2 disabled:cursor-default motion-reduce:transition-none";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-blue-medium text-white hover:bg-blue-dark disabled:bg-muted disabled:text-muted-dark",
  success: "bg-green-medium text-white hover:bg-green-dark disabled:bg-muted disabled:text-muted-dark",
  secondary:
    "border border-blue-dark/15 bg-white text-blue-dark hover:bg-blue-dark/[0.04] disabled:text-muted-dark disabled:hover:bg-white",
  danger: "bg-red-500 text-white hover:bg-red-600 disabled:bg-muted disabled:text-muted-dark",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-10 text-sm",
  md: "h-12 text-sm",
};

export function buttonClass(variant: ButtonVariant, size: ButtonSize = "md", extra = ""): string {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${extra}`.trim();
}
