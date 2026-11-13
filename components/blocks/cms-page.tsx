import type { Metadata } from "next";

import { langs, type Lang } from "@/i18n/config";
import { absoluteUrl } from "@/lib/fleet/seo";
import { listPageRoutes, pageHref, type Page, type PageRoute } from "@/lib/strapi";

import { Blocks } from "./blocks";

/** The body of a CMS page: the home page (`app/[lang]/page.tsx`) and every other (`app/[lang]/[...slug]`). */
export function CmsPage({ page, lang }: { page: Page; lang: Lang }) {
  return (
    <main className="flex flex-1 flex-col">
      {/* A page that does not open with a hero still gets its one `<h1>`. */}
      {page.blocks[0]?.type !== "hero" ? <h1 className="sr-only">{page.title}</h1> : null}
      <Blocks blocks={page.blocks} lang={lang} />
    </main>
  );
}

/** Title, description, robots, canonical and hreflang from the page's SEO fields. */
export async function cmsPageMetadata(lang: Lang, route: PageRoute, page: Page): Promise<Metadata> {
  return {
    title: { absolute: page.seo.title ?? `${page.title} | MobiCars` },
    description: page.seo.description ?? undefined,
    robots: { index: !page.seo.noIndex, follow: !page.seo.noFollow },
    alternates: await pageAlternates(lang, route),
  };
}

/**
 * Canonical and hreflang for the languages this page exists in. All language
 * versions share the `documentId`, so each language's route list says where
 * the page lives there. `x-default` is the Polish version when there is one.
 */
async function pageAlternates(lang: Lang, route: PageRoute): Promise<Metadata["alternates"]> {
  const found = await Promise.all(
    langs.map(async (each) => {
      const routes = each === lang ? null : await listPageRoutes(each);
      const match = routes ? routes.find((other) => other.documentId === route.documentId) : route;
      return match ? ([each, absoluteUrl(pageHref(each, match.segments))] as const) : null;
    }),
  );
  const languages = Object.fromEntries(found.filter((entry) => entry !== null));
  return {
    canonical: absoluteUrl(pageHref(lang, route.segments)),
    languages: languages.pl ? { ...languages, "x-default": languages.pl } : languages,
  };
}
