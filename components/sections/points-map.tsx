"use client";

import { MapPinned, Phone, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

import { KINDS, type MapKind } from "./map-kinds";

export type MapPoint = {
  id: number;
  kind: MapKind;
  name: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  lat: number;
  lng: number;
};

export type MapTexts = Record<MapKind, string> & { label: string; loading: string; route: string; close: string; cluster: string; unavailable: string };

/**
 * The map in the site's colours: a pale blue-grey land, white roads, light
 * blue water, navy borders; no shops, sights or transit icons competing with
 * our markers. Styles in code (no cloud Map ID), so they need no console setup.
 */
const STYLES = [
  { elementType: "geometry", stylers: [{ color: "#eef3f8" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5c6166" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#083052" }, { weight: 1.2 }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#a8bdd1" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#083052" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#eaf1f8" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#d5e4f2" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9dcee" }] },
];

/** Markers closer than this on screen are drawn as one numbered bubble. */
const CLUSTER_PX = 44;

// The few Google Maps API members used here (no `@types/google.maps` dependency).
type LatLng = { lat(): number; lng(): number };
type Listener = { remove(): void };
type GMap = {
  fitBounds(bounds: Bounds, padding?: number | { top: number; right: number; bottom: number; left: number }): void;
  getZoom(): number | undefined;
  setZoom(zoom: number): void;
  panTo(position: { lat: number; lng: number }): void;
  panBy(x: number, y: number): void;
  addListener(event: string, handler: () => void): Listener;
};
type Bounds = { extend(point: LatLng): void };
type Projection = { fromLatLngToDivPixel(point: LatLng): { x: number; y: number } | null };
type Overlay = { setMap(map: GMap | null): void; getPanes(): { overlayMouseTarget: HTMLElement } | null; getProjection(): Projection };
type Maps = {
  Map: new (element: HTMLElement, options: object) => GMap;
  LatLng: new (lat: number, lng: number) => LatLng;
  LatLngBounds: new () => Bounds;
  OverlayView: (new () => Overlay) & { preventMapHitsAndGesturesFrom(element: HTMLElement): void };
  ControlPosition: { LEFT_BOTTOM: number; RIGHT_BOTTOM: number };
};

declare global {
  interface Window {
    google?: { maps: Maps };
    gm_authFailure?: () => void;
    __mobicarsMapsReady?: () => void;
  }
}

let loading: Promise<Maps> | null = null;

/** The Maps JavaScript API, once per page, asynchronously; a failed load can be tried again. */
function loadMaps(key: string, lang: string): Promise<Maps> {
  if (window.google?.maps?.OverlayView) return Promise.resolve(window.google.maps);
  loading ??= new Promise<Maps>((resolve, reject) => {
    window.__mobicarsMapsReady = () => (window.google ? resolve(window.google.maps) : reject(new Error("maps")));
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=__mobicarsMapsReady&language=${lang}&region=PL`;
    script.async = true;
    script.onerror = () => {
      loading = null;
      reject(new Error("maps"));
    };
    document.head.append(script);
  });
  return loading;
}

type Spot = { x: number; y: number; points: MapPoint[] };
type Placed = { point: MapPoint; at: { x: number; y: number } | null };

/**
 * The pickup points on a Google map (the section's client part). The API
 * loads only when the map nears the screen, so it costs nothing on the first
 * paint; until then, and if it fails, the frame keeps its size (no layout
 * shift). Markers are our own buttons on one overlay (in the tab order, with
 * a name for screen readers): an icon in the kind's colour, numbered bubbles
 * where points crowd (a click zooms in). A marker opens a popup with the
 * point's name, address, phone and a route link; Escape or a click on the map
 * closes it and focus returns to the marker.
 *
 * `kinds` hides the other kinds' markers (the legend's filter; the view
 * fits the rest). `selectedId` / `onSelect` let a list beside the map open a
 * point: the map pans to it, zooms in when it sits in a bubble, and opens its
 * popup without taking the focus from the list. `cover`: the width (px) a
 * card over the map's right side takes on desktops; fitting and centring
 * leave it out, and the zoom buttons move to the left.
 */
export function PointsMap({
  points,
  apiKey,
  lang,
  t,
  className = "aspect-[4/5] rounded-card sm:aspect-[16/10] lg:aspect-[21/9]",
  kinds,
  selectedId: controlledId,
  onSelect,
  cover = 0,
}: {
  points: MapPoint[];
  apiKey: string;
  lang: string;
  t: MapTexts;
  /** The frame's proportions (fixed, so nothing shifts while the map loads) and corners. */
  className?: string;
  /** The kinds shown; all without it. */
  kinds?: ReadonlySet<MapKind>;
  /** The open point, when a list beside the map shares it; else the map keeps its own. */
  selectedId?: number | null;
  onSelect?: (id: number | null, from: "map") => void;
  cover?: number;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const map = useRef<{ map: GMap; maps: Maps } | null>(null);
  const markers = useRef(new Map<number, HTMLButtonElement>());
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [ownId, setOwnId] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "ready" | "failed">("idle");
  const selectedId = controlledId === undefined ? ownId : controlledId;
  // A marker press moves the focus into the popup; a pick in the list leaves it there.
  const focusPopup = useRef(false);
  const visible = useMemo(() => (kinds ? points.filter((point) => kinds.has(point.kind)) : points), [points, kinds]);
  const spots = useMemo(() => cluster(placed.filter((each) => !kinds || kinds.has(each.point.kind))), [placed, kinds]);
  const selectedAt = selectedId === null ? null : placed.find((each) => each.point.id === selectedId && each.at);
  const selected = selectedAt?.at && visible.some((point) => point.id === selectedId) ? { point: selectedAt.point, ...selectedAt.at } : null;

  function select(id: number | null) {
    if (controlledId === undefined) setOwnId(id);
    onSelect?.(id, "map");
  }

  useEffect(() => {
    const root = frame.current;
    if (!root) return;
    let cleanup: (() => void) | null = null;
    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        window.gm_authFailure = () => setStatus("failed");
        loadMaps(apiKey, lang).then(
          (maps) => {
            if (cancelled || !canvas.current) return;
            cleanup = start(maps, canvas.current);
          },
          () => setStatus("failed"),
        );
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(root);

    function start(maps: Maps, element: HTMLDivElement) {
      const instance = new maps.Map(element, {
        styles: STYLES,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: { position: cover ? maps.ControlPosition.LEFT_BOTTOM : maps.ControlPosition.RIGHT_BOTTOM },
        gestureHandling: "cooperative",
        clickableIcons: false,
        backgroundColor: "#eaf1f8",
        // Fractional zoom: the points fill the wide frame instead of the nearest whole zoom level, which leaves much of Europe around them.
        isFractionalZoomEnabled: true,
        center: { lat: 52.07, lng: 19.48 },
        zoom: 6,
      });
      map.current = { map: instance, maps };
      const container = document.createElement("div");
      maps.OverlayView.preventMapHitsAndGesturesFrom(container);
      const positions = (projection: Projection) =>
        points.map((point) => ({ point, at: projection.fromLatLngToDivPixel(new maps.LatLng(point.lat, point.lng)) }));
      const overlay = new (class extends maps.OverlayView {
        onAdd() {
          this.getPanes()?.overlayMouseTarget.append(container);
          setLayer(container);
        }
        draw() {
          setPlaced(positions(this.getProjection()));
        }
        onRemove() {
          container.remove();
        }
      })();
      overlay.setMap(instance);
      // Once the map knows its size: fitting before that frames a wider area than the points need.
      const first = instance.addListener("idle", () => {
        first.remove();
        fit(points);
      });
      const close = instance.addListener("click", () => select(null));
      setStatus("ready");
      return () => {
        close.remove();
        overlay.setMap(null);
      };
    }

    return () => {
      cancelled = true;
      observer.disconnect();
      cleanup?.();
    };
    // The points and texts come from the server render and do not change on the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, lang, points]);

  // The legend's filter: the view fits the kinds left (not on the first render: the first fit waits for the map's size).
  const filtered = useRef(false);
  useEffect(() => {
    if (!filtered.current) {
      filtered.current = true;
      return;
    }
    if (visible.length > 0) fit(visible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // The open point: centred a little low (room for the popup above it), and zoomed in when it shares a bubble.
  useEffect(() => {
    const point = points.find((each) => each.id === selectedId);
    if (!point || !map.current || status !== "ready") return;
    const instance = map.current.map;
    const inBubble = spots.some((spot) => spot.points.length > 1 && spot.points.some((each) => each.id === point.id));
    if (inBubble) instance.setZoom(Math.max(instance.getZoom() ?? 0, 12));
    instance.panTo({ lat: point.lat, lng: point.lng });
    instance.panBy(covered() / 2, -110);
    // Only when another point opens, not on every redraw.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, status]);

  /** Zooms to the given points (all of them at first), never closer than a street view. */
  function fit(group: MapPoint[]) {
    if (!map.current) return;
    const { map: instance, maps } = map.current;
    const bounds = new maps.LatLngBounds();
    group.forEach((point) => bounds.extend(new maps.LatLng(point.lat, point.lng)));
    instance.fitBounds(bounds, { top: 56, bottom: 56, left: 56, right: 56 + covered() });
    const once = instance.addListener("idle", () => {
      once.remove();
      if ((instance.getZoom() ?? 0) > 15) instance.setZoom(15);
    });
  }

  /** The card's width over the map, on desktops only (on phones it stands above the map). */
  function covered() {
    return cover && window.matchMedia("(min-width: 1024px)").matches ? cover : 0;
  }

  function open(point: MapPoint) {
    focusPopup.current = true;
    select(point.id);
  }

  function close() {
    const id = selectedId;
    select(null);
    if (id !== null) markers.current.get(id)?.focus({ preventScroll: true });
  }

  return (
    <div ref={frame} className={`relative w-full overflow-clip bg-tint ${className}`}>
      <div ref={canvas} role="region" aria-label={t.label} className="absolute inset-0" />
      {status !== "ready" ? (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-blue-dark/70">
          {status === "failed" ? (
            <div className="max-w-md text-left">
              <p className="mb-3 font-semibold text-blue-dark">{t.unavailable}</p>
              <ul className="flex flex-col gap-1 text-sm">
                {points.map((point) => (
                  <li key={point.id}>{[point.name, point.address].filter(Boolean).join(" – ")}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-sm">
              <MapPinned aria-hidden className="size-5 text-blue-medium" />
              {t.loading}
            </p>
          )}
        </div>
      ) : null}
      {layer
        ? createPortal(
            <>
              {spots.map((spot) =>
                spot.points.length === 1 ? (
                  <Marker
                    key={spot.points[0].id}
                    ref={(element) => {
                      if (element) markers.current.set(spot.points[0].id, element);
                      else markers.current.delete(spot.points[0].id);
                    }}
                    spot={spot}
                    active={selectedId === spot.points[0].id}
                    label={`${t[spot.points[0].kind]}: ${spot.points[0].name}`}
                    onPress={() => open(spot.points[0])}
                  />
                ) : (
                  <button
                    key={spot.points.map((point) => point.id).join("-")}
                    type="button"
                    onClick={() => {
                      select(null);
                      fit(spot.points);
                    }}
                    aria-label={t.cluster.replace("{count}", String(spot.points.length))}
                    style={{ left: spot.x, top: spot.y }}
                    className="absolute grid size-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white text-sm font-bold text-blue-dark ring-4 ring-blue-dark/15 outline-none transition-transform hover:scale-110 focus-visible:ring-blue-medium motion-reduce:transition-none"
                  >
                    {spot.points.length}
                  </button>
                ),
              )}
              {selected ? <Popup selected={selected} t={t} onClose={close} focusRef={focusPopup} /> : null}
            </>,
            layer,
          )
        : null}
    </div>
  );
}

function Marker({ spot, active, label, onPress, ref }: { spot: Spot; active: boolean; label: string; onPress: () => void; ref: (element: HTMLButtonElement | null) => void }) {
  const { icon: Icon, colour } = KINDS[spot.points[0].kind];
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      aria-expanded={active}
      onClick={onPress}
      style={{ left: spot.x, top: spot.y, zIndex: active ? 2 : 1 }}
      className={`absolute grid size-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-white ring-[3px] ring-white outline-none transition-transform hover:scale-110 focus-visible:ring-blue-medium motion-reduce:transition-none ${colour} ${active ? "scale-115" : ""}`}
    >
      <Icon aria-hidden className="size-5" />
    </button>
  );
}

/** The popup over the chosen marker: kind, name, address, phone and a route link (Google Maps, new tab). */
function Popup({ selected, t, onClose, focusRef }: { selected: { point: MapPoint; x: number; y: number }; t: MapTexts; onClose: () => void; focusRef: RefObject<boolean> }) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const { point } = selected;
  const { icon: Icon, colour } = KINDS[point.kind];
  useEffect(() => {
    // Opened from its marker: the focus moves in. From the list: it stays in the list.
    if (focusRef.current) closeButton.current?.focus({ preventScroll: true });
    focusRef.current = false;
  }, [point.id, focusRef]);
  return (
    <div
      role="dialog"
      aria-label={point.name}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      style={{ left: selected.x, top: selected.y, zIndex: 3 }}
      className="absolute w-72 -translate-x-1/2 -translate-y-[calc(100%+1.75rem)] cursor-default rounded-2xl bg-white p-4 text-left text-blue-dark ring-1 ring-line"
    >
      <button
        ref={closeButton}
        type="button"
        onClick={onClose}
        aria-label={t.close}
        className="absolute top-2 right-2 grid size-8 cursor-pointer place-items-center rounded-full text-blue-dark/70 outline-none hover:bg-tint focus-visible:ring-2 focus-visible:ring-blue-medium"
      >
        <X aria-hidden className="size-4" />
      </button>
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-blue-medium uppercase">
        <span aria-hidden className={`grid size-6 place-items-center rounded-full text-white ${colour}`}>
          <Icon className="size-3.5" />
        </span>
        {t[point.kind]}
      </p>
      <p className="pr-6 font-bold leading-snug text-balance">{point.name}</p>
      {point.address || point.city ? <p className="mt-1 text-sm text-blue-dark/75">{[point.address, point.city].filter(Boolean).join(", ")}</p> : null}
      {point.phone ? (
        <a href={`tel:${point.phone.replace(/[^\d+]/g, "")}`} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-medium hover:underline">
          <Phone aria-hidden className="size-4" />
          {point.phone}
        </a>
      ) : null}
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex h-10 items-center justify-center rounded-full bg-blue-medium px-4 text-sm font-bold text-white hover:bg-blue-dark"
      >
        {t.route}
      </a>
      {/* The pointer under the card, towards the marker. */}
      <span aria-hidden className="absolute -bottom-2 left-1/2 size-4 -translate-x-1/2 rotate-45 bg-white" />
    </div>
  );
}

/** Groups markers closer than `CLUSTER_PX` on screen (greedy, in the points' order). */
function cluster(placed: Placed[]): Spot[] {
  const spots: Spot[] = [];
  for (const { point, at } of placed) {
    if (!at) continue;
    const near = spots.find((spot) => Math.hypot(spot.x - at.x, spot.y - at.y) < CLUSTER_PX);
    if (near) {
      near.points.push(point);
    } else {
      spots.push({ x: at.x, y: at.y, points: [point] });
    }
  }
  return spots;
}
