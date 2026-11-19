import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { FleetBrowser } from "@/components/fleet/fleet-browser";
import { FleetCard } from "@/components/fleet/fleet-card";
import { buttonClass } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section";
import { cardClass, Rail, RailItem } from "@/components/ui/surface";
import type { Lang } from "@/i18n/config";
import { fill, getMessages } from "@/i18n/messages";
import { fleetHref } from "@/i18n/routes";
import { absoluteUrl, jsonLd } from "@/lib/fleet/seo";
import { cacheEnabled } from "@/lib/cache";
import { listFleetCarIdsAt, listFleetCars, type FleetCard as FleetCardData } from "@/lib/fleet/cars";
import { selectBlockCars } from "@/lib/fleet/cars-block";
import type { CarsBlock, CarsTab } from "@/lib/strapi";

import { CarCategories } from "./car-categories";
import { LazyScenarioTabs } from "./scenario-tabs-lazy";
import { SectionFrame } from "./section-frame";

/**
 * The CMS fleet block: all cars, chosen price classes or a category
 * (electric, delivery, family, automatic), as the fleet card of
 * `components/fleet/fleet-card.tsx`. Server-rendered, no client JavaScript.
 * The cars come from the one cached catalog list the fleet page reads, so a
 * page with several blocks makes no extra RentCarSoft request.
 *
 * Layout `row` is a swipeable row on phones (CSS scroll snap, the next card
 * peeking in) and a grid from `lg`; `grid` is a grid everywhere.
 */
export function Cars({
  block,
  lang,
  first,
  pickupId = null,
}: {
  block: CarsBlock;
  lang: Lang;
  first: boolean;
  /** The page's pickup point: only the cars RentCarSoft offers there. */
  pickupId?: number | null;
}) {
  const headingId = `cars-${block.id}`;
  const dark = block.section.tone === "dark";
  const { layout } = block;
  // The catalog is the fleet itself: no "Cała flota" link.
  const fleetLink = layout === "catalog" ? null : <FleetLink block={block} lang={lang} dark={dark} />;
  return (
    <SectionFrame style={block.section} labelledBy={block.title ? headingId : undefined}>
      {block.title ? (
        <SectionHeader
          id={headingId}
          level={first ? 1 : 2}
          eyebrow={block.eyebrow}
          title={block.title}
          lead={block.lead}
          dark={dark}
          action={fleetLink}
        />
      ) : null}
      {layout === "tabs" ? (
        <Suspense fallback={<CarsSkeleton layout="row" />}>
          <CarsTabs block={block} lang={lang} headingLevel={block.title ? "h3" : "h2"} pickupId={pickupId} dark={dark} />
        </Suspense>
      ) : layout === "catalog" ? (
        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogList selection={block} lang={lang} name={block.title ?? getMessages(lang).fleet.title} pickupId={pickupId} />
        </Suspense>
      ) : (
        <Suspense fallback={<CarsSkeleton layout={layout} />}>
          <CarsList block={block} lang={lang} headingLevel={block.title ? "h3" : "h2"} pickupId={pickupId} />
        </Suspense>
      )}
      {block.title || !fleetLink ? null : <div className="mt-8 flex justify-center">{fleetLink}</div>}
    </SectionFrame>
  );
}

/** `grid`, `row`, `categories` (class tiles, `car-categories.tsx`) or `catalog` (the fleet with its filters). */
type Layout = CarsBlock["layout"];

async function CarsList({
  block,
  lang,
  headingLevel,
  pickupId,
}: {
  block: CarsBlock;
  lang: Lang;
  headingLevel: "h2" | "h3";
  pickupId: number | null;
}) {
  const t = getMessages(lang).fleet;
  const cars = await readCars(block, lang, block.id, pickupId);
  if (!cars) {
    return null;
  }
  if (cars.length === 0) {
    // "Tylko promocje" with none running says so; RentCarSoft down (`null` above) says nothing.
    return block.onlyPromotions ? <NoPromotions lang={lang} /> : null;
  }
  if (block.layout === "categories") {
    return <CarCategories cars={cars} lang={lang} headingLevel={headingLevel} />;
  }
  const row = block.layout === "row";
  return (
    <ul
      className={
        row
          ? // Phones: one card and a peek of the next, bleeding to the screen edge; `lg`: the grid.
            "-mx-gutter flex snap-x snap-mandatory scroll-px-gutter gap-4 overflow-x-auto px-gutter pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0 xl:grid-cols-4"
          : "grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
      }
    >
      {cars.map((car) => (
        <li key={car.id} className={row ? "w-[82%] max-w-80 shrink-0 snap-start sm:w-[45%] lg:w-auto lg:max-w-none" : undefined}>
          <FleetCard
            car={car}
            lang={lang}
            t={t}
            headingLevel={headingLevel}
            showPromotionEnd={block.onlyPromotions}
            sizes={row ? "(min-width: 1280px) 300px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 80vw" : undefined}
          />
        </li>
      ))}
    </ul>
  );
}

function NoPromotions({ lang }: { lang: Lang }) {
  const t = getMessages(lang).fleet;
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-card bg-surface px-5 py-4 text-blue-dark">
      {t.noPromotions}
      <Link href={fleetHref(lang)} className="inline-flex items-center gap-1 font-semibold text-blue-medium hover:underline">
        {t.noPromotionsLink}
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </p>
  );
}

/** RentCarSoft's categories in the fleet filters' order, then the 7+ seats tab. */
const TAB_ORDER: CarsTab[] = ["all", "small", "compact", "large", "eco", "delivery", "seats7"];
/** Cars per tab before the "See all" card. */
const TAB_LIMIT = 8;

function inTab(tab: CarsTab, car: FleetCardData): boolean {
  if (tab === "all") return true;
  if (tab === "seats7") return (car.seats ?? 0) >= 7;
  return car.categories.includes(tab);
}

/**
 * Catalog C18: category tabs over a swipe row of cars (`Rail`). The tabs come
 * from RentCarSoft (a tab shows only when it has a car), never invented. Every
 * panel is in the HTML (`ScenarioTabs` keeps them mounted), so search engines
 * see every car; each ends with a card to the fleet filtered the same way.
 */
async function CarsTabs({
  block,
  lang,
  headingLevel,
  pickupId,
  dark,
}: {
  block: CarsBlock;
  lang: Lang;
  headingLevel: "h2" | "h3";
  pickupId: number | null;
  dark: boolean;
}) {
  const t = getMessages(lang).fleet;
  const cars = await readCars({ ...block, limit: null }, lang, block.id, pickupId);
  if (!cars || cars.length === 0) {
    return null;
  }
  const limit = block.limit ?? TAB_LIMIT;
  const tabs = TAB_ORDER.map((tab) => ({ tab, cars: cars.filter((car) => inTab(tab, car)) })).filter(
    ({ tab, cars: matching }) => matching.length > 0 && (tab === "all" || matching.length < cars.length || tab === "seats7"),
  );
  const label = (tab: CarsTab) => (tab === "all" ? t.tabsAll : tab === "seats7" ? t.tabsSeats7 : t.categories[tab]);
  const href = (tab: CarsTab) =>
    tab === "all" ? fleetHref(lang) : tab === "seats7" ? `${fleetHref(lang)}?seats=7` : `${fleetHref(lang)}?category=${tab}`;
  const defaultIndex = Math.max(0, tabs.findIndex(({ tab }) => tab === block.defaultCategory));
  return (
    <LazyScenarioTabs
      label={t.tabsLabel}
      dark={dark}
      defaultIndex={defaultIndex}
      panels={tabs.map(({ tab, cars: matching }) => ({
        label: label(tab),
        content: (
          <Rail label={label(tab)} columns={4}>
            {matching.slice(0, limit).map((car) => (
              <RailItem key={car.id}>
                <FleetCard car={car} lang={lang} t={t} headingLevel={headingLevel} sizes="(min-width: 1280px) 300px, (min-width: 1024px) 23vw, (min-width: 640px) 45vw, 78vw" />
              </RailItem>
            ))}
            {matching.length > limit ? (
              <RailItem>
                <Link
                  href={href(tab)}
                  className={cardClass("light", true, "flex w-full flex-col items-center justify-center gap-3 p-6 text-center font-bold text-blue-dark")}
                >
                  <ChevronRight className="size-6 text-blue-medium" aria-hidden />
                  {fill(t.tabsSeeAll, { category: label(tab), count: String(matching.length) })}
                </Link>
              </RailItem>
            ) : null}
          </Rail>
        ),
      }))}
    />
  );
}

/** The block's own link, or the fleet list ("Cała flota") when the editor left it empty. */
function FleetLink({ block, lang, dark }: { block: CarsBlock; lang: Lang; dark: boolean }) {
  const link = block.cta ?? { label: getMessages(lang).fleet.allCars, href: fleetHref(lang), newTab: false };
  return (
    <Link
      href={link.href}
      target={link.newTab ? "_blank" : undefined}
      rel={link.newTab ? "noopener noreferrer" : undefined}
      className={buttonClass(dark ? "outline-inverse" : "secondary")}
    >
      {link.label}
      <ChevronRight className="size-4" aria-hidden />
    </Link>
  );
}

function CarsSkeleton({ layout }: { layout: Layout }) {
  if (layout === "categories") {
    return (
      <div aria-hidden className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="aspect-[16/10] animate-pulse rounded-card bg-surface" />
        ))}
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className={
        layout === "row"
          ? "flex gap-4 overflow-hidden lg:grid lg:grid-cols-3 lg:gap-6 xl:grid-cols-4"
          : "grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
      }
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className={`h-96 animate-pulse rounded-card bg-surface ${layout === "row" ? "w-[82%] max-w-80 shrink-0 sm:w-[45%] lg:w-auto lg:max-w-none" : ""}`}
        />
      ))}
    </div>
  );
}

type Selection = Pick<CarsBlock, "source" | "segmentIds" | "category" | "limit"> & { layout?: CarsBlock["layout"] };

/**
 * The catalog: the chosen cars (every class when none is picked) with the
 * fleet filters (`FleetBrowser`; the filters live in the URL and run in the
 * browser, so the page stays static) and schema.org `ItemList`. `name` names
 * the list for search engines.
 */
async function CatalogList({
  selection,
  lang,
  name,
  pickupId,
}: {
  selection: Selection;
  lang: Lang;
  name: string;
  pickupId: number | null;
}) {
  const cars = await readCars(selection, lang, `catalog ${name}`, pickupId);
  if (!cars || cars.length === 0) {
    return null;
  }
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: cars.length,
    itemListElement: cars.map((car, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(fleetHref(lang, car.slug)),
      name: car.name,
    })),
  };
  return (
    <>
      <FleetBrowser cars={cars} lang={lang} t={getMessages(lang).fleet} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemList) }} />
    </>
  );
}

function CatalogSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <div className="h-12 animate-pulse rounded-card bg-white lg:h-28" />
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-96 animate-pulse rounded-card bg-white" />
        ))}
      </div>
    </div>
  );
}

/**
 * The selected cars from the one cached catalog list, or `null` when
 * RentCarSoft is down: the block then keeps its header and the page stays up.
 * With the page's pickup point only the cars RentCarSoft offers there, then
 * the block's classes.
 */
async function readCars(selection: Selection, lang: Lang, label: string, pickupId: number | null): Promise<FleetCardData[] | null> {
  // Without the cache the prices use the clock (`Date.now()`): read per request, not in a prerender.
  if (!cacheEnabled()) {
    await connection();
  }
  const [fleet, atPoint] = await Promise.all([listFleetCars(lang), pickupId ? listFleetCarIdsAt(pickupId) : null]).catch(
    (error: unknown) => {
      console.error(`[blocks.cars ${label}] RentCarSoft unavailable, the list is left out`, error);
      return [null, null] as const;
    },
  );
  if (!fleet) {
    return null;
  }
  const offered = atPoint ? fleet.filter((car) => atPoint.has(car.id)) : fleet;
  const { cars, missingSegmentIds } = selectBlockCars(selection, offered);
  if (missingSegmentIds.length > 0) {
    console.warn(`[blocks.cars ${label}] RentCarSoft has no cars in classes ${missingSegmentIds.join(", ")}`);
  }
  return cars;
}
