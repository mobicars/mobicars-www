import { ArrowRight, BadgePercent, CarFront, Fuel, Settings2, Star, Users, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { BookCarButton } from "@/components/fleet/book-car-button";
import type { Lang } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { fleetHref } from "@/i18n/routes";
import type { FleetCard as FleetCardData } from "@/lib/fleet/cars";
import { fill } from "@/i18n/fill";
import { countLabel, formatApiDate, formatPrice } from "@/lib/fleet/format";

export type FleetTexts = Messages["fleet"];

/**
 * The one car card of the site: the fleet list, "Podobne samochody" and the
 * CMS cars block (`components/blocks/cars.tsx`). Server-safe markup; the one
 * client part is "Rezerwuj". The card is a link to the car page (the name is
 * the link, stretched over the card; "Szczegóły" at the bottom is part of it),
 * and "Rezerwuj" above it opens the short-term search for this car
 * (`BookCarButton`). Prices are the base "from" prices of `lib/fleet/cars.ts`.
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
    <article className="group relative flex h-full w-full flex-col overflow-hidden rounded-card border border-line bg-white has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-blue-medium has-[a:focus-visible]:ring-offset-2">
      <div className={`flex min-h-0 flex-1 ${compact ? "flex-col max-sm:flex-row" : "flex-col"}`}>
        {/* Flat, like the new sections: no shadow or lift; on hover the photo zooms in a little. */}
        <div className={`relative aspect-[16/10] overflow-hidden bg-surface ${compact ? "max-sm:aspect-auto max-sm:w-[40%] max-sm:shrink-0" : ""}`}>
          {car.image ? (
            <Image
              src={car.image.src}
              alt={car.image.alt}
              fill
              priority={priority}
              sizes={sizes}
              className={`object-contain p-4 transition-transform duration-500 ease-out-soft group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${compact ? "max-sm:p-2" : ""}`}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-dark">
              <CarFront className="size-12" strokeWidth={1.25} aria-hidden />
              <span className="sr-only">{t.noPhoto}</span>
            </div>
          )}
          <div className={`absolute top-3 left-3 flex flex-wrap gap-1.5 ${compact ? "max-sm:top-2 max-sm:left-2 max-sm:[&>span:nth-child(n+2)]:hidden" : ""}`}>
            {car.promotion ? (
              <Badge icon={BadgePercent} className="bg-go-strong text-white">
                {t.promotion}
              </Badge>
            ) : null}
            {car.popular ? (
              <Badge icon={Star} className="bg-white text-blue-dark">
                {t.popular}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className={`flex min-w-0 flex-1 flex-col p-4 sm:gap-3 ${compact ? "gap-2 max-sm:p-3" : "gap-3"}`}>
          <div className="flex flex-col">
            <p className="mb-0.5 text-xs font-semibold text-blue-medium">{car.segment}</p>
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
            <CardPrice car={car} lang={lang} t={t} compact={compact} />
          </div>
        </div>
      </div>

      {/* "Szczegóły" belongs to the card's link (no second link to the same page); "Rezerwuj" sits above it. */}
      <div className="grid h-12 shrink-0 grid-cols-2 border-t border-line text-sm font-bold">
        <span aria-hidden className="flex items-center justify-center gap-2 text-blue-medium transition-colors duration-150 ease-out-soft group-hover:bg-tint motion-reduce:transition-none">
          {t.details}
          <ArrowRight className="size-4 transition-transform duration-150 ease-out-soft group-hover:translate-x-0.5 motion-reduce:transition-none" strokeWidth={2} />
        </span>
        <BookCarButton
          offerId={car.id}
          name={car.name}
          title={t.bookTitle}
          lead={t.bookLead}
          className="relative z-10 flex cursor-pointer items-center justify-center gap-2 bg-go-strong text-white outline-none transition-colors duration-150 ease-out-soft hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-blue-medium focus-visible:ring-inset motion-reduce:transition-none"
        />
      </div>
    </article>
  );
}

/**
 * One price: "od X zł / doba", without its rental length (decided 19 November
 * 2026, to keep the card short) or a 1-day price; the monthly one only for a
 * car without a daily one. The car page has them all.
 */
function CardPrice({ car, lang, t, compact = false }: { car: FleetCardData; lang: Lang; t: FleetTexts; compact?: boolean }) {
  if (car.dailyFrom === null && car.monthlyFrom === null) {
    return <p className="text-xs text-muted-dark">{t.priceOnRequest}</p>;
  }
  return (
    <div className="min-w-0">
      {car.dailyFrom !== null ? (
        <p className={`text-sm whitespace-nowrap ${car.promotion ? "text-green-dark" : "text-blue-dark"}`}>
          {t.from} <span className={`font-bold tracking-tight tabular-nums ${compact ? "text-xl sm:text-2xl" : "text-2xl"}`}>{formatPrice(lang, car.dailyFrom)}</span>{" "}
          <span className="text-xs font-semibold">{t.perDay}</span>
        </p>
      ) : null}
      {car.dailyFrom === null && car.monthlyFrom !== null ? (
        <p className="text-xs text-muted-dark">
          {t.from} {formatPrice(lang, car.monthlyFrom)} {t.perMonth}
        </p>
      ) : null}
    </div>
  );
}

function Badge({ icon: Icon, className, children }: { icon: LucideIcon; className: string; children: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${className}`}>
      <Icon className="size-3" aria-hidden />
      {children}
    </span>
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
