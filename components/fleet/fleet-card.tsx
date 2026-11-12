import { BadgePercent, CarFront, DoorOpen, Fuel, Luggage, Settings2, Star, Users, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { Lang } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { fleetHref } from "@/i18n/routes";
import type { FleetCard as FleetCardData } from "@/lib/fleet/cars";
import { fill } from "@/i18n/fill";
import { countLabel, formatPrice } from "@/lib/fleet/format";

export type FleetTexts = Messages["fleet"];

/**
 * One car on the fleet list and under "Podobne samochody". The whole card is
 * one link to the car page (the name is the link; the rest is stretched over
 * it), so it is one tab stop. Prices are the base "from" prices.
 */
export function FleetCard({
  car,
  lang,
  t,
  headingLevel = "h2",
  priority = false,
}: {
  car: FleetCardData;
  lang: Lang;
  t: FleetTexts;
  headingLevel?: "h2" | "h3";
  /** The first row of the list: load the photo eagerly. */
  priority?: boolean;
}) {
  const Heading = headingLevel;
  const luggage =
    car.suitcases.large !== null || car.suitcases.small !== null
      ? fill(t.luggage, { large: car.suitcases.large ?? 0, small: car.suitcases.small ?? 0 })
      : null;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-muted bg-white shadow-sm transition-shadow duration-200 ease-out focus-within:ring-2 focus-within:ring-blue-medium hover:shadow-md motion-reduce:transition-none">
      <div className="relative aspect-[16/10] bg-surface">
        {car.image ? (
          <Image
            src={car.image.src}
            alt={car.image.alt}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 300px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-contain p-3 transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-dark">
            <CarFront className="size-12" strokeWidth={1.25} aria-hidden />
            <span className="sr-only">{t.noPhoto}</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {car.promotion ? (
            <Badge icon={BadgePercent} className="bg-green-medium text-white">
              {t.promotion}
            </Badge>
          ) : null}
          {car.popular ? (
            <Badge icon={Star} className="bg-white/95 text-blue-dark shadow-sm">
              {t.popular}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-blue-medium uppercase">{car.segment}</p>
          <Heading className="mt-0.5 text-lg leading-snug font-bold text-blue-dark">
            <Link
              href={fleetHref(lang, car.slug)}
              className="outline-none after:absolute after:inset-0 after:content-['']"
            >
              {car.name}
            </Link>
          </Heading>
          <p className="text-xs text-muted-dark">{t.orSimilar}</p>
        </div>

        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-blue-dark/80">
          <Spec icon={Users} label={car.seats ? countLabel(lang, car.seats, t.seatCount) : null} short={car.seats} />
          <Spec icon={DoorOpen} label={car.doors ? countLabel(lang, car.doors, t.doorCount) : null} short={car.doors} />
          <Spec icon={Settings2} label={car.transmission} />
          <Spec icon={Fuel} label={car.fuel?.label ?? null} />
          <Spec
            icon={Luggage}
            label={luggage}
            short={luggage ? `${car.suitcases.large ?? 0} + ${car.suitcases.small ?? 0}` : null}
          />
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-muted-light pt-3">
          <CardPrice car={car} lang={lang} t={t} />
          <span
            aria-hidden
            className="shrink-0 rounded-xl bg-blue-medium px-3 py-2 text-sm font-bold text-white transition-colors duration-200 ease-out group-hover:bg-blue-dark motion-reduce:transition-none"
          >
            {t.details}
          </span>
        </div>
      </div>
    </article>
  );
}

function CardPrice({ car, lang, t }: { car: FleetCardData; lang: Lang; t: FleetTexts }) {
  if (car.dailyFrom === null && car.monthlyFrom === null) {
    return <p className="text-xs text-muted-dark">{t.priceOnRequest}</p>;
  }
  return (
    <div className="min-w-0">
      {car.dailyFrom !== null ? (
        <p className={`text-sm whitespace-nowrap ${car.promotion ? "text-green-dark" : "text-blue-dark"}`}>
          {t.from} <span className="text-xl font-bold">{formatPrice(lang, car.dailyFrom)}</span>{" "}
          <span className="text-xs font-semibold">{t.perDay}</span>
        </p>
      ) : null}
      {car.monthlyFrom !== null ? (
        <p className="text-xs text-muted-dark">
          {t.from} {formatPrice(lang, car.monthlyFrom)} {t.perMonth}
        </p>
      ) : null}
    </div>
  );
}

function Badge({ icon: Icon, className, children }: { icon: LucideIcon; className: string; children: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xxs font-bold uppercase ${className}`}>
      <Icon className="size-3" aria-hidden />
      {children}
    </span>
  );
}

/** An icon with a short value; screen readers hear the full label ("5 miejsc"). */
function Spec({ icon: Icon, label, short }: { icon: LucideIcon; label: string | null; short?: string | number | null }) {
  if (!label) {
    return null;
  }
  return (
    <li className="flex min-w-0 items-center gap-1">
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
