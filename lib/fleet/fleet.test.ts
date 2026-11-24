import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { RentCarSoftError } from "@/lib/rentcarsoft";

import { carClasses } from "./car-classes";
import { partialFleetCar, withCatalogFallback, type FleetCard, type FleetCar } from "./cars";
import { sanitizeDescription } from "./sanitize";
import { carSlug, offerIdFromSlug } from "./slug";

describe("car slugs", () => {
  it("matches the old site's URLs", () => {
    assert.equal(carSlug("Toyota Yaris", 1219), "toyota-yaris-1219");
    assert.equal(carSlug("MG 4", 4560), "mg-4-4560");
    assert.equal(carSlug("Toyota Yaris AUTOMAT", 3092), "toyota-yaris-automat-3092");
  });

  it("drops punctuation and Polish letters", () => {
    assert.equal(carSlug("Nissan X-TRAIL 7 os.", 4431), "nissan-x-trail-7-os-4431");
    assert.equal(carSlug(" Dacia Jogger 7 os.  ", 3896), "dacia-jogger-7-os-3896");
    assert.equal(carSlug("Łódź Żółta", 1), "lodz-zolta-1");
    assert.equal(carSlug("", 7), "7");
  });

  it("reads the id at the end", () => {
    assert.equal(offerIdFromSlug("toyota-yaris-1219"), 1219);
    assert.equal(offerIdFromSlug("1219"), 1219);
    assert.equal(offerIdFromSlug("nissan-x-trail-7-os.-4431"), 4431);
    assert.equal(offerIdFromSlug("toyota-yaris"), null);
    assert.equal(offerIdFromSlug("toyota-0"), null);
  });
});

describe("description sanitizer", () => {
  it("keeps text formatting and moves headings one level down", () => {
    assert.equal(
      sanitizeDescription('<h1 class="x">Wynajem</h1>\r\n<p style="color:red">Tekst <strong>mocny</strong></p>'),
      "<h2>Wynajem</h2>\n<p>Tekst <strong>mocny</strong></p>",
    );
    assert.equal(sanitizeDescription("<h3>FAQ</h3>"), "<h4>FAQ</h4>");
  });

  it("removes scripts, handlers and unsafe links", () => {
    assert.equal(sanitizeDescription('<p onclick="x()">a</p><script>alert(1)</script>'), "<p>a</p>");
    assert.equal(sanitizeDescription('<a href="javascript:alert(1)">x</a>'), "<a>x</a>");
    assert.equal(sanitizeDescription('<a href="/pl/flota" target="_blank">x</a>'), '<a href="/pl/flota">x</a>');
    assert.equal(sanitizeDescription("<img src=x onerror=alert(1)><div>t</div>"), "t");
  });
});

describe("band labels", () => {
  const pl = {
    bandFirst: "do {to} {days}",
    bandRange: "{from}–{to} {days}",
    bandLast: "od {from} {days}",
    days: { one: "dzień", few: "dni", many: "dni", other: "dni" },
  };

  it("names each band of the price list", async () => {
    const { bandLabel } = await import("./format");
    assert.equal(bandLabel("pl", { from: null, to: 1 }, pl), "1 dzień");
    assert.equal(bandLabel("pl", { from: 2, to: 3 }, pl), "2–3 dni");
    assert.equal(bandLabel("pl", { from: 4, to: 7 }, pl), "4–7 dni");
    assert.equal(bandLabel("pl", { from: 30, to: null }, pl), "od 30 dni");
  });

  it("reads a band from 0 days as the first band", async () => {
    const { bandLabel } = await import("./format");
    assert.equal(bandLabel("pl", { from: 0, to: 1 }, pl), "1 dzień");
    assert.equal(bandLabel("pl", { from: 0, to: 3 }, pl), "do 3 dni");
  });

  it("formats whole and fractional prices", async () => {
    const { formatPrice } = await import("./format");
    assert.match(formatPrice("pl", 89), /^89\szł$/);
    assert.match(formatPrice("pl", 95.2), /^95,20\szł$/);
  });
});

describe("fleet filters", () => {
  it("reads and writes the query string", async () => {
    const { fleetFiltersToQuery, parseFleetFilters } = await import("./filters");
    const filters = parseFleetFilters(new URLSearchParams("category=eco&gearbox=automatic&fuel=18&seats=7&sort=price_asc"));
    assert.deepEqual(filters, { category: "eco", gearbox: "automatic", fuel: 18, seats: 7, collection: null, sort: "price_asc" });
    assert.equal(fleetFiltersToQuery(filters).toString(), "category=eco&gearbox=automatic&fuel=18&seats=7&sort=price_asc");
  });

  it("reads a collection slug next to the other filters", async () => {
    const { fleetFiltersToQuery, parseFleetFilters } = await import("./filters");
    const filters = parseFleetFilters(new URLSearchParams("collection=dla-rodzin&fuel=18"));
    assert.equal(filters.collection, "dla-rodzin");
    assert.equal(fleetFiltersToQuery(filters).toString(), "fuel=18&collection=dla-rodzin");
    assert.equal(parseFleetFilters(new URLSearchParams("collection=<script>")).collection, null);
  });

  it("ignores unknown values", async () => {
    const { parseFleetFilters } = await import("./filters");
    assert.deepEqual(parseFleetFilters(new URLSearchParams("category=suv&gearbox=cvt&fuel=-1&seats=x&sort=new")), {
      category: null,
      gearbox: null,
      fuel: null,
      seats: null,
      collection: null,
      sort: "default",
    });
  });
});

describe("cars section selection", () => {
  const car = (id: number, extra: Record<string, unknown> = {}) =>
    ({
      id,
      segmentId: "1462",
      categories: [],
      fuel: { id: 15, label: "Benzyna" },
      seats: 5,
      automatic: false,
      ...extra,
    }) as unknown as import("./cars").FleetCard;
  const cars = [
    car(1),
    car(2, { segmentId: "6328", fuel: { id: 110, label: "Elektryczny" }, automatic: true }),
    car(3, { segmentId: "8550", categories: ["delivery"], seats: 9 }),
    car(4, { segmentId: "2699", seats: 7 }),
  ];

  it("selects a Cars section's cars: category, classes, picked cars in the editor's order", async () => {
    const { selectSectionCars } = await import("./cars-block");
    type Selection = Parameters<typeof selectSectionCars>[0];
    const section: Selection = { source: "all", category: "passenger", segmentIds: [], carIds: [], collection: null, limit: null };
    const ids = (overrides: Partial<Selection>, list = cars) => selectSectionCars({ ...section, ...overrides }, list).map((each) => each.id);
    assert.deepEqual(ids({}), [1, 2, 3, 4]);
    assert.deepEqual(ids({ limit: 2 }), [1, 2]);
    assert.deepEqual(ids({ source: "category", category: "passenger" }), [1, 2, 4]);
    assert.deepEqual(ids({ source: "category", category: "delivery" }), [3]);
    assert.deepEqual(ids({ source: "category", category: "popular" }, [car(1), car(2, { popular: true })]), [2]);
    assert.deepEqual(ids({ source: "classes", segmentIds: [8550, 1462] }), [1, 3]);
    assert.deepEqual(ids({ source: "classes", segmentIds: [] }), [1, 2, 3, 4]);
    // Picked cars keep the editor's order; one RentCarSoft no longer lists is left out.
    assert.deepEqual(ids({ source: "cars", carIds: [4, 99, 1] }), [4, 1]);
    // A collection without a linked entry shows nothing rather than the whole fleet.
    assert.deepEqual(ids({ source: "collection", collection: null }), []);
  });

  it("selects a car collection: empty rules do not filter, any value within a rule, every rule together", async () => {
    const { collectionCars } = await import("./car-collection");
    type Rules = Parameters<typeof collectionCars>[0];
    const none: Rules = { segmentIds: [], categories: [], fuels: [], bodies: [], gearboxes: [], minSeats: null, onlyPromotion: false, onlyPopular: false, sort: "default" };
    const ids = (rules: Partial<Rules>, list = cars) => collectionCars({ ...none, ...rules }, list).map((each) => each.id);
    const priced = [car(1, { dailyFrom: 129, gearboxId: 13, popular: false }), car(2, { dailyFrom: 89, gearboxId: 14, popular: true }), car(3, { dailyFrom: null, gearboxId: 14, popular: false }), car(4, { dailyFrom: 99, gearboxId: 14, bodyId: 2, popular: false })];
    assert.deepEqual(ids({}), [1, 2, 3, 4]);
    // Segment A or B, and automatic.
    assert.deepEqual(ids({ segmentIds: [1462, 6328], gearboxes: [14] }, [car(1, { gearboxId: 13 }), car(2, { segmentId: "6328", gearboxId: 14 }), car(3, { gearboxId: 14 })]), [2, 3]);
    assert.deepEqual(ids({ fuels: [110] }), [2]);
    assert.deepEqual(ids({ categories: ["delivery", "eco"] }), [3]);
    assert.deepEqual(ids({ minSeats: 7 }), [3, 4]);
    assert.deepEqual(ids({ bodies: [2] }, priced), [4]);
    assert.deepEqual(ids({ sort: "price" }, priced), [2, 4, 1, 3]);
    assert.deepEqual(ids({ sort: "popular" }, priced), [2, 1, 3, 4]);
    assert.deepEqual(ids({ onlyPopular: true }, priced), [2]);
  });

  it("lists the collection pickers' values with their car counts", async () => {
    const { collectionValues } = await import("./car-collection");
    const values = collectionValues(
      [car(1, { bodyId: 2, body: "Kombi", gearboxId: 13, transmission: "Manualna" }), car(2, { bodyId: 2, body: "Kombi", gearboxId: 14, transmission: "Automatyczna", fuel: { id: 110, label: "Elektryczny" } })],
      { small: "Małe", compact: "Kompaktowe", large: "Duże", eco: "Eko", delivery: "Dostawcze" },
    );
    assert.deepEqual(values.bodies, [{ id: 2, label: "Kombi", cars: 2 }]);
    assert.deepEqual(values.gearboxes.map((value) => value.label), ["Automatyczna", "Manualna"]);
    assert.deepEqual(values.fuels, [{ id: 15, label: "Benzyna", cars: 1 }, { id: 110, label: "Elektryczny", cars: 1 }]);
    assert.equal(values.categories.length, 5);
  });
});

describe("daily from price", () => {
  const bands = [
    { from: null, to: 1, price: 179, promotionalPrice: null },
    { from: 2, to: 3, price: 159, promotionalPrice: 140 },
    { from: 30, to: null, price: 89, promotionalPrice: 80 },
  ];
  const promotion = { startsAt: "2026-10-05 00:00:00", endsAt: "2026-12-15 23:55:00" };

  it("reads RentCarSoft times as Warsaw time", async () => {
    const { warsawTime } = await import("./daily-price");
    assert.equal(warsawTime("2026-12-15 23:55:00"), Date.UTC(2026, 11, 15, 22, 55));
    assert.equal(warsawTime("2026-07-01 12:00:00"), Date.UTC(2026, 6, 1, 10, 0));
    assert.equal(warsawTime("soon"), null);
  });

  it("counts a promotional price only while the promotion runs", async () => {
    const { bandsAt, dailyFrom } = await import("./daily-price");
    const during = Date.UTC(2026, 10, 13, 12);
    const after = Date.UTC(2026, 11, 16, 12);
    assert.deepEqual(dailyFrom(bandsAt(bands, promotion, during)), { price: 80, fromDays: 30, oneDay: 179, promotional: true });
    assert.deepEqual(dailyFrom(bandsAt(bands, promotion, after)), { price: 89, fromDays: 30, oneDay: 179, promotional: false });
    assert.deepEqual(dailyFrom(bandsAt(bands, null, during)), { price: 89, fromDays: 30, oneDay: 179, promotional: false });
  });

  it("has no 1-day price when the first band starts later", async () => {
    const { dailyFrom } = await import("./daily-price");
    assert.equal(dailyFrom([{ from: 2, to: null, price: 109, promotionalPrice: null }])?.oneDay, null);
    assert.equal(dailyFrom([]), null);
  });

  it("knows when the next promotion starts or ends", async () => {
    const { nextPriceChange, warsawTime } = await import("./daily-price");
    const now = Date.UTC(2026, 10, 13, 12);
    assert.equal(nextPriceChange([null, promotion], now), warsawTime(promotion.endsAt));
    assert.equal(nextPriceChange([null], now), null);
  });

  it("prices classes from bookable cars only", async () => {
    const { classPricesFrom } = await import("./daily-price");
    const daily = (price: number) => ({ price, fromDays: 30, oneDay: price * 2, promotional: false });
    const car = (segmentId: string, price: number, rentable = true) => ({
      segmentId,
      segment: `Klasa ${segmentId}`,
      rentable,
      shortTerm: true,
      daily: daily(price),
    });
    const { classes, lowest } = classPricesFrom([car("A", 89), car("A", 89), car("B", 109), car("X", 50, false)]);
    assert.deepEqual(classes.map((each) => [each.segmentId, each.price, each.cars]), [["A", 89, 2], ["B", 109, 1]]);
    assert.equal(lowest?.segmentId, "A");
  });
});

describe("car page when RentCarSoft fails", () => {
  const card: FleetCard = {
    id: 1218,
    slug: "toyota-aygo-1218",
    name: "Toyota Aygo",
    segment: "Klasa A",
    segmentId: "1",
    image: { src: "https://example.test/aygo.webp", alt: "Toyota Aygo" },
    body: null,
    bodyId: null,
    seats: 4,
    doors: 5,
    suitcases: { large: 1, small: 1 },
    transmission: "Manualna",
    automatic: false,
    gearboxId: 13,
    fuel: null,
    categories: [],
    daily: null,
    dailyFrom: 89,
    monthlyFrom: null,
    monthlyTerms: null,
    deposit: null,
    promotion: false,
    promotionEndsAt: null,
    rentable: true,
    popular: false,
    shortTerm: true,
    longTerm: false,
  };
  const full: FleetCar = { ...partialFleetCar(card), specs: [{ key: "engine", value: "1.0" }], partial: false };
  const fail = (code: ConstructorParameters<typeof RentCarSoftError>[0]) => () => Promise.reject(new RentCarSoftError(code));

  it("turns a catalog card into a car page without the details", () => {
    const car = partialFleetCar(card);
    assert.equal(car.partial, true);
    assert.equal(car.dailyFrom, 89);
    assert.deepEqual(car.gallery, [{ src: card.image!.src, thumb: card.image!.src, alt: "Toyota Aygo", studio: true }]);
    assert.deepEqual([car.specs, car.features, car.equipment, car.priceBands], [[], [], [], []]);
    assert.equal(car.description, null);
    assert.equal(partialFleetCar({ ...card, image: null }).gallery.length, 0);
  });

  it("uses the details when RentCarSoft answers", async () => {
    let asked = false;
    const car = await withCatalogFallback(1218, async () => full, async () => ((asked = true), null));
    assert.equal(car, full);
    assert.equal(asked, false);
  });

  it("answers 404 for an unknown id, without the catalog", async () => {
    let asked = false;
    assert.equal(await withCatalogFallback(1, fail("not_found"), async () => ((asked = true), null)), null);
    assert.equal(asked, false);
  });

  it("falls back to the catalog card on a server error or timeout", async () => {
    for (const code of ["api", "timeout", "network"] as const) {
      const car = await withCatalogFallback(1218, fail(code), async () => partialFleetCar(card));
      assert.equal(car?.partial, true, code);
    }
  });

  it("keeps the original error when the catalog fails too or lacks the car", async () => {
    await assert.rejects(withCatalogFallback(1218, fail("api"), () => Promise.reject(new Error("down"))), { code: "api" });
    await assert.rejects(withCatalogFallback(1218, fail("timeout"), async () => null), { code: "timeout" });
  });

  it("never hides an error that is not RentCarSoft's", async () => {
    await assert.rejects(
      withCatalogFallback(1218, () => Promise.reject(new TypeError("bug")), async () => partialFleetCar(card)),
      TypeError,
    );
  });
});

describe("car classes (menu panel, Car classes section)", () => {
  const car = (id: number, categories: FleetCard["categories"], dailyFrom: number | null) =>
    ({ id, categories, dailyFrom }) as FleetCard;

  it("lists the classes with cars in the fixed order, each with its cheapest priced car", () => {
    const classes = carClasses([
      car(1, ["compact"], 129),
      car(2, ["small"], null),
      car(3, ["small"], 89),
      car(4, ["compact", "eco"], 119),
    ]);
    assert.deepEqual(
      classes.map(({ id, cheapest }) => [id, cheapest.id]),
      [["small", 3], ["compact", 4], ["eco", 4]],
    );
  });

  it("keeps the classes picked in the CMS, in that order, and skips one without cars", () => {
    const cars = [car(1, ["compact"], 129), car(3, ["small"], 89), car(4, ["eco"], 119)];
    assert.deepEqual(
      carClasses(cars, ["eco", "delivery", "small"]).map(({ id, cheapest }) => [id, cheapest.id]),
      [["eco", 4], ["small", 3]],
    );
  });
});

describe("promotions (Promotions section)", () => {
  const now = Date.UTC(2026, 10, 20, 12);
  const offer = (id: number, segmentId: string, name: string | null, endsAt: string, promo: [number, number][], extra: Record<string, unknown> = {}) =>
    ({
      id,
      segmentId,
      segmentName: `Klasa ${segmentId}`,
      rentable: true,
      shortTerm: true,
      promotion: { name, startsAt: "2026-11-16 00:00:00", endsAt, dailyPrice: null },
      priceList: {
        deposit: 0,
        monthlyFrom: null,
        bands: promo.map(([price, promotionalPrice], index) => ({ from: index === 0 ? null : index * 3, to: index * 3 + 2, price, promotionalPrice })),
      },
      ...extra,
    }) as never;

  it("takes running promotions per class: lowest promotional price and its regular price", async () => {
    const { promotionClasses } = await import("./promotions");
    const classes = promotionClasses(
      [
        offer(1, "A", "Promocja przedświąteczna", "2026-12-17 23:00:00", [[179, 161.1], [119, 95.2]]),
        offer(2, "A", "Promocja przedświąteczna", "2026-12-17 23:00:00", [[179, 161.1], [119, 95.2]]),
        offer(3, "B", null, "2026-11-01 00:00:00", [[139, 125.1]]),
        offer(4, "C", "Jesień", "2026-12-15 23:55:00", [[99, 99]]),
      ],
      now,
    );
    assert.equal(classes.length, 1, "B has ended, C has no lower price");
    assert.deepEqual(
      { segmentId: classes[0].segmentId, price: classes[0].price, regular: classes[0].regularPrice, cars: classes[0].carIds },
      { segmentId: "A", price: 95.2, regular: 119, cars: [1, 2] },
    );
  });

  it("puts the soonest to end first, then the cheapest", async () => {
    const { promotionClasses, sortPromotions } = await import("./promotions");
    const classes = promotionClasses(
      [
        offer(1, "A", "Promocja przedświąteczna", "2026-12-17 23:00:00", [[100, 80]]),
        offer(2, "B", "Jesień z Mobicars", "2026-11-25 23:55:00", [[100, 90]]),
        offer(3, "C", "Promocja przedświąteczna", "2026-12-17 23:00:00", [[100, 70]]),
      ],
      now,
    );
    assert.deepEqual(sortPromotions(classes).map((each) => each.segmentId), ["B", "C", "A"]);
  });
});
