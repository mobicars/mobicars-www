import { parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * The contact form (`sections.form`, form `contact`): reading and checking
 * its fields, the old site's set. Pure, so the server action and the tests
 * share it.
 *
 * Required: name, email, message and the consent; city and phone optional
 * (the phone, when given, must be a real number).
 */

export type ContactForm = {
  name: string;
  city: string | null;
  email: string;
  /** E.164, e.g. `+48600100200`. */
  phone: string | null;
  message: string;
};

export type ContactFormField = "name" | "city" | "email" | "phone" | "message" | "consent";

export type ContactFormCheck = { ok: true; form: ContactForm } | { ok: false; errors: ContactFormField[] };

const MAX = { short: 200, message: 3000 };

function text(form: FormData, name: string, max = MAX.short): string | null {
  const value = form.get(name);
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed === "" ? null : trimmed;
}

/** Lenient on purpose: one `@`, something on both sides, a dot in the domain. */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function checkContactForm(form: FormData): ContactFormCheck {
  const errors: ContactFormField[] = [];
  const name = text(form, "name");
  const city = text(form, "city", 100);
  const email = text(form, "email");
  const phoneRaw = text(form, "phone", 40);
  const message = text(form, "message", MAX.message);

  if (!name) errors.push("name");
  if (!email || !isEmail(email)) errors.push("email");
  let phone: string | null = null;
  if (phoneRaw) {
    const parsed = parsePhoneNumberFromString(phoneRaw, "PL");
    if (parsed?.isValid()) phone = parsed.number;
    else errors.push("phone");
  }
  if (!message) errors.push("message");
  if (form.get("consent") !== "on") errors.push("consent");

  if (errors.length > 0 || !name || !email || !message) {
    return { ok: false, errors };
  }
  return { ok: true, form: { name, city, email, phone, message } };
}
