import type { ReactNode } from "react";
import { connection } from "next/server";

import { CtaLink } from "@/components/blocks/cta-link";
import { FleetCard } from "@/components/fleet/fleet-card";
import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { cacheEnabled } from "@/lib/cache";
import { listFleetCarIdsAt, listFleetCars, type FleetCard as FleetCardData } from "@/lib/fleet/cars";
import { fleetFilterCollections } from "@/lib/fleet/car-collection";
import { selectSectionCars } from "@/lib/fleet/cars-block";
import { isDarkBackground, listFleetCollections, type CarsSection } from "@/lib/strapi";

import { CardItem } from "./cards";
import { LazyCarousel as Carousel, LazyFleetBrowser as FleetBrowser } from "./lazy";
import { cardSizes } from "./image-sizes";
import { SECTION_CTA_SIZE, SectionHeading, SectionShell } from "./section-shell";

/** Cars per "Show more" step in the full list. */
const STEP = 12;

const GRID = "grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4";
/** Carousel slides: one (85%) on phones, two on tablets, three on desktops. */
const SLIDE = "flex w-[85%] shrink-0 snap-center sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]";

/**
 * Cars (`sections.cars`): RentCarSoft's cars on the fleet page's cards
 * (`FleetCard`, unchanged), chosen in the CMS (`selectSectionCars`): the
 * fleet, a category, classes or picked cars. With the page's pickup point only
 * the cars offered there. The prices and the "Choose" link are the fleet's.
 *
 * `full`: the fleet page's list (`FleetBrowser`: its filters and sorting) of
 * every car, 12 at a time with "Show more";
 * `grid`: up to `limit` cards; `carousel`: our shared carousel. Grid and
 * carousel end with the optional last card, the Cards section's card (`parts.card`). When RentCarSoft is
 * down, or nothing matches, the section is left out and the page stays up.
 */
export async function Cars({ section, lang, pickupId }: { section: CarsSection; lang: Lang; pickupId: number | null }) {
  const cars = await readCars(section, lang, pickupId);
  if (!cars || cars.length === 0) {
    return null;
  }
  const t = getMessages(lang);
  const headingId = `cars-${section.id}`;
  const heading = section.title ? "h3" : "h2";
  const label = section.title ?? t.fleet.title;
  const card = (car: FleetCardData, sizes?: string) => <FleetCard car={car} lang={lang} t={t.fleet} headingLevel={heading} sizes={sizes} />;
  // The Cards section's card, as tall as the car cards beside it.
  // `GRID`: four a row from 1280 px, three from 1024 px, two on tablets; `SLIDE`: three in view.
  const gridSizes = cardSizes(section.width, { desktop: 3, wide: 4 });
  const slideSizes = cardSizes(section.width, { desktop: 3, slide: true });
  const more = section.moreCard ? (
    <CardItem card={section.moreCard} heading={heading} sizes={section.layout === "carousel" ? slideSizes : gridSizes} banner={false} />
  ) : null;

  let list;
  if (section.layout === "full") {
    // The fleet page's list: its filters (in the URL, run in the browser) over the section's cars, 12 at a time;
    // `?collection=` from the menu narrows it to a CMS collection.
    list = (
      <FleetBrowser
        cars={cars}
        lang={lang}
        t={t.fleet}
        collections={fleetFilterCollections(await listFleetCollections(lang))}
        more={{ step: STEP, labels: { more: t.blocks.showMore, shownOf: t.blocks.shownOf } }}
      />
    );
  } else if (section.layout === "carousel") {
    list = (
      <CarsCarousel
        label={label}
        tone={isDarkBackground(section.background) ? "dark" : "light"}
        slides={[
          ...cars.map((car) => ({ key: String(car.id), node: card(car, slideSizes) })),
          ...(more ? [{ key: "more", node: more }] : []),
        ]}
      />
    );
  } else {
    list = (
      <ul className={GRID}>
        {cars.map((car) => (
          <li key={car.id}>{card(car, gridSizes)}</li>
        ))}
        {more ? <li className="flex">{more}</li> : null}
      </ul>
    );
  }

  return (
    <SectionShell background={section.background} spacing={section.spacing} width={section.width} labelledBy={section.title ? headingId : undefined}>
      <SectionHeading id={headingId} badge={section.badge} title={section.title} text={section.text} align={section.headerAlign} background={section.background} />
      {list}
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
 * The Cars section's carousel: centred, the slides beside the one in view
 * dimmed (`spotlight`) and visible in the page margins (`bleed`). Also the car
 * page's "Podobne samochody", so both rows move and look the same. Put it in a
 * box that clips at the screen edge (`overflow-clip`, as `SectionShell`).
 */
export function CarsCarousel({
  label,
  slides,
  tone = "light",
}: {
  label: string;
  slides: { key: string; node: ReactNode }[];
  tone?: "light" | "dark";
}) {
  return (
    <Carousel
      label={label}
      count={slides.length}
      tone={tone}
      align="center"
      spotlight
      bleed
      className="snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex gap-6 pb-2">
        {slides.map((slide) => (
          <li key={slide.key} className={SLIDE}>
            {slide.node}
          </li>
        ))}
      </ul>
    </Carousel>
  );
}

/** The section's cars from the cached fleet list, or `null` when RentCarSoft is down (logged; the section is left out). */
async function readCars(section: CarsSection, lang: Lang, pickupId: number | null): Promise<FleetCardData[] | null> {
  // Without the cache the prices use the clock (`Date.now()`): read per request, not in a prerender.
  if (!cacheEnabled()) {
    await connection();
  }
  const [fleet, atPoint] = await Promise.all([listFleetCars(lang), pickupId ? listFleetCarIdsAt(pickupId) : null]).catch((error: unknown) => {
    console.error(`[sections.cars ${section.id}] RentCarSoft unavailable, the section is left out`, error);
    return [null, null] as const;
  });
  if (!fleet) {
    return null;
  }
  return selectSectionCars(section, atPoint ? fleet.filter((car) => atPoint.has(car.id)) : fleet);
}
