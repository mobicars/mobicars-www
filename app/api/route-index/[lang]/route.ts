import { NextResponse } from "next/server";

import { isLang, langStaticParams, type Lang } from "@/i18n/config";
import type { RouteIndex } from "@/lib/seo/route-index";
import { listBlogRoutes, listPageRoutes, listPlaceRoutes, listSales } from "@/lib/strapi";

/**
 * `GET /api/route-index/{lang}`: the CMS URLs that exist in one language, for
 * `proxy.ts` (`lib/seo/route-index.ts`). Built from the cached lists the pages
 * look in, so it is prerendered per language and expired by their tags on
 * publish: a request reads a static file, never Strapi. A list that cannot be
 * read is `null` rather than failing the rest.
 */
export async function GET(_request: Request, { params }: RouteContext<"/api/route-index/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const [pages, blog, sales] = await Promise.all([
    readable("pages", () => cmsPaths(lang)),
    readable("blog", async () => (await listBlogRoutes(lang)).map((route) => route.segments[0])),
    readable("sales", async () => (await listSales(lang)).map((sale) => sale.slug)),
  ]);
  const index: RouteIndex = { pages, blog, sales };
  return NextResponse.json(index);
}

export const generateStaticParams = langStaticParams;

/** The paths `app/[lang]/[...slug]` answers: CMS pages (not the home page, not app folders'), cities, local pages. */
async function cmsPaths(lang: Lang): Promise<string[][]> {
  const [pages, cities, locals] = await Promise.all([listPageRoutes(lang), listPlaceRoutes("city", lang), listPlaceRoutes("local", lang)]);
  return [...pages.filter((route) => !route.servedByApp), ...cities, ...locals]
    .map((route) => route.segments)
    .filter((segments) => segments.length > 0);
}

async function readable<T>(name: string, read: () => Promise<T>): Promise<T | null> {
  try {
    return await read();
  } catch (error) {
    console.error(`[route-index] ${name} unavailable, left to the pages: ${error instanceof Error ? error.name : "unknown"}`);
    return null;
  }
}
