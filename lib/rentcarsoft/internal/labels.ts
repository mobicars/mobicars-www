/**
 * Stable MobiCars names for RentCarSoft custom-field ids.
 * Display text for select values comes from the key dictionaries, not from this map.
 */

export const OFFER_KEY_LABELS: Record<number, string> = {
  1: "name",
  2: "body",
  3: "seats",
  4: "doors",
  5: "suitcasesXl",
  6: "suitcasesXs",
  7: "airConditioning",
  8: "transmission",
  9: "fuelType",
  10: "description",
  11: "engine",
  15: "priceOffer",
  16: "fuelConsumptionCity",
  17: "fuelConsumptionHighway",
  18: "year",
  19: "color",
  20: "power",
  21: "acceleration",
  22: "maxSpeed",
  64: "trunk",
  65: "centralLock",
  66: "onboardComputer",
  67: "airConditioningType",
  68: "windowType",
  69: "mirrorType",
  70: "additionalCategory",
  71: "isPopular",
  72: "isSmallCar",
  73: "isCompactCar",
  74: "isLargeCar",
  75: "isEcoCar",
  76: "bluetooth",
  77: "cruiseControl",
  78: "chargePerKm",
  79: "metaTitle",
  80: "metaDescription",
  127: "longTermDescription",
  128: "androidAuto",
  129: "parkingSensors",
  130: "rearCamera",
  131: "isDeliveryCar",
  133: "descriptionEn",
  134: "longTermDescriptionEn",
};

export const POPULAR_OFFER_KEY_ID = 71;
export const POPULAR_OFFER_VALUE = "81";

export const DEFAULT_OFFER_KEY_IDS = [
  1, 2, 3, 8, 9, 11, 16, 17, 20, 64, 71, 72, 73, 74, 75, 131,
];

export const DEFAULT_LONG_TERM_OFFER_KEY_IDS = [
  ...DEFAULT_OFFER_KEY_IDS,
  134,
];

export const SERVICE_POINT_KEY_LABELS: Record<number, string> = {
  1: "name",
  2: "status",
  3: "city",
  4: "address",
  5: "phone",
  6: "email",
  7: "minTime",
  8: "maxTime",
  13: "instructions",
  14: "postalCode",
  18: "latitude",
  19: "longitude",
  21: "isTrainStation",
  22: "isOffice",
};

/** Live dictionary: service-point key 2, select value 6, label "Aktywny". */
export const ACTIVE_SERVICE_POINT_STATUS_VALUE = "6";
export const SERVICE_POINT_STATUS_KEY_ID = 2;

export const DEFAULT_SERVICE_POINT_KEY_IDS = [2, 3, 4, 14, 21, 22];

export const CLIENT_KEY_LABELS: Record<number, string> = {
  1: "firstName",
  2: "lastName",
  4: "phone",
  5: "email",
  7: "vatNumber",
  9: "companyName",
  11: "companyAddress",
  12: "homeAddress",
  13: "companyCity",
  14: "companyPostalCode",
  15: "city",
  16: "postalCode",
  17: "pesel",
  18: "driverLicenseNumber",
  25: "banned",
  26: "banDescription",
  30: "passportNumber",
  31: "identityDocumentNumber",
  44: "age",
  45: "country",
  46: "contactPerson",
  47: "reservationTransferConsent",
  85: "collectiveInvoices",
};

export const DEFAULT_CLIENT_KEY_IDS = [1, 2, 4, 5, 7, 9, 44, 46];

export const PRICE_GROUP_KEY_LABELS: Record<number, string> = {
  1: "name",
};

export const CACHE_TAGS = {
  keys: "rcs:keys",
  catalog: "rcs:catalog",
} as const;
