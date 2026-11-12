import { ArrowLeft, ArrowRight, Check, DoorOpen, Fuel, Info, Luggage, Settings2, Users, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { Breadcrumbs } from "@/components/fleet/breadcrumbs";
import { CarGallery } from "@/components/fleet/car-gallery";
import { FleetCard, type FleetTexts } from "@/components/fleet/fleet-card";
import { PriceTable } from "@/components/fleet/price-table";
import { ReservationPicker } from "@/components/reservation/picker";
import { isLang, type Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { fleetHref, reservationHref } from "@/i18n/routes";
import { getFleetCar, listFleetCars, similarCars, type FleetCar, type SpecKey } from "@/lib/fleet/cars";
import { fill } from "@/i18n/fill";
import { countLabel, formatPrice } from "@/lib/fleet/format";
import { absoluteUrl, alternates, jsonLd } from "@/lib/fleet/seo";
import { offerIdFromSlug } from "@/lib/fleet/slug";
import { listServicePoints } from "@/lib/rentcarsoft";
import { toPickupPlace } from "@/lib/reservation/places";

type Props = PageProps<"/[lang]/fleet/[slug]">;

/**
 * One car: `/pl/flota/toyota-yaris-1219`. Generic for every RentCarSoft offer:
 * the id at the end of the slug picks the offer, and a stale name part
 * redirects to the current slug. See `lib/fleet/README.md`.
 */

/**
 * Allowed to block: the page answers 404 or a 308 before it renders (see
 * `CarPage`). Every car of the daily catalog is prerendered, so only an id
 * outside it waits for RentCarSoft on its first visit.
 */
export const instant = false;

/** Every car of the daily catalog is prerendered; any other id renders on its first visit. */
export async function generateStaticParams() {
  const cars = await listFleetCars("pl");
  return cars.map((car) => ({ slug: car.slug }));
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
    car.metaDescription ?? fill(t.metaDescriptionFallback, { name: car.name, segment: car.segment, price });
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
  const [cars, points] = await Promise.all([listFleetCars(lang), listServicePoints({ lang })]);

  const t = getMessages(lang).fleet;
  const places = points.map(toPickupPlace);
  const similar = similarCars(car, cars);
  // A car rented only by the day or only by the month books on that term alone.
  const term = car.shortTerm && !car.longTerm ? "short" : car.longTerm && !car.shortTerm ? "long" : undefined;

  return (
    <>
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-3 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-8 lg:py-10">
        <div className="flex min-w-0 flex-col gap-6">
          <Breadcrumbs
            items={[
              { href: `/${lang}`, label: t.breadcrumbHome },
              { href: fleetHref(lang), label: t.breadcrumbFleet },
              { href: fleetHref(lang, car.slug), label: car.name },
            ]}
          />
          <header className="flex flex-col gap-2">
            <p className="text-sm font-semibold tracking-wide text-blue-medium uppercase">{car.segment}</p>
            <h1 className="text-3xl leading-tight font-bold text-blue-dark sm:text-4xl">
              {fill(t.carTitle, { name: car.name })}
            </h1>
            <p className="text-sm text-muted-dark">
              {car.name} {t.orSimilar}
            </p>
          </header>
          <CarGallery images={car.gallery} name={car.name} t={t} />
          <KeyFacts car={car} lang={lang} t={t} />
          <p className="flex gap-2 rounded-xl bg-blue-light px-4 py-3 text-sm text-blue-dark">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            {t.classNote}
          </p>
        </div>

        <aside className="lg:row-span-2">
          <div className="flex flex-col gap-4 lg:sticky lg:top-6">
            <section aria-labelledby="book-title" className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
              <FromPrice car={car} lang={lang} t={t} />
              <h2 id="book-title" className="mt-4 text-lg font-bold text-blue-dark">
                {t.bookTitle}
              </h2>
              <p className="mb-4 text-sm text-muted-dark">{t.bookLead}</p>
              <ReservationPicker lang={lang} places={places} term={term} offerId={car.id} />
            </section>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
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
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Section>
          ) : null}

          <Specs car={car} lang={lang} t={t} />

          {car.features.length > 0 || (lang === "pl" && car.equipment.length > 0) ? (
            <Section title={t.featuresTitle} id="equipment">
              <ul className="grid gap-x-6 gap-y-2 text-sm text-blue-dark sm:grid-cols-2">
                {car.features.map((feature) => (
                  <li key={feature.key} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-green-medium" aria-hidden />
                    <span>
                      {t.features[feature.key]}
                      {isYes(feature.value) ? null : <span className="text-muted-dark">: {feature.value}</span>}
                    </span>
                  </li>
                ))}
                {/* `details` are Polish free text in RentCarSoft; other languages leave them out. */}
                {lang === "pl"
                  ? car.equipment.map((line) => (
                      <li key={line} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-green-medium" aria-hidden />
                        <span>{line}</span>
                      </li>
                    ))
                  : null}
              </ul>
            </Section>
          ) : null}

          {car.description ? (
            <Section title={t.descriptionTitle} id="description">
              <div
                className="car-description text-sm leading-relaxed text-ink [&_a]:text-blue-medium [&_a]:underline [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-blue-dark [&_h3]:mt-4 [&_h3]:font-bold [&_h3]:text-blue-dark [&_h4]:mt-3 [&_h4]:font-semibold [&_h4]:text-blue-dark [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mt-2 [&_ul]:list-disc [&>*:first-child]:mt-0"
                dangerouslySetInnerHTML={{ __html: car.description }}
              />
            </Section>
          ) : null}
        </div>
      </div>

      {similar.length > 0 ? (
        <section aria-labelledby="similar-title" className="border-t border-muted bg-white">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-10 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="similar-title" className="text-2xl font-bold text-blue-dark">
                {t.similarTitle}
              </h2>
              <Link
                href={fleetHref(lang)}
                className="inline-flex items-center gap-1 text-sm font-bold text-blue-medium underline-offset-4 hover:underline"
              >
                <ArrowLeft className="size-4" aria-hidden />
                {t.backToFleet}
              </Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((other) => (
                <li key={other.id}>
                  <FleetCard car={other} lang={lang} t={t} headingLevel="h3" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(carJsonLd(car, lang)) }} />
    </>
  );
}

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
      <h2 id={`${id}-title`} className="text-xl font-bold text-blue-dark">
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
          {t.from} <span className="text-3xl font-bold">{formatPrice(lang, car.dailyFrom)}</span>{" "}
          <span className="text-sm font-semibold">{t.perDay}</span>
        </p>
      ) : null}
      {car.monthlyFrom !== null ? (
        <p className="text-sm text-muted-dark">
          {t.from} {formatPrice(lang, car.monthlyFrom)} {t.perMonth}
        </p>
      ) : null}
    </div>
  );
}

function KeyFacts({ car, lang, t }: { car: FleetCar; lang: Lang; t: FleetTexts }) {
  const facts: { icon: LucideIcon; label: string; value: string }[] = [];
  if (car.seats) facts.push({ icon: Users, label: t.specs.seats, value: countLabel(lang, car.seats, t.seatCount) });
  if (car.transmission) facts.push({ icon: Settings2, label: t.specs.transmission, value: car.transmission });
  if (car.fuel) facts.push({ icon: Fuel, label: t.specs.fuel, value: car.fuel.label });
  if (car.doors) facts.push({ icon: DoorOpen, label: t.specs.doors, value: countLabel(lang, car.doors, t.doorCount) });
  if (car.suitcases.large !== null || car.suitcases.small !== null) {
    facts.push({
      icon: Luggage,
      label: t.suitcases,
      value: fill(t.suitcasesValue, { large: car.suitcases.large ?? 0, small: car.suitcases.small ?? 0 }),
    });
  }
  if (facts.length === 0) {
    return null;
  }
  return (
    <dl className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3">
      {facts.map((fact) => (
        <div key={fact.label} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
          <fact.icon className="size-6 shrink-0 text-blue-medium" strokeWidth={1.5} aria-hidden />
          <div className="min-w-0">
            <dt className="text-xxs font-semibold text-muted-dark uppercase">{fact.label}</dt>
            <dd className="text-sm font-bold break-words text-blue-dark">{fact.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

const UNIT_KEYS = new Set<SpecKey>(["power", "trunk", "acceleration", "maxSpeed"]);

function Specs({ car, t }: { car: FleetCar; lang: Lang; t: FleetTexts }) {
  const rows = [
    { label: t.specs.segment, value: car.segment },
    ...(car.transmission ? [{ label: t.specs.transmission, value: car.transmission }] : []),
    ...(car.fuel ? [{ label: t.specs.fuel, value: car.fuel.label }] : []),
    ...car.specs.map((spec) => ({
      label: t.specs[spec.key],
      value: UNIT_KEYS.has(spec.key) && /^[\d.,\s]+$/.test(spec.value)
        ? fill(t.units[spec.key as keyof FleetTexts["units"]], { value: spec.value })
        : spec.value,
    })),
  ];
  return (
    <Section title={t.specsTitle} id="specs">
      <dl className="grid text-sm sm:grid-cols-2 sm:gap-x-8">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 border-b border-muted-light py-2.5">
            <dt className="text-muted-dark">{row.label}</dt>
            <dd className="text-right font-semibold text-blue-dark">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/** "Tak" / "Yes" / "Ja" / "Так": the feature name says enough. */
function isYes(value: string): boolean {
  return ["tak", "yes", "ja", "так"].includes(value.trim().toLowerCase());
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
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: "MobiCars" },
          },
        }
      : {}),
  };
}
