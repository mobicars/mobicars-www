import type { Lang } from "@/i18n/config";
import { accountHref, resolveAccountPath, resolveReservationPath } from "@/i18n/routes";

/**
 * Cookie that holds the encrypted session.
 * Production uses the `__Host-` prefix: HTTPS only, no Domain, Path=/.
 * Shared with `proxy.ts`, so this file must not import `server-only`.
 */
export const SESSION_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-mc_session" : "mc_session";

export function loginPath(lang: Lang, returnTo?: string): string {
  const path = accountHref(lang, "login");
  return returnTo ? `${path}?next=${encodeURIComponent(returnTo)}` : path;
}

/**
 * Where to go after login. Only canonical, non-public panel URLs and the
 * reservation pages of this language are accepted (the booking form sends a
 * guest to log in and back), so `next` cannot send the user to another site.
 */
export function safeReturnPath(lang: Lang, value: unknown): string {
  const fallback = accountHref(lang);
  if (typeof value !== "string" || !value.startsWith("/") || /[\\\s]/.test(value)) {
    return fallback;
  }
  const pathname = value.split(/[?#]/)[0];
  const reservation = resolveReservationPath(lang, pathname);
  if (reservation) {
    return reservation.term !== null && reservation.canonical === pathname ? value : fallback;
  }
  const route = resolveAccountPath(lang, pathname);
  if (!route || route.isPublic || route.canonical !== pathname) {
    return fallback;
  }
  return value;
}
