import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CmsPage, cmsPageMetadata } from "@/components/blocks/cms-page";
import { isLang, type Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { fleetHref } from "@/i18n/routes";
import { absoluteUrl, jsonLd } from "@/lib/fleet/seo";
import { getPage, listPageRoutes, pageHref, type Page, type PageRoute } from "@/lib/strapi";

/**
 * The fleet: `/pl/flota`, `/en/fleet`, `/de/flotte`, `/uk/avtopark`. The page
 * is the CMS page at that path in this language (hero, a `cars` block with the
 * `catalog` layout, content, FAQ…). A language whose CMS has no such page, or
 * a page with no blocks, answers 404. See `lib/fleet/README.md`.
 */
/**
 * Allowed to block, like the CMS pages and the car page: the CMS page is read
 * before anything renders, so a language without one answers a real 404.
 */
export const instant = false;

export async function generateMetadata({ params }: PageProps<"/[lang]/fleet">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) {
    return {};
  }
  const cms = await fleetCmsPage(lang);
  return cms ? cmsPageMetadata(lang, cms.route, cms.page) : {};
}

export default async function FleetPage({ params }: PageProps<"/[lang]/fleet">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const cms = await fleetCmsPage(lang);
  if (!cms) {
    notFound();
  }
  const t = getMessages(lang).fleet;
  // No visible breadcrumbs over a full-screen hero; search engines still get the trail.
  const trail = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t.breadcrumbHome, item: absoluteUrl(`/${lang}`) },
      { "@type": "ListItem", position: 2, name: t.breadcrumbFleet, item: absoluteUrl(fleetHref(lang)) },
    ],
  };
  return (
    <>
      <CmsPage page={cms.page} lang={lang} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(trail) }} />
    </>
  );
}

/** The CMS page at this language's fleet path (`servedByApp`: this route serves it), when it has blocks. */
async function fleetCmsPage(lang: Lang): Promise<{ route: PageRoute; page: Page } | null> {
  const route = (await listPageRoutes(lang)).find((each) => pageHref(lang, each.segments) === fleetHref(lang));
  const page = route ? await getPage(lang, route.documentId) : null;
  return route && page && page.blocks.length > 0 ? { route, page } : null;
}
