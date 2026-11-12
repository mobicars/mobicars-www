import { QUERY_KEYS } from "@/lib/reservation/search";

/** Sets or removes one query parameter without a navigation (`history.replaceState`). */
export function replaceParam(key: string, value: string | null): void {
  const url = new URL(window.location.href);
  if (value === null) {
    url.searchParams.delete(key);
  } else {
    url.searchParams.set(key, value);
  }
  window.history.replaceState(null, "", url);
}

/** The current URL with some parameters changed, as a path for `router.push`. */
export function currentHrefWith(changes: Record<string, string | null>): string {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  }
  return `${url.pathname}${url.search}`;
}

/**
 * Back to the car list with a fresh choice: drops the step and everything
 * chosen for the previous car (protection, border zone, extras, accessories).
 * The "Zmień" next to the car on the protection, extras and details steps.
 */
export function restartCarChoice(): string {
  return currentHrefWith({
    [QUERY_KEYS.step]: null,
    [QUERY_KEYS.protection]: null,
    [QUERY_KEYS.zone]: null,
    [QUERY_KEYS.extras]: null,
    [QUERY_KEYS.accessories]: null,
  });
}
