import { intlLocales, type Lang } from "@/i18n/config";
import type { Extra, ExtraPresentation } from "@/lib/rentcarsoft";

import type { PriceUnit } from "./extras";
import { richText } from "./text";

/** `Extra.type` of the insurance addons ("Ubezpieczenia"). */
export const INSURANCE_TYPE = 1;

/** Shield colour for the fallback icon, by price rank: cheapest bronze, dearest gold. */
export type ProtectionTier = "bronze" | "silver" | "gold";

/** Which cover a row describes; its label is `protection.rows.<key>` in messages/{lang}.json. */
export type ProtectionRowKey =
  | "thirdPartyInsuranceDamage"
  | "bodyworkDamage"
  | "tiresRimsDamage"
  | "glassDamage"
  | "totalLoss"
  | "theft"
  | "replacementCar";

export type ProtectionRow = {
  key: ProtectionRowKey;
  value: string;
  /** Nothing to pay: "0 zł" or a free replacement car. */
  covered: boolean;
};

/**
 * A row's value in the page language. RentCarSoft writes them in Polish only
 * ("1500 zł", "0 zł", "bezpłatnie"), whatever `lang` asks for: amounts are
 * formatted for `lang` ("PLN 1,500"), a free word becomes `included`, and any
 * other text stays as sent.
 */
export function rowValue(row: ProtectionRow, lang: Lang, included: string): string {
  const amount = row.value.match(/^(\d[\d\s.]*)\s*(zł|pln)$/i);
  if (amount) {
    const number = Number(amount[1].replace(/[\s.]/g, ""));
    return new Intl.NumberFormat(intlLocales[lang], { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(number);
  }
  return row.covered ? included : row.value;
}

/** What a protection card shows. Built on the server from the dated addon list. */
export type ProtectionOption = {
  id: number;
  /** `price` is per rental day or per month, unless `oneTime`. */
  unit: PriceUnit;
  name: string;
  /** Shield picture managed in RentCarSoft, as the old site showed. */
  image: string | null;
  /** Cleaned HTML (`richText`); render it as markup. */
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

/** Rows in the old site's order. */
const ROWS: (ProtectionRowKey & keyof ExtraPresentation)[] = [
  "thirdPartyInsuranceDamage",
  "bodyworkDamage",
  "tiresRimsDamage",
  "glassDamage",
  "totalLoss",
  "theft",
  "replacementCar",
];

/** Values RentCarSoft writes for "nothing to pay", in the languages it answers in. */
const COVERED = new Set(["0 zł", "0 pln", "bezpłatnie", "free", "free of charge", "kostenlos", "безкоштовно"]);

/**
 * Insurance packages from a dated addon list, cheapest first. The dearest one
 * is marked recommended. Other addon groups are left for the extras step.
 */
export function toProtectionOptions(extras: Extra[], unit: PriceUnit = "day"): ProtectionOption[] {
  const insurance = extras
    .filter((extra) => extra.type === INSURANCE_TYPE)
    .toSorted((left, right) => total(left) - total(right));
  const last = insurance.length - 1;

  return insurance.map((extra, index) => {
    const discounted = extra.isDiscounted ? extra.discountedCalculatedPrice : null;
    return {
      id: extra.id,
      unit,
      name: extra.name,
      image: extra.image,
      description: extra.description ? richText(extra.description) : null,
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
  return ROWS.flatMap((key) => {
    const value = presentation[key]?.replace(/\s+/g, " ").trim();
    if (!value) {
      return [];
    }
    return [{ key, value, covered: COVERED.has(value.toLocaleLowerCase()) }];
  });
}
