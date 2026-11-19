import { Info } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";

import { EXTRAS_GRID, ExtraCard } from "@/components/extras/extra-card";
import { ReservationPicker } from "@/components/reservation/picker";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/section";
import { isLang, langs, type Lang } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { getMessages } from "@/i18n/messages";
import { extrasHref } from "@/i18n/routes";
import { findCatalogExtra, listCatalogExtras, type CatalogExtra } from "@/lib/extras/catalog";
import { absoluteUrl, jsonLd } from "@/lib/fleet/seo";
import { offerIdFromSlug } from "@/lib/fleet/slug";
import { listServicePoints, type ExtraPresentation } from "@/lib/rentcarsoft";
import { toPickupPlace } from "@/lib/reservation/places";

type Props = PageProps<"/[lang]/extras/[slug]">;

/**
 * One add-on or accessory, `/pl/dodatki-i-akcesoria/fotelik-9-36kg-147`, as on
 * the old site: everything comes from RentCarSoft's cached catalog
 * (`lib/extras/catalog.ts`), so a new add-on has its page at once. Allowed to
 * block like the car page: an unknown id answers 404 and an old or variant
 * slug a real 308 before anything renders.
 */
export const instant = false;

/** One add-on prerendered, so Cache Components can check the static shell; the rest render on first visit. */
export async function generateStaticParams() {
  const extras = await listCatalogExtras("pl").catch((error: unknown) => {
    console.error(`[extras] catalog unavailable at build, no add-on prerendered: ${error instanceof Error ? error.name : "unknown"}`);
    return [];
  });
  return [{ slug: extras[0]?.slug ?? "catalog-unavailable" }];
}

async function read(lang: string, slug: string): Promise<{ lang: Lang; extra: CatalogExtra } | null> {
  const id = offerIdFromSlug(slug);
  if (!isLang(lang) || id === null) {
    return null;
  }
  const extra = await findCatalogExtra(lang, id);
  return extra ? { lang, extra } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const found = await read(lang, slug);
  if (!found) {
    return {};
  }
  const { extra } = found;
  const t = getMessages(found.lang).extrasPage;
  const title = fill(t.metaTitle, { name: extra.name });
  const description = fill(t.metaDescription, { name: extra.name, group: t.groups[extra.group] });
  // The name, and so the slug, is per language: each alternate is that language's own page.
  const slugs = await Promise.all(langs.map(async (each) => [each, (await findCatalogExtra(each, extra.id))?.slug] as const));
  const languages = Object.fromEntries(slugs.flatMap(([each, other]) => (other ? [[each, absoluteUrl(extrasHref(each, other))]] : [])));
  return {
    title: `${title} | MobiCars`,
    description,
    alternates: {
      canonical: absoluteUrl(extrasHref(found.lang, extra.slug)),
      languages: { ...languages, ...(languages.pl ? { "x-default": languages.pl } : {}) },
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(extrasHref(found.lang, extra.slug)),
      type: "website",
      images: extra.image ? [{ url: extra.image, alt: extra.name }] : undefined,
    },
  };
}

export default async function ExtraPage({ params }: Props) {
  const { lang, slug } = await params;
  const found = await read(lang, slug);
  if (!found) {
    notFound();
  }
  if (found.extra.slug !== decodeURIComponent(slug)) {
    // Old site URLs (`pelny-bak-na-start-(benzyna)-3758`), variants and renamed add-ons.
    permanentRedirect(extrasHref(found.lang, found.extra.slug));
  }
  return (
    <main className="flex flex-1 flex-col bg-surface">
      <ExtraDetails lang={found.lang} extra={found.extra} />
    </main>
  );
}

async function ExtraDetails({ lang, extra }: { lang: Lang; extra: CatalogExtra }) {
  const messages = getMessages(lang);
  const t = messages.extrasPage;
  const [catalog, points] = await Promise.all([listCatalogExtras(lang), listServicePoints({ lang })]);
  const related = catalog.filter((other) => other.group === extra.group && other.id !== extra.id);
  const group = t.groups[extra.group];
  const trail = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t.breadcrumbHome, item: absoluteUrl(`/${lang}`) },
      { "@type": "ListItem", position: 2, name: t.list, item: absoluteUrl(extrasHref(lang)) },
      { "@type": "ListItem", position: 3, name: extra.name, item: absoluteUrl(extrasHref(lang, extra.slug)) },
    ],
  };

  return (
    <>
      <Container className="grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-10 lg:py-10">
        <div className="flex min-w-0 flex-col gap-6">
          <Breadcrumbs
            label={t.breadcrumbLabel}
            items={[
              { href: `/${lang}`, label: t.breadcrumbHome },
              { href: extrasHref(lang), label: t.list },
              { href: extrasHref(lang, extra.slug), label: extra.name },
            ]}
          />
          <header className="flex flex-col gap-2">
            <p className="text-eyebrow text-green-dark uppercase">{group}</p>
            <h1 className="text-title text-balance text-blue-dark">{extra.name}</h1>
          </header>
          {extra.image ? (
            // RentCarSoft's add-on images are mostly pictograms: shown smaller, with room around them.
            <div className="relative aspect-[16/9] overflow-hidden rounded-card border border-line bg-white">
              <Image src={extra.image} alt={extra.name} fill priority sizes="(min-width: 1024px) 480px, 70vw" className="object-contain p-10 sm:p-16" />
            </div>
          ) : null}
          {extra.description ? (
            <Panel title={t.descriptionTitle} id="description">
              <div
                className="text-sm leading-relaxed text-ink [&_a]:text-blue-medium [&_a]:underline [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-blue-dark [&_h3]:mt-4 [&_h3]:font-bold [&_h3]:text-blue-dark [&_h4]:mt-3 [&_h4]:font-semibold [&_h4]:text-blue-dark [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mt-2 [&_ul]:list-disc [&>*:first-child]:mt-0"
                dangerouslySetInnerHTML={{ __html: extra.description }}
              />
            </Panel>
          ) : null}
          {extra.presentation ? (
            <Panel title={t.protectionTitle} id="excess">
              <Excess presentation={extra.presentation} rows={messages.protection.rows} />
            </Panel>
          ) : null}
        </div>

        <aside className="lg:row-span-2">
          <div className="flex flex-col gap-4 lg:sticky lg:top-24">
            <section aria-labelledby="book-title" className="rounded-card border border-line bg-white p-5 shadow-float sm:p-6">
              <p className="flex gap-2 rounded-control bg-tint px-4 py-3 text-sm text-blue-dark">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                {t.howTo}
              </p>
              <h2 id="book-title" className="mt-5 border-t border-line pt-5 text-subtitle text-blue-dark">
                {t.bookTitle}
              </h2>
              <p className="mb-4 text-sm text-muted-dark">{t.bookLead}</p>
              <ReservationPicker lang={lang} places={points.map(toPickupPlace)} />
            </section>
          </div>
        </aside>
      </Container>

      {related.length > 0 ? (
        <section aria-labelledby="related-title" className="bg-white py-section-sm">
          <Container className="flex flex-col gap-6">
            <h2 id="related-title" className="text-subtitle text-blue-dark">
              {fill(t.related, { group })}
            </h2>
            <ul className={EXTRAS_GRID}>
              {related.map((other) => (
                <li key={other.id} className="flex">
                  <ExtraCard extra={other} lang={lang} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(trail) }} />
    </>
  );
}

function Panel({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex flex-col gap-4 rounded-card border border-line bg-white p-5 sm:p-7">
      <h2 id={`${id}-title`} className="text-subtitle text-blue-dark">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** The protection package's excess per damage, the rows of the booking's comparison. */
function Excess({ presentation, rows }: { presentation: ExtraPresentation; rows: Record<keyof ExtraPresentation, string> }) {
  const keys = (Object.keys(rows) as (keyof ExtraPresentation)[]).filter((key) => presentation[key]);
  return (
    <dl className="divide-y divide-line">
      {keys.map((key) => (
        <div key={key} className="flex items-center justify-between gap-4 py-2.5 text-sm">
          <dt className="text-blue-dark/80">{rows[key]}</dt>
          <dd className="text-right font-semibold text-blue-dark">{presentation[key]}</dd>
        </div>
      ))}
    </dl>
  );
}
