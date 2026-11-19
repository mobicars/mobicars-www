import { ChevronRight, Building2, MapPin, Plane, TrainFront } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";

import type { Lang } from "@/i18n/config";
import { fill, getMessages } from "@/i18n/messages";
import { fleetHref, reservationHref } from "@/i18n/routes";
import { cacheEnabled } from "@/lib/cache";
import { carClasses } from "@/lib/fleet/car-classes";
import { listFleetCars } from "@/lib/fleet/cars";
import { formatPrice } from "@/lib/fleet/format";
import { listServicePoints } from "@/lib/rentcarsoft";
import { findPageRoute, listLatestPosts, pageHref, type NavLink } from "@/lib/strapi";

/**
 * Submenu panels of the header (`MainNav`). Rendered on the server, so the
 * links are in the prerendered HTML. Data panels read the same cached sources
 * as the pages: the fleet and pickup points from RentCarSoft, posts from Strapi.
 * They sit in the layout of every page, so a failing source shows a shorter
 * panel (a link to the full list) instead of failing the page.
 */

/** The data, or `fallback` after logging the failure (no details: they may hold URLs). */
async function orFallback<T>(what: string, read: Promise<T>, fallback: T): Promise<T> {
  try {
    return await read;
  } catch (error) {
    console.error(`[menu] ${what} unavailable, showing a shorter panel: ${error instanceof Error ? error.name : "unknown"}`);
    return fallback;
  }
}

const linkClass =
  "rounded-lg text-sm font-semibold text-blue-dark outline-none underline-offset-4 hover:text-blue-medium hover:underline focus-visible:ring-2 focus-visible:ring-blue-medium";

const chipClass =
  "inline-flex h-9 items-center rounded-full border border-muted px-4 text-sm font-semibold text-blue-dark outline-none transition-colors duration-200 ease-out hover:border-blue-medium hover:bg-blue-light focus-visible:ring-2 focus-visible:ring-blue-medium motion-reduce:transition-none";

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
  // Without the cache the prices use the clock (`Date.now()`): read per request, not in a prerender.
  if (!cacheEnabled()) {
    await connection();
  }
  const cars = await orFallback("fleet", listFleetCars(lang), []);
  // The cheapest car's "from" price with its condition, as on its fleet card (`DailyNotes`).
  const classes = carClasses(cars).map(({ id, cheapest }) => ({
    id,
    label: messages.cars.categories[id],
    daily: cheapest.daily,
    image: cheapest.image,
  }));
  // Shortcuts to the filtered fleet, shown only when the fleet has such cars.
  const quickLinks = [
    { label: t.fleetVans, query: "category=delivery", show: cars.some((car) => car.categories.includes("delivery")) },
    // 110 is "Elektryczny" on the RentCarSoft fuel key (`lib/fleet/filters.ts`).
    { label: t.fleetElectric, query: "fuel=110", show: cars.some((car) => car.fuel?.id === 110) },
  ].filter((link) => link.show);

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
                {item.daily ? (
                  <span className="text-xs text-muted-dark">
                    {fill(t.fromPerDay, { price: formatPrice(lang, item.daily.price) })}
                    {item.daily.fromDays > 1 ? (
                      <>
                        <br />
                        {fill(messages.fleet.dailyFromNote, { days: item.daily.fromDays })}
                      </>
                    ) : null}
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {quickLinks.length > 0 ? (
          <nav aria-label={t.fleetQuickLinks}>
            <ul className="flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <li key={link.query}>
                  <Link href={`${fleetHref(lang)}?${link.query}`} className={chipClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        <Link href={fleetHref(lang)} className={moreClass}>
          {t.allCars}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

/** Pickup points by city; each opens the booking with that point picked. */
export async function LocationsPanel({ lang }: { lang: Lang }) {
  const t = getMessages(lang).layout;
  const points = await orFallback("pickup points", listServicePoints({ lang }), []);
  // Grouped by RentCarSoft's (Polish) town, headed by its name in this language ("Warschau").
  const cities = new Map<string, typeof points>();
  for (const point of points) {
    const city = point.cityName ?? point.city ?? t.otherPlaces;
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
              const type = point.airport ? t.airport : point.trainStation ? t.trainStation : point.office ? t.office : null;
              // Most names already say it ("Warschau – Büro"): the type is only added for screen readers when they do not.
              const kind = type && !point.name.toLocaleLowerCase(lang).includes(type.toLocaleLowerCase(lang)) ? type : null;
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
  const [posts, listing] = await Promise.all([listLatestPosts(lang, 3), orFallback("blog page", findPageRoute(lang, ["blog"]), null)]);

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
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
