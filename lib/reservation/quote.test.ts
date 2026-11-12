import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ReservationQuote } from "@/lib/rentcarsoft";

import { quoteQuery, toQuoteView } from "./quote";

const base: ReservationQuote = {
  term: "short",
  pickUpName: null,
  returnName: null,
  pickUpAt: null,
  returnAt: null,
  vehicleName: null,
  vehicleId: null,
  segmentName: null,
  imageFile: null,
  imageWebpFile: null,
  deposit: 0,
  available: true,
  price: 894,
  priceDiscounted: 715.2,
  priceWithoutDiscount: 894,
  mileageLimit: 400,
  mileageLimitFee: 0.5,
  total: 1179.2,
  pickUpPrice: 50,
  returnPrice: 0,
  relocationPrice: null,
  rent: 715.2,
  days: 6,
  hours: 144,
  months: null,
  monthlyKmLimitInput: null,
  monthlyRent: null,
  oneTimeTotal: null,
  monthlyWithExtras: null,
  monthlyKmLimit: null,
  totalKmLimit: null,
  addons: [
    { id: 414, price: 414, suggested: 69, itemPrice: 69, isOneTime: false, name: "Ochrona Premium", nameEn: null },
  ],
  accessories: [],
};

describe("quote view", () => {
  it("lists the API's own amounts and total", () => {
    assert.deepEqual(toQuoteView(base), {
      lines: [
        { kind: "rent", days: 6, amount: 715.2, regular: 894 },
        { kind: "pickup", amount: 50, regular: null },
        { kind: "item", name: "Ochrona Premium", amount: 414, regular: null },
      ],
      total: 1179.2,
      deposit: 0,
    });
  });

  it("rejects a quote without a total", () => {
    assert.throws(() => toQuoteView({ ...base, total: null }));
  });

  it("builds the request from the search query", () => {
    assert.equal(
      quoteQuery("pl", "pickup=479&from=2026-11-20T10%3A00", 4457, [1006]),
      "pickup=479&from=2026-11-20T10%3A00&lang=pl&offer=4457&addon=1006",
    );
  });
});

describe("monthly quote", () => {
  // Live API, 12 November 2026: offer 5196, 3 months, 2000 km, Standard, zone 1, guarantee, one child seat.
  const monthly: ReservationQuote = {
    ...base,
    term: "long",
    total: 8950,
    pickUpPrice: 0,
    returnPrice: 0,
    relocationPrice: 0,
    rent: null,
    days: null,
    months: 3,
    monthlyRent: 2650,
    monthlyWithExtras: 2950,
    oneTimeTotal: 100,
    monthlyKmLimit: 2000,
    totalKmLimit: 6000,
    mileageLimitFee: 0.5,
    addons: [
      { id: 0, price: 0, suggested: 0, itemPrice: 0, isOneTime: false, name: "Ochrona Standard", nameEn: null },
      { id: 450, price: 450, suggested: 150, itemPrice: 150, isOneTime: false, name: "Strefa 1", nameEn: null },
      { id: 100, price: 100, suggested: 100, itemPrice: 100, isOneTime: true, name: "Gwarancja", nameEn: null },
    ],
    accessories: [
      { id: 450, price: 450, suggested: 150, itemPrice: 150, isOneTime: false, name: "Fotelik", nameEn: null },
    ],
  };

  it("splits monthly and one-time lines and keeps the API totals", () => {
    const view = toQuoteView({ ...monthly, months: null }, 3);
    assert.equal(view.total, 8950);
    assert.deepEqual(
      view.lines.map((line) => [line.kind, line.name ?? null, line.amount]),
      [
        ["monthlyRent", null, 2650],
        ["item", "Ochrona Standard", 0],
        ["item", "Strefa 1", 150],
        ["item", "Fotelik", 150],
      ],
    );
    assert.deepEqual(view.monthly, {
      months: 3,
      perMonth: 2950,
      oneTimeLines: [{ kind: "item", name: "Gwarancja", amount: 100, regular: null }],
      oneTimeTotal: 100,
      kmPerMonth: 2000,
      kmTotal: 6000,
      overLimitFee: 0.5,
    });
  });
});
