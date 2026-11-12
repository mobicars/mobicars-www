/**
 * Normalizes any domain or URL string by stripping protocol (http://, https://),
 * leading 'www.', query strings, port, and trailing slashes.
 *
 * Examples:
 * - "https://www.mobicars.pl/" -> "mobicars.pl"
 * - "http://mobicars.pl" -> "mobicars.pl"
 * - "https://staging.mobicars.pl" -> "staging.mobicars.pl"
 * - "http://localhost:3000/" -> "localhost:3000"
 */
export function normalizeDomain(rawDomain?: string | null): string {
  if (!rawDomain) return "";

  return rawDomain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "") // remove http:// or https://
    .replace(/^www\./, "")       // remove leading www.
    .replace(/\/+$/, "")        // remove trailing slashes
    .split("/")[0];             // remove any path if present
}

/**
 * Returns true ONLY if the configured domain matches 'mobicars.pl' exactly.
 * Any other domain (e.g. localhost, staging.mobicars.pl, vercel preview) returns false.
 */
export function isProduction(): boolean {
  const raw =
    process.env.NEXT_PUBLIC_DOMAIN ||
    process.env.DOMAIN ||
    "";

  return normalizeDomain(raw) === "mobicars.pl";
}

export const environment = isProduction() ? "production" : "staging";
