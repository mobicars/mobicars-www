import { CarFront } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";

import { CtaLink } from "@/components/blocks/cta-link";
import { PRODUCT_IMAGE, PRODUCT_PHOTO, PRODUCT_TITLE, ProductMore, ProductPrice, productCardClass } from "@/components/ui/product-card";
import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { fleetHref } from "@/i18n/routes";
import { cacheEnabled } from "@/lib/cache";
import { carClasses, cheapestCar } from "@/lib/fleet/car-classes";
import { collectionCars } from "@/lib/fleet/car-collection";
import { listFleetCarIdsAt, listFleetCars, type FleetCard } from "@/lib/fleet/cars";
import { formatPrice } from "@/lib/fleet/format";
import { isDarkBackground, type CarClassesSection } from "@/lib/strapi";

import { CardItem } from "./cards";
import { LazyCarousel as Carousel } from "./lazy";
import { SECTION_CTA_SIZE, SectionHeading, SectionShell } from "./section-shell";

/** As many cards in a row as fit: two on a phone, all five or six on a desktop. */
const GRID = "grid grid-cols-[repeat(auto-fit,minmax(min(100%,9.5rem),1fr))] gap-4 sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] sm:gap-6";
/** Carousel slides: two and a bit on a phone, three on a tablet, five on a desktop. */
const SLIDE = "flex w-[45%] shrink-0 snap-start sm:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-6rem)/5)]";
const PHOTO_SIZES = "(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw";

/**
 * Car classes (`sections.car-classes`): one card per RentCarSoft class with
 * cars (the ones picked, or all), like the header's "Samochody" panel in the
 * look of the other sections: the photo of the class's cheapest car, the class
 * and its "od XX zł / doba", linking to the fleet filtered to the class. Or
 * one card per car collection picked, the same way, linking where the editor
 * set; a collection with no cars is left out. With the page's pickup
 * point only the cars offered there. The optional last card (`parts.card`)
 * takes the height of the class cards. When RentCarSoft is down the section is
 * left out and the page stays up.
 */
export async function CarClasses({ section, lang, pickupId }: { section: CarClassesSection; lang: Lang; pickupId: number | null }) {
  const cars = await readCars(section, lang, pickupId);
  const t = getMessages(lang);
  const items = cars ? CARDS[section.source](section, cars, lang, t.cars.categories) : [];
  if (items.length === 0) {
    return null;
  }
  const headingId = `car-classes-${section.id}`;
  const heading = section.title ? "h3" : "h2";
  const more = section.moreCard ? <CardItem card={section.moreCard} heading={heading} sizes={PHOTO_SIZES} banner={false} fill /> : null;
  const card = (item: ClassItem) => (
    <ClassCard item={item} lang={lang} heading={heading} texts={{ from: t.fleet.from, perDay: t.fleet.perDay, more: t.fleet.seeCars }} />
  );

  return (
    <SectionShell background={section.background} spacing={section.spacing} width={section.width} labelledBy={section.title ? headingId : undefined}>
      <SectionHeading id={headingId} badge={section.badge} title={section.title} text={section.text} align={section.headerAlign} background={section.background} />
      {section.layout === "carousel" ? (
        <Carousel
          label={section.title ?? t.fleet.title}
          count={items.length + (more ? 1 : 0)}
          tone={isDarkBackground(section.background) ? "dark" : "light"}
          align="start"
          bleed
          className="snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex gap-6 pb-2">
            {items.map((item) => (
              <li key={item.key} className={SLIDE}>
                {card(item)}
              </li>
            ))}
            {more ? <li className={SLIDE}>{more}</li> : null}
          </ul>
        </Carousel>
      ) : (
        <ul className={GRID}>
          {items.map((item) => (
            <li key={item.key} className="flex">
              {card(item)}
            </li>
          ))}
          {more ? <li className="flex">{more}</li> : null}
        </ul>
      )}
      {section.ctas.length > 0 ? (
        <div className={`mt-10 flex flex-col gap-3 sm:flex-row ${section.headerAlign === "center" ? "sm:justify-center" : ""}`}>
          {section.ctas.map((cta) => (
            <CtaLink key={`${cta.href}-${cta.label}`} cta={cta} size={SECTION_CTA_SIZE} />
          ))}
        </div>
      ) : null}
    </SectionShell>
  );
}

/** One card: a class or a collection, its link and the car whose photo and price it shows. */
type ClassItem = { key: string; href: string; newTab: boolean; label: string; car: FleetCard };

const CARDS: Record<
  CarClassesSection["source"],
  (section: CarClassesSection, cars: readonly FleetCard[], lang: Lang, labels: Record<CarClassesSection["categories"][number], string>) => ClassItem[]
> = {
  classes: (section, cars, lang, labels) =>
    carClasses(cars, section.categories).map(({ id, cheapest }) => ({
      key: id,
      href: `${fleetHref(lang)}?category=${id}`,
      newTab: false,
      label: labels[id],
      car: cheapest,
    })),
  collections: (section, cars) =>
    section.collections.flatMap(({ collection, href, newTab }, index) => {
      const car = cheapestCar(collectionCars(collection, cars));
      return car ? [{ key: `${collection.documentId}-${index}`, href, newTab, label: collection.title, car }] : [];
    }),
};

/**
 * One class or collection, flat like the fleet card: the photo, the class name (the link,
 * stretched over the card, so it is one tab stop) and "od 89 zł / doba" with
 * no condition (the car page and the fleet have it).
 */
function ClassCard({
  item: { href, newTab, label, car },
  lang,
  heading: Heading,
  texts,
}: {
  item: ClassItem;
  lang: Lang;
  heading: "h2" | "h3";
  texts: { from: string; perDay: string; more: string };
}) {
  return (
    <article className={productCardClass({ interactive: true })}>
      <div className={PRODUCT_PHOTO}>
        {car.image ? (
          <Image
            src={car.image.src}
            alt=""
            fill
            sizes={PHOTO_SIZES}
            className={PRODUCT_IMAGE}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-dark">
            <CarFront className="size-10" strokeWidth={1.25} aria-hidden />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Heading className={PRODUCT_TITLE}>
          <Link
            href={href}
            {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {label}
          </Link>
        </Heading>
        {car.dailyFrom !== null ? (
          <ProductPrice from={texts.from} amount={formatPrice(lang, car.dailyFrom)} unit={texts.perDay} promotion={car.promotion} small />
        ) : null}
        <div className="mt-auto border-t border-line pt-3">
          <ProductMore label={texts.more} />
        </div>
      </div>
    </article>
  );
}

/** The fleet from the cached list, at the page's pickup point when it has one; `null` when RentCarSoft is down (logged). */
async function readCars(section: CarClassesSection, lang: Lang, pickupId: number | null): Promise<FleetCard[] | null> {
  // Without the cache the prices use the clock (`Date.now()`): read per request, not in a prerender.
  if (!cacheEnabled()) {
    await connection();
  }
  const [fleet, atPoint] = await Promise.all([listFleetCars(lang), pickupId ? listFleetCarIdsAt(pickupId) : null]).catch((error: unknown) => {
    console.error(`[sections.car-classes ${section.id}] RentCarSoft unavailable, the section is left out`, error);
    return [null, null] as const;
  });
  return fleet && atPoint ? fleet.filter((car) => atPoint.has(car.id)) : fleet;
}
