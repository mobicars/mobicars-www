import type { Extra } from "@/lib/rentcarsoft";

import { plainText } from "./text";

/**
 * The extras step: everything after insurance. RentCarSoft has two kinds,
 * and the site keeps them apart the way the old site did:
 *
 * - addons (`listAddons`): yes or no. Border trips are addons too, but only
 *   one zone makes sense, so they are a single choice here.
 * - accessories (`listAccessories`): a quantity, 0 to `MAX_QUANTITY`.
 *
 * Prices are the API's. A one-time extra costs its `price` once (the quote
 * charges it once, while the list's `calculatedPrice` multiplies it by the
 * days); a per-day extra costs `calculatedPrice` for the period.
 */

export const MAX_QUANTITY = 5;

/** `Extra.type` values, as the old site grouped them. 1 (insurance) is its own step. */
const TYPE = { other: 0, insurance: 1, kids: 2, multimedia: 3, border: 4 } as const;

export type ExtraGroupId = "kids" | "multimedia" | "other";

/** Group titles are `extras.groups.<id>` in messages/{lang}.json. */
const GROUPS: { id: ExtraGroupId; type: number | null }[] = [
  { id: "kids", type: TYPE.kids },
  { id: "multimedia", type: TYPE.multimedia },
  { id: "other", type: TYPE.other },
];

/** What a price is per: a rental day (daily rental) or a month (monthly rental). */
export type PriceUnit = "day" | "month";

export type ExtraOption = {
  id: number;
  /** `price` is per this unit, unless `oneTime`. */
  unit: PriceUnit;
  kind: "toggle" | "quantity";
  name: string;
  /** Border zones: the part of the name in brackets, e.g. "limit 400 km/ doba". */
  note: string | null;
  description: string | null;
  image: string | null;
  /** Per day, or once when `oneTime`. Per unit for quantities. */
  price: number;
  oneTime: boolean;
  /** For the whole period, per unit. Null when the API sent none. */
  periodPrice: number | null;
};

export type ExtraGroup = { id: ExtraGroupId; items: ExtraOption[] };

export type ExtrasView = {
  /** Border trip zones, cheapest first. A single choice; none is the default. */
  zones: ExtraOption[];
  groups: ExtraGroup[];
};

/** The customer's choice, as it travels in the URL. */
export type ExtrasSelection = {
  zone: number | null;
  /** Yes/no addons that are switched on. */
  addons: number[];
  /** Accessory id → quantity, 1 to `MAX_QUANTITY`. */
  accessories: Map<number, number>;
};

export function toExtrasView(addons: Extra[], accessories: Extra[], unit: PriceUnit = "day"): ExtrasView {
  const zones = addons
    .filter((extra) => extra.type === TYPE.border && isOffered(extra))
    .map((extra) => zoneOption(extra, unit))
    .toSorted((left, right) => left.price - right.price);
  const items = [
    ...addons
      .filter((extra) => extra.type !== TYPE.border && isOffered(extra))
      .map((extra) => ({ extra, kind: "toggle" as const })),
    ...accessories.filter(isOffered).map((extra) => ({ extra, kind: "quantity" as const })),
  ];

  return {
    zones,
    groups: GROUPS.map(({ id }) => ({
      id,
      items: items.filter(({ extra }) => groupOf(extra.type) === id).map(({ extra, kind }) => toOption(extra, kind, unit)),
    })).filter((group) => group.items.length > 0),
  };
}

/** Kids and multimedia by type; any other type, known or new, goes to "Pozostałe". */
function groupOf(type: number | null): ExtraGroupId {
  return GROUPS.find((group) => group.type === type)?.id ?? "other";
}

/** Keeps only choices the view offers; quantities are clamped to 1–`MAX_QUANTITY`. */
export function sanitizeSelection(selection: ExtrasSelection, view: ExtrasView): ExtrasSelection {
  const toggles = new Set(view.groups.flatMap((group) => group.items.filter((item) => item.kind === "toggle").map((item) => item.id)));
  const quantities = new Set(view.groups.flatMap((group) => group.items.filter((item) => item.kind === "quantity").map((item) => item.id)));
  const accessories = new Map<number, number>();
  for (const [id, quantity] of selection.accessories) {
    if (quantities.has(id) && quantity > 0) {
      accessories.set(id, Math.min(quantity, MAX_QUANTITY));
    }
  }
  return {
    zone: view.zones.some((zone) => zone.id === selection.zone) ? selection.zone : null,
    addons: [...new Set(selection.addons)].filter((id) => toggles.has(id)),
    accessories,
  };
}

/** How many choices `sanitizeSelection` left out: zone, addons and accessories each count once. */
export function droppedChoices(before: ExtrasSelection, after: ExtrasSelection): number {
  const zone = before.zone !== null && after.zone === null ? 1 : 0;
  const addons = new Set(before.addons).size - after.addons.length;
  const accessories = [...before.accessories].filter(([id, quantity]) => quantity > 0 && !after.accessories.has(id)).length;
  return zone + addons + accessories;
}

/** `extras=1007,2754&acc=703-2,147-1`. Malformed parts are dropped. */
export function selectionFromQuery(extras: string | null, accessories: string | null, zone: string | null): ExtrasSelection {
  const ids = (value: string | null) =>
    (value ?? "")
      .split(",")
      .map((part) => positiveInt(part))
      .filter((id): id is number => id !== null);
  const map = new Map<number, number>();
  for (const part of (accessories ?? "").split(",")) {
    const [id, quantity] = part.split("-").map(positiveInt);
    if (id && quantity) {
      map.set(id, quantity);
    }
  }
  return { zone: positiveInt(zone ?? ""), addons: ids(extras), accessories: map };
}

/** The URL values for a selection; `null` removes the parameter. */
export function selectionToQuery(selection: ExtrasSelection): {
  zone: string | null;
  extras: string | null;
  acc: string | null;
} {
  const accessories = [...selection.accessories].map(([id, quantity]) => `${id}-${quantity}`);
  return {
    zone: selection.zone === null ? null : String(selection.zone),
    extras: selection.addons.length ? selection.addons.join(",") : null,
    acc: accessories.length ? accessories.join(",") : null,
  };
}

/** Addon ids for the quote: the zone and the switched-on extras. */
export function selectedAddonIds(selection: ExtrasSelection): number[] {
  return [...(selection.zone === null ? [] : [selection.zone]), ...selection.addons];
}

export function selectedAccessories(selection: ExtrasSelection): { id: number; quantity: number }[] {
  return [...selection.accessories].map(([id, quantity]) => ({ id, quantity }));
}

/**
 * The old site hid an extra that has no price for the day count (its `prices`
 * bands start later, e.g. long-term zones from 30 days, or it is free).
 * The same rule here: insurance aside, only priced extras are offered.
 */
function isOffered(extra: Extra): boolean {
  return extra.type !== TYPE.insurance && ((extra.isDiscounted ? extra.priceDiscounted : extra.price) ?? 0) > 0;
}

function toOption(extra: Extra, kind: ExtraOption["kind"], unit: PriceUnit): ExtraOption {
  const price = (extra.isDiscounted ? extra.priceDiscounted : extra.price) ?? 0;
  const oneTime = extra.oneTimeFee === true;
  return {
    id: extra.id,
    unit,
    kind,
    name: extra.name.trim(),
    note: null,
    description: extra.description ? plainText(extra.description) : null,
    image: extra.image,
    price,
    oneTime,
    periodPrice: oneTime ? price : (extra.isDiscounted ? extra.discountedCalculatedPrice : extra.calculatedPrice),
  };
}

/** "Wyjazd za granicę Strefa 1 (limit 400 km/ doba)" → "Strefa 1" with the note "limit 400 km/ doba". */
function zoneOption(extra: Extra, unit: PriceUnit): ExtraOption {
  const option = toOption(extra, "toggle", unit);
  const match = option.name.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  const base = (match ? match[1] : option.name).replace(/^wyjazd za granic[ęe]\s*/i, "").trim();
  return { ...option, name: base || option.name, note: match ? match[2].trim() : null };
}

function positiveInt(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d{1,9}$/.test(trimmed)) {
    return null;
  }
  const parsed = Number(trimmed);
  return parsed > 0 ? parsed : null;
}
