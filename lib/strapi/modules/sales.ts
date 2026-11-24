import { cacheLife, cacheTag } from "next/cache";

import type { Lang } from "@/i18n/config";
import { cacheEnabled } from "@/lib/cache";

import { SaleBySlugDocument, SaleCardsDocument } from "../generated/graphql";
import { contentStatus } from "../internal/config";
import { strapiRequest } from "../internal/http";
import { parseSaleAd, parseSaleCard, type SaleAd, type SaleCard } from "../internal/sales";
import { CACHE_TAGS } from "../internal/tags";

/**
 * The car-sale ads (`sale`) of one language, newest first: the Car sales
 * section's list, the other ads under an ad and the sitemap. One request for
 * all of them (a few dozen at most), cached until an ad changes.
 */
export function listSales(lang: Lang): Promise<SaleCard[]> {
  return cacheEnabled() ? loadCachedSales(lang) : loadSales(lang);
}

/** One ad by its slug in `lang`, or `null` (404). */
export function findSale(lang: Lang, slug: string): Promise<SaleAd | null> {
  return cacheEnabled() ? loadCachedSale(lang, slug) : loadSale(lang, slug);
}

async function loadCachedSales(lang: Lang): Promise<SaleCard[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.type("sale"));
  return loadSales(lang);
}

async function loadSales(lang: Lang): Promise<SaleCard[]> {
  const { sales } = await strapiRequest(SaleCardsDocument, { locale: lang, status: contentStatus() });
  return sales.flatMap((raw) => {
    const card = raw ? parseSaleCard(raw, lang) : null;
    return card ? [card] : [];
  });
}

async function loadCachedSale(lang: Lang, slug: string): Promise<SaleAd | null> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.type("sale"));
  return loadSale(lang, slug);
}

async function loadSale(lang: Lang, slug: string): Promise<SaleAd | null> {
  const { sales } = await strapiRequest(SaleBySlugDocument, { slug, locale: lang, status: contentStatus() });
  return sales[0] ? parseSaleAd(sales[0], lang) : null;
}
