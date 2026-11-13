import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { CmsPage, cmsPageMetadata } from "@/components/blocks/cms-page";
import { isLang } from "@/i18n/config";
import { findPageRoute, getPage, listPageRoutes, pageHref } from "@/lib/strapi";

type Props = PageProps<"/[lang]/[...slug]">;

/**
 * CMS pages: any URL below the language that no app folder serves, e.g.
 * `/pl/wynajem-na-dni`. The URL comes from the page's slug and its
 * `parentPage` chain (`lib/strapi/README.md`). Folders such as `fleet` and
 * `reservation` win over this route, and `proxy.ts` rewrites their localized
 * URLs before it is reached. The home page is `app/[lang]/page.tsx`.
 */

/**
 * Allowed to block: the page answers 404 or a 308 before it renders, like the
 * car page. Every CMS page is prerendered; one added later renders on its
 * first visit and is cached from then on.
 */
export const instant = false;

export async function generateStaticParams({ params }: { params: { lang: string } }) {
  const routes = isLang(params.lang) ? await listPageRoutes(params.lang) : [];
  const slugs = routes.filter((route) => route.segments.length > 0).map((route) => ({ slug: route.segments }));
  // Cache Components refuses an empty list. A language with no CMS pages yet
  // (de, uk) prerenders one path that is not a slug and answers 404.
  return slugs.length > 0 ? slugs : [{ slug: [NO_PAGES] }];
}

/** Not a valid Strapi uid, so it never matches a page. */
const NO_PAGES = "_";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) {
    return {};
  }
  const route = await findPageRoute(lang, slug);
  const page = route ? await getPage(lang, route.documentId) : null;
  if (!route || !page) {
    return {};
  }
  return cmsPageMetadata(lang, route, page);
}

/**
 * The route and the page are read before anything renders, not inside
 * `<Suspense>`: an unknown URL must answer 404 and a wrongly cased one a real
 * 308 (see the car page).
 */
export default async function CmsRoute({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const route = await findPageRoute(lang, slug);
  if (!route) {
    notFound();
  }
  const canonical = pageHref(lang, route.segments);
  // `findRoute` matched, so every segment decodes.
  if (canonical !== pageHref(lang, slug.map(decodeURIComponent))) {
    permanentRedirect(canonical);
  }
  const page = await getPage(lang, route.documentId);
  if (!page) {
    notFound();
  }

  return <CmsPage page={page} lang={lang} />;
}
