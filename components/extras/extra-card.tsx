import { Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { CardArrow } from "@/components/ui/surface";
import type { Lang } from "@/i18n/config";
import { extrasHref } from "@/i18n/routes";
import type { CatalogExtra } from "@/lib/extras/catalog";

/**
 * Two on a phone, up to six on a desktop. `auto-fill`, not the Car classes'
 * `auto-fit`: a group of three keeps the card size instead of stretching.
 */
export const EXTRAS_GRID = "grid grid-cols-[repeat(auto-fill,minmax(min(100%,9.5rem),1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] sm:gap-6";
const PHOTO_SIZES = "(min-width: 1024px) 220px, (min-width: 640px) 33vw, 50vw";

/**
 * One add-on, flat like the class and fleet cards: the photo and the name
 * (the link to its page, stretched over the card). No price: it depends on
 * the car and the dates, so the booking shows it.
 */
export function ExtraCard({
  extra,
  lang,
  heading: Heading = "h3",
}: {
  extra: CatalogExtra;
  lang: Lang;
  heading?: "h2" | "h3" | "h4";
}) {
  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-card border border-line bg-white text-blue-dark focus-within:ring-2 focus-within:ring-blue-medium focus-within:ring-offset-2">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        {extra.image ? (
          <Image
            src={extra.image}
            alt=""
            fill
            sizes={PHOTO_SIZES}
            className="object-contain p-4 transition-transform duration-500 ease-out-soft group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-dark">
            <Package className="size-10" strokeWidth={1.25} aria-hidden />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Heading className="text-base leading-snug font-bold text-balance">
          <Link href={extrasHref(lang, extra.slug)} className="outline-none after:absolute after:inset-0 after:content-['']">
            {extra.name}
          </Link>
        </Heading>
        <div className="mt-auto flex justify-end">
          <CardArrow />
        </div>
      </div>
    </article>
  );
}
