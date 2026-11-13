/**
 * Cache tags. Every cached read is tagged with `cms` and with each content
 * type its query reads, so a change to one type expires every page that
 * shows it (a new blog post expires the home page that lists posts).
 * Strapi's webhook names the type in `model`, the API id (`page`, `blog`).
 */
export const CACHE_TAGS = {
  all: "cms",
  type: (model: string) => `cms:${model}`,
} as const;

/** Strapi webhook events that change what the site shows. */
const ENTRY_EVENTS: ReadonlySet<string> = new Set([
  "entry.create",
  "entry.update",
  "entry.delete",
  "entry.publish",
  "entry.unpublish",
]);

/**
 * Tags to expire for one Strapi webhook call, or `null` for a body this
 * endpoint does not understand.
 *
 * - `entry.*`: the entry's content type.
 * - `media.*`: all CMS reads; a replaced file keeps its id, and the pages
 *   that show it are not known here.
 * - `trigger-test` (the "Trigger" button in Strapi): nothing.
 *
 * Manual calls (`purge`, explicit tags) are handled in `lib/revalidate.ts`.
 */
export function tagsForWebhook(body: unknown): string[] | null {
  if (!body || typeof body !== "object") {
    return null;
  }
  const { event, model } = body as { event?: unknown; model?: unknown };
  if (typeof event !== "string") {
    return null;
  }
  if (event === "trigger-test") {
    return [];
  }
  if (event.startsWith("media.")) {
    return [CACHE_TAGS.all];
  }
  if (ENTRY_EVENTS.has(event) && typeof model === "string" && /^[a-z0-9-]+$/.test(model)) {
    return [CACHE_TAGS.type(model)];
  }
  return null;
}
