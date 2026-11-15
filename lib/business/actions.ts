"use server";

import { isLang } from "@/i18n/config";
import { isRateLimited, recordFailure, requestIp } from "@/lib/auth/rate-limit";

import { checkContact, type ContactField } from "./contact";
import { checkLead, looksAutomated, type LeadField } from "./lead";

export type LeadState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "invalid"; errors: LeadField[] }
  | { status: "failed" }
  | { status: "unavailable" };

/** Five requests per address in 15 minutes: plenty for a person, little for a script. */
const PER_IP = 5;

/**
 * Sends a business quote request. Where it goes is not decided yet
 * (`redesign/b2b.md`): `LEAD_WEBHOOK_URL` receives it as JSON (a CRM, an
 * automation or a mail relay). Without it the request is not sent anywhere:
 * production says the form is unavailable and shows the phone and email;
 * development logs the request so the form can be tried locally.
 */
export async function sendLead(_previous: LeadState, form: FormData): Promise<LeadState> {
  const now = Date.now();
  // A bot gets the same "sent" a person gets, so it learns nothing.
  if (looksAutomated(form, now)) {
    return { status: "sent" };
  }
  const result = checkLead(form);
  if (!result.ok) {
    return { status: "invalid", errors: result.errors };
  }

  const ip = await requestIp();
  const limit = [{ key: `lead:${ip}`, max: PER_IP }];
  if (isRateLimited(limit)) {
    return { status: "failed" };
  }
  recordFailure(limit);

  const lang = String(form.get("lang"));
  const payload = {
    type: "business-quote",
    lang: isLang(lang) ? lang : "pl",
    page: String(form.get("page") ?? ""),
    receivedAt: new Date(now).toISOString(),
    lead: result.lead,
  };

  return deliver(payload);
}

export type ContactState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "invalid"; errors: ContactField[] }
  | { status: "failed" }
  | { status: "unavailable" };

/**
 * Sends a message from the contact page form (`blocks.contact`) to the same
 * webhook as the business requests, with `type: "contact"` and the topic, so
 * one inbox or automation sorts both. Same bot filter and rate limit.
 */
export async function sendContact(_previous: ContactState, form: FormData): Promise<ContactState> {
  const now = Date.now();
  if (looksAutomated(form, now)) {
    return { status: "sent" };
  }
  // The topics are the CMS choices the form offered; a forged one only reaches the inbox as text.
  const topics = String(form.get("topics") ?? "").split("\n").filter(Boolean);
  const result = checkContact(form, topics);
  if (!result.ok) {
    return { status: "invalid", errors: result.errors };
  }
  const ip = await requestIp();
  const limit = [{ key: `lead:${ip}`, max: PER_IP }];
  if (isRateLimited(limit)) {
    return { status: "failed" };
  }
  recordFailure(limit);
  const lang = String(form.get("lang"));
  return deliver({
    type: "contact",
    lang: isLang(lang) ? lang : "pl",
    page: String(form.get("page") ?? ""),
    receivedAt: new Date(now).toISOString(),
    message: result.message,
  });
}

/**
 * `LEAD_WEBHOOK_URL` receives the request as JSON. Without it nothing is sent:
 * production says the form is unavailable (the page shows the phone and
 * email); development logs the request so the form can be tried locally.
 */
async function deliver(payload: { type: string } & Record<string, unknown>): Promise<{ status: "sent" | "failed" | "unavailable" }> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      console.error(`sendLead: LEAD_WEBHOOK_URL is not set, a ${payload.type} request was not delivered`);
      return { status: "unavailable" };
    }
    console.info(`${payload.type} (development, not delivered):`, JSON.stringify(payload));
    return { status: "sent" };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.LEAD_WEBHOOK_SECRET ? { authorization: `Bearer ${process.env.LEAD_WEBHOOK_SECRET}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error(`sendLead: webhook answered ${response.status}`);
      return { status: "failed" };
    }
    return { status: "sent" };
  } catch (error) {
    console.error("sendLead: webhook unreachable", error);
    return { status: "failed" };
  }
}
