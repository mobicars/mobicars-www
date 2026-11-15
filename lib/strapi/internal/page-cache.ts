import { cacheLife } from "next/cache";

/**
 * Inside `"use cache"`: keep a page for good, or only until its next promotion
 * card turns on or off (`Page.changesAt`), as the chrome does for the announcement.
 */
export function cacheUntil(changesAt: string | null | undefined): void {
  if (!changesAt) {
    cacheLife("max");
    return;
  }
  const seconds = Math.max(1, Math.ceil((Date.parse(changesAt) - Date.now()) / 1000));
  cacheLife({ stale: Math.min(300, seconds), revalidate: seconds, expire: seconds + 1 });
}
