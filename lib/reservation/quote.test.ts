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
        { label: "Wynajem (6 dób)", amount: 715.2, regular: 894 },
        { label: "Podstawienie auta", amount: 50, regular: null },
        { label: "Ochrona Premium", amount: 414, regular: null },
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
