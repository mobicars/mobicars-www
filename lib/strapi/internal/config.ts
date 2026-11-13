import { contentPreview } from "@/lib/cache";

import type { PublicationStatus } from "../generated/graphql";

/** CMS origin without a trailing slash. Media URLs from the local upload provider are relative to it. */
export function strapiUrl(): string {
  return (process.env.STRAPI_URL || "http://localhost:1337").replace(/\/+$/, "");
}

/** Read-only API token. The CMS answers nothing without one (its Public role has no permissions). */
export function strapiKey(): string | undefined {
  return process.env.STRAPI_KEY || undefined;
}

/**
 * A cached site shows what is published. A preview (`CACHE_ENABLED` off) shows
 * drafts, so editors see a saved change before they publish it (`PreviewBanner`).
 */
export function contentStatus(): PublicationStatus {
  return contentPreview() ? "DRAFT" : "PUBLISHED";
}
