import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { extensionCandidate } from "./extend";
import type { OfferCard } from "./offers";

// Bands of class A on the live list, 12 November 2026.
const bands = [
  { from: null, to: 1, daily: 161.1 },
  { from: 2, to: 3, daily: 125.1 },
  { from: 4, to: 7, daily: 95.2 },
  { from: 8, to: 14, daily: 92.65 },
  { from: 15, to: 29, daily: 89.1 },
  { from: 30, to: null, daily: 84.55 },
];
const car = (days: number | null, dailyPrice: number | null) => ({ days, dailyPrice, bands }) as unknown as OfferCard;

describe("extensionCandidate", () => {
  it("suggests the next band when it starts within two days", () => {
    assert.deepEqual(extensionCandidate(car(3, 125.1)), { addDays: 1, days: 4, dailyBefore: 125.1, dailyAfter: 95.2 });
    assert.deepEqual(extensionCandidate(car(2, 125.1)), { addDays: 2, days: 4, dailyBefore: 125.1, dailyAfter: 95.2 });
  });

  it("stays quiet when the next cheaper band is further away", () => {
    assert.equal(extensionCandidate(car(4, 95.2)), null);
    assert.equal(extensionCandidate(car(10, 92.65)), null);
  });

  it("needs a day count and a daily price", () => {
    assert.equal(extensionCandidate(car(null, 125.1)), null);
    assert.equal(extensionCandidate(car(3, null)), null);
  });
});
