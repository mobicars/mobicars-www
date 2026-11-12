import assert from "node:assert/strict";
import { describe, it } from "node:test";

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
    days: { one: "doba", few: "doby", many: "dób", other: "doby" },
  };

  it("names each band of the price list", async () => {
    const { bandLabel } = await import("./format");
    assert.equal(bandLabel("pl", { from: null, to: 1 }, pl), "1 doba");
    assert.equal(bandLabel("pl", { from: 2, to: 3 }, pl), "2–3 doby");
    assert.equal(bandLabel("pl", { from: 4, to: 7 }, pl), "4–7 dób");
    assert.equal(bandLabel("pl", { from: 30, to: null }, pl), "od 30 dób");
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
    assert.deepEqual(filters, { category: "eco", gearbox: "automatic", fuel: 18, seats: 7, sort: "price_asc" });
    assert.equal(fleetFiltersToQuery(filters).toString(), "category=eco&gearbox=automatic&fuel=18&seats=7&sort=price_asc");
  });

  it("ignores unknown values", async () => {
    const { parseFleetFilters } = await import("./filters");
    assert.deepEqual(parseFleetFilters(new URLSearchParams("category=suv&gearbox=cvt&fuel=-1&seats=x&sort=new")), {
      category: null,
      gearbox: null,
      fuel: null,
      seats: null,
      sort: "default",
    });
  });
});
