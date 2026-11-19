import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseZonedDateTime } from "@internationalized/date";

import { pickupTimeCheck } from "@/components/reservation/schedule";

import { withPagePickup, type PickupPlace } from "./places";
import {
  bookingStatus,
  draftFromQuery,
  emptyDraft,
  movePickup,
  rentalPeriod,
  searchToQuery,
  toRentCarSoftDateTime,
  toZonedDateTime,
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

  it("tells an expired search (only the time too early) from a broken one", () => {
    const options = { places, earliestStart };
    const booking = (overrides: Partial<SearchDraft>) =>
      bookingStatus(draft({ pickup: { id: 1, address: null }, end: "2026-11-14T10:00", ...overrides }), options);
    assert.equal(booking({ start: "2026-11-11T12:30" }).status, "ok");
    // Earlier today or days ago: complete, so the page asks for a new time and keeps the search.
    const earlier = booking({ start: "2026-11-11T11:30" });
    assert.equal(earlier.status, "expired");
    assert.equal(earlier.status === "expired" ? earlier.search.start : null, "2026-11-11T11:30");
    assert.equal(booking({ start: "2026-11-10T22:00" }).status, "expired");
    // Anything else wrong as well: the usual "complete the search".
    const broken = booking({ start: "2026-11-10T22:00", pickup: { id: 9, address: null } });
    assert.deepEqual(broken.status === "invalid" ? broken.issues : [], [
      { field: "pickup", code: "unknown" },
      { field: "start", code: "past" },
    ]);
  });

  it("leaves the time unchecked with a null earliest start", () => {
    const result = validateSearch(
      draft({ pickup: { id: 1, address: null }, start: "2020-01-01T10:00", end: "2020-01-03T10:00" }),
      { places, earliestStart: null },
    );
    assert.equal(result.ok, true);
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

describe("page pickup point (city and local pages)", () => {
  const place = (id: number, city: string | null): PickupPlace => ({
    id,
    name: `P${id}`,
    city,
    cityName: city,
    addressNote: null,
    fee: null,
    customAddresses: false,
    airport: false,
    office: false,
    trainStation: false,
  });
  const places = [place(480, "Warszawa"), place(479, "Warszawa"), place(489, "Kraków")];
  const dates = { start: "2026-11-20T10:00", end: "2026-11-23T10:00" };

  it("starts an empty search at the page's point", () => {
    const draft = withPagePickup(emptyDraft("short"), 480, places);
    assert.deepEqual(draft.pickup, { id: 480, address: null });
  });

  it("keeps a saved search in the same town", () => {
    const saved = { ...emptyDraft("short"), ...dates, pickup: { id: 479, address: null } };
    assert.equal(withPagePickup(saved, 480, places), saved);
  });

  it("replaces a saved search in another town, keeping its dates", () => {
    const saved = { ...emptyDraft("short"), ...dates, pickup: { id: 489, address: null }, differentReturn: true, dropoff: { id: 479, address: null } };
    const draft = withPagePickup(saved, 480, places);
    assert.deepEqual([draft.pickup, draft.differentReturn, draft.dropoff, draft.start, draft.end], [
      { id: 480, address: null },
      false,
      null,
      dates.start,
      dates.end,
    ]);
  });

  it("changes nothing without a point, or for one RentCarSoft does not list", () => {
    const saved = { ...emptyDraft("short"), pickup: { id: 489, address: null } };
    assert.equal(withPagePickup(saved, null, places), saved);
    assert.equal(withPagePickup(saved, 999, places), saved);
    assert.equal(withPagePickup(saved, 480, []), saved);
  });
});

describe("pickup time check (PickupTimeGuard)", () => {
  const search = (start: string, end: string) =>
    ({ term: "short", pickup: { id: 1, address: null }, dropoff: null, start, end }) as const;

  it("leaves a pickup far ahead alone, unless the page already found it too early", () => {
    assert.equal(pickupTimeCheck(search("2099-01-10T10:00", "2099-01-14T10:00")), null);
    assert.notEqual(pickupTimeCheck(search("2099-01-10T10:00", "2099-01-14T10:00"), true), null);
  });

  it("moves a passed pickup to an open slot and keeps the rental length", () => {
    const check = pickupTimeCheck(search("2020-01-10T10:00", "2020-01-14T10:00"));
    assert.ok(check);
    assert.equal(check.passed, true);
    assert.equal(check.start, "2020-01-10T10:00");
    assert.ok(check.moved.start > "2020-01-10T10:00");
    const moved = toZonedDateTime(check.moved.start)!;
    const end = toZonedDateTime(check.moved.term === "short" ? check.moved.end : "")!;
    assert.equal(end.toDate().getTime() - moved.toDate().getTime(), 4 * 24 * 60 * 60 * 1000);
  });
});
