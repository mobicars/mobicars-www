import "server-only";

import { headers } from "next/headers";

/**
 * Failed-login counter kept in this server process.
 * It resets on restart and is not shared between instances. Swap the store
 * for Redis or similar when the site runs on more than one instance.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ENTRIES = 10_000;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type LimitKey = { key: string; max: number };

export function isRateLimited(keys: LimitKey[]): boolean {
  const now = Date.now();
  return keys.some(({ key, max }) => {
    const bucket = buckets.get(key);
    return bucket !== undefined && bucket.resetAt > now && bucket.count >= max;
  });
}

export function recordFailure(keys: LimitKey[]): void {
  const now = Date.now();
  if (buckets.size > MAX_ENTRIES) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) {
        buckets.delete(key);
      }
    }
  }
  for (const { key } of keys) {
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    } else {
      bucket.count += 1;
    }
  }
}

export function clearFailures(keys: LimitKey[]): void {
  for (const { key } of keys) {
    buckets.delete(key);
  }
}

/**
 * First hop of `x-forwarded-for`. Behind a proxy that does not overwrite this
 * header the value can be spoofed, so pair it with a per-account key.
 */
export async function requestIp(): Promise<string> {
  const forwarded = (await headers()).get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
