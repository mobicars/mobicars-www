import { ArrowRight, Building2, MapPin, Plane, TrainFront } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { Lang } from "@/i18n/config";
import { fill, getMessages } from "@/i18n/messages";
import { fleetHref, reservationHref } from "@/i18n/routes";
import { listFleetCars } from "@/lib/fleet/cars";
import { formatPrice } from "@/lib/fleet/format";
import { listServicePoints } from "@/lib/rentcarsoft";
import { OFFER_CATEGORIES } from "@/lib/reservation/offers";
import { findPageRoute, listLatestPosts, pageHref, type NavLink } from "@/lib/strapi";

/**
 * Submenu panels of the header (`MainNav`). Rendered on the server, so the
 * links are in the prerendered HTML. Data panels read the same cached sources
 * as the pages: the fleet and pickup points from RentCarSoft, posts from Strapi.
 */

const linkClass =
  "rounded-lg text-sm font-semibold text-blue-dark outline-none underline-offset-4 hover:text-blue-medium hover:underline focus-visible:ring-2 focus-visible:ring-blue-medium";

const moreClass =
  "inline-flex items-center gap-1 text-sm font-bold text-blue-medium outline-none underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-blue-medium";

export function LinksPanel({ links }: { links: NavLink[] }) {
  return (
    <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
      {links.map((link) => (
        <li key={`${link.href}-${link.label}`}>
          {link.newTab ? (
            <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {link.label}
            </a>
          ) : (
            <Link href={link.href} className={linkClass}>
              {link.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Car classes with their lowest daily price; each opens the fleet filtered to it. */
export async function FleetPanel({ lang }: { lang: Lang }) {
  const messages = getMessages(lang);
  const t = messages.layout;
  const cars = await listFleetCars(lang);
  const classes = OFFER_CATEGORIES.flatMap(({ id }) => {
    const inClass = cars.filter((car) => car.categories.includes(id));
    if (inClass.length === 0) {
      return [];
    }
    const prices = inClass.flatMap((car) => (car.dailyFrom !== null ? [car.dailyFrom] : []));
    const cheapest = inClass.reduce((best, car) =>
      (car.dailyFrom ?? Infinity) < (best.dailyFrom ?? Infinity) ? car : best,
    );
    return [{ id, label: messages.cars.categories[id], from: prices.length > 0 ? Math.min(...prices) : null, image: cheapest.image }];
  });

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {classes.map((item) => (
          <li key={item.id}>
            <Link
              href={`${fleetHref(lang)}?category=${item.id}`}
              className="flex h-full items-center gap-3 rounded-xl border border-muted p-3 outline-none transition-colors duration-200 ease-out hover:border-blue-medium hover:bg-blue-light focus-visible:ring-2 focus-visible:ring-blue-medium motion-reduce:transition-none lg:flex-col lg:items-start"
            >
              {item.image ? (
                <Image
                  src={item.image.src}
                  alt=""
                  width={160}
                  height={96}
                  sizes="160px"
                  className="h-12 w-20 shrink-0 object-contain lg:h-20 lg:w-full"
                />
              ) : null}
              <span className="flex flex-col">
                <span className="font-bold text-blue-dark">{item.label}</span>
                {item.from !== null ? (
                  <span className="text-xs text-muted-dark">{fill(t.fromPerDay, { price: formatPrice(lang, item.from) })}</span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href={fleetHref(lang)} className={moreClass}>
        {t.allCars}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

/** Pickup points by city; each opens the booking with that point picked. */
export async function LocationsPanel({ lang }: { lang: Lang }) {
  const t = getMessages(lang).layout;
  const points = await listServicePoints({ lang });
  const cities = new Map<string, typeof points>();
  for (const point of points) {
    const city = point.city ?? t.otherPlaces;
    cities.set(city, [...(cities.get(city) ?? []), point]);
  }
  const sorted = [...cities].sort(([a], [b]) => a.localeCompare(b, lang));

  return (
    <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
      {sorted.map(([city, cityPoints]) => (
        <section key={city} aria-label={city} className="flex flex-col gap-2">
          <h3 className="text-xs font-bold tracking-wide text-muted-dark uppercase">{city}</h3>
          <ul className="flex flex-col gap-2">
            {cityPoints.map((point) => {
              const Icon = point.airport ? Plane : point.trainStation ? TrainFront : point.office ? Building2 : MapPin;
              const kind = point.airport ? t.airport : point.trainStation ? t.trainStation : point.office ? t.office : null;
              return (
                <li key={point.id}>
                  <Link href={reservationHref(lang, "short", `pickup=${point.id}`)} className={`${linkClass} flex items-start gap-2`}>
                    <Icon className="mt-0.5 size-4 shrink-0 text-blue-medium" aria-hidden />
                    <span>
                      {point.name}
                      {kind ? <span className="sr-only"> ({kind})</span> : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** The three newest posts and, when the CMS has a `blog` page, a link to all. */
export async function BlogPanel({ lang }: { lang: Lang }) {
  const t = getMessages(lang).layout;
  const [posts, listing] = await Promise.all([listLatestPosts(lang, 3), findPageRoute(lang, ["blog"])]);

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-4 sm:grid-cols-3">
        {posts.map((post) => (
          <li key={post.documentId}>
            <Link href={post.href} className="group flex flex-col gap-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-medium">
              {post.image ? (
                <Image
                  src={post.image.url}
                  alt=""
                  width={post.image.width ?? 640}
                  height={post.image.height ?? 360}
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="aspect-video w-full rounded-xl object-cover"
                />
              ) : null}
              <span className="text-sm font-bold text-blue-dark group-hover:text-blue-medium group-hover:underline">
                {post.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {listing ? (
        <Link href={pageHref(lang, listing.segments)} className={moreClass}>
          {t.allPosts}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
