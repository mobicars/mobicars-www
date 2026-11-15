import { parsePhoneNumberFromString } from "libphonenumber-js";

import { isValidTaxId, normalizeTaxId } from "./tax-id";

export { isValidTaxId };

/**
 * The business quote request ("Dla firm" form): reading and checking the
 * submitted fields. Pure, so the server action and the tests share it.
 *
 * Required: company, name, consent, and an email or a phone (one is enough).
 * Everything else is optional and only checked when filled.
 */

export const FLEET_SIZES = ["1", "2-5", "6-20", "20+"] as const;
export const CAR_TYPES = ["passenger", "van", "minibus", "electric"] as const;
export const TERMS = ["days", "weeks", "months", "unsure"] as const;
export const STARTS = ["asap", "month", "later"] as const;

export type Lead = {
  company: string;
  taxId: string | null;
  name: string;
  email: string | null;
  /** E.164, e.g. `+48600100200`. */
  phone: string | null;
  fleetSize: (typeof FLEET_SIZES)[number] | null;
  carTypes: (typeof CAR_TYPES)[number][];
  term: (typeof TERMS)[number] | null;
  start: (typeof STARTS)[number] | null;
  location: string | null;
  message: string | null;
};

export type LeadField = "company" | "name" | "contact" | "email" | "phone" | "taxId" | "consent";

export type LeadCheck = { ok: true; lead: Lead } | { ok: false; errors: LeadField[] };

const MAX = { short: 200, message: 3000 };

function text(form: FormData, name: string, max = MAX.short): string | null {
  const value = form.get(name);
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed === "" ? null : trimmed;
}

function oneOf<T extends string>(value: string | null, allowed: readonly T[]): T | null {
  return value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}


/** Lenient on purpose: one `@`, something on both sides, a dot in the domain. */
function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function checkLead(form: FormData): LeadCheck {
  const errors: LeadField[] = [];
  const company = text(form, "company");
  const name = text(form, "name");
  const email = text(form, "email");
  const phoneRaw = text(form, "phone", 40);
  const taxIdRaw = text(form, "taxId", 20);

  if (!company) errors.push("company");
  if (!name) errors.push("name");
  if (!email && !phoneRaw) errors.push("contact");
  if (email && !isEmail(email)) errors.push("email");

  let phone: string | null = null;
  if (phoneRaw) {
    const parsed = parsePhoneNumberFromString(phoneRaw, "PL");
    if (parsed?.isValid()) phone = parsed.number;
    else errors.push("phone");
  }
  if (taxIdRaw && !isValidTaxId(taxIdRaw)) errors.push("taxId");
  if (form.get("consent") !== "on") errors.push("consent");

  if (errors.length > 0 || !company || !name) {
    return { ok: false, errors };
  }
  const carTypes = form
    .getAll("carTypes")
    .filter((value): value is (typeof CAR_TYPES)[number] => typeof value === "string" && (CAR_TYPES as readonly string[]).includes(value));
  return {
    ok: true,
    lead: {
      company,
      taxId: taxIdRaw ? normalizeTaxId(taxIdRaw) : null,
      name,
      email,
      phone,
      fleetSize: oneOf(text(form, "fleetSize"), FLEET_SIZES),
      carTypes: [...new Set(carTypes)],
      term: oneOf(text(form, "term"), TERMS),
      start: oneOf(text(form, "start"), STARTS),
      location: text(form, "location"),
      message: text(form, "message", MAX.message),
    },
  };
}

/**
 * Cheap bot filter, no CAPTCHA: a hidden field people never see stays empty,
 * and a person takes more than a few seconds to fill the form.
 */
export function looksAutomated(form: FormData, nowMs: number): boolean {
  const trap = form.get("website");
  if (typeof trap === "string" && trap !== "") return true;
  const started = Number(form.get("startedAt"));
  return !Number.isFinite(started) || nowMs - started < 3000;
}
