import type { Metadata } from "next";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { Blog } from "@/components/sections/blog";
import { cmsPageMetadata, type PageSource } from "@/components/sections/cms-page";
import { Sections } from "@/components/sections/sections";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/section";
import { intlLocales, isLang, type Lang } from "@/i18n/config";
import { fill, getMessages } from "@/i18n/messages";
import { plural } from "@/i18n/plural";
import { prepareArticle } from "@/lib/blog/article";
import { absoluteUrl } from "@/lib/fleet/seo";
import { blogHref, findBlogRoute, getBlogPost, listBlogRoutes, type BlogPost } from "@/lib/strapi";

type Props = PageProps<"/[lang]/blog/[slug]">;

/**
 * One blog post at the old site's URL, `/pl/blog/{slug}`. The list itself,
 * `/pl/blog`, is a CMS page (`app/[lang]/[...slug]`). A post renders its
 * `sections` like a CMS page, under a header with its date and cover, and ends
 * with the newest posts as a Blog section.
 * A post missing in `lang` is shown with the English text at its English slug,
 * `noindex` with an English canonical (`lib/strapi/modules/blog.ts`).
 */

/** Allowed to block: an unknown slug answers 404 and a wrongly cased one a 308 before rendering. */
export const instant = false;

export async function generateStaticParams({ params }: { params: { lang: string } }) {
  const routes = isLang(params.lang) ? await listBlogRoutes(params.lang) : [];
  const slugs = routes.map((route) => ({ slug: route.segments[0] }));
  // Cache Components refuses an empty list; this slug is not a valid uid, so it answers 404.
  return slugs.length > 0 ? slugs : [{ slug: "_" }];
}

const BLOG: PageSource = {
  listRoutes: listBlogRoutes,
  getPage: async (lang, documentId) => (await getBlogPost(lang, documentId))?.page ?? null,
  href: (lang, segments) => blogHref(lang, segments[0]),
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) {
    return {};
  }
  const found = await resolve(lang, slug);
  if (!found) {
    return {};
  }
  const metadata = await cmsPageMetadata(lang, found.route, found.post.page, BLOG);
  const { card } = found.post;
  return {
    ...metadata,
    description: metadata.description ?? card.excerpt ?? undefined,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      ...(card.publishedAt ? { publishedTime: card.publishedAt } : {}),
      ...(found.post.updatedAt ? { modifiedTime: found.post.updatedAt } : {}),
    },
  };
}

export default async function BlogPostRoute({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const found = await resolve(lang, slug);
  if (!found) {
    notFound();
  }
  const canonical = blogHref(lang, found.route.segments[0]);
  if (canonical !== blogHref(lang, decodeURIComponent(slug))) {
    permanentRedirect(canonical);
  }
  const { page, card } = found.post;
  const t = getMessages(lang);
  const date = card.publishedAt ? new Date(card.publishedAt) : null;
  const article = prepareArticle(page.sections);
  const related = found.post.related;
  return (
    // A post shown with the English text (missing in `lang`) says so to screen readers and translators.
    <main className="flex flex-1 flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(lang, found.post, canonical)).replace(/</g, "\\u003c") }} />
      <article className="flex flex-col">
        <header className="bg-surface py-section-sm">
          <Container className="flex max-w-reading flex-col gap-5">
            <Breadcrumbs
              label={t.fleet.breadcrumbLabel}
              items={[
                { href: `/${lang}`, label: t.layout.breadcrumbHome },
                { href: `/${lang}/blog`, label: t.blocks.blogBreadcrumb },
                { href: canonical, label: page.title },
              ]}
            />
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-dark">
              {date ? (
                <time dateTime={card.publishedAt ?? undefined}>
                  {new Intl.DateTimeFormat(intlLocales[lang], { day: "numeric", month: "long", year: "numeric" }).format(date)}
                </time>
              ) : null}
              <span aria-hidden>·</span>
              <span>{fill(plural(lang, article.minutes, t.blocks.readingTime), { count: String(article.minutes) })}</span>
            </p>
            <h1 className="text-title text-balance text-blue-dark">{page.title}</h1>
            {card.excerpt ? <p className="text-lead text-pretty text-blue-dark/80">{card.excerpt}</p> : null}
            {article.toc.length > 1 ? (
              <details className="group rounded-card bg-white ring-1 ring-line">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 font-semibold text-blue-dark outline-none focus-visible:ring-2 focus-visible:ring-blue-medium [&::-webkit-details-marker]:hidden">
                  {fill(t.blocks.toc, { count: String(article.toc.length) })}
                  <ChevronDown className="size-5 text-blue-medium transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
                </summary>
                <ol className="flex list-decimal flex-col gap-1 border-t border-line py-3 pr-4 pl-9 text-blue-medium marker:text-muted-dark">
                  {article.toc.map((entry) => (
                    <li key={entry.id}>
                      <a href={`#${entry.id}`} className="inline-flex min-h-8 items-center font-semibold underline-offset-4 hover:underline">
                        {entry.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            ) : null}
            {card.image ? (
              <Image
                src={card.image.url}
                alt={card.image.alt}
                width={card.image.width ?? 1200}
                height={card.image.height ?? 675}
                sizes="(min-width: 768px) 720px, 100vw"
                priority
                className="aspect-[16/9] w-full rounded-card object-cover"
              />
            ) : null}
          </Container>
        </header>
        <Sections sections={article.sections} lang={lang} title={page.title} pickupId={null} titled />
      </article>
      {related.length > 0 ? (
        // The Blog section's grid and cards, as on the CMS pages.
        <Blog
          lang={lang}
          section={{
            type: "blog",
            id: "related",
            badge: null,
            title: t.blocks.relatedPosts,
            text: null,
            headerAlign: "start",
            posts: related,
            listing: false,
            layout: "grid",
            ctas: [],
            background: { tone: "light" },
            width: "full",
            spacing: "medium",
          }}
        />
      ) : null}
    </main>
  );
}

async function resolve(lang: Lang, slug: string) {
  const route = await findBlogRoute(lang, slug);
  if (!route) {
    return null;
  }
  const post = await getBlogPost(lang, route.documentId);
  return post ? { route, post } : null;
}

/** `BlogPosting` for search engines: the post's text language, dates and cover. */
function structuredData(lang: Lang, post: BlogPost, href: string) {
  const { page, card, updatedAt } = post;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: page.title,
    ...(card.excerpt ? { description: card.excerpt } : {}),
    inLanguage: intlLocales[lang],
    mainEntityOfPage: absoluteUrl(href),
    ...(card.publishedAt ? { datePublished: card.publishedAt } : {}),
    ...(updatedAt ? { dateModified: updatedAt } : {}),
    ...(card.image ? { image: card.image.url } : {}),
    publisher: { "@type": "Organization", name: "MobiCars" },
  };
}
