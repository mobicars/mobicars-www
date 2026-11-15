import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import { termOfSearchQuery, track, trackExtrasChange } from "./analytics";
import type { ExtraOption, ExtrasSelection, ExtrasView } from "./extras";

/** A browser stand-in: `track` only needs `window.dataLayer`. */
const fakeWindow = globalThis as unknown as { window?: { dataLayer?: unknown[] } };

function events() {
  return fakeWindow.window?.dataLayer ?? [];
}

function option(id: number, name: string, kind: ExtraOption["kind"] = "toggle"): ExtraOption {
  return { id, name, kind } as ExtraOption;
}

const view = {
  zones: [option(10, "Strefa 1"), option(11, "Strefa 2")],
  groups: [{ id: "kids", items: [option(147, "Fotelik", "quantity")] }, { id: "other", items: [option(2754, "CarPlay")] }],
} as unknown as ExtrasView;

function selection(zone: number | null, addons: number[], accessories: [number, number][] = []): ExtrasSelection {
  return { zone, addons, accessories: new Map(accessories) };
}

describe("analytics", () => {
  beforeEach(() => {
    fakeWindow.window = {};
  });

  it("does nothing on the server", () => {
    delete fakeWindow.window;
    assert.doesNotThrow(() => track("booking_step", { step: "car" }));
  });

  it("pushes an event with its params", () => {
    track("booking_step", { step: "extras", term: "short" });
    assert.deepEqual(events(), [{ event: "booking_step", step: "extras", term: "short" }]);
  });

  it("reads the term from a search query", () => {
    assert.equal(termOfSearchQuery("pickup=480&from=2026-11-20T10:00&to=2026-11-23T10:00"), "short");
    assert.equal(termOfSearchQuery("pickup=480&from=2026-11-20T10:00&months=3&km=2000"), "long");
  });

  it("sends one event per changed extra, with names and quantities", () => {
    trackExtrasChange(view, selection(10, [2754], [[147, 1]]), selection(11, [], [[147, 2]]));
    assert.deepEqual(events(), [
      { event: "extra_remove", extra_id: 10, extra_name: "Strefa 1", kind: "zone", quantity: 1 },
      { event: "extra_add", extra_id: 11, extra_name: "Strefa 2", kind: "zone", quantity: 1 },
      { event: "extra_remove", extra_id: 2754, extra_name: "CarPlay", kind: "addon", quantity: 1 },
      { event: "extra_add", extra_id: 147, extra_name: "Fotelik", kind: "accessory", quantity: 2 },
    ]);
  });

  it("sends nothing when the selection is the same", () => {
    trackExtrasChange(view, selection(null, [2754]), selection(null, [2754]));
    assert.deepEqual(events(), []);
  });

  it("reports a removed accessory with quantity 0", () => {
    trackExtrasChange(view, selection(null, [], [[147, 2]]), selection(null, []));
    assert.deepEqual(events(), [{ event: "extra_remove", extra_id: 147, extra_name: "Fotelik", kind: "accessory", quantity: 0 }]);
  });
});
