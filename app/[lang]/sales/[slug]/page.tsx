import { ChevronLeft, Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { CarGallery } from "@/components/fleet/car-gallery";
import { StickyBookBar } from "@/components/fleet/sticky-book-bar";
import { SaleCard, formatMileage, saleFacts, saleSubtitle, type SalesTexts } from "@/components/sales/sale-card";
import { CarsCarousel } from "@/components/sections/cars";
import { RichBlocksView } from "@/components/sections/rich-blocks";
import { BOTTOM_BAR_LABEL, BOTTOM_BAR_VALUE } from "@/components/ui/bottom-bar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonClass } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { isLang, type Lang } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { getMessages } from "@/i18n/messages";
import { salesHref } from "@/i18n/routes";
import { formatPrice } from "@/lib/fleet/format";
import { absoluteUrl, jsonLd } from "@/lib/fleet/seo";
import { findSale, getChrome, listSales, type Contact, type SaleAd } from "@/lib/strapi";

type Props = PageProps<"/[lang]/sales/[slug]">;

/**
 * One car-sale ad, `/pl/sprzedaz-samochodow/mazda-cx-30` (the old site's URL;
 * `proxy.ts` rewrites it here). Like the car page, but a seller's page: the
 * gallery, a sticky box with the gross price, the four key facts and the sales
 * line and mailbox (Site settings, `contact.salesPhone` / `salesEmail`), the
 * phone bar with the same "Call", the specs with the VIN, registration number
 * and first registration, the ad's own text, and the other ads. Allowed to
 * block: an unknown slug answers 404 and a wrongly cased one a 308 before
 * anything renders. Structured data: `Car` with its `Offer`.
 */
export const instant = false;

/** One ad prerendered, so Cache Components can check the static shell; the rest render on first visit. */
export async function generateStaticParams() {
  const sales = await listSales("pl").catch(() => []);
  return [{ slug: sales[0]?.slug ?? "no-ads" }];
}

async function read(lang: string, slug: string): Promise<{ lang: Lang; sale: SaleAd } | null> {
  if (!isLang(lang)) {
    return null;
  }
  const sale = await findSale(lang, decodeURIComponent(slug));
  return sale ? { lang, sale } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const found = await read(lang, slug);
  if (!found) {
    return {};
  }
  const { sale } = found;
  const t = getMessages(found.lang).sales;
  const title = sale.seo.title ?? `${sale.title} | MobiCars`;
  const description = sale.seo.description ?? fill(t.metaDescription, { name: sale.title, details: details(found.lang, sale, t) });
  const url = absoluteUrl(salesHref(found.lang, sale.slug));
  const image = sale.seo.image ?? sale.images[0] ?? null;
  return {
    title: { absolute: title },
    description,
    robots: { index: !sale.seo.noIndex, follow: !sale.seo.noFollow },
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: "MobiCars", title, description, url, ...(image ? { images: [{ url: image.url, alt: image.alt || sale.title }] } : {}) },
  };
}

/** "2021, 198 000 km, 52 900 zł": what the meta description and the offer say about the car. */
function details(lang: Lang, sale: SaleAd, t: SalesTexts): string {
  return [sale.specs.year, sale.specs.mileage !== null ? formatMileage(lang, sale.specs.mileage) : null, sale.price !== null ? `${formatPrice(lang, sale.price)} ${t.gross}` : null]
    .filter(Boolean)
    .join(", ");
}

export default async function SalePage({ params }: Props) {
  const { lang, slug } = await params;
  const found = await read(lang, slug);
  if (!found) {
    notFound();
  }
  if (found.sale.slug !== decodeURIComponent(slug)) {
    permanentRedirect(salesHref(found.lang, found.sale.slug));
  }
  return (
    <main className="flex flex-1 flex-col bg-surface">
      <SaleDetails lang={found.lang} sale={found.sale} />
    </main>
  );
}

async function SaleDetails({ lang, sale }: { lang: Lang; sale: SaleAd }) {
  const messages = getMessages(lang);
  const t = messages.sales;
  const [chrome, others] = await Promise.all([
    getChrome(lang).catch(() => null),
    listSales(lang).catch(() => []),
  ]);
  const contact = chrome?.contact ?? null;
  const subtitle = saleSubtitle(sale.specs);
  const facts = saleFacts(lang, sale.specs, t);
  const more = others.filter((other) => other.id !== sale.id);
  return (
    <>
      <Container className="grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-10">
        <div className="flex min-w-0 flex-col gap-6">
          <Breadcrumbs
            label={messages.fleet.breadcrumbLabel}
            items={[
              { href: `/${lang}`, label: messages.layout.breadcrumbHome },
              { href: salesHref(lang), label: t.list },
              { href: salesHref(lang, sale.slug), label: sale.title },
            ]}
          />
          <header className="flex flex-col gap-1">
            <h1 className="text-title text-balance text-blue-dark">{sale.title}</h1>
            {subtitle ? <p className="text-lead text-muted-dark">{subtitle}</p> : null}
          </header>
          <CarGallery images={sale.images.map((image) => ({ src: image.url, thumb: image.url, alt: image.alt || sale.title, studio: false }))} name={sale.title} t={messages.fleet} />
          {/* What a buyer compares first, right under the photos: the price and the four key facts. */}
          <KeyFacts lang={lang} sale={sale} facts={facts} t={t} />
        </div>

        {/* As the car page's box: a white card with a line frame, under the sticky header; on phones under the price. */}
        <aside className="lg:row-span-2">
          <ContactBox lang={lang} contact={contact} t={t} />
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          {sale.body.length > 0 ? (
            <Section title={t.descriptionTitle} id="description">
              <div className="text-base leading-relaxed text-blue-dark/85">
                <RichBlocksView blocks={sale.body} baseLevel={3} />
              </div>
            </Section>
          ) : null}
        </div>

      </Container>

      {more.length > 0 ? (
        <section aria-labelledby="other-sales-title" className="overflow-clip border-t border-line bg-canvas py-section-sm">
          <Container className="flex flex-col gap-6">
            <h2 id="other-sales-title" className="text-title text-blue-dark">
              {t.otherTitle}
            </h2>
            <CarsCarousel
              label={t.otherTitle}
              slides={more.map((other) => ({ key: other.id, node: <SaleCard sale={other} lang={lang} t={t} layout="tile" /> }))}
            />
          </Container>
        </section>
      ) : null}

      {contact ? (
        <StickyBookBar
          targetId="contact"
          action={
            <a href={contact.salesPhoneHref} className={buttonClass("success", "md", "px-4")}>
              <Phone aria-hidden className="size-5" />
              {t.call}
            </a>
          }
        >
          <p className={BOTTOM_BAR_LABEL}>{sale.title}</p>
          {sale.price !== null ? <p className={`whitespace-nowrap ${BOTTOM_BAR_VALUE}`}>{formatPrice(lang, sale.price)}</p> : null}
        </StickyBookBar>
      ) : null}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(saleJsonLd(lang, sale, contact)) }} />
    </>
  );
}

function KeyFacts({ lang, sale, facts, t }: { lang: Lang; sale: SaleAd; facts: ReturnType<typeof saleFacts>; t: SalesTexts }) {
  return (
    <section aria-label={t.price} className="flex flex-col gap-4 rounded-card bg-white p-5 ring-1 ring-line sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
      <div className="shrink-0">
        <p className="text-sm font-semibold text-muted-dark">{t.price}</p>
        {sale.price !== null ? (
          <p className="text-blue-dark">
            <span className="text-4xl font-bold tracking-tight tabular-nums">{formatPrice(lang, sale.price)}</span>{" "}
            <span className="text-sm font-semibold">{t.gross}</span>
          </p>
        ) : (
          <p className="text-lg font-bold text-blue-dark">{t.priceOnRequest}</p>
        )}
      </div>
      {facts.length > 0 ? (
        <dl className="grid flex-1 grid-cols-2 gap-2 sm:max-w-xl lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-center gap-2 rounded-control bg-tint px-3 py-2.5">
              <fact.icon aria-hidden className="size-5 shrink-0 text-blue-medium" strokeWidth={1.75} />
              <div className="min-w-0">
                <dt className="text-xxs text-muted-dark">{fact.label}</dt>
                <dd className="text-sm font-bold hyphens-auto text-blue-dark">{fact.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}

function ContactBox({ lang, contact, t }: { lang: Lang; contact: Contact | null; t: SalesTexts }) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="flex flex-col gap-4 rounded-card bg-white p-5 ring-1 ring-line lg:sticky lg:top-[calc(var(--site-header,5rem)+1rem)] lg:transition-[top] lg:duration-300 lg:ease-in-out motion-reduce:transition-none"
    >
      <div>
        <h2 id="contact-title" className="text-lg font-semibold text-blue-dark">
          {t.contactTitle}
        </h2>
        <p className="mt-1 text-sm text-muted-dark">{t.contactLead}</p>
      </div>
      {contact ? <ContactButtons contact={contact} t={t} /> : null}
      <Link href={salesHref(lang)} className="inline-flex items-center gap-1 self-start text-sm font-bold text-blue-medium underline-offset-4 hover:underline">
        <ChevronLeft className="size-4" aria-hidden />
        {t.allAds}
      </Link>
    </section>
  );
}

function ContactButtons({ contact, t }: { contact: Contact; t: SalesTexts }) {
  return (
    <div className="flex flex-col gap-2">
      <a href={contact.salesPhoneHref} className={buttonClass("success", "md", "w-full")}>
        <Phone aria-hidden className="size-5" />
        {t.call}: {contact.salesPhone}
      </a>
      <a href={`mailto:${contact.salesEmail}`} className={buttonClass("secondary", "md", "w-full")}>
        <Mail aria-hidden className="size-5" />
        {t.write}
      </a>
    </div>
  );
}

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-32 flex-col gap-4 rounded-card bg-white p-5 ring-1 ring-line sm:p-6">
      <h2 id={`${id}-title`} className="text-subtitle text-blue-dark">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * schema.org `Car` with its `Offer`: the gross price in PLN, in stock, sold by
 * MobiCars on the sales line (Site settings). The VIN and the first
 * registration are the ad's own fields; the mileage and the year come from its text.
 */
function saleJsonLd(lang: Lang, sale: SaleAd, contact: Contact | null) {
  const url = absoluteUrl(salesHref(lang, sale.slug));
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: sale.title,
    url,
    image: sale.images.map((image) => image.url),
    ...(sale.vin ? { vehicleIdentificationNumber: sale.vin } : {}),
    ...(sale.firstRegistration ? { dateVehicleFirstRegistered: sale.firstRegistration } : {}),
    ...(sale.specs.year ? { vehicleModelDate: String(sale.specs.year) } : {}),
    ...(sale.specs.mileage !== null ? { mileageFromOdometer: { "@type": "QuantitativeValue", value: sale.specs.mileage, unitCode: "KMT" } } : {}),
    ...(sale.specs.fuel ? { fuelType: sale.specs.fuel } : {}),
    ...(sale.specs.gearbox ? { vehicleTransmission: sale.specs.gearbox } : {}),
    ...(sale.specs.body ? { bodyType: sale.specs.body } : {}),
    itemCondition: "https://schema.org/UsedCondition",
    ...(sale.price !== null
      ? {
          offers: {
            "@type": "Offer",
            price: sale.price,
            priceCurrency: "PLN",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/UsedCondition",
            url,
            seller: {
              "@type": "Organization",
              name: "MobiCars",
              ...(contact ? { telephone: contact.salesPhone, email: contact.salesEmail } : {}),
            },
          },
        }
      : {}),
  };
}
