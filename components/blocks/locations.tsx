import { Suspense } from "react";
import Link from "next/link";
import { Building2, ChevronDown, MapPin, Phone, Plane, TrainFront, Truck } from "lucide-react";

import { IconSymbols, UseIcon } from "@/components/ui/icon-symbols";

import type { Lang } from "@/i18n/config";
import { fill, getMessages } from "@/i18n/messages";
import { reservationHref } from "@/i18n/routes";
import { listServicePoints, type ServicePoint } from "@/lib/rentcarsoft";
import { absoluteUrl, jsonLd } from "@/lib/fleet/seo";
import { countLabel } from "@/lib/fleet/format";
import { placeDetails } from "@/lib/reservation/places";
import { QUERY_KEYS } from "@/lib/reservation/search";
import { listPlaceLinks, type LocationsBlock, type PlaceLink } from "@/lib/strapi";

import { SectionHeader } from "@/components/ui/section";

import { PointsMap, PointsMapLinks, type MapTown } from "./points-map";
import { SectionFrame } from "./section-frame";

type Texts = ReturnType<typeof getMessages>["blocks"]["locations"];

type CityGroup = {
  /** RentCarSoft's town (Polish), the group's key. */
  city: string;
  /** The same in the page's language. */
  name: string;
  /** Offices, airports, stations and other fixed points, in that order. */
  fixed: ServicePoint[];
  /** "Own address" points: delivery in and around the town. */
  delivery: ServicePoint[];
};

/**
 * The CMS locations block: pickup points from RentCarSoft grouped by town,
 * airports, stations and offices marked, each with its fee, phone, an
 * optional map link and a link that opens the booking with that point. A
 * server component with no client JavaScript; the list streams in after the
 * heading, which does not wait for RentCarSoft.
 */
export function Locations({
  block,
  lang,
  first,
  pickupId = null,
}: {
  block: LocationsBlock;
  lang: Lang;
  first: boolean;
  /** The page's pickup point: a city filter with no town shows the point's town. */
  pickupId?: number | null;
}) {
  const t = getMessages(lang).blocks.locations;
  const headingId = `locations-${block.id}`;
  return (
    <SectionFrame style={block.section} labelledBy={headingId}>
      <SectionHeader
        id={headingId}
        level={first ? 1 : 2}
        eyebrow={block.eyebrow}
        title={block.title ?? t.title}
        lead={block.lead}
        dark={block.section.tone === "dark"}
      />
      <Suspense fallback={<ListSkeleton />}>
        <LocationList block={block} lang={lang} texts={t} pickupId={pickupId} />
      </Suspense>
    </SectionFrame>
  );
}

async function LocationList({
  block,
  lang,
  texts,
  pickupId,
}: {
  block: LocationsBlock;
  lang: Lang;
  texts: Texts;
  pickupId: number | null;
}) {
  // A RentCarSoft outage must not cost the page: the heading stays, the list gives way to a note.
  const all = await listServicePoints({ lang }).catch((error: unknown) => {
    console.error(`[locations] service points unavailable: ${error instanceof Error ? error.name : "unknown"}`);
    return null;
  });
  if (!all) {
    return (
      <p className="text-blue-dark/80">
        {texts.unavailable}{" "}
        <Link href={reservationHref(lang, "short")} className={`${LINK_CLASS} font-semibold text-blue-medium underline`}>
          {texts.unavailableLink}
        </Link>
      </p>
    );
  }
  const points = all.filter((point) => point.active);
  // A city filter without a town: the town of the page's pickup point; with neither, every point.
  const city = block.filter === "city" ? (block.city ?? all.find((point) => point.id === pickupId)?.city ?? null) : null;
  const groups = groupByCity(points.filter((point) => matches(block.filter, city, point)));
  if (groups.length === 0) {
    return null;
  }
  if (block.layout === "compact" || block.layout === "map") {
    const links = await listPlaceLinks(lang);
    const open =
      pickupId === null
        ? null
        : (groups.find((group) => [...group.fixed, ...group.delivery].some((point) => point.id === pickupId))?.city ?? null);
    const withMap = block.layout === "map";
    const list = (
      <CompactList
        groups={groups}
        blockId={block.id}
        lang={lang}
        texts={texts}
        showMap={block.showMap}
        openCity={open}
        cityLinks={links.cities}
        withMap={withMap}
      />
    );
    return (
      <>
        <IconSymbols prefix={iconPrefix(block.id)} icons={{ ...KIND_ICONS, phone: Phone }} />
        {withMap ? (
          <div id={`locations-${block.id}-map`} className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
            <PointsMap
              towns={mapTowns(groups, block.id, lang, texts, links.cities)}
              caption={texts.mapCaption}
              className="lg:sticky lg:top-24"
            />
            {list}
            <PointsMapLinks scope={`locations-${block.id}-map`} keys={groups.map((_, index) => townKey(index))} />
          </div>
        ) : (
          list
        )}
        {city ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: jsonLd(
                pointsJsonLd(
                  groups.flatMap((group) => group.fixed),
                  lang,
                ),
              ),
            }}
          />
        ) : null}
      </>
    );
  }
  // No counts of points or towns: the site promises "over 30 locations" word for word.
  return (
    <>
      {/* Each icon is drawn once and reused: a town list repeats them dozens of times. */}
      <IconSymbols prefix={iconPrefix(block.id)} icons={{ ...KIND_ICONS, phone: Phone }} />
      <ul className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <li key={group.city}>
            <CityCard group={group} blockId={block.id} lang={lang} texts={texts} showMap={block.showMap} />
          </li>
        ))}
      </ul>
      {city ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(
              pointsJsonLd(
                groups.flatMap((group) => group.fixed),
                lang,
              ),
            ),
          }}
        />
      ) : null}
    </>
  );
}

/**
 * schema.org `AutoRental` per fixed pickup point, for a page about one town
 * (`filter: "city"`): name, phone, town and position from RentCarSoft. The
 * home page lists the whole network and leaves it out.
 */
function pointsJsonLd(points: ServicePoint[], lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@graph": points.map((point) => ({
      "@type": "AutoRental",
      name: `MobiCars – ${point.name}`,
      url: absoluteUrl(reservationHref(lang, "short", new URLSearchParams({ [QUERY_KEYS.pickup]: String(point.id) }))),
      ...(point.phone ? { telephone: point.phone } : {}),
      address: {
        "@type": "PostalAddress",
        addressLocality: point.city,
        // No street: RentCarSoft mixes it with directions ("Parking P2 - wjazd obok…").
        addressCountry: "PL",
      },
      ...(point.latitude !== null && point.longitude !== null
        ? {
            geo: {
              "@type": "GeoCoordinates",
              latitude: point.latitude,
              longitude: point.longitude,
            },
          }
        : {}),
    })),
  };
}

/**
 * The compact layout (catalog C14): town pills, then one fold per town with
 * its points (the same rows as the cards). Only the town of the page's pickup
 * point starts open. Every point stays in the HTML, so crawlers and the
 * browser's find-in-page see them; no client JavaScript.
 */
function CompactList({
  groups,
  blockId,
  lang,
  texts,
  showMap,
  openCity,
  cityLinks,
  withMap = false,
}: {
  groups: CityGroup[];
  blockId: string;
  lang: Lang;
  texts: Texts;
  showMap: boolean;
  openCity: string | null;
  cityLinks: PlaceLink[];
  /** Beside the map (catalog C24): one column, and no pills, since the pins lead to the towns. */
  withMap?: boolean;
}) {
  const icons = iconPrefix(blockId);
  const anchor = (group: CityGroup) => foldId(blockId, group);
  return (
    <div className="flex flex-col gap-6">
      {withMap ? null : (
        <nav aria-label={texts.citiesLabel}>
          <ul className="-mx-gutter flex gap-2 overflow-x-auto px-gutter pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {groups.map((group) => (
              <li key={group.city} className="shrink-0">
                <Link
                  href={townPage(cityLinks, group) ?? `#${anchor(group)}`}
                  className="inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold text-blue-dark ring-1 ring-line transition-colors hover:bg-blue-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-medium motion-reduce:transition-none"
                >
                  {group.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <ul className={`grid items-start gap-3 ${withMap ? "" : "lg:grid-cols-3"}`.trim()}>
        {groups.map((group, index) => {
          const rows = [...group.fixed, ...group.delivery];
          const phone = mostCommon(rows.map((point) => point.phone));
          const airport = rows.some((point) => pointKind(point) === "airport");
          return (
            <li key={group.city}>
              <details
                id={anchor(group)}
                data-fold={townKey(index)}
                open={group.city === openCity}
                className="group/city scroll-mt-28 rounded-card bg-white text-blue-dark shadow-card ring-1 ring-line"
              >
                <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 marker:hidden focus-visible:rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-medium [&::-webkit-details-marker]:hidden">
                  <UseIcon prefix={icons} name="other" className="size-5 shrink-0 text-blue-medium" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{group.name}</span>
                    <span className="block text-sm text-muted-dark">{countLabel(lang, rows.length, texts.pointCount)}</span>
                  </span>
                  {airport ? <UseIcon prefix={icons} name="airport" className="size-4 shrink-0 text-muted-dark" /> : null}
                  <ChevronDown
                    className="size-5 shrink-0 text-blue-medium transition-transform duration-250 ease-out-soft group-open/city:rotate-180 motion-reduce:transition-none"
                    aria-hidden
                  />
                </summary>
                <div className="border-t border-line px-4 pb-2">
                  {phone ? (
                    <p className="pt-3">
                      <PhoneLink icons={icons} phone={phone} label={fill(texts.call, { place: group.name })} />
                    </p>
                  ) : null}
                  <ul className="divide-y divide-line">
                    {rows.map((point) => (
                      <PointRow
                        key={point.id}
                        icons={icons}
                        point={point}
                        lang={lang}
                        texts={texts}
                        showMap={showMap && !point.customAddresses}
                        showPhone={point.phone !== phone}
                      />
                    ))}
                  </ul>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** One pin per town, in the list's order; the town's key matches its fold's `data-fold`. */
function mapTowns(groups: CityGroup[], blockId: string, lang: Lang, texts: Texts, cityLinks: PlaceLink[]): MapTown[] {
  return groups.map((group, index) => {
    const rows = [...group.fixed, ...group.delivery];
    return {
      key: townKey(index),
      name: group.name,
      href: townPage(cityLinks, group) ?? `#${foldId(blockId, group)}`,
      label: `${group.name}, ${countLabel(lang, rows.length, texts.pointCount)}`,
      airportOnly: group.fixed.length > 0 && group.fixed.every((point) => point.airport),
      positions: rows.flatMap((point): [number, number][] =>
        point.latitude !== null && point.longitude !== null ? [[point.latitude, point.longitude]] : [],
      ),
      size: rows.length,
    };
  });
}

function townKey(index: number): string {
  return `town-${index}`;
}

function foldId(blockId: string, group: CityGroup): string {
  return `${cityId(blockId, group)}-fold`;
}

/** A town with its own page links there (`shortName` or title, e.g. "Kraków"); else to its fold. */
function townPage(cityLinks: PlaceLink[], group: CityGroup): string | null {
  return cityLinks.find((link) => sameCity(link.label, group.name) || sameCity(link.label, group.city))?.href ?? null;
}

function cityId(blockId: string, group: CityGroup): string {
  return `locations-${blockId}-${group.city.toLocaleLowerCase("pl").replace(/\s+/g, "-")}`;
}

/** Shown before the rest of a town's points fold away under "Show all". */
const VISIBLE_POINTS = 4;

function CityCard({
  group,
  blockId,
  lang,
  texts,
  showMap,
}: {
  group: CityGroup;
  blockId: string;
  lang: Lang;
  texts: Texts;
  showMap: boolean;
}) {
  const headingId = cityId(blockId, group);
  const rows = [...group.fixed, ...group.delivery];
  // Most points share the hotline: shown once under the town, on a row only when it differs.
  const phone = mostCommon(rows.map((point) => point.phone));
  const icons = iconPrefix(blockId);
  const row = (point: ServicePoint) => (
    <PointRow
      key={point.id}
      icons={icons}
      point={point}
      lang={lang}
      texts={texts}
      showMap={showMap && !point.customAddresses}
      showPhone={point.phone !== phone}
    />
  );
  return (
    <section aria-labelledby={headingId} className="rounded-card border border-line bg-white p-5 text-blue-dark shadow-card">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 id={headingId} className="flex items-center gap-2 text-subtitle">
          <UseIcon prefix={icons} name="other" className="size-5 text-blue-medium" />
          {group.name}
        </h3>
        {phone ? <PhoneLink icons={icons} phone={phone} label={fill(texts.call, { place: group.name })} /> : null}
      </div>
      <ul className="mt-2 divide-y divide-line">{rows.slice(0, VISIBLE_POINTS).map(row)}</ul>
      {rows.length > VISIBLE_POINTS ? (
        <details className="group/more">
          <summary className="mt-1 cursor-pointer list-none py-2 text-sm font-semibold text-blue-medium marker:hidden focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-medium group-open/more:hidden [&::-webkit-details-marker]:hidden">
            {fill(texts.showAll, { count: String(rows.length) })}
          </summary>
          <ul className="divide-y divide-line border-t border-line">{rows.slice(VISIBLE_POINTS).map(row)}</ul>
        </details>
      ) : null}
    </section>
  );
}

const LINK_CLASS =
  "inline-flex items-center gap-1 underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-medium";

function PhoneLink({ icons, phone, label }: { icons: string; phone: string; label: string }) {
  return (
    <a
      href={`tel:${phone.replace(/[^\d+]/g, "")}`}
      aria-label={`${label} ${phone}`}
      className={`${LINK_CLASS} text-sm font-semibold text-blue-dark/80`}
    >
      <UseIcon prefix={icons} name="phone" className="size-4" />
      {phone}
    </a>
  );
}

function PointRow({
  icons,
  point,
  lang,
  texts,
  showMap,
  showPhone,
}: {
  icons: string;
  point: ServicePoint;
  lang: Lang;
  texts: Texts;
  showMap: boolean;
  showPhone: boolean;
}) {
  const kind = pointKind(point);
  const label = kind === "other" ? null : texts[kind];
  const book = reservationHref(lang, "short", new URLSearchParams({ [QUERY_KEYS.pickup]: String(point.id) }));
  const map =
    showMap && point.latitude !== null && point.longitude !== null
      ? `https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`
      : null;
  const details = placeDetails(lang, point, texts);
  return (
    <li className="flex items-start gap-3 py-3">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-blue-light text-blue-medium">
        <UseIcon prefix={icons} name={kind} className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="leading-snug font-semibold text-pretty">
          {point.name}
          {label ? (
            <span className="ml-2 inline-block rounded-full bg-tint px-2 py-0.5 align-middle text-xxs font-semibold tracking-wide text-blue-medium uppercase">
              {label}
            </span>
          ) : null}
        </p>
        {details ? <p className="text-sm text-muted-dark">{details}</p> : null}
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold">
          <Link href={book} aria-label={fill(texts.bookLabel, { place: point.name })} className={`${LINK_CLASS} text-blue-medium`}>
            {texts.book} →
          </Link>
          {map ? (
            <a
              href={map}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={fill(texts.mapLabel, { place: point.name })}
              className={`${LINK_CLASS} text-blue-dark/80`}
            >
              {texts.map}
            </a>
          ) : null}
          {showPhone && point.phone ? (
            <PhoneLink icons={icons} phone={point.phone} label={fill(texts.call, { place: point.name })} />
          ) : null}
        </p>
      </div>
    </li>
  );
}

function mostCommon(values: (string | null)[]): string | null {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (value) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts].toSorted((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function ListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {[0, 1, 2].map((index) => (
        <div key={index} className="h-72 animate-pulse rounded-card bg-surface motion-reduce:animate-none" />
      ))}
    </div>
  );
}

type Kind = "office" | "airport" | "station" | "other" | "delivery";

function iconPrefix(blockId: string): string {
  return `locations-${blockId}-icon`;
}

const KIND_ICONS = {
  office: Building2,
  airport: Plane,
  station: TrainFront,
  other: MapPin,
  delivery: Truck,
} as const;
const KIND_ORDER: Kind[] = ["office", "airport", "station", "other", "delivery"];

function pointKind(point: ServicePoint): Kind {
  if (point.customAddresses) {
    return "delivery";
  }
  if (point.airport) {
    return "airport";
  }
  if (point.office) {
    return "office";
  }
  return point.trainStation ? "station" : "other";
}

function matches(filter: LocationsBlock["filter"], city: string | null, point: ServicePoint): boolean {
  switch (filter) {
    case "airports":
      return point.airport && !point.customAddresses;
    case "city":
      return city === null || sameCity(point.city, city);
    default:
      return true;
  }
}

function sameCity(a: string | null, b: string | null): boolean {
  return a !== null && b !== null && a.trim().toLocaleLowerCase("pl") === b.trim().toLocaleLowerCase("pl");
}

/** Towns with the most fixed points first (Warsaw), then by name; kinds in `KIND_ORDER` inside each. */
function groupByCity(points: ServicePoint[]): CityGroup[] {
  const groups = new Map<string, CityGroup>();
  for (const point of points) {
    const city = point.city?.trim();
    if (!city) {
      continue;
    }
    const group = groups.get(city) ?? {
      city,
      name: point.cityName?.trim() || city,
      fixed: [],
      delivery: [],
    };
    (point.customAddresses ? group.delivery : group.fixed).push(point);
    groups.set(city, group);
  }
  const rank = (point: ServicePoint) => KIND_ORDER.indexOf(pointKind(point));
  return [...groups.values()]
    .filter((group) => group.fixed.length > 0 || group.delivery.length > 0)
    .map((group) => ({
      ...group,
      fixed: group.fixed.toSorted((a, b) => rank(a) - rank(b)),
    }))
    .toSorted((a, b) => b.fixed.length - a.fixed.length || a.name.localeCompare(b.name));
}
