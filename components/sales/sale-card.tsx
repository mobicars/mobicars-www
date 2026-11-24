import { CalendarDays, Camera, ChevronRight, Fuel, Gauge, Settings2, type LucideIcon } from "lucide-react";
import Image from "next/image";

import { intlLocales, type Lang } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import type { Messages } from "@/i18n/messages";
import { formatPrice } from "@/lib/fleet/format";
import type { SaleCard as SaleCardData, SaleSpecs } from "@/lib/strapi";

export type SalesTexts = Messages["sales"];

/** "198 000 km". */
export function formatMileage(lang: Lang, km: number): string {
  return `${new Intl.NumberFormat(intlLocales[lang]).format(km)} km`;
}

/** "2.0 mHEV · 150 KM · SUV": the line under the name. */
export function saleSubtitle(specs: SaleSpecs): string {
  return [specs.engine, specs.power, specs.body].filter(Boolean).join(" · ");
}

/** The four facts a buyer compares first, with their icons; the ad leaves out what it does not say. */
export function saleFacts(lang: Lang, specs: SaleSpecs, t: SalesTexts): { icon: LucideIcon; label: string; value: string }[] {
  return [
    specs.year ? { icon: CalendarDays, label: t.specs.year, value: String(specs.year) } : null,
    specs.mileage !== null ? { icon: Gauge, label: t.specs.mileage, value: formatMileage(lang, specs.mileage) } : null,
    specs.fuel ? { icon: Fuel, label: t.specs.fuel, value: specs.fuel } : null,
    specs.gearbox ? { icon: Settings2, label: t.specs.gearbox, value: specs.gearbox } : null,
  ].filter((fact) => fact !== null);
}

/**
 * One car-sale ad, as on a sales portal but in the site's look: the photo with
 * its count, the name and engine line, the facts with icons and the gross price.
 * `row` (the list from `sm`): the photo beside the text; `tile` (the carousel
 * under an ad, and every card on phones): the photo above. The whole card is
 * one link (the name, stretched over it). Server-safe markup, no state.
 */
export function SaleCard({
  sale,
  lang,
  t,
  layout = "row",
  headingLevel = "h3",
  priority = false,
  sizes,
}: {
  sale: SaleCardData;
  lang: Lang;
  t: SalesTexts;
  layout?: "row" | "tile";
  headingLevel?: "h2" | "h3";
  priority?: boolean;
  sizes?: string;
}) {
  const Heading = headingLevel;
  const row = layout === "row";
  const image = sale.images[0] ?? null;
  const subtitle = saleSubtitle(sale.specs);
  const facts = saleFacts(lang, sale.specs, t);
  return (
    <article
      className={`group relative flex w-full flex-col overflow-hidden rounded-card bg-white ring-1 ring-line transition-[box-shadow] duration-200 ease-out hover:shadow-card focus-within:ring-2 focus-within:ring-blue-medium motion-reduce:transition-none ${
        row ? "sm:flex-row" : ""
      }`}
    >
      <div className={`relative aspect-[4/3] shrink-0 overflow-hidden bg-tint ${row ? "sm:aspect-auto sm:w-[min(42%,22rem)]" : ""}`}>
        {image ? (
          <Image
            src={image.url}
            alt={image.alt || sale.title}
            fill
            priority={priority}
            sizes={sizes ?? (row ? "(min-width: 640px) 22rem, calc(100vw - 2rem)" : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 85vw")}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : null}
        {sale.images.length > 1 ? (
          <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-blue-dark/80 px-2.5 py-1 text-xs font-semibold text-white">
            <Camera aria-hidden className="size-3.5" />
            {fill(t.photos, { count: String(sale.images.length) })}
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className={`flex flex-col gap-2 ${row ? "sm:flex-row sm:items-start sm:justify-between sm:gap-6" : ""}`}>
          <div className="min-w-0">
            <Heading className="text-lg leading-snug font-bold text-blue-dark">
              {/* Stretched over the card: one link, one tab stop, named by the car. */}
              <a href={sale.href} className="outline-none after:absolute after:inset-0 after:content-['']">
                {sale.title}
              </a>
            </Heading>
            {subtitle ? <p className="mt-0.5 text-sm text-muted-dark">{subtitle}</p> : null}
          </div>
          <p className={`shrink-0 ${row ? "sm:text-right" : ""}`}>
            {sale.price !== null ? (
              <>
                <span className="text-2xl font-bold whitespace-nowrap text-blue-dark tabular-nums">{formatPrice(lang, sale.price)}</span>
                <span className="ml-1.5 text-xs font-semibold text-muted-dark sm:ml-0 sm:block">{t.gross}</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-blue-dark">{t.priceOnRequest}</span>
            )}
          </p>
        </div>

        {facts.length > 0 ? (
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-blue-dark">
            {facts.map((fact) => (
              <li key={fact.label} className="flex items-center gap-1.5">
                <fact.icon aria-hidden className="size-4 shrink-0 text-blue-medium" strokeWidth={1.75} />
                <span className="sr-only">{fact.label}: </span>
                {fact.value}
              </li>
            ))}
          </ul>
        ) : null}

        <p aria-hidden className="mt-auto flex items-center justify-end gap-1 border-t border-line pt-3 text-sm font-bold text-blue-medium group-hover:underline">
          {t.details}
          <ChevronRight className="size-4" />
        </p>
      </div>
    </article>
  );
}
