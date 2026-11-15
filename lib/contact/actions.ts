"use server";

import { isLang } from "@/i18n/config";
import { isRateLimited, recordFailure, requestIp } from "@/lib/auth/rate-limit";
import { looksAutomated } from "@/lib/business/lead";
import { absoluteUrl } from "@/lib/fleet/seo";

import { checkContactForm, type ContactFormField } from "./form";
import { contactMails, type Mail } from "./mail";

export type ContactFormState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "invalid"; errors: ContactFormField[] }
  | { status: "failed" }
  | { status: "unavailable" };

/** Five messages per address in 15 minutes: plenty for a person, little for a script. */
const PER_IP = 5;
/** Copies to one mailbox in 15 minutes: nobody can use the form to flood someone else's inbox from our domain. */
const COPIES_PER_EMAIL = 3;

const FROM = "MobiCars <noreply@mobicars.pl>";

/**
 * Sends the contact form (`sections.form`) by Resend, as the old site did:
 * the message to the office (`CONTACT_MAIL_TO`, reply to the customer) and a
 * copy to the customer. Bots get "sent" and nothing goes out; an address is
 * limited to 5 messages and a mailbox to 3 copies per 15 minutes. Without
 * `RESEND_API_KEY` or `CONTACT_MAIL_TO` production says the form is
 * unavailable (the page shows the phone and email). `CONTACT_MAIL_DRY_RUN=1`
 * logs the emails instead of sending them (local tests).
 */
export async function sendContactForm(_previous: ContactFormState, data: FormData): Promise<ContactFormState> {
  const now = Date.now();
  if (looksAutomated(data, now)) {
    return { status: "sent" };
  }
  const result = checkContactForm(data);
  if (!result.ok) {
    return { status: "invalid", errors: result.errors };
  }
  const ip = await requestIp();
  const limit = [{ key: `contact:${ip}`, max: PER_IP }];
  if (isRateLimited(limit)) {
    return { status: "failed" };
  }
  recordFailure(limit);

  const lang = String(data.get("lang"));
  const { office, copy } = contactMails(result.form, {
    lang: isLang(lang) ? lang : "pl",
    page: String(data.get("page") ?? "").slice(0, 300),
    logoUrl: absoluteUrl("/assets/mobilogo.png"),
    now: new Date(now),
  });

  const to = process.env.CONTACT_MAIL_TO;
  const key = process.env.RESEND_API_KEY;
  const dryRun = process.env.CONTACT_MAIL_DRY_RUN === "1";
  if (!dryRun && (!to || !key)) {
    console.error("sendContactForm: RESEND_API_KEY or CONTACT_MAIL_TO is not set, a message was not delivered");
    return { status: "unavailable" };
  }

  const sent = await send({ to: to ?? "(office)", replyTo: result.form.email, mail: office, key, dryRun });
  if (!sent) {
    return { status: "failed" };
  }
  // The copy only while the mailbox is under its limit; a failed copy does not undo the sent message.
  const copies = [{ key: `contact-copy:${result.form.email.toLowerCase()}`, max: COPIES_PER_EMAIL }];
  if (!isRateLimited(copies)) {
    recordFailure(copies);
    await send({ to: result.form.email, mail: copy, key, dryRun });
  }
  return { status: "sent" };
}

async function send({ to, replyTo, mail, key, dryRun }: { to: string; replyTo?: string; mail: Mail; key: string | undefined; dryRun: boolean }): Promise<boolean> {
  if (dryRun) {
    console.info(`sendContactForm (dry run) to ${to}: ${mail.subject}\n${mail.text}`);
    return true;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [to], ...(replyTo ? { reply_to: replyTo } : {}), subject: mail.subject, html: mail.html, text: mail.text }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error(`sendContactForm: Resend answered ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("sendContactForm: Resend unreachable", error);
    return false;
  }
}
