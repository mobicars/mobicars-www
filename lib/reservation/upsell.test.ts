import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { OfferCard } from "./offers";
import { upsellOptions } from "./upsell";

let nextId = 1;
function car(segment: string, daily: number, overrides: Partial<OfferCard> = {}): OfferCard {
  return {
    id: nextId++,
    name: `${segment} car`,
    segment,
    segmentId: segment,
    image: null,
    seats: "5",
    transmission: null,
    automatic: false,
    categories: [],
    fuelType: null,
    dailyPrice: daily,
    days: null,
    totalPrice: daily * 6,
    monthlyPrice: null,
    regularTotalPrice: null,
    promotion: null,
    deposit: 0,
    available: true,
    popular: false,
    ...overrides,
  };
}

const fabia = car("B", 149);
const offers = [
  fabia,
  car("B", 149),
  car("A", 119),
  car("B Automat", 169, { automatic: true, available: false }),
  car("B+ Cross", 169),
  car("C", 189),
  car("C", 189, { popular: true, name: "popular C" }),
  car("B+ Cross Automat", 199, { automatic: true }),
  car("D Automat", 259, { automatic: true }),
  car("Cargo XL", 160, { categories: ["delivery"], seats: "3" }),
  car("VAN 7", 339, { seats: "7" }),
];

describe("upsell", () => {
  it("offers the nearest dearer classes, one free car each, popular first, in full rows of two", () => {
    assert.deepEqual(
      upsellOptions(fabia, offers).map((option) => [option.car.segment, option.car.name, option.dailyIncrease, option.totalIncrease]),
      [
        ["B+ Cross", "B+ Cross car", 20, 120],
        ["C", "popular C", 40, 240],
        ["B+ Cross Automat", "B+ Cross Automat car", 50, 300],
        ["D Automat", "D Automat car", 110, 660],
      ],
    );
    // Three candidates show two; one shows one.
    const threeCandidates = offers.filter((offer) => offer.segment !== "D Automat" && offer.segment !== "VAN 7");
    assert.equal(upsellOptions(fabia, threeCandidates).length, 2);
    assert.equal(upsellOptions(fabia, [fabia, car("C", 189)]).length, 1);
  });

  it("never mixes vans and cars", () => {
    const van = offers.find((offer) => offer.segment === "Cargo XL")!;
    const vans = [van, car("Cargo XXL", 329, { categories: ["delivery"], seats: "3" })];
    assert.deepEqual(upsellOptions(van, [...offers, ...vans]).map((option) => option.car.segment), ["Cargo XXL"]);
    assert.ok(upsellOptions(fabia, offers).every((option) => !option.car.categories.includes("delivery")));
  });

  it("keeps automatics automatic and seats at least as many", () => {
    const kamiq = offers.find((offer) => offer.segment === "B+ Cross Automat")!;
    assert.deepEqual(upsellOptions(kamiq, offers).map((option) => option.car.segment), ["D Automat"]);
    const van = offers.find((offer) => offer.segment === "VAN 7")!;
    assert.deepEqual(upsellOptions(van, offers), []);
  });

  it("offers nothing without a price for the chosen car", () => {
    assert.deepEqual(upsellOptions({ ...fabia, totalPrice: null }, offers), []);
  });
});
