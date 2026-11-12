import { toRentCarSoftPhone } from "@/lib/account/phone";

/**
 * The "Twoje dane" step: who books, as the old site sent it to RentCarSoft.
 * Shared by the form and the Server Action, so no `server-only` here.
 *
 * - A guest always creates an account: a password is required.
 * - A signed-in client books as their account: type, name and email come
 *   from it and cannot change here; the phone can.
 * - The three required consents are asked every time, signed in or not.
 */

export type CustomerType = "individual" | "company";

export type ConsentName = "regulations" | "standardTerms" | "privacyPolicy" | "transfer";

/** Required consents first, in the old site's order. */
export const CONSENTS: readonly { name: ConsentName; required: boolean }[] = [
  { name: "regulations", required: true },
  { name: "standardTerms", required: true },
  { name: "privacyPolicy", required: true },
  { name: "transfer", required: false },
];

export type CustomerInput = {
  type: CustomerType;
  firstName: string;
  lastName: string;
  companyName: string;
  vatNumber: string;
  contactPerson: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
  /** Individuals only: an invoice instead of a receipt. */
  invoice: boolean;
  comment: string;
  flightNumber: string;
  consents: Record<ConsentName, boolean>;
};

export type CustomerField = Exclude<keyof CustomerInput, "consents" | "invoice"> | "consents";

export type CustomerError =
  | "required"
  | "email"
  | "phone"
  | "passwordLength"
  | "passwordMatch"
  | "consents"
  | "tooLong";

/** What the form has to know besides the fields. */
export type CustomerContext = {
  /** Booking as a signed-in client: no password, type and identity fixed. */
  signedIn: boolean;
  /** Pickup at an airport: the flight number field is shown (optional). */
  airport: boolean;
};

/** Same rules as registration (`lib/auth/form.ts`): the booking creates the account. */
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 256;

const MAX = {
  name: 100,
  companyName: 200,
  vatNumber: 32,
  email: 254,
  comment: 2000,
  flightNumber: 20,
} as const;

/** Every problem, by field. An empty object means the input can be sent. */
export function validateCustomer(
  input: CustomerInput,
  context: CustomerContext,
): Partial<Record<CustomerField, CustomerError>> {
  const errors: Partial<Record<CustomerField, CustomerError>> = {};
  const need = (field: CustomerField, value: string, max: number) => {
    if (!value.trim()) {
      errors[field] = "required";
    } else if (value.length > max) {
      errors[field] = "tooLong";
    }
  };

  if (!context.signedIn) {
    if (input.type === "individual") {
      need("firstName", input.firstName, MAX.name);
      need("lastName", input.lastName, MAX.name);
    } else {
      need("companyName", input.companyName, MAX.companyName);
      need("vatNumber", input.vatNumber, MAX.vatNumber);
    }
    need("email", input.email, MAX.email);
    if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
      errors.email = "email";
    }
    if (input.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = input.password ? "passwordLength" : "required";
    } else if (input.password.length > MAX_PASSWORD_LENGTH) {
      errors.password = "tooLong";
    } else if (input.password !== input.confirm) {
      errors.confirm = "passwordMatch";
    }
  }
  if (input.type === "company") {
    need("contactPerson", input.contactPerson, MAX.companyName);
  } else if (input.invoice) {
    need("vatNumber", input.vatNumber, MAX.vatNumber);
  }

  if (!input.phone.trim()) {
    errors.phone = "required";
  } else if (!toRentCarSoftPhone(input.phone)) {
    errors.phone = "phone";
  }
  if (input.comment.length > MAX.comment) {
    errors.comment = "tooLong";
  }
  if (context.airport && input.flightNumber.length > MAX.flightNumber) {
    errors.flightNumber = "tooLong";
  }
  if (CONSENTS.some(({ name, required }) => required && !input.consents[name])) {
    errors.consents = "consents";
  }
  return errors;
}

/**
 * Client keys for `createReservation`, as the old site sent them:
 * 1 first name, 2 last name, 4 phone, 5 email, 7 tax number, 9 company name,
 * 46 contact person, 47 reservation transfer consent ("18" yes / "17" no).
 * A signed-in client's identity stays in the account; only the phone, the tax
 * number for an invoice, the contact person and the consent are sent.
 */
export function customerClientKeys(input: CustomerInput, signedIn: boolean): { id: number; value: string }[] {
  const keys: { id: number; value: string }[] = [];
  const add = (id: number, value: string) => keys.push({ id, value: value.trim() });

  if (!signedIn) {
    if (input.type === "individual") {
      add(1, input.firstName);
      add(2, input.lastName);
    } else {
      add(9, input.companyName);
      add(7, input.vatNumber);
    }
    add(5, input.email);
  }
  if (input.type === "individual" && input.invoice) {
    add(7, input.vatNumber);
  }
  if (input.type === "company") {
    add(46, input.contactPerson);
  }
  add(4, toRentCarSoftPhone(input.phone) ?? input.phone);
  add(47, input.consents.transfer ? "18" : "17");
  return keys;
}

/** Reads the form fields; checkboxes are "on" when ticked. */
export function customerFromForm(form: FormData, fixedType: CustomerType | null): CustomerInput {
  const text = (name: string) => {
    const value = form.get(name);
    return typeof value === "string" ? value : "";
  };
  const consents = Object.fromEntries(
    CONSENTS.map(({ name }) => [name, form.get(`consent-${name}`) === "on"]),
  ) as Record<ConsentName, boolean>;
  return {
    type: fixedType ?? (text("type") === "company" ? "company" : "individual"),
    firstName: text("firstName"),
    lastName: text("lastName"),
    companyName: text("companyName"),
    vatNumber: text("vatNumber"),
    contactPerson: text("contactPerson"),
    email: text("email"),
    phone: text("phone"),
    password: text("password"),
    confirm: text("confirm"),
    invoice: form.get("invoice") === "on",
    comment: text("comment"),
    flightNumber: text("flightNumber"),
    consents,
  };
}
