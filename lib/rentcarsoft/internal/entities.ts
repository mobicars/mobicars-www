import { RentCarSoftError } from "./errors";
import {
  ACTIVE_SERVICE_POINT_STATUS_VALUE,
  OFFER_KEY_LABELS,
  POPULAR_OFFER_VALUE,
  PRICE_GROUP_KEY_LABELS,
  SERVICE_POINT_KEY_LABELS,
  SERVICE_POINT_STATUS_KEY_ID,
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
  cover: boolean;
  webp: string | null;
  standard: string | null;
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
    attributes,
    isPopular: popular?.valueId === asId(POPULAR_OFFER_VALUE),
    gallery: parseGallery(record.gallery),
  };
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
  description: string | null;
  image: string | null;
  oneTimeFee: boolean | null;
  price: number | null;
  priceDiscounted: number | null;
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
    description: asString(record.description),
    image: asString(record.image),
    oneTimeFee: asBoolean(record.oneTimeFee),
    price: asNumber(record.price),
    priceDiscounted: asNumber(record.priceDiscounted),
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
