/**
 * One switch for how the site reads data, set per environment instead of
 * guessed from the domain. Expiring entries on demand is `lib/revalidate.ts`.
 *
 * `CACHE_ENABLED`: on unless `false`, `0` or `off`. A missing variable keeps the
 * cache on, so a forgotten setting on a deployment costs freshness, never speed
 * or unpublished content.
 *
 * - on (production): cached reads of published content.
 * - off (local, preview deployments): every request reads live, Strapi drafts
 *   included, with the preview banner. See `contentPreview`.
 */
export function cacheEnabled(): boolean {
  const value = process.env.CACHE_ENABLED?.trim().toLowerCase();
  return !(value === "false" || value === "0" || value === "off");
}

/**
 * Content preview: Strapi drafts and the red banner. The other side of the
 * cache switch, so a site never caches drafts and never shows drafts to visitors
 * of a cached (production) site.
 */
export function contentPreview(): boolean {
  return !cacheEnabled();
}
