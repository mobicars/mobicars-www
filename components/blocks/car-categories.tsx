import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { Lang } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { getMessages } from "@/i18n/messages";
import { fleetHref } from "@/i18n/routes";
import type { FleetCard } from "@/lib/fleet/cars";
import { formatPrice } from "@/lib/fleet/format";
import { OFFER_CATEGORIES } from "@/lib/reservation/offers";

import { Pill } from "@/components/ui/surface";

/**
 * Car classes as photo tiles (as the vehicle types on carnet.pl, with our
 * "from" price): the photo of the class's cheapest car, the class name and its
 * lowest daily price with the rental length it needs. Each tile opens the fleet
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
            className="group relative flex w-full flex-col overflow-hidden rounded-card bg-white shadow-card ring-1 ring-line transition-[box-shadow,transform] duration-250 ease-out-soft outline-none hover:-translate-y-1 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-blue-medium motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            {/* A road-grey floor under the car, so cut-out photos sit on something. */}
            <div className="relative aspect-[16/10] bg-linear-to-b from-tint to-blue-light/70">
              {item.image ? (
                <Image
                  src={item.image.src}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 16rem, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  // Below the first screen: 60 is indistinguishable here and ~25% lighter (PageSpeed on phones).
                  quality={60}
                  className="object-contain p-4 transition-transform duration-250 ease-out-soft group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              ) : null}
              {/* The rental length the "from" price needs, where the eye already is. */}
              {item.daily && item.daily.fromDays > 1 ? (
                <Pill tone="glass" className="absolute top-3 left-3 shadow-card">
                  {fill(messages.fleet.dailyFromNote, { days: item.daily.fromDays })}
                </Pill>
              ) : null}
            </div>
            <div className="flex flex-1 items-end justify-between gap-3 p-5">
              <div className="flex flex-col gap-1">
                <Heading className="text-lg font-bold text-blue-dark">{item.label}</Heading>
                {item.daily ? (
                  <p className="text-blue-dark">
                    <span className="text-xl font-bold tabular-nums">{fill(messages.layout.fromPerDay, { price: formatPrice(lang, item.daily.price) })}</span>
                  </p>
                ) : null}
              </div>
              <span
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-dark text-white transition-colors duration-150 ease-out-soft group-hover:bg-green-medium"
              >
                <ArrowRight className="size-5" />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
