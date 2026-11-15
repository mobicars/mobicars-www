import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { cache } from "react";

import type { Lang } from "@/i18n/config";
import { cacheEnabled } from "@/lib/cache";

import { ChromeDocument, LatestPostsDocument } from "../generated/graphql";
import { contentStatus } from "../internal/config";
import { EMPTY_CHROME, nextAnnouncementChange, parseChrome, parsePosts, type Chrome, type PostTeaser } from "../internal/entities";
import { StrapiError } from "../internal/errors";
import { strapiRequest } from "../internal/http";
import { CACHE_TAGS } from "../internal/tags";
import { listPageRoutes } from "./routes";

/**
 * Header, footer and site settings of one language. Empty lists and `null`s
 * when the CMS has no `layout` or `site` for it yet, and also when Strapi
 * fails: the layout reads this on every route (booking included, whose data
 * comes from RentCarSoft), so a CMS outage must not take a page down. A
 * failed read is logged and cached for half a minute only.
 */
export async function getChrome(lang: Lang): Promise<Chrome> {
  return cacheEnabled() ? loadCachedChrome(lang) : loadChrome(lang);
}

/**
 * The site's SEO defaults for the `[lang]` layout's metadata. With the cache on
 * they come from the cached chrome. With the cache off (local and preview, which
 * are `noindex`) every CMS read is request-time, and request-time data in
 * `generateMetadata()` blocks prerendering on routes that are otherwise static
 * (the account pages); `null` there means the layout uses its built-in texts.
 */
export async function getSiteSeo(lang: Lang): Promise<Chrome["seo"] | null> {
  return cacheEnabled() ? (await loadCachedChrome(lang)).seo : null;
}

/** The newest blog posts, for the `blog` submenu. Empty when Strapi fails, like `getChrome`. */
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
  let fetched: Awaited<ReturnType<typeof fetchChrome>>;
  try {
    fetched = await fetchChrome(lang);
  } catch (error) {
    logFailure("chrome", lang, error);
    cacheLife(FAILURE_LIFE);
    return EMPTY_CHROME;
  }
  const [raw, routes] = fetched;
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
  try {
    const [raw, routes] = await fetchChrome(lang);
    return parseChrome(raw, lang, routes, new Date());
  } catch (error) {
    logFailure("chrome", lang, error);
    return EMPTY_CHROME;
  }
});

/** How long a fallback after a failed read is kept: retried soon, not hammered. */
const FAILURE_LIFE = { stale: 30, revalidate: 30, expire: 60 };

/** The error code only (`timeout`, `graphql`, …): no token, body or variables. */
function logFailure(what: string, lang: Lang, error: unknown): void {
  const code = error instanceof StrapiError ? error.code : "unexpected";
  console.error(`[strapi] ${what} (${lang}) unavailable, showing the fallback: ${code}`);
}

function fetchChrome(lang: Lang) {
  return Promise.all([strapiRequest(ChromeDocument, { locale: lang, status: contentStatus() }), listPageRoutes(lang)]);
}

async function loadCachedPosts(lang: Lang, limit: number): Promise<PostTeaser[]> {
  "use cache";
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.type("blog"));
  try {
    const posts = await fetchPosts(lang, limit);
    cacheLife("max");
    return posts;
  } catch (error) {
    logFailure("latest posts", lang, error);
    cacheLife(FAILURE_LIFE);
    return [];
  }
}

async function loadPosts(lang: Lang, limit: number): Promise<PostTeaser[]> {
  try {
    return await fetchPosts(lang, limit);
  } catch (error) {
    logFailure("latest posts", lang, error);
    return [];
  }
}

async function fetchPosts(lang: Lang, limit: number): Promise<PostTeaser[]> {
  return parsePosts(await strapiRequest(LatestPostsDocument, { locale: lang, status: contentStatus(), limit }), lang);
}
