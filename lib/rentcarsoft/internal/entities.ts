import { RentCarSoftError } from "./errors";
import {
  ACTIVE_SERVICE_POINT_STATUS_VALUE,
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
  };
}

/**
 * The short-term `cennik` is keyed by segment id. The long-term list reuses the
 * name for a flat `{ cena_miesieczna, … }` object, which has no promotion.
 */
function parsePromotion(cennik: unknown, segmentId: unknown, days: number | null): OfferPromotion | null {
  if (!isRecord(cennik) || segmentId === undefined || segmentId === null) {
    return null;
  }
  const segment = cennik[String(segmentId)];
  if (!isRecord(segment) || asNumber(segment.is_promocja) !== 1) {
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
    return [
      {
        alt: asString(item.altText) ?? "",
        main: asBoolean(item.default) ?? false,
        cover: asBoolean(item.cover) ?? asBoolean(item.coverBig) ?? false,
        webp,
        standard,
      },
    ];
  });
}

export type ServicePoint = {
  id: number;
  name: string;
  active: boolean;
  instruction: string | null;
  latitude: number | null;
  longitude: number | null;
  departmentId: number | null;
  airport: boolean;
  /** Custom field 22. True when the live dictionary says "Tak" (value 13). */
  office: boolean;
  /** Custom field 21. True when the live dictionary says "Tak" (value 9). */
  trainStation: boolean;
  city: string | null;
  address: string | null;
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
    active,
    instruction: asString(record.customerInstruction),
    latitude: asNumber(record.latitude),
    longitude: asNumber(record.longitude),
    departmentId: asId(record.department),
    airport: asBoolean(record.isAirport) ?? false,
    office: isAffirmative(attributes.isOffice, OFFICE_YES_VALUE),
    trainStation: isAffirmative(attributes.isTrainStation, TRAIN_STATION_YES_VALUE),
    city: textAttribute(attributes.city),
    address: textAttribute(attributes.address),
    minDays: asId(record.minDays),
    maxDays: asId(record.maxDays),
    customAddresses: asBoolean(record.customAddresses) ?? false,
    addressRequired: asBoolean(record.addressRequired) ?? false,
    attributes,
  };
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
        itemPrice: asNumber(item.itemPrice),
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
