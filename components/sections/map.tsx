import { CtaLink } from "@/components/blocks/cta-link";
import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { listServicePoints } from "@/lib/rentcarsoft";
import { isDarkBackground, type MapSection } from "@/lib/strapi";

import type { MapKind } from "./map-kinds";
import { PointsExplorer, type ExplorerTexts } from "./points-explorer";
import type { MapPoint } from "./points-map";
import { SECTION_CTA_SIZE, SectionHeading, SectionShell } from "./section-shell";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

/**
 * Map (`sections.map`): the RentCarSoft pickup points that are an airport, a
 * station or an office (`ServicePoint.airport`, `trainStation`, `office`) on
 * a Google map in the site's colours (`PointsMap`). With `showLegend` a
 * legend under it that filters the kinds; with `showList` a searchable list of the points
 * beside the map (above it on phones); with `fullBleed` the map runs from
 * side to side of the section (`PointsExplorer`). The points come from the
 * cached RentCarSoft list; the section holds only its heading and looks. Left out without the Maps key, without points, or
 * when RentCarSoft is down (the page stays up).
 */
export async function MapBlock({ section, lang }: { section: MapSection; lang: Lang }) {
  const points = await loadMapPoints(lang, `sections.map ${section.id}`);
  if (points.length === 0) {
    return null;
  }
  const headingId = `map-${section.id}`;

  return (
    <SectionShell background={section.background} spacing={section.spacing} width={section.width} labelledBy={section.title ? headingId : undefined}>
      <SectionHeading id={headingId} badge={section.badge} title={section.title} text={section.text} align={section.headerAlign} background={section.background} />
      <PointsExplorer
        points={points}
        apiKey={API_KEY}
        lang={lang}
        t={explorerTexts(lang)}
        list={section.showList}
        bleed={section.fullBleed}
        legend={section.showLegend}
        dark={isDarkBackground(section.background)}
        centered={section.headerAlign === "center"}
      />
      {section.ctas.length > 0 ? (
        <div className={`mt-10 flex flex-col gap-3 sm:flex-row ${section.headerAlign === "center" ? "sm:justify-center" : ""}`}>
          {section.ctas.map((cta) => (
            <CtaLink key={`${cta.href}-${cta.label}`} cta={cta} size={SECTION_CTA_SIZE} />
          ))}
        </div>
      ) : null}
    </SectionShell>
  );
}

/**
 * The airports, stations and offices with coordinates from the cached
 * RentCarSoft list; none without the Maps key or when RentCarSoft is down
 * (logged under `where`). Shared by Map and Two columns.
 */
export async function loadMapPoints(lang: Lang, where: string): Promise<MapPoint[]> {
  if (!API_KEY) {
    return [];
  }
  const all = await listServicePoints({ lang }).catch((error: unknown) => {
    console.error(`[${where}] RentCarSoft unavailable, the map is left out`, error);
    return [];
  });
  return all.flatMap((point): MapPoint[] => {
    const kind: MapKind | null = point.airport ? "airport" : point.trainStation ? "station" : point.office ? "office" : null;
    return kind && point.latitude !== null && point.longitude !== null
      ? [
          {
            id: point.id,
            kind,
            name: point.names[lang] ?? point.name,
            city: point.cityName ?? point.city,
            address: point.addressNote,
            phone: point.phone,
            lat: point.latitude,
            lng: point.longitude,
          },
        ]
      : [];
  });
}

/** The map, with or without its legend (a filter of the kinds), and no list: Two columns' half. */
export function PointsMapView({ points, lang, dark, legend }: { points: MapPoint[]; lang: Lang; dark: boolean; legend: boolean }) {
  // As the photo: 4:3 on phones, at least 4:5 on desktops and as tall as the content beside it.
  return <PointsExplorer points={points} apiKey={API_KEY} lang={lang} t={explorerTexts(lang)} list={false} dark={dark} centered={false} legend={legend} fill="aspect-[4/3] lg:aspect-[4/5]" />;
}

function explorerTexts(lang: Lang): ExplorerTexts {
  const t = getMessages(lang).blocks;
  const legend: Record<MapKind, string> = { airport: t.mapAirports, station: t.mapStations, office: t.mapOffices };
  return {
    airport: t.mapAirport,
    station: t.mapStation,
    office: t.mapOffice,
    label: t.mapLabel,
    loading: t.mapLoading,
    route: t.mapRoute,
    close: t.mapClose,
    cluster: t.mapCluster,
    unavailable: t.mapUnavailable,
    legend,
    filter: t.mapFilter,
    points: t.mapPoints,
    search: t.mapSearch,
    noResults: t.mapNoResults,
  };
}
