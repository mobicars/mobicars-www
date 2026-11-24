import { BadgePercent, CarFront, Fuel, Settings2, Star, Users, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { BookCarButton } from "@/components/fleet/book-car-button";
import { buttonClass } from "@/components/ui/button";
import { PRODUCT_BADGES, PRODUCT_EYEBROW, PRODUCT_IMAGE, PRODUCT_PHOTO, ProductBadge, ProductMore, ProductPrice, productCardClass } from "@/components/ui/product-card";
import type { Lang } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { fleetHref } from "@/i18n/routes";
import type { FleetCard as FleetCardData } from "@/lib/fleet/cars";
import { fill } from "@/i18n/fill";
import { countLabel, formatApiDate, formatPrice } from "@/lib/fleet/format";

export type FleetTexts = Messages["fleet"];

/**
 * The one car card of the site: the fleet list, "Podobne samochody" and the
 * CMS Cars section (`components/sections/cars.tsx`). Server-safe markup; the one
 * client part is "Rezerwuj". The card is a link to the car page (the name is
 * the link, stretched over the card; "Szczegóły ›" at the bottom is part of it),
 * and "Rezerwuj" above it opens the short-term search for this car
 * (`BookCarButton`). Prices are the base "from" prices of `lib/fleet/cars.ts`.
 * The look is the site's product card (`components/ui/product-card.tsx`).
 */
export function FleetCard({
  car,
  lang,
  t,
  headingLevel = "h2",
  priority = false,
  showPromotionEnd = false,
  compact = false,
  sizes = "(min-width: 1280px) 300px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw",
}: {
  car: FleetCardData;
  lang: Lang;
  t: FleetTexts;
  headingLevel?: "h2" | "h3";
  /** The first row of the list: load the photo eagerly. */
  priority?: boolean;
  /** `sizes` of the photo when the card is not in the fleet grid (a scroll row). */
  sizes?: string;
  /** "Promocja do {date}" (a block of promotions only). Generic, as RentCarSoft names promotions in Polish only. */
  showPromotionEnd?: boolean;
  /**
   * The fleet list on phones: photo on the left (40%), name, class, three
   * specs and one "from" price, about a third of the height. From `sm` the
   * usual card. Same data and link.
   */
  compact?: boolean;
}) {
  const Heading = headingLevel;
  const promotionEnd = showPromotionEnd && car.promotionEndsAt ? formatApiDate(lang, car.promotionEndsAt) : null;

  return (
    <article className={productCardClass({ interactive: true, extra: "h-full" })}>
      <div className={`flex min-h-0 flex-1 ${compact ? "flex-col max-sm:flex-row" : "flex-col"}`}>
        <div className={`${PRODUCT_PHOTO} ${compact ? "max-sm:aspect-auto max-sm:w-[40%]" : ""}`}>
          {car.image ? (
            <Image
              src={car.image.src}
              alt={car.image.alt}
              fill
              priority={priority}
              sizes={sizes}
              className={`${PRODUCT_IMAGE} ${compact ? "max-sm:p-2" : ""}`}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-dark">
              <CarFront className="size-12" strokeWidth={1.25} aria-hidden />
              <span className="sr-only">{t.noPhoto}</span>
            </div>
          )}
          <div className={`${PRODUCT_BADGES} ${compact ? "max-sm:top-2 max-sm:left-2 max-sm:[&>span:nth-child(n+2)]:hidden" : ""}`}>
            {car.promotion ? (
              <ProductBadge icon={BadgePercent} tone="promo">
                {t.promotion}
              </ProductBadge>
            ) : null}
            {car.popular ? (
              <ProductBadge icon={Star} tone="plain">
                {t.popular}
              </ProductBadge>
            ) : null}
          </div>
        </div>

        <div className={`flex min-w-0 flex-1 flex-col p-4 sm:gap-3 ${compact ? "gap-2 max-sm:p-3" : "gap-3"}`}>
          <div className="flex flex-col">
            <p className={`mb-0.5 ${PRODUCT_EYEBROW}`}>{car.segment}</p>
            <Heading className={`leading-snug font-bold text-blue-dark text-balance ${compact ? "text-base sm:text-lg" : "text-lg"}`}>
              <Link
                href={fleetHref(lang, car.slug)}
                className="outline-none after:absolute after:inset-0 after:content-['']"
              >
                {car.name}
              </Link>
            </Heading>
            <p className={`text-xxs text-muted-dark ${compact ? "max-sm:hidden" : ""}`}>{t.orSimilar}</p>
            {promotionEnd ? (
              <p className="mt-1 text-xs font-semibold text-green-dark">{fill(t.promotionUntilGeneric, { date: promotionEnd })}</p>
            ) : null}
          </div>

          <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-blue-dark/80">
            <Spec icon={Users} label={car.seats ? countLabel(lang, car.seats, t.seatCount) : null} short={car.seats} />
            <Spec icon={Settings2} label={car.transmission} />
            <Spec icon={Fuel} label={car.fuel?.label ?? null} />
          </ul>

          <div className={`mt-auto border-t border-line pt-3 ${compact ? "max-sm:border-0 max-sm:pt-0" : ""}`}>
            <CardPrice car={car} lang={lang} t={t} />
          </div>
        </div>
      </div>

      {/* Inside the card's padding, not glued to its edges. "Szczegóły ›" belongs to the card's link (no second link to the same page); "Rezerwuj" sits above it. */}
      <div className={`flex items-center justify-between gap-3 px-4 pb-4 ${compact ? "max-sm:px-3 max-sm:pb-3" : ""}`}>
        <ProductMore label={t.details} />
        <BookCarButton offerId={car.id} name={car.name} title={t.bookTitle} lead={t.bookLead} className={buttonClass("success", "sm", "relative z-10 px-4")} />
      </div>
    </article>
  );
}

/**
 * One price: "od X zł / doba", without its rental length (decided 19 November
 * 2026, to keep the card short) or a 1-day price; the monthly one only for a
 * car without a daily one. The car page has them all.
 */
function CardPrice({ car, lang, t }: { car: FleetCardData; lang: Lang; t: FleetTexts }) {
  if (car.dailyFrom === null && car.monthlyFrom === null) {
    return <p className="text-xs text-muted-dark">{t.priceOnRequest}</p>;
  }
  return (
    <div className="min-w-0">
      {car.dailyFrom !== null ? (
        <ProductPrice from={t.from} amount={formatPrice(lang, car.dailyFrom)} unit={t.perDay} promotion={car.promotion} />
      ) : null}
      {car.dailyFrom === null && car.monthlyFrom !== null ? (
        <p className="text-xs text-muted-dark">
          {t.from} {formatPrice(lang, car.monthlyFrom)} {t.perMonth}
        </p>
      ) : null}
    </div>
  );
}

/** An icon with a short value; screen readers hear the full label ("5 miejsc"). */
function Spec({
  icon: Icon,
  label,
  short,
  hidden = false,
}: {
  icon: LucideIcon;
  label: string | null;
  short?: string | number | null;
  /** Left out of the compact phone card (from `sm` it shows). */
  hidden?: boolean;
}) {
  if (!label) {
    return null;
  }
  return (
    <li className={`flex min-w-0 items-center gap-1 ${hidden ? "max-sm:hidden" : ""}`}>
      <Icon className="size-4 shrink-0 text-blue-medium" strokeWidth={1.75} aria-hidden />
      {short !== undefined && short !== null ? (
        <>
          <span aria-hidden>{short}</span>
          <span className="sr-only">{label}</span>
        </>
      ) : (
        <span className="min-w-0 break-words">{label}</span>
      )}
    </li>
  );
}
