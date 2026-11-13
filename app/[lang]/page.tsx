import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CmsPage, cmsPageMetadata } from "@/components/blocks/cms-page";
import { ResumeBooking } from "@/components/reservation/resume-booking";
import { isLang, type Lang } from "@/i18n/config";
import { findPageRoute, getPage } from "@/lib/strapi";

/**
 * The home page is the CMS page with slug `homepage` (`lib/strapi/README.md`).
 * A language without one answers 404.
 */

/** Allowed to block, like the other CMS pages: with the cache off the page is read per request. */
export const instant = false;

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) {
    return {};
  }
  const home = await getHome(lang);
  return home ? cmsPageMetadata(lang, home.route, home.page) : {};
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const home = await getHome(lang);
  if (!home) {
    notFound();
  }

  return (
    <>
      <CmsPage page={home.page} lang={lang} />
      <ResumeBooking />
    </>
  );
}

async function getHome(lang: Lang) {
  const route = await findPageRoute(lang, []);
  const page = route ? await getPage(lang, route.documentId) : null;
  return route && page ? { route, page } : null;
}
