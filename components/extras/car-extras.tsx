import { Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { Lang } from "@/i18n/config";
import { CardArrow } from "@/components/ui/surface";
import { extrasHref } from "@/i18n/routes";
import { EXTRA_GROUPS, type CatalogExtra, type ExtraGroup } from "@/lib/extras/catalog";

/**
 * The add-ons of one car (`segmentExtras`), grouped as in the booking: one
 * compact row per add-on, its pictogram and name, linking to its page. No
 * price: it depends on the car and the dates, so the booking shows it.
 */
export function CarExtras({ extras, lang, groups }: { extras: readonly CatalogExtra[]; lang: Lang; groups: Record<ExtraGroup, string> }) {
  const grouped = EXTRA_GROUPS.map((group) => ({ group, items: extras.filter((extra) => extra.group === group) })).filter(
    ({ items }) => items.length > 0,
  );
  return (
    <div className="flex flex-col gap-5">
      {grouped.map(({ group, items }) => (
        <div key={group} className="flex flex-col gap-2">
          <h3 className="text-eyebrow text-green-dark uppercase">{groups[group]}</h3>
          {/* A phone swipes each group in one row (the section stays short); wider screens wrap it in two columns. */}
          <ul className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
            {items.map((extra) => (
              <li key={extra.id} className="flex w-36 shrink-0 snap-start sm:w-auto">
                <Link
                  href={extrasHref(lang, extra.slug)}
                  className="group flex min-h-14 w-full flex-col items-start gap-2 rounded-control border border-line bg-white p-2 text-sm font-semibold text-blue-dark transition-colors hover:bg-tint focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-medium motion-reduce:transition-none sm:flex-row sm:items-center sm:gap-3"
                >
                  <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-control bg-surface text-muted-dark">
                    {extra.image ? (
                      <Image src={extra.image} alt="" fill sizes="40px" className="object-contain p-1" />
                    ) : (
                      <Package className="size-5" strokeWidth={1.5} aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 text-balance">{extra.name}</span>
                  <CardArrow className="max-sm:hidden" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
