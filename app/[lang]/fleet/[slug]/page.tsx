import { AirVent, Camera, ChevronLeft, ChevronRight, Check, CircleParking, Fuel, Gauge, Info, MonitorSmartphone, Settings2, Users, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { BOTTOM_BAR_LABEL, BOTTOM_BAR_VALUE } from "@/components/ui/bottom-bar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CarExtras } from "@/components/extras/car-extras";
import { CarGallery } from "@/components/fleet/car-gallery";
import { FaqList } from "@/components/blocks/faq-list";
import { FleetCard, type FleetTexts } from "@/components/fleet/fleet-card";
import { PriceTable } from "@/components/fleet/price-table";
import { Rail, RailItem } from "@/components/ui/surface";
import { BookCarButton } from "@/components/fleet/book-car-button";
import { StickyBookBar } from "@/components/fleet/sticky-book-bar";
import { buttonClass } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { isLang, type Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { extrasHref, fleetHref, reservationHref } from "@/i18n/routes";
import { listCatalogExtras, segmentExtras } from "@/lib/extras/catalog";
import { getFleetCar, listFleetCars, similarCars, type FeatureKey, type FleetCar, type SpecKey } from "@/lib/fleet/cars";
import { fill } from "@/i18n/fill";
import { countLabel, formatPrice } from "@/lib/fleet/format";
import { absoluteUrl, alternates, jsonLd } from "@/lib/fleet/seo";
import { offerIdFromSlug } from "@/lib/fleet/slug";
import { getChrome } from "@/lib/strapi";

type Props = PageProps<"/[lang]/fleet/[slug]">;

/**
 * One car: `/pl/flota/toyota-yaris-1219`. Generic for every RentCarSoft offer:
 * the id at the end of the slug picks the offer, and a stale name part
 * redirects to the current slug. See `lib/fleet/README.md`.
 */

/**
 * Allowed to block: the page answers 404 or a 308 before it renders (see
 * `CarPage`). One car is prerendered (`generateStaticParams`); every other
 * renders on its first visit and is cached from then on (`use cache` in
 * `lib/fleet/cars.ts`), so that visit waits for RentCarSoft.
 */
export const instant = false;

/**
 * A slug with no offer id: answers 404 without asking RentCarSoft. The build
 * prerenders it when the catalog cannot be read, so a RentCarSoft outage does
 * not stop a deploy.
 */
const OFFLINE_SLUG = "catalog-unavailable";

/**
 * Cache Components needs at least one param to check the route's static
 * shell. One car is enough: prerendering the whole catalog made every build
 * depend on a hundred `getOffer` calls, and one 5xx stopped it.
 */
export async function generateStaticParams() {
  const cars = await listFleetCars("pl").catch((error: unknown) => {
    console.error(`[fleet] catalog unavailable at build, no car prerendered: ${error instanceof Error ? error.name : "unknown"}`);
    return [];
  });
  return [{ slug: cars[0]?.slug ?? OFFLINE_SLUG }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const id = offerIdFromSlug(slug);
  if (!isLang(lang) || id === null) {
    return {};
  }
  const car = await getFleetCar(lang, id);
  if (!car) {
    return {};
  }
  const t = getMessages(lang).fleet;
  const price = car.dailyFrom !== null ? formatPrice(lang, car.dailyFrom) : "";
  const title = car.metaTitle ?? fill(t.metaTitleFallback, { name: car.name, segment: car.segment });
  const description =
    car.metaDescription ?? fill(t.metaDescriptionFallback, { name: car.name, segment: car.segment, price, days: car.daily?.fromDays ?? 1 });
  const image = car.gallery[0];
  return {
    // The RentCarSoft title already ends with the brand when staff wrote one.
    title: { absolute: title.includes("MobiCars") ? title : `${title} | MobiCars` },
    description,
    alternates: alternates(lang, (each) => fleetHref(each, car.slug)),
    openGraph: {
      title,
      description,
      url: absoluteUrl(fleetHref(lang, car.slug)),
      type: "website",
      images: image ? [{ url: image.src, alt: image.alt }] : undefined,
    },
  };
}

/**
 * `params` and the car are read before anything renders, not inside
 * `<Suspense>`: an unknown id must answer 404 and an old slug a real 308.
 * Inside a streamed boundary both would be a 200 page with a client-side
 * redirect, which search engines do not treat as a moved URL.
 */
export default async function CarPage({ params }: Props) {
  const { lang, slug } = await params;
  const id = offerIdFromSlug(slug);
  if (!isLang(lang) || id === null) {
    notFound();
  }
  const car = await getFleetCar(lang, id);
  if (!car) {
    notFound();
  }
  if (car.slug !== decodeURIComponent(slug)) {
    // Old site URLs (`nissan-x-trail-7-os.-4431`) and renamed cars.
    permanentRedirect(fleetHref(lang, car.slug));
  }
  return (
    <main className="flex flex-1 flex-col bg-surface">
      <CarDetails lang={lang} car={car} />
    </main>
  );
}

async function CarDetails({ lang, car }: { lang: Lang; car: FleetCar }) {
  const [cars, catalog] = await Promise.all([
    listFleetCars(lang),
    // Without the add-ons the car page still stands: the section is left out.
    listCatalogExtras(lang).catch((error: unknown) => {
      console.error(`[fleet] car ${car.id} add-ons unavailable, the section is left out`, error);
      return [];
    }),
  ]);

  const messages = getMessages(lang);
  const t = messages.fleet;
  // `GET /offer/{id}` has no `segmentId`; the car's card in the cached catalog list has it.
  const extras = segmentExtras(catalog, car.segmentId ?? cars.find((each) => each.id === car.id)?.segmentId ?? null);
  const similar = similarCars(car, cars);
  // A car rented only by the day or only by the month books on that term alone.
  const term = car.shortTerm && !car.longTerm ? "short" : car.longTerm && !car.shortTerm ? "long" : undefined;

  return (
    <>
      <Container className="grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-10">
        <div className="flex min-w-0 flex-col gap-6">
          <Breadcrumbs
            label={t.breadcrumbLabel}
            items={[
              { href: `/${lang}`, label: t.breadcrumbHome },
              { href: fleetHref(lang), label: t.breadcrumbFleet },
              { href: fleetHref(lang, car.slug), label: car.name },
            ]}
          />
          <header className="flex flex-col gap-2">
            <p className="text-eyebrow text-green-dark uppercase">{car.segment}</p>
            <h1 className="text-title text-balance text-blue-dark">{fill(t.carTitle, { name: car.name })}</h1>
          </header>
          <CarGallery images={car.gallery} name={car.name} t={t} />
          <SectionLinks
            label={t.sectionsLabel}
            links={[
              hasSpecs(car) ? { href: "#specs", label: t.specsTitle } : null,
              car.features.length > 0 || car.equipment.length > 0 ? { href: "#equipment", label: t.featuresTitle } : null,
              extras.length > 0 ? { href: "#extras", label: t.extrasTitle } : null,
              car.priceBands.length > 0 ? { href: "#prices", label: t.pricesTitle } : null,
              car.monthlyFrom !== null ? { href: "#monthly", label: t.monthlyTitle } : null,
            ]}
          />
        </div>

        {/* As the booking's summary panel: a white card with a line frame, under the sticky header; "Rezerwuj" opens the search in a dialog, as on the car cards. */}
        <aside className="lg:row-span-2">
          <section
            id="book"
            aria-labelledby="book-title"
            className="flex flex-col gap-4 rounded-card bg-white p-5 ring-1 ring-line lg:sticky lg:top-[calc(var(--site-header,5rem)+1rem)] lg:transition-[top] lg:duration-300 lg:ease-in-out motion-reduce:transition-none"
          >
            <h2 id="book-title" className="text-lg font-semibold text-blue-dark">
              {t.bookTitle}
            </h2>
            <FromPrice car={car} lang={lang} t={t} />
            <Included t={t} />
            <BookCarButton
              offerId={car.id}
              name={car.name}
              term={term ?? null}
              title={t.bookTitle}
              lead={t.bookLead}
              className={buttonClass("success", "md", "w-full")}
            />
          </section>
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          {car.partial ? <DetailsUnavailable lang={lang} t={t} /> : null}
          <Specs car={car} lang={lang} t={t} />

          {car.features.length > 0 || car.equipment.length > 0 ? (
            <Section title={t.featuresTitle} id="equipment">
              <FeatureTiles car={car} t={t} />
              {/* The `details` lines as RentCarSoft has them (Polish in every language), filled top to bottom. */}
              <ul className="text-sm text-blue-dark sm:columns-2 sm:gap-x-6">
                {car.equipment.map((line) => (
                  <li key={line} className="flex break-inside-avoid gap-2 py-1">
                    <Check className="mt-0.5 size-4 shrink-0 text-green-medium" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {extras.length > 0 ? (
            <Section title={t.extrasTitle} id="extras">
              <p className="text-sm text-muted-dark">{t.extrasLead}</p>
              <CarExtras extras={extras} lang={lang} groups={messages.extrasPage.groups} />
              <Link
                href={extrasHref(lang)}
                className="inline-flex items-center gap-1 self-start text-sm font-bold text-blue-medium underline-offset-4 hover:underline"
              >
                {t.extrasAll}
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            </Section>
          ) : null}

          {car.priceBands.length > 0 ? (
            <Section title={t.pricesTitle} id="prices">
              <p className="text-sm text-muted-dark">{t.pricesLead}</p>
              <PriceTable bands={car.priceBands} promotion={car.promotionInfo} lang={lang} t={t} />
              {car.deposit ? (
                <p className="text-sm text-blue-dark">{fill(t.deposit, { price: formatPrice(lang, car.deposit) })}</p>
              ) : null}
            </Section>
          ) : null}

          {car.monthlyFrom !== null ? (
            <Section title={t.monthlyTitle} id="monthly">
              <p className="text-sm text-muted-dark">{t.monthlyLead}</p>
              <p className="text-xl font-bold text-blue-dark">
                {fill(t.monthlyFrom, { price: formatPrice(lang, car.monthlyFrom) })}
              </p>
              <Link
                href={reservationHref(lang, "long")}
                className="inline-flex items-center gap-1 self-start text-sm font-bold text-blue-medium underline-offset-4 hover:underline"
              >
                {t.monthlyLink}
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            </Section>
          ) : null}

          <Section title={t.termsTitle} id="terms">
            <FaqList items={t.terms.map((term) => ({ question: term.question, answer: <p>{term.answer}</p> }))} />
            <Link
              href={`/${lang}/faq`}
              className="inline-flex items-center gap-1 self-start text-sm font-bold text-blue-medium underline-offset-4 hover:underline"
            >
              {t.termsMore}
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </Section>

          {car.description ? (
            <Section title={t.descriptionTitle} id="description">
              <div
                className="car-description text-sm leading-relaxed text-ink [&_a]:text-blue-medium [&_a]:underline [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-blue-dark [&_h3]:mt-4 [&_h3]:font-bold [&_h3]:text-blue-dark [&_h4]:mt-3 [&_h4]:font-semibold [&_h4]:text-blue-dark [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mt-2 [&_ul]:list-disc [&>*:first-child]:mt-0"
                dangerouslySetInnerHTML={{ __html: car.description }}
              />
            </Section>
          ) : null}
        </div>
      </Container>

      {similar.length > 0 ? (
        <section aria-labelledby="similar-title" className="border-t border-line bg-canvas py-section-sm">
          <Container className="flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="similar-title" className="text-title text-blue-dark">
                {t.similarTitle}
              </h2>
              <Link
                href={fleetHref(lang)}
                className="inline-flex items-center gap-1 text-sm font-bold text-blue-medium underline-offset-4 hover:underline"
              >
                <ChevronLeft className="size-4" aria-hidden />
                {t.backToFleet}
              </Link>
            </div>
            <Rail label={t.similarTitle} columns={4}>
              {similar.map((other) => (
                <RailItem key={other.id}>
                  <FleetCard car={other} lang={lang} t={t} headingLevel="h3" sizes="(min-width: 1280px) 300px, (min-width: 1024px) 23vw, (min-width: 640px) 45vw, 78vw" />
                </RailItem>
              ))}
            </Rail>
          </Container>
        </section>
      ) : null}

      <StickyBookBar
        targetId="book"
        action={
          <BookCarButton
            offerId={car.id}
            name={car.name}
            term={term ?? null}
            title={t.bookTitle}
            lead={t.bookLead}
            className={buttonClass("success", "md", "px-4")}
          />
        }
      >
        <BarPrice car={car} lang={lang} t={t} />
      </StickyBookBar>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(carJsonLd(car, lang)) }} />
    </>
  );
}

/** Catalog C28: what every rental includes, only what the terms confirm. */
function Included({ t }: { t: FleetTexts }) {
  return (
    <div className="rounded-control bg-tint px-4 py-3">
      <p className="text-sm font-bold text-blue-dark">{t.includedTitle}</p>
      <ul className="mt-2 flex flex-col gap-1.5 text-sm text-blue-dark">
        {t.included.map((item) => (
          <li key={item} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-green-medium" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Jump links to the sections below the gallery: the page is long on phones. Plain links, no JavaScript. */
function SectionLinks({ label, links }: { label: string; links: ({ href: string; label: string } | null)[] }) {
  return (
    <nav aria-label={label}>
      <ul className="-mx-gutter flex gap-2 overflow-x-auto px-gutter pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {links.flatMap((link) =>
          link
            ? [
                <li key={link.href} className="shrink-0">
                  <a
                    href={link.href}
                    className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-blue-dark ring-1 ring-line transition-colors hover:bg-blue-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-medium motion-reduce:transition-none"
                  >
                    {link.label}
                  </a>
                </li>,
              ]
            : [],
        )}
      </ul>
    </nav>
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

function FromPrice({ car, lang, t }: { car: FleetCar; lang: Lang; t: FleetTexts }) {
  if (car.dailyFrom === null && car.monthlyFrom === null) {
    return <p className="text-sm text-muted-dark">{t.priceOnRequest}</p>;
  }
  return (
    <div className="flex flex-col gap-0.5">
      {car.dailyFrom !== null ? (
        <p className={car.promotion ? "text-green-dark" : "text-blue-dark"}>
          {t.from} <span className="text-4xl font-bold tracking-tight">{formatPrice(lang, car.dailyFrom)}</span>{" "}
          <span className="text-sm font-semibold">{t.perDay}</span>
        </p>
      ) : null}
      {car.monthlyFrom !== null ? (
        <p className="mt-2 text-sm text-blue-dark">
          {t.from} <span className="font-bold">{formatPrice(lang, car.monthlyFrom)}</span> {t.perMonth}
        </p>
      ) : null}
    </div>
  );
}

/** The "from" price in the phone bar: the daily price first, else the monthly one. */
/** The bottom bar's two lines (`BOTTOM_BAR_LABEL` over `BOTTOM_BAR_VALUE`), as in the booking: the car, then its "from" price. */
function BarPrice({ car, lang, t }: { car: FleetCar; lang: Lang; t: FleetTexts }) {
  const price = car.daily ? { amount: car.daily.price, unit: t.perDay } : car.monthlyFrom !== null ? { amount: car.monthlyFrom, unit: t.perMonth } : null;
  return (
    <>
      <p className={BOTTOM_BAR_LABEL}>{car.name}</p>
      {price ? (
        <p className={`whitespace-nowrap ${BOTTOM_BAR_VALUE} ${car.daily?.promotional ? "text-green-dark!" : ""}`}>
          <span className="text-xs font-semibold">{t.from}</span> {formatPrice(lang, price.amount)} <span className="text-xs font-semibold">{price.unit}</span>
        </p>
      ) : null}
    </>
  );
}

type Fact = { icon: LucideIcon; label: string; value: string };

/** Fuel, gearbox and seats as tiles, at the top of the specs section. */
function KeyFacts({ car, lang, t }: { car: FleetCar; lang: Lang; t: FleetTexts }) {
  const facts: Fact[] = [];
  if (car.fuel) facts.push({ icon: Fuel, label: t.specs.fuel, value: car.fuel.label });
  if (car.transmission) facts.push({ icon: Settings2, label: t.specs.transmission, value: car.transmission });
  if (car.seats) facts.push({ icon: Users, label: t.specs.seats, value: countLabel(lang, car.seats, t.seatCount) });
  // One row of three.
  return <FactTiles facts={facts} className="grid-cols-3" />;
}

const FEATURE_ICONS: Record<FeatureKey, LucideIcon> = {
  rearCamera: Camera,
  parkingSensors: CircleParking,
  airConditioningType: AirVent,
  androidAuto: MonitorSmartphone,
  cruiseControl: Gauge,
};

/**
 * The equipment select keys as tiles, over the `details` list: two per row on
 * phones (their values run long), three from `sm`. A shorter last row stretches
 * across the full width (six tracks: three tiles take two each, two take three).
 */
function FeatureTiles({ car, t }: { car: FleetCar; t: FleetTexts }) {
  const facts = car.features.map((feature) => ({ icon: FEATURE_ICONS[feature.key], label: t.features[feature.key], value: feature.value }));
  const count = facts.length;
  const lastRow = count % 3;
  const span = (index: number) => {
    const phone = count % 2 === 1 && index === count - 1 ? "col-span-2" : "";
    const inLastRow = lastRow > 0 && index >= count - lastRow;
    const wide = !inLastRow ? "sm:col-span-2" : lastRow === 2 ? "sm:col-span-3" : "sm:col-span-6";
    return `${phone} ${wide}`;
  };
  return <FactTiles facts={facts} className="grid-cols-2 sm:grid-cols-6" itemClassName={span} />;
}

/** Tiles with an icon, a grey label and a navy value: on phones the icon sits over the text, from `sm` beside it. */
function FactTiles({
  facts,
  className,
  itemClassName = () => "",
}: {
  facts: Fact[];
  className: string;
  itemClassName?: (index: number) => string;
}) {
  if (facts.length === 0) {
    return null;
  }
  return (
    <dl className={`grid gap-2 sm:gap-3 ${className}`}>
      {facts.map((fact, index) => (
        // `dt` and `dd` sit right in the group (a `dl` allows nothing else there); the icon rides in the `dt`.
        <div
          key={fact.label}
          className={`relative flex min-w-0 flex-col items-center justify-center rounded-control border border-line bg-white px-2 pt-14 pb-3 text-center sm:min-h-16 sm:items-start sm:py-3 sm:pr-3 sm:pl-16 sm:text-left ${itemClassName(index)}`}
        >
          <dt className="text-xs text-muted-dark">
            <span aria-hidden className="absolute top-3 left-1/2 flex size-10 -translate-x-1/2 items-center justify-center rounded-full bg-tint text-blue-medium sm:top-1/2 sm:left-3 sm:translate-x-0 sm:-translate-y-1/2">
              <fact.icon className="size-5" strokeWidth={1.75} />
            </span>
            {fact.label}
          </dt>
          <dd className="text-sm font-bold break-words text-blue-dark">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

const UNIT_KEYS = new Set<SpecKey>(["power", "trunk", "acceleration", "maxSpeed"]);

function hasSpecs(car: FleetCar): boolean {
  return car.specs.length > 0 || car.fuel !== null || car.transmission !== null || Boolean(car.seats);
}

/** The key facts as tiles, then the table in `SPEC_KEYS` order (`lib/fleet/cars.ts`). */
function Specs({ car, lang, t }: { car: FleetCar; lang: Lang; t: FleetTexts }) {
  if (!hasSpecs(car)) {
    return null;
  }
  const rows = car.specs.map((spec) => ({
    label: t.specs[spec.key],
    value: UNIT_KEYS.has(spec.key) && /^[\d.,\s]+$/.test(spec.value)
      ? fill(t.units[spec.key as keyof FleetTexts["units"]], { value: spec.value })
      : spec.value,
  }));
  return (
    <Section title={t.specsTitle} id="specs">
      <KeyFacts car={car} lang={lang} t={t} />
      <dl className="text-sm sm:columns-2 sm:gap-x-8">
        {rows.map((row) => (
          <div key={row.label} className="flex break-inside-avoid justify-between gap-4 border-b border-line py-3">
            <dt className="text-muted-dark">{row.label}</dt>
            <dd className="text-right font-semibold text-blue-dark">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/**
 * In place of the specs, prices and description when RentCarSoft could not
 * give them (`car.partial`): the hotline and the booking form above.
 */
async function DetailsUnavailable({ lang, t }: { lang: Lang; t: ReturnType<typeof getMessages>["fleet"] }) {
  const contact = await getChrome(lang).then(
    (chrome) => chrome.contact,
    () => null,
  );
  const [before, after] = contact ? t.detailsUnavailable.split("{phone}") : [t.detailsUnavailableNoPhone, ""];
  return (
    <p role="status" className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-control bg-tint px-4 py-3 text-sm text-blue-dark">
      <Info className="size-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1">
        {before}
        {contact ? (
          <a href={contact.phoneHref} className="font-bold whitespace-nowrap underline underline-offset-2">
            {contact.phone}
          </a>
        ) : null}
        {after}
      </span>
      <a href="#book" className="font-bold text-blue-medium underline-offset-4 hover:underline">
        {t.detailsUnavailableBook}
      </a>
    </p>
  );
}

/** schema.org `Car` with the base daily price as an `Offer`, priced per day. */
function carJsonLd(car: FleetCar, lang: Lang) {
  const url = absoluteUrl(fleetHref(lang, car.slug));
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: car.name,
    url,
    image: car.gallery.map((image) => image.src),
    category: car.segment,
    ...(car.body ? { bodyType: car.body } : {}),
    ...(car.seats ? { seatingCapacity: car.seats } : {}),
    ...(car.doors ? { numberOfDoors: car.doors } : {}),
    ...(car.transmission ? { vehicleTransmission: car.transmission } : {}),
    ...(car.fuel ? { fuelType: car.fuel.label } : {}),
    ...(car.dailyFrom !== null
      ? {
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: "PLN",
            price: car.dailyFrom,
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: car.dailyFrom,
              priceCurrency: "PLN",
              unitCode: "DAY",
              referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "DAY" },
            },
            // The "from" price holds from this rental length on (30 days for the cheapest band).
            ...(car.daily && car.daily.fromDays > 1
              ? { eligibleDuration: { "@type": "QuantitativeValue", minValue: car.daily.fromDays, unitCode: "DAY" } }
              : {}),
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: "MobiCars" },
          },
        }
      : {}),
  };
}
