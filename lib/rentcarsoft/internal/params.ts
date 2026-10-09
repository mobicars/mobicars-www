import { RentCarSoftError } from "./errors";
import {
  DEFAULT_CLIENT_KEY_IDS,
  DEFAULT_LONG_TERM_OFFER_KEY_IDS,
  DEFAULT_OFFER_KEY_IDS,
  DEFAULT_SERVICE_POINT_KEY_IDS,
} from "./labels";
import type { QueryValue } from "./query";

export type QueryParams = Record<string, QueryValue>;

export type OfferSort =
  | "default"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "name_desc";

export type OfferListInput = {
  lang?: string;
  term?: "short" | "long";
  page?: number;
  perPage?: number;
  servicePointIds?: number[];
  priceSegmentIds?: number[];
  excludeSegmentIds?: number[];
  offerKeyIds?: number[];
  pickUpDate?: string;
  returnDate?: string;
  promoCode?: string;
  onlyAvailable?: boolean;
  /**
   * Passed through as `onlyAvailableAtLocation`.
   * Requires `servicePointIds`, `pickUpDate`, and `returnDate`.
   * Omitted availability stays company-wide.
   */
  onlyAvailableAtLocation?: boolean;
  order?: OfferSort;
  longTermQuote?: LongTermRental;
};

export function defaultOfferKeyIds(term: "short" | "long"): number[] {
  return term === "long"
    ? DEFAULT_LONG_TERM_OFFER_KEY_IDS
    : DEFAULT_OFFER_KEY_IDS;
}

export type LongTermRental = {
  months: number;
  monthlyKmLimit: number;
};

export function buildOfferQuery(input: OfferListInput): QueryParams {
  if (input.onlyAvailable && (!input.pickUpDate || !input.returnDate)) {
    throw new RentCarSoftError("invalid_request");
  }
  if (
    input.onlyAvailableAtLocation &&
    (!input.servicePointIds?.length || !input.pickUpDate || !input.returnDate)
  ) {
    throw new RentCarSoftError("invalid_request");
  }

  const term = input.longTermQuote ? "long" : (input.term ?? "short");
  const query: QueryParams = {
    lang: input.lang ?? "pl",
    page: input.page ?? 0,
    perPage: input.perPage ?? 100,
    order: input.order ?? "default",
    keys: input.offerKeyIds ?? defaultOfferKeyIds(term),
  };

  if (term === "short") {
    query.shortTerm = true;
  } else {
    query.longTerm = true;
  }

  if (input.servicePointIds?.length) {
    query.servicePoints = input.servicePointIds;
  }
  if (input.priceSegmentIds?.length) {
    query.priceSegment = input.priceSegmentIds;
  }
  if (input.excludeSegmentIds?.length) {
    query.excludeSegment = input.excludeSegmentIds;
  }
  if (input.pickUpDate) {
    query.pickupDate = input.pickUpDate;
  }
  if (input.returnDate) {
    query.returnDate = input.returnDate;
  }
  if (input.promoCode) {
    query.promoCode = input.promoCode;
  }
  if (input.onlyAvailable) {
    query.onlyAvailable = true;
  }
  if (input.onlyAvailableAtLocation) {
    query.onlyAvailableAtLocation = true;
  }
  if (input.longTermQuote) {
    query.longTerm = true;
    query.longTermKalukator = true;
    query.okresLongTerm = input.longTermQuote.months;
    query.limitLongTerm = input.longTermQuote.monthlyKmLimit;
  }

  return query;
}

export function isCatalogOfferQuery(input: OfferListInput): boolean {
  return (
    !input.pickUpDate &&
    !input.returnDate &&
    !input.promoCode &&
    !input.onlyAvailable &&
    !input.onlyAvailableAtLocation &&
    !input.longTermQuote
  );
}

export type CalculateReservationInput = {
  offerId: number;
  pickUpPointId: number;
  returnPointId: number;
  pickUpDate: string;
  returnDate: string;
  lang?: string;
  /** Passed through as `mileageLimit`. Omitted leaves the API default (`false`). */
  mileageLimit?: boolean;
  promoCode?: string;
  clientId?: number;
  addonIds?: number[];
  accessories?: ReservationAccessory[];
  longTerm?: LongTermRental;
};

export function buildCalculateQuery(
  input: CalculateReservationInput,
): QueryParams {
  const query: QueryParams = {
    offerId: input.offerId,
    pickUpPoint: input.pickUpPointId,
    returnPoint: input.returnPointId,
    pickupDate: input.pickUpDate,
    returnDate: input.returnDate,
    lang: input.lang ?? "pl",
  };

  if (input.mileageLimit !== undefined) {
    query.mileageLimit = input.mileageLimit;
  }

  if (input.promoCode) {
    query.promoCode = input.promoCode;
  }
  if (input.clientId !== undefined) {
    query.clientId = input.clientId;
  }
  if (input.addonIds?.length) {
    query.addons = input.addonIds;
  }
  if (input.accessories?.length) {
    // Live calculate prices `ilosc` and leaves `quantity` at a zero line.
    query.accessories = input.accessories.map((item) => ({
      id: item.id,
      ilosc: item.quantity,
    }));
  }
  if (input.longTerm) {
    query.longTerm = 1;
    query.iloscMiesiecy = input.longTerm.months;
    query.limitKmMiesieczny = input.longTerm.monthlyKmLimit;
  }

  return query;
}

export type ReservationAccessory = {
  id: number;
  quantity: number;
};

export type CreateReservationInput = {
  offerId: number;
  pickUpPointId: number;
  pickUpDate: string;
  returnPointId: number;
  returnDate: string;
  clientKeys: { id: number; value: string }[];
  pickUpAddress?: string;
  returnAddress?: string;
  clientId?: number;
  /**
   * Passed through as `clientType`.
   * Legacy MobiCars sent 0 for a person and 1 for a company. That mapping was not rechecked live.
   */
  clientType?: number;
  clientPassword?: string;
  promoCode?: string;
  addonIds?: number[];
  /**
   * Domain quantity. The create body still uses OpenAPI `quantity`.
   * Calculate uses `ilosc`, which is the key the live quote prices.
   * Those wire names are intentionally not unified until a create is tested.
   */
  accessories?: ReservationAccessory[];
  flightNumber?: string;
  /** Optional. The library does not default this to 1 ("Nie podano"). */
  paymentMethodId?: number;
  comment?: string;
  /** Passed through as `mileageLimit`. Omitted leaves the API default (`false`). */
  mileageLimit?: boolean;
  language?: string;
  longTerm?: LongTermRental & {
    calculate?: boolean;
  };
  /**
   * Passed through as `statusRez`.
   * The meaning of id 1219 is UNVERIFIED. The library never sets a default.
   */
  forcedStatusId?: number;
};

export function buildReservationBody(
  input: CreateReservationInput,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    clientKeys: input.clientKeys,
    offerId: input.offerId,
    pickUpPoint: input.pickUpPointId,
    pickUpDate: input.pickUpDate,
    returnPoint: input.returnPointId,
    returnDate: input.returnDate,
  };

  assign(body, "pickUpAddress", input.pickUpAddress);
  assign(body, "returnAddress", input.returnAddress);
  assign(body, "clientId", input.clientId);
  assign(body, "clientType", input.clientType);
  assign(body, "clientPassword", input.clientPassword);
  assign(body, "promoCode", input.promoCode);
  assign(body, "comment", input.comment);
  assign(body, "language", input.language);
  assign(body, "mileageLimit", input.mileageLimit);
  assign(body, "paymentMethod", input.paymentMethodId);
  assign(body, "flightNo", input.flightNumber);
  assign(body, "statusRez", input.forcedStatusId);

  if (input.addonIds?.length) {
    body.addons = input.addonIds;
  }
  if (input.accessories?.length) {
    body.accessories = input.accessories.map((item) => ({
      id: item.id,
      quantity: item.quantity,
    }));
  }
  if (input.longTerm) {
    body.longTerm = true;
    body.calculateLongTerm = input.longTerm.calculate ?? true;
    assign(body, "iloscMiesiecy", input.longTerm.months);
    assign(body, "ustalonyLimitKm", input.longTerm.monthlyKmLimit);
  }

  return body;
}

export function buildLoginBody(input: {
  email: string;
  password: string;
}): { email: string; password: string } {
  return { email: input.email, password: input.password };
}

export function buildPasswordRecoveryBody(input: {
  email: string;
  password?: string;
}): { email: string; password?: string } {
  if (input.password === undefined) {
    return { email: input.email };
  }
  return { email: input.email, password: input.password };
}

export type ExtrasQueryInput = {
  lang?: string;
  priceSegmentIds?: number[];
  longTerm?: boolean;
  pickUpDate?: string;
  returnDate?: string;
  promoCode?: string;
  clientIds?: number[];
};

export function buildExtrasQuery(
  input: ExtrasQueryInput,
  clientParam: "clients" | "customers",
): QueryParams {
  const query: QueryParams = {
    lang: input.lang ?? "pl",
  };
  if (input.priceSegmentIds?.length) {
    query.priceSegments = input.priceSegmentIds;
  }
  if (input.longTerm) {
    query.loadLongTerm = true;
  }
  if (input.pickUpDate) {
    query.pickupDate = input.pickUpDate;
  }
  if (input.returnDate) {
    query.returnDate = input.returnDate;
  }
  if (input.promoCode) {
    query.promoCode = input.promoCode;
  }
  if (input.clientIds?.length) {
    query[clientParam] = input.clientIds;
  }
  return query;
}

export function isCatalogExtrasQuery(input: ExtrasQueryInput): boolean {
  return !input.pickUpDate && !input.returnDate && !input.promoCode && !input.clientIds?.length;
}

export function buildServicePointQuery(input: {
  lang?: string;
  keyIds?: number[];
  departmentIds?: number[];
}): QueryParams {
  const query: QueryParams = {
    lang: input.lang ?? "pl",
    keys: input.keyIds ?? DEFAULT_SERVICE_POINT_KEY_IDS,
  };
  if (input.departmentIds?.length) {
    query.departments = input.departmentIds;
  }
  return query;
}

export function buildClientQuery(input: { keyIds?: number[] }): QueryParams {
  return { keys: input.keyIds ?? DEFAULT_CLIENT_KEY_IDS };
}

function assign(
  target: Record<string, unknown>,
  key: string,
  value: unknown,
): void {
  if (value !== undefined) {
    target[key] = value;
  }
}
