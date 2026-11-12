import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseZonedDateTime } from "@internationalized/date";

import {
  draftFromQuery,
  emptyDraft,
  movePickup,
  rentalPeriod,
  searchToQuery,
  toRentCarSoftDateTime,
  validateSearch,
  type SearchDraft,
} from "./search";

const places = [
  { id: 1, customAddresses: false },
  { id: 2, customAddresses: true },
];
const earliestStart = parseZonedDateTime("2026-11-11T12:00[Europe/Warsaw]");

function draft(overrides: Partial<SearchDraft>): SearchDraft {
  return { ...emptyDraft(), ...overrides };
}

describe("reservation search", () => {
  it("round-trips a short-term search through the URL query", () => {
    const result = validateSearch(
      draft({
        pickup: { id: 2, address: "Prosta 1, Warszawa" },
        differentReturn: true,
        dropoff: { id: 1, address: null },
        start: "2026-11-12T10:00",
        end: "2026-11-14T10:30",
      }),
      { places, earliestStart },
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const query = searchToQuery(result.search);
    assert.equal(
      query.toString(),
      "pickup=2&pickupAddress=Prosta+1%2C+Warszawa&dropoff=1&from=2026-11-12T10%3A00&to=2026-11-14T10%3A30",
    );
    const back = validateSearch(draftFromQuery(query, "short"), { places, earliestStart });
    assert.deepEqual(back, result);
  });

  it("writes only long-term fields for a long-term search", () => {
    const result = validateSearch(
      draft({ term: "long", pickup: { id: 1, address: null }, start: "2026-11-20T09:00", end: "2026-11-21T09:00", months: 3, km: 2000 }),
      { places, earliestStart },
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(searchToQuery(result.search).get("to"), null);
    const { end } = rentalPeriod(result.search);
    assert.equal(toRentCarSoftDateTime(end), "2027-02-20 09:00");
  });

  it("reports every missing field", () => {
    const short = validateSearch(draft({ differentReturn: true }), { places, earliestStart });
    assert.deepEqual(short.ok ? [] : short.issues.map((issue) => issue.field), ["pickup", "dropoff", "start", "end"]);

    const long = validateSearch(draft({ term: "long" }), { places, earliestStart });
    assert.deepEqual(long.ok ? [] : long.issues.map((issue) => issue.field), ["pickup", "start", "months", "km"]);
  });

  it("rejects past, reversed and unknown values", () => {
    const result = validateSearch(
      draft({
        pickup: { id: 2, address: null },
        differentReturn: true,
        dropoff: { id: 99, address: null },
        start: "2026-11-11T11:30",
        end: "2026-11-11T11:00",
      }),
      { places, earliestStart },
    );
    assert.deepEqual(result.ok ? [] : result.issues, [
      { field: "pickup", code: "address" },
      { field: "dropoff", code: "unknown" },
      { field: "start", code: "past" },
      { field: "end", code: "beforeStart" },
    ]);
  });

  it("lets a booking in progress keep a pickup earlier today, but not yesterday", () => {
    const startOfToday = parseZonedDateTime("2026-11-11T00:00[Europe/Warsaw]");
    const booking = (start: string) =>
      validateSearch(
        draft({ pickup: { id: 1, address: null }, start, end: "2026-11-14T10:00" }),
        { places, earliestStart: startOfToday },
      );
    assert.equal(booking("2026-11-11T08:30").ok, true);
    const yesterday = booking("2026-11-10T22:00");
    assert.deepEqual(yesterday.ok ? [] : yesterday.issues, [{ field: "start", code: "past" }]);
  });

  it("moves a pickup and keeps the return while it still follows", () => {
    assert.deepEqual(movePickup("2026-11-11T21:30", "2026-11-14T10:00", "2026-11-11T23:00"), {
      start: "2026-11-11T23:00",
      end: "2026-11-14T10:00",
    });
    // A return that would come first moves by the same amount: the rental keeps its 2 hours.
    assert.deepEqual(movePickup("2026-11-11T21:30", "2026-11-11T23:30", "2026-11-12T00:00"), {
      start: "2026-11-12T00:00",
      end: "2026-11-12T02:00",
    });
    assert.deepEqual(movePickup("2026-11-11T21:30", null, "2026-11-11T23:00"), { start: "2026-11-11T23:00", end: null });
  });

  it("drops malformed query values instead of throwing", () => {
    const parsed = draftFromQuery({ pickup: "abc", from: "2026-13-45T99:00", months: "-3", km: ["2000", "3000"] }, "long");
    assert.deepEqual(parsed, { ...emptyDraft("long"), km: 2000 });
  });
});
