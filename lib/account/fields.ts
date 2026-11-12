/**
 * Client fields the customer may change in the panel.
 * Anything not listed here is never written, whatever the form sends.
 * Left out on purpose: email (it is the login), PESEL and documents,
 * and internal fields such as “Zakaz wynajmu”, KRD, CEPIK or “Grupa”.
 * Shared by the form and the Server Action, so no `server-only` here.
 */

export type TextFieldName =
  | "firstName"
  | "lastName"
  | "phone"
  | "homeAddress"
  | "postalCode"
  | "city"
  | "country"
  | "companyName"
  | "vatNumber"
  | "companyAddress"
  | "companyPostalCode"
  | "companyCity";

export type TextFieldSpec = {
  name: TextFieldName;
  keyId: number;
  required: boolean;
  /** Shown and saved only for company accounts. */
  companyOnly: boolean;
  autoComplete?: string;
  type?: "text" | "tel";
  maxLength: number;
};

export const TEXT_FIELDS: readonly TextFieldSpec[] = [
  { name: "firstName", keyId: 1, required: true, companyOnly: false, autoComplete: "given-name", maxLength: 100 },
  { name: "lastName", keyId: 2, required: true, companyOnly: false, autoComplete: "family-name", maxLength: 100 },
  { name: "phone", keyId: 4, required: true, companyOnly: false, autoComplete: "tel", type: "tel", maxLength: 32 },
  { name: "homeAddress", keyId: 12, required: false, companyOnly: false, autoComplete: "street-address", maxLength: 200 },
  { name: "postalCode", keyId: 16, required: false, companyOnly: false, autoComplete: "postal-code", maxLength: 16 },
  { name: "city", keyId: 15, required: false, companyOnly: false, autoComplete: "address-level2", maxLength: 100 },
  { name: "country", keyId: 45, required: false, companyOnly: false, autoComplete: "country-name", maxLength: 100 },
  { name: "companyName", keyId: 9, required: true, companyOnly: true, autoComplete: "organization", maxLength: 200 },
  { name: "vatNumber", keyId: 7, required: true, companyOnly: true, maxLength: 32 },
  { name: "companyAddress", keyId: 11, required: false, companyOnly: true, maxLength: 200 },
  { name: "companyPostalCode", keyId: 14, required: false, companyOnly: true, maxLength: 16 },
  { name: "companyCity", keyId: 13, required: false, companyOnly: true, maxLength: 100 },
];

export type ConsentName = "reservationTransferConsent" | "collectiveInvoices";

export type ConsentSpec = {
  name: ConsentName;
  keyId: number;
  /** Option ids of the RentCarSoft select. */
  yes: string;
  no: string;
  companyOnly: boolean;
};

export const CONSENT_FIELDS: readonly ConsentSpec[] = [
  { name: "reservationTransferConsent", keyId: 47, yes: "18", no: "17", companyOnly: false },
  { name: "collectiveInvoices", keyId: 85, yes: "34", no: "33", companyOnly: true },
];

/** Email (5) is read for display only. */
export const DETAIL_KEY_IDS = [
  5,
  ...TEXT_FIELDS.map((field) => field.keyId),
  ...CONSENT_FIELDS.map((field) => field.keyId),
];

export type AccountDetails = {
  isCompany: boolean;
  email: string | null;
  text: Record<TextFieldName, string>;
  consents: Record<ConsentName, boolean>;
};
