import Image from "next/image";
import Link from "next/link";

import { PRODUCT_IMAGE, PRODUCT_PHOTO, PRODUCT_TITLE, ProductMore, ProductPrice, productCardClass } from "@/components/ui/product-card";
import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { fleetHref } from "@/i18n/routes";
import type { FleetCard } from "@/lib/fleet/cars";
import { formatPrice } from "@/lib/fleet/format";
import { OFFER_CATEGORIES } from "@/lib/reservation/offers";

/**
 * Car classes as photo tiles (as the vehicle types on carnet.pl, with our
 * "from" price): the photo of the class's cheapest car, the class name and its
 * lowest daily price (the bare "od", decided 20 November 2026). Each tile opens the fleet
 * filtered to the class. Only classes the fleet has are shown. Server markup
 * only, no JavaScript. `headingLevel` is the tiles' own level, as with
 * `FleetCard`: `h3` under the block's title, `h2` when the block has none.
 */
export function CarCategories({ cars, lang, headingLevel }: { cars: FleetCard[]; lang: Lang; headingLevel: "h2" | "h3" }) {
  const messages = getMessages(lang);
  const Heading = headingLevel;
  // A car can be in more than one class (a Sandero is compact and eco): each tile shows a car
  // no earlier tile used, so two tiles never carry the same photo. The price stays the class's lowest.
  const shown = new Set<number>();
  const classes = OFFER_CATEGORIES.flatMap(({ id }) => {
    const inClass = cars
      .filter((car) => car.categories.includes(id) && car.daily !== null)
      .sort((a, b) => (a.daily?.price ?? Infinity) - (b.daily?.price ?? Infinity));
    if (inClass.length === 0) {
      return [];
    }
    const cheapest = inClass[0];
    const pictured = inClass.find((car) => car.image && !shown.has(car.id)) ?? cheapest;
    shown.add(pictured.id);
    return [{ id, label: messages.cars.categories[id], daily: cheapest.daily, image: pictured.image, count: inClass.length }];
  });
  if (classes.length === 0) {
    return null;
  }

  return (
    // Phones: a swipe row with a peek of the next tile, bleeding to the screen edge (as the car row); `sm`: the grid.
    <ul className="-mx-gutter flex snap-x snap-mandatory scroll-px-gutter gap-4 overflow-x-auto px-gutter pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 xl:grid-cols-5">
      {classes.map((item) => (
        <li key={item.id} className="flex w-[72%] max-w-72 shrink-0 snap-start sm:w-auto sm:max-w-none">
          <Link
            href={`${fleetHref(lang)}?category=${item.id}`}
            className={productCardClass({ interactive: true, extra: "outline-none focus-visible:ring-2 focus-visible:ring-blue-medium focus-visible:ring-offset-2" })}
          >
            <div className={PRODUCT_PHOTO}>
              {item.image ? (
                <Image
                  src={item.image.src}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 16rem, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  // Below the first screen: 60 is indistinguishable here and ~25% lighter (PageSpeed on phones).
                  quality={60}
                  className={PRODUCT_IMAGE}
                />
              ) : null}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <Heading className={PRODUCT_TITLE}>{item.label}</Heading>
              {item.daily ? (
                <ProductPrice from={messages.fleet.from} amount={formatPrice(lang, item.daily.price)} unit={messages.fleet.perDay} promotion={item.daily.promotional} small />
              ) : null}
              <div className="mt-auto border-t border-line pt-3">
                <ProductMore label={messages.fleet.seeCars} />
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
