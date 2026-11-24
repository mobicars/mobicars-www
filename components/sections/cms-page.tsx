import type { Metadata } from "next";

import { intlLocales, langs, type Lang } from "@/i18n/config";
import { absoluteUrl } from "@/lib/fleet/seo";
import { getChrome, getPage, listPageRoutes, pageHref, type Media, type Page, type PageRoute } from "@/lib/strapi";

import { Sections } from "./sections";

/** The body of a CMS page: the home page (`app/[lang]/page.tsx`) and every other (`app/[lang]/[...slug]`). */
export function CmsPage({ page, lang }: { page: Page; lang: Lang }) {
  return (
    <main className="flex flex-1 flex-col">
      <Sections sections={page.sections} lang={lang} title={page.title} pickupId={page.pickupId} />
    </main>
  );
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
  const first = page.sections[0];
  if (first?.type === "hero" && first.image) {
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
