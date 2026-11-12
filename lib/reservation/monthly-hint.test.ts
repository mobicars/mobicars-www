import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { monthlyAlternative } from "./monthly-hint";
import type { ReservationSearch } from "./search";

const daily = (end: string, dropoff: ReservationSearch["dropoff"] = null): ReservationSearch => ({
  term: "short",
  pickup: { id: 479, address: null },
  dropoff,
  start: "2026-12-01T10:00",
  end,
});

describe("monthlyAlternative", () => {
  it("stays quiet below four weeks", () => {
    assert.equal(monthlyAlternative(daily("2026-12-20T10:00")), null);
  });

  it("suggests the same pickup by the month for 4 weeks or more", () => {
    const hint = monthlyAlternative(daily("2027-01-15T10:00"))!;
    assert.equal(hint.days, 45);
    assert.equal(hint.months, 2);
    assert.equal(hint.query.get("pickup"), "479");
    assert.equal(hint.query.get("from"), "2026-12-01T10:00");
    assert.equal(hint.query.get("months"), "2");
    assert.equal(hint.query.get("km"), "2000");
    assert.equal(hint.query.has("to"), false);
  });

  it("rounds down to a month count that is offered", () => {
    // 8 months wanted; 6 is the largest offered count below 12.
    assert.equal(monthlyAlternative(daily("2027-07-28T10:00"))!.months, 6);
  });

  it("skips one-way rentals and monthly searches", () => {
    assert.equal(monthlyAlternative(daily("2027-01-15T10:00", { id: 480, address: null })), null);
    assert.equal(
      monthlyAlternative({ term: "long", pickup: { id: 479, address: null }, dropoff: null, start: "2026-12-01T10:00", months: 3, km: 2000 }),
      null,
    );
  });
});
