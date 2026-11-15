import { parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * The contact page form (`blocks.contact`): reading and checking the fields.
 * Pure, so the server action and the tests share it.
 *
 * Required: name, a message, the consent, and an email or a phone (one is
 * enough). The topic is one of the CMS choices, or none.
 */

export type ContactMessage = {
  topic: string | null;
  name: string;
  email: string | null;
  /** E.164, e.g. `+48600100200`. */
  phone: string | null;
  message: string;
};

export type ContactField = "name" | "contact" | "email" | "phone" | "message" | "consent";

export type ContactCheck = { ok: true; message: ContactMessage } | { ok: false; errors: ContactField[] };

const MAX = { short: 200, message: 3000 };

function text(form: FormData, name: string, max = MAX.short): string | null {
  const value = form.get(name);
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed === "" ? null : trimmed;
}

/** Lenient on purpose: one `@`, something on both sides, a dot in the domain. */
function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** `topics`: the CMS choices; anything else sent as a topic is dropped. */
export function checkContact(form: FormData, topics: readonly string[]): ContactCheck {
  const errors: ContactField[] = [];
  const name = text(form, "name");
  const email = text(form, "email");
  const phoneRaw = text(form, "phone", 40);
  const message = text(form, "message", MAX.message);
  const topicRaw = text(form, "topic");

  if (!name) errors.push("name");
  if (!email && !phoneRaw) errors.push("contact");
  if (email && !isEmail(email)) errors.push("email");
  let phone: string | null = null;
  if (phoneRaw) {
    const parsed = parsePhoneNumberFromString(phoneRaw, "PL");
    if (parsed?.isValid()) phone = parsed.number;
    else errors.push("phone");
  }
  if (!message) errors.push("message");
  if (form.get("consent") !== "on") errors.push("consent");

  if (errors.length > 0 || !name || !message) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    message: { topic: topicRaw && topics.includes(topicRaw) ? topicRaw : null, name, email, phone, message },
  };
}
