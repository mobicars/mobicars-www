"use client";

import { Search } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { ListBox, ListBoxItem, ToggleButton, ToggleButtonGroup } from "react-aria-components";

import { KINDS, type MapKind } from "./map-kinds";
import { PointsMap, type MapPoint, type MapTexts } from "./points-map";

const ORDER: MapKind[] = ["airport", "station", "office"];

export type ExplorerTexts = MapTexts & {
  legend: Record<MapKind, string>;
  filter: string;
  points: string;
  search: string;
  noResults: string;
};

/**
 * The pickup points map, with `legend` its legend as a filter (a toggle per
 * kind: the markers and the list show only the kinds on; one stays on), with `list`
 * a list of the points: beside the map on desktops, as tall as it; above it on
 * phones, low (three and a half rows), scrolling inside. The list's search
 * and look are the booking place dialog's. Picking a point opens it on the
 * map; a marker pressed on the map marks its row. The page scrolls to the map
 * only when it is mostly off screen. The list is in the HTML from the start,
 * before the map loads.
 *
 * `bleed`: the map runs from side to side of the section (the window with
 * `full`, the box with `boxed` and `contained`: the section clips it), square
 * cornered; the list then floats over its right side on desktops.
 */
export function PointsExplorer({
  points,
  apiKey,
  lang,
  t,
  list,
  dark,
  centered,
  bleed = false,
  legend: withLegend = false,
  fill,
  mapClassName,
}: {
  points: MapPoint[];
  apiKey: string;
  lang: string;
  t: ExplorerTexts;
  list: boolean;
  dark: boolean;
  centered: boolean;
  bleed?: boolean;
  /** The legend under the map, a filter of the kinds. */
  legend?: boolean;
  /**
   * Fill the parent's height (Two columns): the map at least as tall as this
   * frame (an empty box sets it) and taller when the parent is; the legend under it.
   */
  fill?: string;
  mapClassName?: string;
}) {
  const present = ORDER.filter((kind) => points.some((point) => point.kind === kind));
  const [kinds, setKinds] = useState<ReadonlySet<MapKind>>(() => new Set(present));
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const frame = useRef<HTMLDivElement>(null);
  const rows = useRef<HTMLDivElement>(null);

  const sorted = useMemo(
    () =>
      [...points].sort(
        (a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || (a.city ?? a.name).localeCompare(b.city ?? b.name, lang) || a.name.localeCompare(b.name, lang),
      ),
    [points, lang],
  );
  const needle = query.trim().toLocaleLowerCase(lang);
  const shown = sorted.filter(
    (point) => kinds.has(point.kind) && (!needle || [point.name, point.city, point.address].some((value) => value?.toLocaleLowerCase(lang).includes(needle))),
  );

  // A marker pressed on the map: its row is marked and scrolled into the list's view (the list only, never the page).
  const fromMap = useCallback((id: number | null) => {
    setSelectedId(id);
    if (id === null) return;
    requestAnimationFrame(() => {
      const box = rows.current;
      const row = box?.querySelector<HTMLElement>(`[data-point="${id}"]`);
      if (!box || !row) return;
      const top = row.offsetTop - box.offsetTop;
      if (top < box.scrollTop || top + row.offsetHeight > box.scrollTop + box.clientHeight) {
        box.scrollTo({ top: top - 8, behavior: reducedMotion() ? "auto" : "smooth" });
      }
    });
  }, []);

  function fromList(id: number) {
    setSelectedId(id);
    // Phones: the map stands under the list. Brought into view only when less than half of it shows.
    const box = frame.current?.getBoundingClientRect();
    if (box && Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 0) < box.height / 2) {
      frame.current?.scrollIntoView({ block: "nearest", behavior: reducedMotion() ? "auto" : "smooth" });
    }
  }

  const legend = withLegend ? (
    <ToggleButtonGroup
      aria-label={t.filter}
      selectionMode="multiple"
      disallowEmptySelection
      selectedKeys={kinds}
      onSelectionChange={(keys) => {
        const next = new Set([...keys].map(String) as MapKind[]);
        setKinds(next);
        if (selectedId !== null && !next.has(points.find((point) => point.id === selectedId)?.kind ?? "office")) setSelectedId(null);
      }}
      className={`mt-5 flex flex-wrap gap-2 ${centered && !list ? "justify-center" : ""}`}
    >
      {present.map((kind) => {
        const { icon: Icon, colour } = KINDS[kind];
        const count = points.filter((point) => point.kind === kind).length;
        return (
          <ToggleButton
            key={kind}
            id={kind}
            className={`group flex h-10 cursor-pointer items-center gap-2 rounded-full border pr-3.5 pl-1.5 text-sm font-semibold outline-none transition-colors duration-200 ease-out data-focus-visible:ring-2 data-focus-visible:ring-offset-2 motion-reduce:transition-none ${
              dark
                ? "border-white/30 text-white/70 hover:border-white/60 data-focus-visible:ring-white data-focus-visible:ring-offset-blue-dark data-selected:border-white data-selected:bg-white data-selected:text-blue-dark"
                : "border-blue-dark/15 text-blue-dark/75 hover:border-blue-medium/50 data-focus-visible:ring-blue-medium data-selected:border-blue-medium/30 data-selected:bg-white data-selected:text-blue-dark"
            }`}
          >
            <span aria-hidden className={`grid size-7 place-items-center rounded-full text-white transition-opacity group-data-selected:opacity-100 ${colour} opacity-40`}>
              <Icon className="size-4" />
            </span>
            {t.legend[kind]} ({count})
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  ) : null;

  const mapView = (
    <PointsMap
      points={points}
      apiKey={apiKey}
      lang={lang}
      t={t}
      className={
        fill
          ? "h-full rounded-card"
          : bleed
            ? "aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/7]"
            : list
              ? "aspect-square rounded-card sm:aspect-[16/10] lg:aspect-[4/3]"
              : mapClassName
      }
      kinds={kinds}
      selectedId={selectedId}
      onSelect={fromMap}
      // The list's card over the map: `w-96` plus the section's side padding and a margin.
      cover={bleed && list ? 460 : 0}
    />
  );
  const map = (
    // Bleed: out to the window's sides; the section's `overflow-clip` cuts it at its own (the window, or the box).
    <div ref={frame} className={`scroll-mt-24 ${bleed ? "mx-[calc(50%-50vw)]" : ""} ${fill ? "relative min-h-0 flex-1" : ""}`}>
      {fill ? (
        <>
          <div aria-hidden className={fill} />
          <div className="absolute inset-0">{mapView}</div>
        </>
      ) : (
        mapView
      )}
    </div>
  );

  if (!list) {
    return fill ? (
      <div className="flex h-full flex-col">
        {map}
        {legend}
      </div>
    ) : (
      <>
        {map}
        {legend}
      </>
    );
  }

  const panel = (
    <>
      <label className="relative block shrink-0">
        <span className="sr-only">{t.search}</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-blue-medium" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.search}
          className="h-12 w-full rounded-xl border border-blue-dark/15 bg-white pr-3 pl-11 text-base text-blue-dark outline-none transition-[border-color,background-color] duration-200 ease-out hover:border-blue-medium/50 focus:border-blue-medium motion-reduce:transition-none"
        />
      </label>
      <div ref={rows} className="mt-3 h-56 overflow-y-auto overscroll-contain lg:h-auto lg:min-h-0 lg:flex-1">
        {shown.length === 0 ? (
          <p role="status" className={`text-sm ${dark ? `text-white/80 ${bleed ? "lg:text-blue-dark/70" : ""}` : "text-blue-dark/70"}`}>
            {t.noResults.replace("{query}", query.trim())}
          </p>
        ) : (
          // As in the place dialog: one tab stop, arrows through the points, typing jumps; the open one again re-opens it.
          <ListBox
            aria-label={t.points}
            selectionMode="single"
            selectedKeys={selectedId === null ? [] : [String(selectedId)]}
            onSelectionChange={(keys) => {
              const [key] = keys === "all" ? [] : keys;
              const id = key === undefined ? selectedId : Number(key);
              if (id !== null) fromList(id);
            }}
            className="flex flex-col gap-2 pb-1 outline-none"
          >
            {shown.map((point) => {
              const { icon: Icon } = KINDS[point.kind];
              return (
                <ListBoxItem
                  key={point.id}
                  id={String(point.id)}
                  textValue={point.name}
                  data-point={point.id}
                  className={({ isSelected }) =>
                    `flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-left outline-none transition-colors duration-200 ease-out data-focus-visible:ring-2 data-focus-visible:ring-blue-medium data-focus-visible:ring-inset motion-reduce:transition-none ${
                      isSelected
                        ? "border-blue-medium bg-blue-medium text-white hover:border-blue-dark hover:bg-blue-dark"
                        : "border-blue-light bg-white text-blue-dark hover:border-blue-medium/40 hover:bg-[color-mix(in_srgb,var(--color-blue-dark)_4%,white)]"
                    }`
                  }
                >
                  {({ isSelected }) => (
                    <>
                      <Icon className={`size-5 shrink-0 ${isSelected ? "text-white" : "text-blue-medium"}`} strokeWidth={1.75} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">{point.name}</span>
                        {point.address || point.city ? (
                          <span className={`block truncate text-xs ${isSelected ? "text-white/80" : "text-blue-dark/75"}`}>
                            {[point.address, point.city].filter(Boolean).join(", ")}
                          </span>
                        ) : null}
                      </span>
                    </>
                  )}
                </ListBoxItem>
              );
            })}
          </ListBox>
        )}
      </div>
    </>
  );

  if (bleed) {
    // Phones: the list above the map. Desktops: a card over the map's right side, inside the page's width.
    return (
      <>
        <div className="relative flex flex-col gap-4">
          <div className="flex h-auto flex-col lg:absolute lg:inset-y-6 lg:right-0 lg:z-10 lg:w-96 lg:rounded-card lg:bg-white lg:p-4 lg:ring-1 lg:ring-line">{panel}</div>
          <div className="order-last lg:order-none">{map}</div>
        </div>
        {legend}
      </>
    );
  }

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="min-w-0 lg:col-span-2">{map}</div>
        {/* Above the map on phones; beside it on desktops, as tall as the map (the list's box adds no height to the row). */}
        <div className="order-first min-w-0 lg:relative lg:order-last">
          <div className="flex flex-col lg:absolute lg:inset-0">{panel}</div>
        </div>
      </div>
      {legend}
    </>
  );
}

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
