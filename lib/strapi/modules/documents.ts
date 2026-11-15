import { cacheLife, cacheTag } from "next/cache";

import type { Lang } from "@/i18n/config";
import { cacheEnabled } from "@/lib/cache";

import { DocumentFileDocument } from "../generated/graphql";
import { contentStatus, strapiUrl } from "../internal/config";
import { strapiRequest } from "../internal/http";
import { CACHE_TAGS } from "../internal/tags";
import { safeUrl } from "../internal/url";

/**
 * The file URL of a legal document (`regulation`) by its slug, or `null`.
 * Contracts and e-mails link to `/pl/dokumenty/{slug}`, which the old site
 * redirected to the PDF; `app/[lang]/dokumenty/[slug]` keeps doing that.
 * Only the language's own documents: one it lacks is a 404.
 */
export function findDocumentFile(lang: Lang, slug: string): Promise<string | null> {
  return loadOwn(lang, slug);
}

function loadOwn(lang: Lang, slug: string): Promise<string | null> {
  return cacheEnabled() ? loadCachedFile(lang, slug) : loadFile(lang, slug);
}

async function loadCachedFile(lang: Lang, slug: string): Promise<string | null> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.type("regulation"));
  return loadFile(lang, slug);
}

async function loadFile(lang: Lang, slug: string): Promise<string | null> {
  const { regulations } = await strapiRequest(DocumentFileDocument, { slug, locale: lang, status: contentStatus() });
  const url = regulations[0]?.file?.url;
  if (!url) {
    return null;
  }
  return safeUrl(/^https?:\/\//.test(url) ? url : `${strapiUrl()}${url}`);
}
