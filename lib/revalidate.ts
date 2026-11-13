import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import { CACHE_TAGS as RCS_CACHE_TAGS } from "@/lib/rentcarsoft";
import { CACHE_TAGS as CMS_CACHE_TAGS, tagsForWebhook } from "@/lib/strapi";

/**
 * On-demand expiry for every data source, behind `POST /api/revalidate`.
 * Each source names its own tags (`CACHE_TAGS` in `lib/strapi` and
 * `lib/rentcarsoft`); a tag added there is accepted here without a change.
 */

/** Every tag a call may name: each source's tags plus `cms:<api id>`. */
function isKnownTag(tag: string): boolean {
  return (
    tag === CMS_CACHE_TAGS.all ||
    /^cms:[a-z0-9-]+$/.test(tag) ||
    (Object.values(RCS_CACHE_TAGS) as string[]).includes(tag)
  );
}

/**
 * Tags to expire for one request body, or `null` when it is not understood:
 *
 * - `{"event":"purge"}`: everything, all sources.
 * - `{"tags":["rcs:catalog","cms:page"]}`: those tags; one unknown tag rejects the call.
 * - a Strapi webhook (`event`, `model`): see `tagsForWebhook` in `lib/strapi`.
 */
export function tagsToRevalidate(body: unknown): string[] | null {
  if (!body || typeof body !== "object") {
    return null;
  }
  const { event, tags } = body as { event?: unknown; tags?: unknown };
  if (event === "purge") {
    return [CMS_CACHE_TAGS.all, ...new Set(Object.values(RCS_CACHE_TAGS))];
  }
  if (tags !== undefined) {
    if (!Array.isArray(tags) || tags.length === 0) {
      return null;
    }
    return tags.every((tag) => typeof tag === "string" && isKnownTag(tag)) ? [...new Set(tags as string[])] : null;
  }
  return tagsForWebhook(body);
}

/**
 * Checks `Authorization: Bearer <REVALIDATE_SECRET>`, the secret shared by the
 * Strapi webhook and manual calls.
 */
export function revalidateAccess(request: Request): "ok" | "not_configured" | "unauthorized" {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return "not_configured";
  }
  const received = request.headers.get("authorization");
  if (!received) {
    return "unauthorized";
  }
  // Hashing first gives equal lengths for the constant-time compare.
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(received), digest(`Bearer ${secret}`)) ? "ok" : "unauthorized";
}
