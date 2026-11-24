import { cacheLife, cacheTag } from "next/cache";

import type { Lang } from "@/i18n/config";
import { cacheEnabled } from "@/lib/cache";

import { BlogCardsDocument, BlogPostDocument, BlogRoutesDocument, type BlogCardFragment } from "../generated/graphql";
import { contentStatus } from "../internal/config";
import { parseBlogCard, type BlogPostCard, type Page } from "../internal/entities";
import { strapiRequest } from "../internal/http";
import { findRoute, type PageRoute } from "../internal/routes";
import { CACHE_TAGS } from "../internal/tags";
import { readPageBody } from "./page-body";
import { listPageRoutes } from "./routes";

/**
 * Blog posts (`blog`) at the old site's URLs, `/{lang}/blog/{slug}`
 * (`blogHref`), so links and search results carry over. A post renders like a
 * CMS page from its own `sections`, under its title, date and cover. A post with
 * no version in a language has no URL there (404).
 */
export type BlogPost = {
  page: Page;
  card: BlogPostCard;
  /** ISO date of the last change, for `dateModified`. */
  updatedAt: string | null;
  /** Up to 4 newest posts, without this one. */
  related: BlogPostCard[];
};

/** A row of the Blog section's grid. */
const RELATED = 4;

/** The related cards from the newest posts: this post left out, at most 4. */
export function relatedCards(posts: readonly (BlogCardFragment | null)[], documentId: string, lang: Lang): BlogPostCard[] {
  return posts
    .flatMap((post) => (post && post.documentId !== documentId ? [parseBlogCard(post, lang)] : []))
    .slice(0, RELATED);
}

const PAGE_SIZE = 100;
/** 2 000 posts per language; past that the list is cut, not silently partial. */
const MAX_REQUESTS = 20;

/** Every post in `lang`. `segments` is `[slug]`. */
export function listBlogRoutes(lang: Lang): Promise<PageRoute[]> {
  return loadOwnSlugs(lang);
}

/** The post at `/{lang}/blog/{slug}`, or `null` (404). */
export async function findBlogRoute(lang: Lang, slug: string): Promise<PageRoute | null> {
  return findRoute(await listBlogRoutes(lang), [slug]);
}

/** One post by `documentId` in `lang`, or `null` when it has no version there. */
export async function getBlogPost(lang: Lang, documentId: string): Promise<BlogPost | null> {
  return cacheEnabled() ? loadCachedPost(lang, documentId) : loadPost(lang, documentId);
}

async function loadCachedPost(lang: Lang, documentId: string): Promise<BlogPost | null> {
  "use cache";
  // As `getPage`: the post, the pages its links point to, and the cards and reviews its sections list.
  cacheLife("max");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.type("blog"), CACHE_TAGS.type("page"), CACHE_TAGS.type("rating"), CACHE_TAGS.type("car-collection"));
  return loadPost(lang, documentId);
}

async function loadPost(lang: Lang, documentId: string): Promise<BlogPost | null> {
  const [{ blog: raw }, routes] = await Promise.all([
    strapiRequest(BlogPostDocument, { documentId, locale: lang, status: contentStatus() }),
    listPageRoutes(lang),
  ]);
  if (!raw) {
    return null;
  }
  // One more than shown, in case this post is among the newest.
  const related = strapiRequest(BlogCardsDocument, { locale: lang, status: contentStatus(), limit: RELATED + 1, filters: null }).then(({ blogs }) =>
    relatedCards(blogs, raw.documentId, lang),
  );
  return {
    page: await readPageBody({ documentId: raw.documentId, title: raw.title, seo: raw.seo, sections: raw.sections }, lang, routes),
    // The card's link is the post in the URL's language: its own slug, or the English one.
    card: parseBlogCard(raw, lang),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
    related: await related,
  };
}

function loadOwnSlugs(lang: Lang): Promise<PageRoute[]> {
  return cacheEnabled() ? loadCachedSlugs(lang) : loadSlugs(lang);
}

async function loadCachedSlugs(lang: Lang): Promise<PageRoute[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.type("blog"));
  return loadSlugs(lang);
}

async function loadSlugs(lang: Lang): Promise<PageRoute[]> {
  const routes: PageRoute[] = [];
  for (let page = 1; page <= MAX_REQUESTS; page++) {
    const { blogs_connection } = await strapiRequest(BlogRoutesDocument, { locale: lang, status: contentStatus(), page, pageSize: PAGE_SIZE });
    for (const node of blogs_connection?.nodes ?? []) {
      if (node.slug) {
        routes.push({ documentId: node.documentId, segments: [node.slug], ...(typeof node.updatedAt === "string" ? { updatedAt: node.updatedAt } : {}) });
      }
    }
    if (!blogs_connection || page >= blogs_connection.pageInfo.pageCount) {
      return routes;
    }
  }
  throw new Error(`Strapi has more than ${PAGE_SIZE * MAX_REQUESTS} blog posts in "${lang}".`);
}
