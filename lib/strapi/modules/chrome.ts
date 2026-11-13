import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { cache } from "react";

import type { Lang } from "@/i18n/config";
import { cacheEnabled } from "@/lib/cache";

import { ChromeDocument, LatestPostsDocument } from "../generated/graphql";
import { contentStatus } from "../internal/config";
import { nextAnnouncementChange, parseChrome, parsePosts, type Chrome, type PostTeaser } from "../internal/entities";
import { strapiRequest } from "../internal/http";
import { CACHE_TAGS } from "../internal/tags";
import { listPageRoutes } from "./routes";

/**
 * Header, footer and site settings of one language. Empty lists and `null`s
 * when the CMS has no `layout` or `site` for it yet.
 */
export async function getChrome(lang: Lang): Promise<Chrome> {
  return cacheEnabled() ? loadCachedChrome(lang) : loadChrome(lang);
}

/** The newest blog posts, for the `blog` submenu. */
export async function listLatestPosts(lang: Lang, limit: number): Promise<PostTeaser[]> {
  return cacheEnabled() ? loadCachedPosts(lang, limit) : loadPosts(lang, limit);
}

/**
 * Kept until expired on demand, or until the announcement's start or end,
 * whichever comes first: every prerendered page shows the bar, so the cache
 * has to turn it on and off on time without a publish.
 */
async function loadCachedChrome(lang: Lang): Promise<Chrome> {
  "use cache";
  // `page` and `blog`: menu links point at pages and posts.
  cacheTag(
    CACHE_TAGS.all,
    CACHE_TAGS.type("layout"),
    CACHE_TAGS.type("site"),
    CACHE_TAGS.type("announcement"),
    CACHE_TAGS.type("page"),
    CACHE_TAGS.type("blog"),
  );
  const [raw, routes] = await fetchChrome(lang);
  const now = new Date();
  const change = nextAnnouncementChange(raw, now);
  if (change) {
    const seconds = Math.max(1, Math.ceil((change.getTime() - now.getTime()) / 1000));
    cacheLife({ stale: Math.min(300, seconds), revalidate: seconds, expire: seconds + 1 });
  } else {
    cacheLife("max");
  }
  return parseChrome(raw, lang, routes, now);
}

/**
 * Uncached: once per request, though the header, announcement and footer all
 * ask. `connection()` marks it request-time, which the announcement's clock needs.
 */
const loadChrome = cache(async (lang: Lang): Promise<Chrome> => {
  await connection();
  const [raw, routes] = await fetchChrome(lang);
  return parseChrome(raw, lang, routes, new Date());
});

function fetchChrome(lang: Lang) {
  return Promise.all([strapiRequest(ChromeDocument, { locale: lang, status: contentStatus() }), listPageRoutes(lang)]);
}

async function loadCachedPosts(lang: Lang, limit: number): Promise<PostTeaser[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.type("blog"));
  return loadPosts(lang, limit);
}

async function loadPosts(lang: Lang, limit: number): Promise<PostTeaser[]> {
  return parsePosts(await strapiRequest(LatestPostsDocument, { locale: lang, status: contentStatus(), limit }), lang);
}
