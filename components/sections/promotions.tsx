import { BadgePercent, ChevronDown, Info, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";

import { CtaLink } from "@/components/sections/cta-link";
import { PRODUCT_TITLE, ProductBadge, ProductPrice, productCardClass } from "@/components/ui/product-card";
import type { Lang } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { getMessages } from "@/i18n/messages";
import { fleetHref } from "@/i18n/routes";
import { cacheEnabled } from "@/lib/cache";
import { listFleetCars, listPromotionClasses, type FleetCard } from "@/lib/fleet/cars";
import { bandLabel, formatApiDate, formatPrice } from "@/lib/fleet/format";
import { sortPromotions, type PromotionClass } from "@/lib/fleet/promotions";
import type { PromotionsSection } from "@/lib/strapi";

import { SECTION_CTA_SIZE, SectionHeading, SectionShell } from "./section-shell";

type Read = { state: "running"; classes: PromotionClass[]; cars: Map<number, FleetCard> } | { state: "none" } | { state: "unavailable" };

/**
 * Promotions (`sections.promotions`): the promotions running now, as
 * RentCarSoft keeps them, per class price list (`listPromotionClasses`, from
 * the cached catalog, whose life ends when a promotion starts or ends, so the
 * section switches by itself). A box per class, the soonest to end first
 * (`sortPromotions`), never grouped by promotion name: the promotion's name as
 * a badge, the class, the end date, its cars as small photo links, the lowest
 * promotional price per day with the regular one struck through and the price
 * per rental length.
 *
 * Three states, never mixed up: promotions running; none running (the CMS
 * empty texts); RentCarSoft not answering (the CMS unavailable text). A
 * failure never reads as "no promotions". A state without its CMS text leaves
 * the section out. RentCarSoft names promotions in Polish only: other
 * languages show the generic label.
 */
export async function Promotions({ section, lang }: { section: PromotionsSection; lang: Lang }) {
  const read = await readPromotions(lang, section);
  const t = getMessages(lang).promotionsSection;
  const headingId = `promotions-${section.id}`;
  const empty = read.state === "none" && (section.emptyTitle || section.emptyText);
  const unavailable = read.state === "unavailable" && section.unavailableText;
  if (read.state !== "running" && !empty && !unavailable) {
    return null;
  }

  return (
    <SectionShell background={section.background} spacing={section.spacing} width={section.width} labelledBy={section.title ? headingId : undefined}>
      <SectionHeading id={headingId} badge={section.badge} title={section.title} text={section.text} align={section.headerAlign} background={section.background} />
      {read.state === "running" ? (
        // One a row on phones, two on tablets, three from `lg`.
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {read.classes.map((each) => (
            <li key={each.segmentId} className="flex min-w-0">
              <ClassBox promotion={each} cars={read.cars} lang={lang} heading={section.title ? "h3" : "h2"} t={t} />
            </li>
          ))}
        </ul>
      ) : (
        // No promotion now, or RentCarSoft is not answering: one calm box in the boxes' place.
        <div className="mx-auto flex w-full max-w-3xl items-start gap-4 rounded-card border border-line bg-white p-5 sm:p-6">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-tint text-blue-medium">
            {read.state === "none" ? <Tag className="size-5" aria-hidden /> : <Info className="size-5" aria-hidden />}
          </span>
          <div className="flex flex-col gap-1">
            {read.state === "none" && section.emptyTitle ? <p className="text-subtitle text-blue-dark">{section.emptyTitle}</p> : null}
            <p className="text-pretty text-blue-dark/80">{read.state === "none" ? section.emptyText : section.unavailableText}</p>
          </div>
        </div>
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

async function readPromotions(lang: Lang, section: PromotionsSection): Promise<Read> {
  // Without the cache the prices use the clock (`Date.now()`): read per request, not in a prerender.
  if (!cacheEnabled()) {
    await connection();
  }
  try {
    const [classes, cars] = await Promise.all([listPromotionClasses(lang), listFleetCars(lang)]);
    if (classes.length === 0) {
      return { state: "none" };
    }
    return { state: "running", classes: sortPromotions(classes), cars: new Map(cars.map((car) => [car.id, car])) };
  } catch (error) {
    console.error(`[sections.promotions ${section.id}] RentCarSoft unavailable, showing the unavailable text`, error);
    return { state: "unavailable" };
  }
}

type Texts = ReturnType<typeof getMessages>["promotionsSection"];

function ClassBox({
  promotion,
  cars,
  lang,
  heading: Heading,
  t,
}: {
  promotion: PromotionClass;
  cars: Map<number, FleetCard>;
  lang: Lang;
  heading: "h2" | "h3";
  t: Texts;
}) {
  const classCars = promotion.carIds.flatMap((id) => cars.get(id) ?? []);
  const until = promotion.endsAt ? formatApiDate(lang, promotion.endsAt, { month: "long" }) : null;
  const fleet = getMessages(lang).fleet;
  return (
    <article className={productCardClass({ extra: "gap-4 p-4 sm:p-5" })}>
      <div className="flex flex-col items-start gap-2">
        {/* RentCarSoft's name in Polish; the generic label in other languages, or without a name. */}
        <ProductBadge icon={BadgePercent} tone="promo">
          {lang === "pl" && promotion.name ? promotion.name : t.promotion}
        </ProductBadge>
        <div>
          <Heading className={PRODUCT_TITLE}>{promotion.segment}</Heading>
          {until ? <p className="text-sm text-muted-dark">{fill(t.until, { date: until })}</p> : null}
        </div>
      </div>

      {classCars.length > 0 ? (
        // The class's cars as small photos on the car cards' grey, each a link to its page.
        <ul className="grid grid-cols-4 gap-2">
          {classCars.map((car) => (
            <li key={car.id}>
              <Link
                href={fleetHref(lang, car.slug)}
                aria-label={car.name}
                title={car.name}
                className="relative block aspect-square overflow-hidden rounded-control bg-surface ring-1 ring-transparent outline-none transition-shadow duration-200 ease-out hover:ring-blue-medium/40 focus-visible:ring-2 focus-visible:ring-blue-medium motion-reduce:transition-none"
              >
                {car.image ? <Image src={car.image.src} alt="" fill sizes="96px" quality={60} className="object-contain p-1.5" /> : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <ProductPrice
        from={t.from}
        amount={formatPrice(lang, promotion.price)}
        unit={t.perDay}
        promotion
        regular={{ text: formatPrice(lang, promotion.regularPrice), label: fill(t.regular, { price: formatPrice(lang, promotion.regularPrice) }) }}
      />

      {/* Phones: the price list folded under a 44px header, so 15 boxes stay a short scroll; from `sm` always shown
          (`::details-content`). A `<details>`, as the footer's link groups: server markup, no script, prices in the HTML. */}
      <details className="group/prices border-t border-line sm:border-0 sm:[&::details-content]:h-auto sm:[&::details-content]:[content-visibility:visible]">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-sm text-sm font-semibold text-blue-dark outline-none focus-visible:ring-2 focus-visible:ring-blue-medium sm:pointer-events-none sm:mb-2 sm:min-h-0 sm:text-xs sm:text-muted-dark [&::-webkit-details-marker]:hidden">
          {t.prices}
          <ChevronDown className="size-4 shrink-0 text-blue-medium transition-transform duration-200 group-open/prices:rotate-180 motion-reduce:transition-none sm:hidden" aria-hidden />
        </summary>
        <ul className="grid grid-cols-2 gap-2 pt-2 min-[400px]:grid-cols-3 sm:pt-0">
          {promotion.bands.map((band) => (
            <li key={`${band.from ?? 0}-${band.to ?? "up"}`} className="flex flex-col rounded-control bg-surface px-2.5 py-1.5">
              <span className="text-xs text-muted-dark">{bandLabel(lang, band, fleet)}</span>
              <span className="text-sm font-bold text-go-strong">{formatPrice(lang, band.promotionalPrice)}</span>
              <s className="text-xs text-muted-dark">
                <span className="sr-only">{fill(t.regular, { price: formatPrice(lang, band.price) })}</span>
                <span aria-hidden>{formatPrice(lang, band.price)}</span>
              </s>
            </li>
          ))}
        </ul>
      </details>
    </article>
  );
}
