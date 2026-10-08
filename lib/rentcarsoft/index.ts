import "server-only";

export { CACHE_TAGS } from "./internal/labels";
export {
  formatRentCarSoftDate,
  formatRentCarSoftDateTime,
} from "./internal/dates";
export { RentCarSoftError } from "./internal/errors";
export type { RentCarSoftErrorCode } from "./internal/errors";

export {
  listCurrencies,
  listLanguages,
  listPaymentTypes,
  listClientKeys,
  listOfferKeys,
  listPriceGroupKeys,
  listServicePointKeys,
} from "./modules/catalog";
export type { Currency, Language, PaymentType } from "./internal/entities";

export { getOffer, listAllOffers, listOffers } from "./modules/offers";
export type { Offer, OfferImage } from "./internal/entities";

export {
  getDepartment,
  getServicePoint,
  listDepartments,
  listServicePoints,
} from "./modules/locations";
export type { Department, ServicePoint } from "./internal/entities";

export { getPriceGroup, listPriceGroups } from "./modules/price-groups";
export type { PriceBand, PriceGroup, PriceGroupMonthlyInfo } from "./internal/entities";

export {
  getAccessory,
  getAddon,
  listAccessories,
  listAddons,
} from "./modules/extras";
export type { Extra, ExtraPresentation } from "./internal/entities";

export { calculateReservation, verifyPromoCode } from "./modules/pricing";
export type { QuoteLine, ReservationQuote } from "./internal/entities";
export type { PromoCodeCheck } from "./internal/parse";

export { createReservation } from "./modules/reservations";
export type { CreatedReservation } from "./internal/entities";

export {
  completePasswordRecovery,
  getClient,
  getPasswordRecoveryToken,
  loginClient,
  startPasswordRecovery,
} from "./modules/clients";
export type { ClientRecord } from "./internal/parse";

export type {
  CalculateReservationInput,
  CreateReservationInput,
  ExtrasQueryInput,
  OfferListInput,
  OfferSort,
  ReservationAccessory,
} from "./internal/params";
export type { FieldAttribute, KeyDefinition } from "./internal/parse";
