import type { Metadata } from "next";

import { intlLocales, langs, type Lang } from "@/i18n/config";
import { absoluteUrl } from "@/lib/fleet/seo";
import { getMessages } from "@/i18n/messages";
import { getChrome, getPage, listPageRoutes, pageHref, type Media, type Page, type PageRoute } from "@/lib/strapi";

import { Sections } from "@/components/sections/sections";

import { Blocks } from "./blocks";
import type { Crumb } from "./page-hero";

/** The body of a CMS page: the home page (`app/[lang]/page.tsx`) and every other (`app/[lang]/[...slug]`). */
export function CmsPage({ page, lang, breadcrumbs = [] }: { page: Page; lang: Lang; breadcrumbs?: Crumb[] }) {
  return (
    // A page shown with the English text (missing in `lang`) says so to screen readers and translators.
    <main className="flex flex-1 flex-col">
      {page.sections.length > 0 ? (
        // The new component set replaces the old blocks page by page.
        <Sections sections={page.sections} lang={lang} title={page.title} pickupId={page.pickupId} />
      ) : (
        <>
          {/* A page that does not open with a hero still gets its one `<h1>`. */}
          {page.blocks[0]?.type !== "hero" ? <h1 className="sr-only">{page.title}</h1> : null}
          <Blocks blocks={page.blocks} lang={lang} pickupId={page.pickupId} breadcrumbs={breadcrumbs} />
        </>
      )}
    </main>
  );
}

/** Whether the page opens with the inner-page hero, the one place breadcrumbs show. */
export function hasPageHero(page: Page): boolean {
  const first = page.blocks[0];
  return first?.type === "hero" && first.layout === "page";
}

/**
 * Breadcrumbs from the route: the home page, every parent path that is a page
 * of the same source (its title), then this page. A parent path without a
 * page is skipped.
 */
export async function pageBreadcrumbs(lang: Lang, route: PageRoute, page: Page, source: PageSource = CMS_PAGES): Promise<Crumb[]> {
  const href = source.href ?? pageHref;
  const routes = await source.listRoutes(lang);
  const parents = await Promise.all(
    route.segments.slice(0, -1).map(async (_, index) => {
      const segments = route.segments.slice(0, index + 1);
      const parent = routes.find((each) => each.segments.join("/") === segments.join("/"));
      const parentPage = parent ? await source.getPage(lang, parent.documentId) : null;
      return parentPage ? { href: href(lang, segments), label: parentPage.title } : null;
    }),
  );
  return [
    { href: `/${lang}`, label: getMessages(lang).layout.breadcrumbHome },
    ...parents.filter((crumb) => crumb !== null),
    { href: href(lang, route.segments), label: page.title },
  ];
}

/**
 * Title, description, robots, canonical, hreflang and Open Graph from the
 * page's SEO fields. hreflang lists the language versions the CMS has, except
 * those with `noIndex` (as in `app/sitemap.ts`).
 *
 * Next replaces the layout's `openGraph` instead of merging it, so the site
 * name and locale are repeated here. The preview image is the page's own
 * (`seo.shareImage`), else the hero photo, else the site's default (`site.seo`).
 */
/** Where a page's language versions come from: CMS pages by default, or a place type (`getPlacePage`). */
export type PageSource = {
  listRoutes: (lang: Lang) => Promise<PageRoute[]>;
  getPage: (lang: Lang, documentId: string) => Promise<Page | null>;
  /** The URL of a route; `pageHref` unless the type has its own folder (blog posts: `blogHref`). */
  href?: (lang: Lang, segments: readonly string[]) => string;
};

const CMS_PAGES: PageSource = { listRoutes: listPageRoutes, getPage };

export async function cmsPageMetadata(lang: Lang, route: PageRoute, page: Page, source: PageSource = CMS_PAGES): Promise<Metadata> {
  const indexable = !page.seo.noIndex;
  const href = source.href ?? pageHref;
  const [alternates, image] = await Promise.all([pageAlternates(lang, route, page, indexable, source), shareImage(lang, page)]);
  const title = page.seo.title ?? `${page.title} | MobiCars`;
  const description = page.seo.description ?? undefined;
  return {
    title: { absolute: title },
    description,
    robots: { index: indexable, follow: !page.seo.noFollow },
    alternates,
    openGraph: {
      type: "website",
      siteName: "MobiCars",
      locale: intlLocales[lang].replace("-", "_"),
      url: absoluteUrl(href(lang, route.segments)),
      title,
      description,
      ...(image ? { images: [previewImage(image)] } : {}),
    },
  };
}

/** Link previews want about 1200 px: the CMS original, scaled by Next's image optimizer (a default size). */
const PREVIEW_WIDTH = 1200;

function previewImage(image: Media) {
  const height = image.width && image.height ? Math.round((image.height * PREVIEW_WIDTH) / image.width) : undefined;
  return {
    url: `/_next/image?url=${encodeURIComponent(image.url)}&w=${PREVIEW_WIDTH}&q=75`,
    alt: image.alt,
    width: PREVIEW_WIDTH,
    height,
  };
}

/** The page's share image, the opening hero's photo or the site's default; `null` when the CMS has none. */
async function shareImage(lang: Lang, page: Page): Promise<Media | null> {
  if (page.seo.image) {
    return page.seo.image;
  }
  const first = page.blocks[0];
  if (first?.type === "hero") {
    return first.image;
  }
  // The CMS being down must not cost the page its metadata.
  return getChrome(lang).then(
    (chrome) => chrome.seo?.image ?? null,
    () => null,
  );
}

/**
 * Canonical and hreflang for the languages this page is indexable in. All
 * language versions share the `documentId`, so each language's route list
 * says where the page lives there; a version with `noIndex` is not offered to
 * search engines (its page is read from the same cache the page itself uses).
 * A page an app route serves (the fleet) is linked to the other languages'
 * pages that route serves too. `x-default` is the Polish version when there is one.
 */
async function pageAlternates(
  lang: Lang,
  route: PageRoute,
  page: Page,
  indexable: boolean,
  source: PageSource,
): Promise<Metadata["alternates"]> {
  const href = source.href ?? pageHref;
  const own = absoluteUrl(href(lang, route.segments));
  if (!indexable) {
    // Not offered to search engines: no alternates.
    return { canonical: own, languages: {} };
  }
  const found = await Promise.all(
    langs.map(async (each) => {
      if (each === lang) {
        return [each, own] as const;
      }
      const match = (await source.listRoutes(each)).find(
        (other) => other.documentId === route.documentId && (!other.servedByApp || route.servedByApp === true),
      );
      if (!match) {
        return null;
      }
      const version = await source.getPage(each, route.documentId);
      return version && !version.seo.noIndex ? ([each, absoluteUrl(href(each, match.segments))] as const) : null;
    }),
  );
  const languages: Record<string, string> = Object.fromEntries(found.filter((entry) => entry !== null));
  return {
    canonical: own,
    languages: languages.pl ? { ...languages, "x-default": languages.pl } : languages,
  };
}
