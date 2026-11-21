import { Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PRODUCT_IMAGE, PRODUCT_PHOTO, ProductMore, productCardClass } from "@/components/ui/product-card";
import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
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
    <article className={productCardClass({ interactive: true })}>
      <div className={PRODUCT_PHOTO}>
        {extra.image ? (
          <Image
            src={extra.image}
            alt=""
            fill
            sizes={PHOTO_SIZES}
            className={PRODUCT_IMAGE}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-dark">
            <Package className="size-10" strokeWidth={1.25} aria-hidden />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Heading className="text-base leading-snug font-bold text-balance text-blue-dark">
          <Link href={extrasHref(lang, extra.slug)} className="outline-none after:absolute after:inset-0 after:content-['']">
            {extra.name}
          </Link>
        </Heading>
        <div className="mt-auto">
          <ProductMore label={getMessages(lang).fleet.details} />
        </div>
      </div>
    </article>
  );
}
