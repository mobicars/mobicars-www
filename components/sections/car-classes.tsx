import { CarFront } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";

import { CtaLink } from "@/components/blocks/cta-link";
import { CardArrow } from "@/components/ui/surface";
import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { fleetHref } from "@/i18n/routes";
import { cacheEnabled } from "@/lib/cache";
import { carClasses } from "@/lib/fleet/car-classes";
import { listFleetCarIdsAt, listFleetCars, type FleetCard } from "@/lib/fleet/cars";
import { formatPrice } from "@/lib/fleet/format";
import type { OfferCategory } from "@/lib/reservation/offers";
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
 * cars, like the header's "Samochody" panel in the look of the other
 * sections: the photo of the class's cheapest car, the class and its "od XX zł
 * / doba", linking to the fleet filtered to the class. With the page's pickup
 * point only the cars offered there. The optional last card (`parts.card`)
 * takes the height of the class cards. When RentCarSoft is down the section is
 * left out and the page stays up.
 */
export async function CarClasses({ section, lang, pickupId }: { section: CarClassesSection; lang: Lang; pickupId: number | null }) {
  const cars = await readCars(section, lang, pickupId);
  const classes = cars ? carClasses(cars) : [];
  if (classes.length === 0) {
    return null;
  }
  const t = getMessages(lang);
  const headingId = `car-classes-${section.id}`;
  const heading = section.title ? "h3" : "h2";
  const more = section.moreCard ? <CardItem card={section.moreCard} heading={heading} sizes={PHOTO_SIZES} banner={false} fill /> : null;
  const card = (id: OfferCategory, cheapest: FleetCard) => (
    <ClassCard
      href={`${fleetHref(lang)}?category=${id}`}
      label={t.cars.categories[id]}
      car={cheapest}
      lang={lang}
      heading={heading}
      texts={{ from: t.fleet.from, perDay: t.fleet.perDay }}
    />
  );

  return (
    <SectionShell background={section.background} spacing={section.spacing} width={section.width} labelledBy={section.title ? headingId : undefined}>
      <SectionHeading id={headingId} badge={section.badge} title={section.title} text={section.text} align={section.headerAlign} background={section.background} />
      {section.layout === "carousel" ? (
        <Carousel
          label={section.title ?? t.fleet.title}
          count={classes.length + (more ? 1 : 0)}
          tone={isDarkBackground(section.background) ? "dark" : "light"}
          align="start"
          bleed
          className="snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex gap-6 pb-2">
            {classes.map(({ id, cheapest }) => (
              <li key={id} className={SLIDE}>
                {card(id, cheapest)}
              </li>
            ))}
            {more ? <li className={SLIDE}>{more}</li> : null}
          </ul>
        </Carousel>
      ) : (
        <ul className={GRID}>
          {classes.map(({ id, cheapest }) => (
            <li key={id} className="flex">
              {card(id, cheapest)}
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

/**
 * One class, flat like the fleet card: the photo, the class name (the link,
 * stretched over the card, so it is one tab stop) and "od 89 zł / doba" with
 * no condition (the car page and the fleet have it).
 */
function ClassCard({
  href,
  label,
  car,
  lang,
  heading: Heading,
  texts,
}: {
  href: string;
  label: string;
  car: FleetCard;
  lang: Lang;
  heading: "h2" | "h3";
  texts: { from: string; perDay: string };
}) {
  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-card border border-line bg-white text-blue-dark focus-within:ring-2 focus-within:ring-blue-medium focus-within:ring-offset-2">
      <div className="relative aspect-[16/10] overflow-hidden bg-surface">
        {car.image ? (
          <Image
            src={car.image.src}
            alt=""
            fill
            sizes={PHOTO_SIZES}
            className="object-contain p-3 transition-transform duration-500 ease-out-soft group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:p-4"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-dark">
            <CarFront className="size-10" strokeWidth={1.25} aria-hidden />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <Heading className="text-lg leading-snug font-bold text-balance">
          <Link href={href} className="outline-none after:absolute after:inset-0 after:content-['']">
            {label}
          </Link>
        </Heading>
        <div className="mt-auto flex items-end justify-between gap-2">
          {car.dailyFrom !== null ? (
            <p className={`text-sm whitespace-nowrap ${car.promotion ? "text-green-dark" : ""}`}>
              {texts.from} <span className="text-xl font-bold tracking-tight tabular-nums">{formatPrice(lang, car.dailyFrom)}</span>{" "}
              <span className="text-xs font-semibold">{texts.perDay}</span>
            </p>
          ) : (
            <span />
          )}
          <CardArrow />
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
