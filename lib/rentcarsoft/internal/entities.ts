import { RentCarSoftError } from "./errors";
import {
  ACTIVE_SERVICE_POINT_STATUS_VALUE,
  RCS_LANGUAGE_IDS,
  OFFICE_YES_VALUE,
  OFFER_KEY_LABELS,
  POPULAR_OFFER_VALUE,
  PRICE_GROUP_KEY_LABELS,
  SERVICE_POINT_KEY_LABELS,
  SERVICE_POINT_STATUS_KEY_ID,
  TRAIN_STATION_YES_VALUE,
} from "./labels";
import {
  asBoolean,
  asId,
  asNumber,
  asString,
  expectArray,
  expectRecord,
  isRecord,
  mapCustomFields,
  requireId,
  type FieldAttribute,
  type KeyDefinition,
} from "./parse";

export type OfferImage = {
  alt: string;
  /** `default`: the offer's main photo. Exactly one per offer on the live list. */
  main: boolean;
  /** `cover` or `coverBig`. Several photos per offer can carry it. */
  cover: boolean;
  webp: string | null;
  standard: string | null;
  /** The `original` size, for a full-width gallery. Null when the payload has none. */
  largeWebp: string | null;
  largeStandard: string | null;
};

/** One row of the segment price list: price per day for a rental of `from`–`to` days. */
export type OfferPriceBand = {
  /** Null on the first band ("up to `to` days"). */
  from: number | null;
  /** Null on the last band ("`from` days and more"). */
  to: number | null;
  price: number | null;
  /** The band's promotional price. Null without a promotion or when equal to `price`. */
  promotionalPrice: number | null;
};

/**
 * The segment's base price list from `cennik[segmentId]` on an undated
 * short-term list or `getOffer`. Base prices only: a quote for real dates
 * comes from `calculateReservation`.
 */
export type OfferPriceList = {
  /** `kaucja`. 0 on the live catalog of 12 November 2026. */
  deposit: number | null;
  /** `monthly_price`: the segment's monthly price shown as "from" on the fleet pages. */
  monthlyFrom: number | null;
  bands: OfferPriceBand[];
};

export type OfferPromotion = {
  name: string | null;
  /** `YYYY-MM-DD HH:mm:ss`, Warsaw wall time. */
  startsAt: string | null;
  endsAt: string | null;
  /**
   * Promotional per-day price: `promocja` of the `cennik` band whose `od`–`do`
   * holds the list's own `days`. Null when no band matches.
   */
  dailyPrice: number | null;
};

export type Offer = {
  id: number;
  brand: string;
  model: string;
  segmentName: string;
  segmentId: string | null;
  shortTerm: boolean;
  longTerm: boolean;
  subscription: boolean;
  rentable: boolean;
  available: boolean | null;
  deposit: number | null;
  dailyPrice: number | null;
  calculatedPrice: number | null;
  /**
   * Dated short-term list: true when a segment promotion applies to the asked
   * window. `discountedCalculatedPrice` then holds the promotional total, which
   * matched the calculate `total` on the live API. Without a promotion it
   * equals `calculatedPrice`.
   */
  isDiscounted: boolean;
  discountedCalculatedPrice: number | null;
  /** Rental days the API counted for the asked window. Null on undated lists. */
  days: number | null;
  /** Segment promotion from `cennik[segmentId]`, when `is_promocja` is set. */
  promotion: OfferPromotion | null;
  /**
   * Long-term list only (`longTermQuote`): monthly price for the asked month
   * count and kilometre limit, from `cennik.cena_miesieczna`. Null otherwise.
   */
  monthlyPrice: number | null;
  attributes: Record<string, FieldAttribute>;
  isPopular: boolean;
  gallery: OfferImage[];
  /** Lowest and highest base price per day across the price bands (`minPrice`, `maxPrice`). */
  minPrice: number | null;
  maxPrice: number | null;
  /** Equipment lines (`details`), trimmed. Object items use their `nazwa`. */
  details: string[];
  /** Short-term `cennik` of the offer's segment. Null on the long-term list and when absent. */
  priceList: OfferPriceList | null;
};

export function parseOffers(
  value: unknown,
  definitions?: KeyDefinition[],
): Offer[] {
  return expectArray(value).map((item) => parseOffer(item, definitions));
}

export function parseOffer(
  value: unknown,
  definitions?: KeyDefinition[],
): Offer {
  const record = expectRecord(value);
  const attributes = mapCustomFields(record.offerKeys, OFFER_KEY_LABELS, definitions);
  const popular = attributes.isPopular;

  return {
    id: requireId(record.id),
    brand: asString(record.mark) ?? "",
    model: asString(record.model) ?? "",
    segmentName: asString(record.segment) ?? "",
    segmentId: record.segmentId === undefined || record.segmentId === null
      ? null
      : String(record.segmentId),
    shortTerm: asBoolean(record.shortTerm) ?? false,
    longTerm: asBoolean(record.longTerm) ?? false,
    subscription: asBoolean(record.subscription) ?? false,
    rentable: asBoolean(record.rentable) ?? false,
    available: asBoolean(record.available),
    deposit: asNumber(record.deposit),
    dailyPrice: asNumber(record.dailyPrice),
    calculatedPrice: asNumber(record.calculatedPrice),
    isDiscounted: asBoolean(record.isDiscounted) ?? false,
    discountedCalculatedPrice: asNumber(record.discountedCalculatedPrice),
    days: asNumber(record.days),
    promotion: parsePromotion(record.cennik, record.segmentId, asNumber(record.days)),
    monthlyPrice: isRecord(record.cennik) ? asNumber(record.cennik.cena_miesieczna) : null,
    attributes,
    isPopular: popular?.valueId === asId(POPULAR_OFFER_VALUE),
    gallery: parseGallery(record.gallery),
    minPrice: asNumber(record.minPrice),
    maxPrice: asNumber(record.maxPrice),
    details: parseDetails(record.details),
    priceList: parsePriceList(record.cennik, record.segmentId),
  };
}

/**
 * The short-term `cennik` entry of the offer's segment. `GET /offer/{id}` has
 * no `segmentId`, but its `cennik` has exactly one segment key, so a single
 * entry is taken as the offer's own. The long-term flat object has none.
 */
function segmentPrices(cennik: unknown, segmentId: unknown): Record<string, unknown> | null {
  if (!isRecord(cennik) || "cena_miesieczna" in cennik) {
    return null;
  }
  const entries = Object.values(cennik);
  const segment =
    segmentId === undefined || segmentId === null
      ? entries.length === 1 ? entries[0] : undefined
      : cennik[String(segmentId)];
  return isRecord(segment) ? segment : null;
}

function parseDetails(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    const text = isRecord(item) ? asString(item.nazwa) : asString(item);
    const trimmed = text?.replace(/\s+/g, " ").trim();
    return trimmed ? [trimmed] : [];
  });
}

function parsePriceList(cennik: unknown, segmentId: unknown): OfferPriceList | null {
  const segment = segmentPrices(cennik, segmentId);
  if (!segment) {
    return null;
  }
  const bands = Array.isArray(segment.czasy)
    ? segment.czasy.flatMap((band) => {
        if (!isRecord(band)) {
          return [];
        }
        const price = asNumber(band.cena);
        const promotional = asNumber(band.promocja);
        return [
          {
            from: asNumber(band.od),
            to: asNumber(band.do),
            price,
            promotionalPrice: promotional !== null && promotional !== price ? promotional : null,
          },
        ];
      })
    : [];
  bands.sort((left, right) => (left.from ?? 0) - (right.from ?? 0));
  return {
    deposit: asNumber(segment.kaucja),
    monthlyFrom: asNumber(segment.monthly_price),
    bands,
  };
}

/**
 * The short-term `cennik` is keyed by segment id. The long-term list reuses the
 * name for a flat `{ cena_miesieczna, … }` object, which has no promotion.
 */
function parsePromotion(cennik: unknown, segmentId: unknown, days: number | null): OfferPromotion | null {
  const segment = segmentPrices(cennik, segmentId);
  if (!segment || asNumber(segment.is_promocja) !== 1) {
    return null;
  }
  return {
    name: asString(segment.promocja_nazwa)?.trim() || null,
    startsAt: asString(segment.promocja_od),
    endsAt: asString(segment.promocja_do),
    dailyPrice: days === null ? null : bandPromotion(segment.czasy, days),
  };
}

/** The band's own promotional price; the bridge picks it, it does not compute one. */
function bandPromotion(bands: unknown, days: number): number | null {
  if (!Array.isArray(bands)) {
    return null;
  }
  for (const band of bands) {
    if (!isRecord(band)) {
      continue;
    }
    const from = asNumber(band.od);
    const to = asNumber(band.do);
    if ((from === null || days >= from) && (to === null || days <= to)) {
      return asNumber(band.promocja);
    }
  }
  return null;
}

function findRawKey(keys: unknown, id: number): unknown {
  if (!Array.isArray(keys)) {
    return undefined;
  }
  for (const item of keys) {
    if (isRecord(item) && asId(item.id) === id) {
      return item.value;
    }
  }
  return undefined;
}

function parseGallery(value: unknown): OfferImage[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }
    const urls = Array.isArray(item.urls) ? item.urls[0] : item.urls;
    const sized = isRecord(urls) ? urls["512"] ?? urls["384"] ?? urls.original : undefined;
    const webp = isRecord(sized) ? asString(sized.webp) : null;
    const standard = isRecord(sized) ? asString(sized.standard) : null;
    const original = isRecord(urls) && isRecord(urls.original) ? urls.original : null;
    return [
      {
        alt: asString(item.altText) ?? "",
        main: asBoolean(item.default) ?? false,
        cover: asBoolean(item.cover) ?? asBoolean(item.coverBig) ?? false,
        webp,
        standard,
        largeWebp: original ? asString(original.webp) : null,
        largeStandard: original ? asString(original.standard) : null,
      },
    ];
  });
}

export type ServicePointLang = keyof typeof RCS_LANGUAGE_IDS;

/** "… - od 79 zł" at the end of a point's address. */
const ADDRESS_FEE = /(?:^|\s*-\s*)(od\s+)?(\d+(?:[.,]\d+)?)\s*zł\s*$/i;
/** What address points (`customAddresses`) hold instead of an address. */
const ADDRESS_PLACEHOLDER = /^wpisz adres$/i;

/**
 * RentCarSoft keeps directions and the fee in one Polish text in every
 * language: "Parking P2 - wjazd obok Renaissance Hotel - od 79 zł",
 * "od 49 zł", "Wpisz adres - 60 zł". Split into the directions and the fee.
 */
export function splitAddress(address: string | null): Pick<ServicePoint, "addressNote" | "fee"> {
  if (!address) {
    return { addressNote: null, fee: null };
  }
  const match = ADDRESS_FEE.exec(address);
  const rest = (match ? address.slice(0, match.index) : address).replace(/[\s-]+$/, "").trim();
  return {
    addressNote: rest && !ADDRESS_PLACEHOLDER.test(rest) ? rest : null,
    fee: match ? { amount: Number(match[2].replace(",", ".")), from: Boolean(match[1]) } : null,
  };
}

export type ServicePoint = {
  id: number;
  name: string;
  /** The name in each site language RentCarSoft has it in (`names`), e.g. `{ pl, en, de, uk }`. */
  names: Partial<Record<ServicePointLang, string>>;
  active: boolean;
  instruction: string | null;
  /** From `latitude`, else custom field 18 (where RentCarSoft keeps it for most points). */
  latitude: number | null;
  /** From `longitude`, else custom field 19. */
  longitude: number | null;
  /** Custom field 5. */
  phone: string | null;
  /** Custom field 6. */
  email: string | null;
  departmentId: number | null;
  airport: boolean;
  /** Custom field 22. True when the live dictionary says "Tak" (value 13). */
  office: boolean;
  /** Custom field 21. True when the live dictionary says "Tak" (value 9). */
  trainStation: boolean;
  /** Custom field 3, the town, in Polish in every language ("Warszawa"). */
  city: string | null;
  /** The town in the list's language ("Warsaw"), from the points' names (`localizeCities`); else `city`. */
  cityName: string | null;
  /** Custom field 2 as RentCarSoft has it, in Polish: directions and the fee, e.g. "Parking P2 - od 79 zł". */
  address: string | null;
  /** `address` without the fee and without the "Wpisz adres" placeholder of address points. */
  addressNote: string | null;
  /** The pickup or delivery fee at the end of `address` ("od 79 zł" → `{ amount: 79, from: true }`). */
  fee: { amount: number; from: boolean } | null;
  minDays: number | null;
  maxDays: number | null;
  /** Point allows a customer pickup or return address. */
  customAddresses: boolean;
  addressRequired: boolean;
  attributes: Record<string, FieldAttribute>;
};

export function parseServicePoints(
  value: unknown,
  definitions?: KeyDefinition[],
): ServicePoint[] {
  return expectArray(value).map((item) => parseServicePoint(item, definitions));
}

export function parseServicePoint(
  value: unknown,
  definitions?: KeyDefinition[],
): ServicePoint {
  const record = expectRecord(value);
  const attributes = mapCustomFields(
    record.keys,
    SERVICE_POINT_KEY_LABELS,
    definitions,
  );
  const status = attributes.status;
  const active = status?.value === ACTIVE_SERVICE_POINT_STATUS_VALUE ||
    status?.valueId === asId(ACTIVE_SERVICE_POINT_STATUS_VALUE) ||
    rawStatus(record.keys) === ACTIVE_SERVICE_POINT_STATUS_VALUE;

  return {
    id: requireId(record.id),
    name: asString(record.name) ?? attributes.name?.value ?? "",
    names: parseNames(record.names),
    active,
    instruction: asString(record.customerInstruction) ?? textAttribute(attributes.instructions),
    latitude: asNumber(record.latitude) ?? coordinate(attributes.latitude),
    longitude: asNumber(record.longitude) ?? coordinate(attributes.longitude),
    phone: textAttribute(attributes.phone),
    email: textAttribute(attributes.email),
    departmentId: asId(record.department),
    airport: asBoolean(record.isAirport) ?? false,
    office: isAffirmative(attributes.isOffice, OFFICE_YES_VALUE),
    trainStation: isAffirmative(attributes.isTrainStation, TRAIN_STATION_YES_VALUE),
    city: textAttribute(attributes.city),
    cityName: textAttribute(attributes.city),
    address: textAttribute(attributes.address),
    ...splitAddress(textAttribute(attributes.address)),
    minDays: asId(record.minDays) ?? asId(textAttribute(attributes.minTime)),
    maxDays: asId(record.maxDays) ?? asId(textAttribute(attributes.maxTime)),
    customAddresses: asBoolean(record.customAddresses) ?? false,
    addressRequired: asBoolean(record.addressRequired) ?? false,
    attributes,
  };
}

export type RcsSegment = {
  /** `segmentId`: what the CMS stores (names change, the id is the price list's key). */
  id: number;
  /** Name per site language; a language whose list lacks the segment falls back to Polish. */
  names: Record<ServicePointLang, string>;
  /** Cars of the segment on the by-the-day list. */
  cars: number;
  /** Offered by the day (`short`) and/or by the month (`long`). */
  terms: ("short" | "long")[];
};

/**
 * Segments from offer lists: by-the-day lists per language, the monthly list
 * in any language. A segment with no cars on either list is left out; Polish
 * name order, as the CMS shows it.
 */
export function collectSegments(
  byDay: Partial<Record<ServicePointLang, readonly Offer[]>>,
  byMonth: readonly Offer[],
): RcsSegment[] {
  const segments = new Map<number, RcsSegment>();
  const entry = (offer: Offer): RcsSegment | null => {
    const id = Number(offer.segmentId);
    if (!offer.segmentId || !Number.isInteger(id)) {
      return null;
    }
    let segment = segments.get(id);
    if (!segment) {
      segment = { id, names: { pl: "", en: "", de: "", uk: "" }, cars: 0, terms: [] };
      segments.set(id, segment);
    }
    return segment;
  };
  for (const [lang, offers] of Object.entries(byDay) as [ServicePointLang, readonly Offer[]][]) {
    for (const offer of offers) {
      const segment = entry(offer);
      if (!segment) continue;
      segment.names[lang] ||= offer.segmentName.trim();
      if (lang === "pl") segment.cars += 1;
      if (!segment.terms.includes("short")) segment.terms.push("short");
    }
  }
  for (const offer of byMonth) {
    const segment = entry(offer);
    if (!segment) continue;
    segment.names.pl ||= offer.segmentName.trim();
    if (!segment.terms.includes("long")) segment.terms.push("long");
  }
  const list = [...segments.values()];
  for (const segment of list) {
    for (const lang of Object.keys(segment.names) as ServicePointLang[]) {
      segment.names[lang] ||= segment.names.pl;
    }
  }
  return list.toSorted((left, right) => left.names.pl.localeCompare(right.names.pl, "pl"));
}

/**
 * RentCarSoft has the town only in Polish, but most translated names start
 * with it: "Warsaw – Chopin Airport", "Варшава – офіс". Each town's
 * `cityName` is the most common such prefix among its points' names in
 * `lang`; Polish, or a town whose names have no prefix, keeps `city`.
 */
export function localizeCities<T extends Pick<ServicePoint, "city" | "cityName" | "name">>(points: readonly T[], lang: string): T[] {
  if (lang === "pl") {
    return [...points];
  }
  const prefixes = new Map<string, Map<string, number>>();
  for (const point of points) {
    const prefix = /^(.+?)\s+[–-]\s+/.exec(point.name)?.[1]?.trim();
    if (point.city && prefix) {
      const counts = prefixes.get(point.city) ?? new Map<string, number>();
      counts.set(prefix, (counts.get(prefix) ?? 0) + 1);
      prefixes.set(point.city, counts);
    }
  }
  const names = new Map(
    [...prefixes].map(([city, counts]) => [city, [...counts].toSorted((a, b) => b[1] - a[1])[0][0]] as const),
  );
  return points.map((point) => (point.city && names.has(point.city) ? { ...point, cityName: names.get(point.city)! } : point));
}

export type LocationStats = {
  /** Active fixed points (not "own address" delivery points). */
  points: number;
  /** Distinct towns of those points (custom field 3; RentCarSoft files a few points under a nearby town). */
  cities: number;
  /** Of those points, the airports. */
  airports: number;
};

/** Counts for copy such as "32 punkty odbioru w 10 miastach, w tym 8 lotnisk". */
export function countLocations(points: readonly ServicePoint[]): LocationStats {
  const fixed = points.filter((point) => point.active && !point.customAddresses);
  const cities = new Set(
    fixed.flatMap((point) => (point.city ? [point.city.trim().toLocaleLowerCase("pl")] : [])),
  );
  return {
    points: fixed.length,
    cities: cities.size,
    airports: fixed.filter((point) => point.airport).length,
  };
}

/** `names` keyed by RentCarSoft language id → by site language; blanks left out. */
function parseNames(value: unknown): Partial<Record<ServicePointLang, string>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const raw = value as Record<string, unknown>;
  const names: Partial<Record<ServicePointLang, string>> = {};
  for (const [lang, id] of Object.entries(RCS_LANGUAGE_IDS) as [ServicePointLang, string][]) {
    const name = asString(raw[id])?.trim();
    if (name) {
      names[lang] = name;
    }
  }
  return names;
}

/** A coordinate from a text field: "52.2297", also with a comma; anything else is null. */
function coordinate(attribute: FieldAttribute | undefined): number | null {
  const text = textAttribute(attribute)?.replace(",", ".");
  if (!text || !/^-?\d+(\.\d+)?$/.test(text)) {
    return null;
  }
  return Number(text);
}

function rawStatus(keys: unknown): string | null {
  return findRawKey(keys, SERVICE_POINT_STATUS_KEY_ID)?.toString() ?? null;
}

function textAttribute(attribute: FieldAttribute | undefined): string | null {
  const value = attribute?.value.trim();
  return value ? value : null;
}

function isAffirmative(
  attribute: FieldAttribute | undefined,
  yesValue: string,
): boolean {
  if (!attribute) {
    return false;
  }
  if (attribute.valueId === asId(yesValue) || attribute.value === yesValue) {
    return true;
  }
  const value = attribute.value.trim().toLocaleLowerCase("pl");
  return value === "tak" || value === "yes";
}

export function isActiveServicePoint(point: ServicePoint): boolean {
  return point.active;
}

export type Department = {
  id: number;
  name: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
};

export function parseDepartments(value: unknown): Department[] {
  return expectArray(value).map(parseDepartment);
}

export function parseDepartment(value: unknown): Department {
  const record = expectRecord(value);
  return {
    id: requireId(record.id),
    name: asString(record.name) ?? "",
    city: asString(record.city),
    address: asString(record.address),
    phone: asString(record.phone),
    email: asString(record.email),
  };
}

export type PriceBand = {
  from: number | null;
  to: number | null;
  price: number | null;
  priceNoLimit: number | null;
  mileageLimit: number | null;
};

export type PriceGroupMonthlyInfo = {
  monthlyPrice: number | null;
  monthlyPriceNoLimit: number | null;
  monthlyKmLimit: number | null;
  monthlyExceedingLimitFee: number | null;
};

export type PriceGroup = {
  id: number;
  sellNoLimit: boolean | null;
  exceedingLimitFee: number | null;
  monthlyInfo: PriceGroupMonthlyInfo | null;
  attributes: Record<string, FieldAttribute>;
  daily: PriceBand[];
  hourly: PriceBand[];
};

export function parsePriceGroups(
  value: unknown,
  definitions?: KeyDefinition[],
): PriceGroup[] {
  return expectArray(value).map((item) => parsePriceGroup(item, definitions));
}

export function parsePriceGroup(
  value: unknown,
  definitions?: KeyDefinition[],
): PriceGroup {
  const record = expectRecord(value);
  const prices = isRecord(record.prices) ? record.prices : {};
  return {
    id: requireId(record.id),
    sellNoLimit: asBoolean(record.sellNoLimit),
    exceedingLimitFee: asNumber(record.exceedingLimitFee),
    monthlyInfo: parseMonthlyInfo(record.monthlyInfo),
    attributes: mapCustomFields(record.keys, PRICE_GROUP_KEY_LABELS, definitions),
    daily: parseBands(prices.daily),
    hourly: parseBands(prices.hourly),
  };
}

function parseMonthlyInfo(value: unknown): PriceGroupMonthlyInfo | null {
  if (!isRecord(value)) {
    return null;
  }
  return {
    monthlyPrice: asNumber(value.monthlyPrice),
    monthlyPriceNoLimit: asNumber(value.monthlyPriceNoLimit),
    monthlyKmLimit: asNumber(value.monthlyKmLimit),
    monthlyExceedingLimitFee: asNumber(value.monthlyExceedingLimitFee),
  };
}

function parseBands(value: unknown): PriceBand[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }
    return [
      {
        from: asNumber(item.from),
        to: asNumber(item.to),
        price: asNumber(item.price),
        priceNoLimit: asNumber(item.priceNoLimit),
        mileageLimit: asNumber(item.mileageLimit),
      },
    ];
  });
}

export type ExtraPresentation = {
  thirdPartyInsuranceDamage: string | null;
  bodyworkDamage: string | null;
  tiresRimsDamage: string | null;
  glassDamage: string | null;
  totalLoss: string | null;
  theft: string | null;
  replacementCar: string | null;
};

export type Extra = {
  id: number;
  name: string;
  /**
   * `additionalType`: the group. `1` is insurance ("Ubezpieczenia"); the old
   * site also grouped `0` others, `2` kids, `3` multimedia, `4` border trips.
   */
  type: number | null;
  description: string | null;
  image: string | null;
  oneTimeFee: boolean | null;
  /** Per day, or once when `oneTimeFee`, for the day count of the asked window. */
  price: number | null;
  priceDiscounted: number | null;
  /**
   * Dated lists only: the price for the whole asked window. It matched the
   * calculate addon line on the live API. `discountedCalculatedPrice` is the
   * promotional one when `isDiscounted`.
   */
  calculatedPrice: number | null;
  discountedCalculatedPrice: number | null;
  isDiscounted: boolean;
  monthlyPrice: number | null;
  longTermVisible: boolean | null;
  inalienable: boolean | null;
  autoSelected: boolean | null;
  presentation: ExtraPresentation | null;
};

export function parseExtras(value: unknown): Extra[] {
  return expectArray(value).map(parseExtra);
}

export function parseExtra(value: unknown): Extra {
  const record = expectRecord(value);
  return {
    id: requireId(record.id),
    name: asString(record.name) ?? "",
    type: asNumber(record.additionalType),
    description: asString(record.description),
    image: asString(record.image),
    oneTimeFee: asBoolean(record.oneTimeFee),
    price: asNumber(record.price),
    priceDiscounted: asNumber(record.priceDiscounted),
    calculatedPrice: asNumber(record.calculatedPrice),
    discountedCalculatedPrice: asNumber(record.discountedCalculatedPrice),
    isDiscounted: asBoolean(record.isDiscounted) ?? false,
    monthlyPrice: asNumber(record.monthlyPrice),
    longTermVisible: asBoolean(record.longTermVisible),
    inalienable: asBoolean(record.inalienable),
    autoSelected: asBoolean(record.autoSelected),
    presentation: parsePresentation(record.presentation),
  };
}

function parsePresentation(value: unknown): ExtraPresentation | null {
  if (!isRecord(value)) {
    return null;
  }
  return {
    thirdPartyInsuranceDamage: asString(value.thirdPartyInsuranceDamage),
    bodyworkDamage: asString(value.bodyworkDamage),
    tiresRimsDamage: asString(value.tiresRimsDamage),
    glassDamage: asString(value.glassDamage),
    totalLoss: asString(value.totalLoss),
    theft: asString(value.theft),
    replacementCar: asString(value.replacementCar),
  };
}

export type ReservationQuote = {
  term: "short" | "long";
  pickUpName: string | null;
  returnName: string | null;
  pickUpAt: string | null;
  returnAt: string | null;
  vehicleName: string | null;
  vehicleId: string | null;
  segmentName: string | null;
  imageFile: string | null;
  imageWebpFile: string | null;
  deposit: number | null;
  /** `vehicle.isAvailable`. Not the top-level calculate `available` value. */
  available: boolean | null;
  /** `vehicle.price`. */
  price: number | null;
  priceDiscounted: number | null;
  priceWithoutDiscount: number | null;
  /** Kilometres from `vehicle.mileageLimit`, not the request flag. */
  mileageLimit: number | null;
  mileageLimitFee: number | null;
  total: number | null;
  pickUpPrice: number | null;
  returnPrice: number | null;
  relocationPrice: number | null;
  rent: number | null;
  days: number | null;
  hours: number | null;
  months: number | null;
  monthlyKmLimitInput: number | null;
  monthlyRent: number | null;
  oneTimeTotal: number | null;
  monthlyWithExtras: number | null;
  monthlyKmLimit: number | null;
  totalKmLimit: number | null;
  addons: QuoteLine[];
  accessories: QuoteLine[];
};

export type QuoteLine = {
  id: number | null;
  price: number | null;
  suggested: number | null;
  itemPrice: number | null;
  isOneTime: boolean | null;
  name: string | null;
  nameEn: string | null;
};

export function parseReservationQuote(value: unknown): ReservationQuote {
  const record = expectRecord(value);
  const prices = isRecord(record.prices) ? record.prices : null;
  const vehicle = isRecord(record.vehicle) ? record.vehicle : null;
  const release = isRecord(record.release) ? record.release : null;
  const dropoff = isRecord(record.return) ? record.return : null;
  if (!prices || !vehicle) {
    throw new RentCarSoftError("malformed_response");
  }

  const longTerm = "cena_miesieczna_najmu" in prices || "iloscMiesiecy" in record;

  return {
    term: longTerm ? "long" : "short",
    pickUpName: release ? asString(release.name) : null,
    returnName: dropoff ? asString(dropoff.name) : null,
    pickUpAt: release ? asString(release.data) : null,
    returnAt: dropoff ? asString(dropoff.data) : null,
    vehicleName: asString(vehicle.name),
    vehicleId: vehicle.id === undefined || vehicle.id === null ? null : String(vehicle.id),
    segmentName: asString(vehicle.priceSegmentName),
    imageFile: asString(vehicle.image),
    imageWebpFile: asString(vehicle.imageWebp),
    deposit: asNumber(vehicle.deposit),
    available: asBoolean(vehicle.isAvailable),
    price: asNumber(vehicle.price),
    priceDiscounted: asNumber(vehicle.priceDiscounted),
    priceWithoutDiscount: asNumber(vehicle.priceWithoutDiscount),
    mileageLimit: asNumber(vehicle.mileageLimit),
    mileageLimitFee: asNumber(vehicle.mileageLimitFee),
    total: asNumber(prices.total),
    pickUpPrice: asNumber(prices.pickUp),
    returnPrice: asNumber(prices.return),
    relocationPrice: asNumber(prices.relocation),
    rent: asNumber(prices.rent),
    days: asNumber(prices.days),
    hours: asNumber(prices.hours),
    months: asNumber(record.iloscMiesiecy),
    monthlyKmLimitInput: asNumber(record.limitKmMiesieczny),
    monthlyRent: asNumber(prices.cena_miesieczna_najmu),
    oneTimeTotal: asNumber(prices.razem_jednorazowo),
    monthlyWithExtras: asNumber(prices.razem_miesiecznie_najem_akcesoria_dodatki),
    monthlyKmLimit: asNumber(prices.limitKmMonth),
    totalKmLimit: asNumber(prices.limitKmTotal),
    addons: parseQuoteLines(prices.addons),
    accessories: parseQuoteLines(prices.accessories),
  };
}

function parseQuoteLines(value: unknown): QuoteLine[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }
    return [
      {
        id: asId(item.id),
        price: asNumber(item.price),
        suggested: asNumber(item.suggested),
        // Accessories send the per-unit price as `itemPriceMoi` (live API, long-term calculate).
        itemPrice: asNumber(item.itemPrice) ?? asNumber(item.itemPriceMoi),
        isOneTime: asBoolean(item.isOneTime),
        name: asString(item.name),
        nameEn: asString(item.nameEn),
      },
    ];
  });
}

export type CreatedReservation = {
  id: number | null;
  success: boolean;
  unique: boolean | null;
  paymentUrl: string | null;
};

export function parseCreatedReservation(value: unknown): CreatedReservation {
  const record = expectRecord(value);
  const success = asBoolean(record.success);
  if (success === null) {
    throw new RentCarSoftError("malformed_response");
  }
  return {
    id: asId(record.id),
    success,
    unique: asBoolean(record.unique),
    paymentUrl: asString(record.paymentUrl),
  };
}

export type Language = {
  id: number;
  name: string;
  code: string;
  default: boolean;
};

export function parseLanguages(value: unknown): Language[] {
  return expectArray(value).map((item) => {
    const record = expectRecord(item);
    const code = asString(record.code);
    if (!code) {
      throw new RentCarSoftError("malformed_response");
    }
    return {
      id: requireId(record.id),
      name: asString(record.name) ?? code,
      code,
      default: asBoolean(record.default) ?? false,
    };
  });
}

export type Currency = {
  id: number;
  name: string;
  code: string;
};

export function parseCurrencies(value: unknown): Currency[] {
  return expectArray(value).map((item) => {
    const record = expectRecord(item);
    return {
      id: requireId(record.id),
      name: asString(record.name) ?? "",
      code: asString(record.code) ?? "",
    };
  });
}

export type PaymentType = {
  id: number;
  name: string;
};

export function parsePaymentTypes(value: unknown): PaymentType[] {
  return expectArray(value).map((item) => {
    const record = expectRecord(item);
    return {
      id: requireId(record.id),
      name: asString(record.name) ?? "",
    };
  });
}

export type ReservationStatus = {
  name: string;
  /** The status holds the car. */
  blocksCar: boolean;
  /** Final status, e.g. “Zakończona”. */
  ending: boolean;
  cancelled: boolean;
  /** The car has been picked up, e.g. “Trwająca”. */
  pickedUp: boolean;
};

export type ReservationStop = {
  pointId: number | null;
  pointName: string | null;
  /** Custom address instead of a service point. */
  address: string | null;
  /** Warsaw wall time, `YYYY-MM-DD HH:mm:ss`. */
  date: string | null;
};

export type ReservationPayment = {
  paid: boolean | null;
  amountDue: number | null;
  totalPaid: number | null;
  remainingToPay: number | null;
  depositTotal: number | null;
  depositPaid: number | null;
};

export type ReservationAccountManager = {
  name: string | null;
  surname: string | null;
  email: string | null;
  phone: string | null;
};

export type ClientReservation = {
  id: number;
  number: string;
  createdAt: string | null;
  status: ReservationStatus | null;
  pickUp: ReservationStop;
  return: ReservationStop;
  longTerm: boolean;
  mileageLimit: {
    enabled: boolean;
    dailyAmount: number | null;
    totalAmount: number | null;
    fee: number | null;
  } | null;
  pickupCode: string | null;
  currency: string | null;
  comment: string | null;
  accountManager: ReservationAccountManager | null;
  payment: ReservationPayment;
  addons: { id: number; name: string }[];
  accessories: { id: number; name: string }[];
  offer: Offer | null;
  carImage: string | null;
};

export function parseClientReservations(
  value: unknown,
  definitions?: KeyDefinition[],
): ClientReservation[] {
  return expectArray(value).map((item) => parseClientReservation(item, definitions));
}

export function parseClientReservation(
  value: unknown,
  definitions?: KeyDefinition[],
): ClientReservation {
  const record = expectRecord(Array.isArray(value) && value.length === 1 ? value[0] : value);
  const status = isRecord(record.status) ? record.status : null;
  const payment = isRecord(record.payment) ? record.payment : {};
  const summary = isRecord(payment.chargeSummary) ? payment.chargeSummary : {};
  const deposit = isRecord(payment.deposit) ? payment.deposit : {};
  const mileage = isRecord(record.mileageLimit) ? record.mileageLimit : null;
  const manager = isRecord(record.accountManager) ? record.accountManager : null;
  const fleet = isRecord(record.fleet) ? record.fleet : null;

  return {
    id: requireId(record.id),
    number: asString(record.number) ?? String(record.id),
    createdAt: asDateTime(record.createdAt),
    status: status
      ? {
          name: asString(status.name) ?? "",
          blocksCar: asBoolean(status.blocks) ?? false,
          ending: asBoolean(status.ending) ?? false,
          cancelled: asBoolean(status.cancel) ?? false,
          pickedUp: asBoolean(status.received) ?? false,
        }
      : null,
    pickUp: parseReservationStop(record.pickUp),
    return: parseReservationStop(record.return),
    longTerm: asBoolean(record.longTerm) ?? false,
    mileageLimit: mileage
      ? {
          enabled: asBoolean(mileage.enabled) ?? false,
          dailyAmount: asNumber(mileage.dailyAmount),
          totalAmount: asNumber(mileage.totalAmount),
          fee: asNumber(mileage.fee),
        }
      : null,
    pickupCode: nonEmpty(record.pickupCode),
    currency: nonEmpty(record.currency),
    comment: nonEmpty(record.comment),
    accountManager: manager
      ? {
          name: nonEmpty(manager.name),
          surname: nonEmpty(manager.surname),
          email: nonEmpty(manager.email),
          phone: nonEmpty(manager.phone),
        }
      : null,
    payment: {
      paid: asBoolean(payment.paid),
      amountDue: asNumber(summary.amountDue),
      totalPaid: asNumber(summary.totalPaid),
      remainingToPay: asNumber(summary.remainingToPay),
      depositTotal: asNumber(deposit.total),
      depositPaid: asNumber(deposit.paid),
    },
    addons: parseNamedItems(record.addons),
    accessories: parseNamedItems(record.accessories),
    offer: isRecord(record.offer) ? parseOffer(record.offer, definitions) : null,
    carImage: fleet ? nonEmpty(fleet.image) : null,
  };
}

function parseReservationStop(value: unknown): ReservationStop {
  const record = isRecord(value) ? value : {};
  const point = isRecord(record.point) ? record.point : {};
  return {
    pointId: asId(point.id),
    pointName: nonEmpty(point.name),
    address: nonEmpty(record.address),
    date: asDateTime(record.date),
  };
}

/**
 * The spec says `YYYY-mm-dd H:i:s`. The live API sends a PHP DateTime object,
 * `{ date: "YYYY-mm-dd HH:mm:ss.uuuuuu", timezone: "Europe/Warsaw" }`. Both map
 * to `YYYY-MM-DD HH:mm:ss` without the fraction.
 */
function asDateTime(value: unknown): string | null {
  const text = isRecord(value) ? asString(value.date) : asString(value);
  const match = text?.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(:\d{2})?/);
  return match ? `${match[1]} ${match[2]}${match[3] ?? ":00"}` : null;
}

function nonEmpty(value: unknown): string | null {
  const text = asString(value)?.trim();
  return text ? text : null;
}

function parseNamedItems(value: unknown): { id: number; name: string }[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }
    const id = asId(item.id);
    const name = nonEmpty(item.name);
    return id === null || !name ? [] : [{ id, name }];
  });
}
