import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Extra } from "@/lib/rentcarsoft";

import {
  droppedChoices,
  sanitizeSelection,
  selectedAccessories,
  selectedAddonIds,
  selectionFromQuery,
  selectionToQuery,
  toExtrasView,
} from "./extras";

function extra(overrides: Partial<Extra>): Extra {
  return {
    id: 0,
    name: "",
    type: 0,
    description: null,
    image: null,
    oneTimeFee: false,
    price: 10,
    priceDiscounted: 10,
    calculatedPrice: 60,
    discountedCalculatedPrice: 60,
    isDiscounted: false,
    monthlyPrice: null,
    longTermVisible: null,
    inalienable: null,
    autoSelected: null,
    presentation: null,
    ...overrides,
  };
}

const view = toExtrasView(
  [
    extra({ id: 1008, type: 4, name: "Wyjazd za granicę Strefa 2 (limit 400 km/ doba)", oneTimeFee: true, price: 400, calculatedPrice: 2400 }),
    extra({ id: 1007, type: 4, name: "Wyjazd za granicę Strefa 1 (limit 400 km/ doba)", oneTimeFee: true, price: 150, calculatedPrice: 900 }),
    extra({ id: 2995, type: 4, name: "Wyjazd za granicę Strefa 1 (długoterminowy)", price: 0, calculatedPrice: 0 }),
    extra({ id: 1005, type: 1, name: "Ochrona Komfort", price: 49 }),
    extra({ id: 2754, type: 3, name: "CarPlay", price: 5, calculatedPrice: 30 }),
    extra({ id: 1643, type: 3, name: "Aplikacja", price: 0, calculatedPrice: 0 }),
    extra({ id: 3765, type: 0, name: "Gwarancja modelu", oneTimeFee: true, price: 100, calculatedPrice: 600 }),
  ],
  [
    extra({ id: 147, type: 2, name: "Fotelik 9-36kg", price: 12, calculatedPrice: 72 }),
    extra({ id: 703, type: 0, name: "Dodatkowy kierowca", oneTimeFee: true, price: 20, calculatedPrice: 120 }),
    extra({ id: 999, type: 7, name: "Nowa grupa", price: 3, calculatedPrice: 18 }),
  ],
);

describe("extras view", () => {
  it("makes border trips a zone choice, cheapest first, without unpriced zones", () => {
    assert.deepEqual(
      view.zones.map((zone) => [zone.id, zone.name, zone.note, zone.periodPrice]),
      [
        [1007, "Strefa 1", "limit 400 km/ doba", 150],
        [1008, "Strefa 2", "limit 400 km/ doba", 400],
      ],
    );
  });

  it("groups the rest like the old site and hides insurance and free items", () => {
    assert.deepEqual(
      view.groups.map((group) => [group.id, group.items.map((item) => [item.id, item.kind])]),
      [
        ["kids", [[147, "quantity"]]],
        ["multimedia", [[2754, "toggle"]]],
        ["other", [[3765, "toggle"], [703, "quantity"], [999, "quantity"]]],
      ],
    );
  });

  it("prices one-time extras once and per-day extras for the period", () => {
    const other = view.groups.find((group) => group.id === "other")!;
    assert.equal(other.items.find((item) => item.id === 3765)?.periodPrice, 100);
    assert.equal(view.groups[0].items[0].periodPrice, 72);
  });
});

describe("extras selection", () => {
  it("round-trips through the URL", () => {
    const selection = selectionFromQuery("2754,3765", "147-2,703-1", "1007");
    assert.deepEqual(selectionToQuery(selection), { zone: "1007", extras: "2754,3765", acc: "147-2,703-1" });
    assert.deepEqual(selectedAddonIds(selection), [1007, 2754, 3765]);
    assert.deepEqual(selectedAccessories(selection), [
      { id: 147, quantity: 2 },
      { id: 703, quantity: 1 },
    ]);
  });

  it("drops what the view does not offer and clamps quantities", () => {
    const selection = sanitizeSelection(selectionFromQuery("2754,1643,1005,x", "147-9,1643-1,703-0", "2995"), view);
    assert.deepEqual(selectionToQuery(selection), { zone: null, extras: "2754", acc: "147-5" });
  });

  it("counts what a change of car or dates dropped", () => {
    const before = selectionFromQuery("2754,1643,1005", "147-2,1643-1", "2995");
    assert.equal(droppedChoices(before, sanitizeSelection(before, view)), 4);
  });
});
