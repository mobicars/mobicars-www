import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Extra } from "@/lib/rentcarsoft";

import { toProtectionOptions } from "./protection";

function extra(overrides: Partial<Extra>): Extra {
  return {
    id: 0,
    name: "",
    type: 1,
    description: null,
    image: null,
    oneTimeFee: false,
    price: null,
    priceDiscounted: null,
    calculatedPrice: null,
    discountedCalculatedPrice: null,
    isDiscounted: false,
    monthlyPrice: null,
    longTermVisible: null,
    inalienable: null,
    autoSelected: null,
    presentation: null,
    ...overrides,
  };
}

describe("protection options", () => {
  const options = toProtectionOptions([
    extra({ id: 1006, name: "Premium", price: 99, calculatedPrice: 297 }),
    extra({ id: 3765, name: "Gwarancja modelu", type: 0, calculatedPrice: 100 }),
    extra({
      id: 2887,
      name: "Standard",
      price: 0,
      calculatedPrice: 0,
      description: "<p>Ochrona&nbsp;Standard jest <b>bezpłatna</b>.</p>",
      presentation: {
        thirdPartyInsuranceDamage: "0 zł",
        bodyworkDamage: "2000/ 3000 zł",
        tiresRimsDamage: "100%  kosztu naprawy",
        glassDamage: null,
        totalLoss: null,
        theft: null,
        replacementCar: "Bezpłatnie",
      },
    }),
    extra({ id: 1005, name: "Komfort", price: 69, calculatedPrice: 207, isDiscounted: true, discountedCalculatedPrice: 180 }),
  ]);

  it("keeps insurance only, cheapest first, with shield tiers", () => {
    assert.deepEqual(
      options.map((option) => [option.id, option.tier, option.recommended]),
      [
        [2887, "bronze", false],
        [1005, "silver", false],
        [1006, "gold", true],
      ],
    );
  });

  it("uses the promotional total and keeps the regular one", () => {
    assert.equal(options[1].totalPrice, 180);
    assert.equal(options[1].regularTotalPrice, 207);
    assert.equal(options[2].regularTotalPrice, null);
  });

  it("cleans rows and the description", () => {
    assert.deepEqual(options[0].rows, [
      { key: "thirdPartyInsuranceDamage", value: "0 zł", covered: true },
      { key: "bodyworkDamage", value: "2000/ 3000 zł", covered: false },
      { key: "tiresRimsDamage", value: "100% kosztu naprawy", covered: false },
      { key: "replacementCar", value: "Bezpłatnie", covered: true },
    ]);
    assert.equal(options[0].description, "Ochrona Standard jest bezpłatna.");
  });
});
