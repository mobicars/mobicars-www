import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { CmsPage, cmsPageMetadata, type PageSource } from "@/components/sections/cms-page";
import { isLang, type Lang } from "@/i18n/config";
import {
  findPageRoute,
  findPlaceRoute,
  getPage,
  getPlacePage,
  listPageRoutes,
  listPlaceRoutes,
  pageHref,
  type Page,
  type PageRoute,
  type PlaceKind,
} from "@/lib/strapi";

type Props = PageProps<"/[lang]/[...slug]">;

/**
 * CMS pages: any URL below the language that no app folder serves, e.g.
 * `/pl/wynajem-na-dni`. A path no CMS page has may be a city page
 * (`/pl/wypozyczalnia-samochodow-warszawa`) or a local page
 * (`/pl/lokalna-wypozyczalnia-samochodow/warszawa-bemowo`), at the old site's
 * URLs (`lib/strapi/modules/places.ts`); those render on their first visit.
 * A CMS page's URL comes from its slug and its `parentPage` chain (`lib/strapi/README.md`). Folders such as `fleet` and
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
  const slugs = routes.filter((route) => route.segments.length > 0 && !route.servedByApp).map((route) => ({ slug: route.segments }));
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
  const found = await resolve(lang, slug);
  return found ? cmsPageMetadata(lang, found.route, found.page, found.source) : {};
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
  const found = await resolve(lang, slug);
  if (!found) {
    notFound();
  }
  const canonical = pageHref(lang, found.route.segments);
  // `findRoute` matched, so every segment decodes.
  if (canonical !== pageHref(lang, slug.map(decodeURIComponent))) {
    permanentRedirect(canonical);
  }
  return <CmsPage page={found.page} lang={lang} />;
}

/** A CMS page first, then a city or local page at that path; `null` for a 404. */
async function resolve(
  lang: Lang,
  slug: string[],
): Promise<{ route: PageRoute; page: Page; source?: PageSource } | null> {
  const route = await findPageRoute(lang, slug);
  if (route) {
    const page = await getPage(lang, route.documentId);
    return page ? { route, page } : null;
  }
  const place = await findPlaceRoute(lang, slug);
  if (!place) {
    return null;
  }
  const page = await getPlacePage(place.kind, lang, place.route.documentId);
  return page ? { route: place.route, page, source: placeSource(place.kind) } : null;
}

function placeSource(kind: PlaceKind): PageSource {
  return {
    listRoutes: (lang) => listPlaceRoutes(kind, lang),
    getPage: (lang, documentId) => getPlacePage(kind, lang, documentId),
  };
}
