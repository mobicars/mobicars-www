import type { Extra, ExtraPresentation } from "@/lib/rentcarsoft";

import { plainText } from "./text";

/** `Extra.type` of the insurance addons ("Ubezpieczenia"). */
export const INSURANCE_TYPE = 1;

/** Shield colour for the fallback icon, by price rank: cheapest bronze, dearest gold. */
export type ProtectionTier = "bronze" | "silver" | "gold";

export type ProtectionRow = {
  label: string;
  value: string;
  /** Nothing to pay: "0 zł" or a free replacement car. */
  covered: boolean;
};

/** What a protection card shows. Built on the server from the dated addon list. */
export type ProtectionOption = {
  id: number;
  name: string;
  /** Shield picture managed in RentCarSoft, as the old site showed. */
  image: string | null;
  /** Plain text; the API sends HTML. */
  description: string | null;
  /** Per day for the searched day count, or the one-time fee. */
  price: number | null;
  oneTime: boolean;
  /** For the whole searched period. Matches the calculate addon line. */
  totalPrice: number | null;
  /** Before a promotion, to strike through. Null without one. */
  regularTotalPrice: number | null;
  rows: ProtectionRow[];
  tier: ProtectionTier;
  /** Shown as "Najczęściej wybierany": the dearest package, as on carfree.pl. */
  recommended: boolean;
};

/** Row labels in the old site's order. */
const ROWS: { key: keyof ExtraPresentation; label: string }[] = [
  { key: "thirdPartyInsuranceDamage", label: "Szkoda z OC" },
  { key: "bodyworkDamage", label: "Uszkodzenie zewnętrzne" },
  { key: "tiresRimsDamage", label: "Uszkodzenie kół" },
  { key: "glassDamage", label: "Uszkodzenie szyby" },
  { key: "totalLoss", label: "Szkoda całkowita" },
  { key: "theft", label: "Kradzież" },
  { key: "replacementCar", label: "Auto zastępcze" },
];

/**
 * Insurance packages from a dated addon list, cheapest first. The dearest one
 * is marked recommended. Other addon groups are left for the extras step.
 */
export function toProtectionOptions(extras: Extra[]): ProtectionOption[] {
  const insurance = extras
    .filter((extra) => extra.type === INSURANCE_TYPE)
    .toSorted((left, right) => total(left) - total(right));
  const last = insurance.length - 1;

  return insurance.map((extra, index) => {
    const discounted = extra.isDiscounted ? extra.discountedCalculatedPrice : null;
    return {
      id: extra.id,
      name: extra.name,
      image: extra.image,
      description: extra.description ? plainText(extra.description) : null,
      price: extra.isDiscounted ? (extra.priceDiscounted ?? extra.price) : extra.price,
      oneTime: extra.oneTimeFee === true,
      totalPrice: discounted ?? extra.calculatedPrice,
      regularTotalPrice: discounted !== null ? extra.calculatedPrice : null,
      rows: rows(extra.presentation),
      tier: index === 0 ? "bronze" : index === last ? "gold" : "silver",
      recommended: last > 0 && index === last,
    };
  });
}

function total(extra: Extra): number {
  return (extra.isDiscounted ? extra.discountedCalculatedPrice : extra.calculatedPrice) ?? Infinity;
}

function rows(presentation: ExtraPresentation | null): ProtectionRow[] {
  if (!presentation) {
    return [];
  }
  return ROWS.flatMap(({ key, label }) => {
    const value = presentation[key]?.replace(/\s+/g, " ").trim();
    if (!value) {
      return [];
    }
    const lower = value.toLocaleLowerCase("pl");
    return [{ label, value, covered: lower === "0 zł" || lower === "bezpłatnie" }];
  });
}
