import { parsePhoneNumberFromString } from "libphonenumber-js";

import type { Lang } from "@/i18n/config";

import type { ContactForm } from "./form";

/**
 * The contact form's two emails, as the old site sent them: the message to
 * the office (reply goes to the customer) and a copy to the customer. The
 * old look (logo on a blue band, a table of the fields, the company in the
 * footer) in our colours. Pure: everything the customer typed is escaped
 * (no markup of theirs reaches either inbox) and each email has a plain text
 * part too. Tables and inline styles, so mail apps (Outlook too) show it.
 */

export type Mail = { subject: string; html: string; text: string };

const BLUE_DARK = "#083052";
const BLUE = "#0e5595";
const TINT = "#eaf1f8";
const LINE = "#d5e4f2";

type MailCopy = {
  labels: { name: string; city: string; email: string; phone: string; message: string };
  copySubject: string;
  copyTitle: string;
  copyIntro: string[];
  copyBelow: string;
};

const PL: MailCopy = {
  labels: { name: "Imię i nazwisko", city: "Miasto", email: "E-mail", phone: "Telefon", message: "Wiadomość" },
  copySubject: "Kopia Twojej wiadomości – MobiCars",
  copyTitle: "Dziękujemy za kontakt z MobiCars",
  copyIntro: ["Otrzymaliśmy Twoją wiadomość i odpowiemy najszybciej, jak to możliwe.", "To wiadomość automatyczna – prosimy na nią nie odpowiadać."],
  copyBelow: "Kopia wysłanej wiadomości:",
};

const EN: MailCopy = {
  labels: { name: "Name", city: "City", email: "Email", phone: "Phone", message: "Message" },
  copySubject: "A copy of your message – MobiCars",
  copyTitle: "Thank you for contacting MobiCars",
  copyIntro: ["We have received your message and will reply as soon as we can.", "This is an automatic message – please do not reply to it."],
  copyBelow: "A copy of your message:",
};

const COPY: Record<Lang, MailCopy> = { pl: PL, en: EN, de: EN, uk: EN };

export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function displayPhone(phone: string): string {
  return parsePhoneNumberFromString(phone)?.formatInternational() ?? phone;
}

function rows(form: ContactForm, labels: MailCopy["labels"]): [string, string][] {
  return [
    [labels.name, form.name],
    [labels.email, form.email],
    ...(form.phone ? [[labels.phone, displayPhone(form.phone)] as [string, string]] : []),
    ...(form.city ? [[labels.city, form.city] as [string, string]] : []),
    [labels.message, form.message],
  ];
}

function table(form: ContactForm, labels: MailCopy["labels"]): string {
  return rows(form, labels)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:10px 12px;border-bottom:1px solid ${LINE};width:32%;vertical-align:top;font-weight:bold;color:${BLUE_DARK}">${escapeHtml(label)}</td>` +
        `<td style="padding:10px 12px;border-bottom:1px solid ${LINE};vertical-align:top;color:${BLUE_DARK};white-space:pre-wrap;word-break:break-word">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
}

function layout({ title, intro, body, logoUrl, year }: { title: string; intro: string[]; body: string; logoUrl: string; year: number }): string {
  const paragraphs = intro.map((line) => `<p style="margin:0 0 8px;color:${BLUE_DARK};font-size:15px;line-height:1.5">${escapeHtml(line)}</p>`).join("");
  return `<!DOCTYPE html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${TINT};font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${TINT};padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td align="center" style="background:${BLUE};padding:20px"><img src="${escapeHtml(logoUrl)}" width="165" height="41" alt="MobiCars" style="display:block;border:0"></td></tr>
<tr><td style="padding:28px 24px">
<h1 style="margin:0 0 16px;color:${BLUE};font-size:22px;line-height:1.3">${escapeHtml(title)}</h1>
${paragraphs}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-collapse:collapse;font-size:15px;line-height:1.5">${body}</table>
</td></tr>
<tr><td align="center" style="background:${BLUE_DARK};padding:16px;color:#ffffff;font-size:12px;line-height:1.5">&copy; ${year} MobiCars Sp. z o.o. Sp. k., ul. Górczewska 53, 01-401 Warszawa</td></tr>
</table></td></tr></table></body></html>`;
}

function plain(title: string, intro: string[], form: ContactForm, labels: MailCopy["labels"]): string {
  return [title, "", ...intro, "", ...rows(form, labels).map(([label, value]) => `${label}: ${value}`)].join("\n");
}

/**
 * `lang`: the page the form was sent from; the copy is in it (German and
 * Ukrainian get English), the office's email always in Polish. `page`: where
 * the form was, for the office.
 */
export function contactMails(form: ContactForm, { lang, page, logoUrl, now }: { lang: Lang; page: string; logoUrl: string; now: Date }): { office: Mail; copy: Mail } {
  const year = now.getFullYear();
  const officeTitle = "Nowa wiadomość z formularza kontaktowego";
  const officeIntro = [`Strona: ${page || "–"} (język: ${lang}).`, "Odpowiedz na tę wiadomość, a trafi do klienta."];
  const copy = COPY[lang];
  return {
    office: {
      // One line: no line break of the customer's reaches the header.
      subject: `Nowa wiadomość z formularza: ${form.name.replace(/\s+/g, " ").slice(0, 80)}`,
      html: layout({ title: officeTitle, intro: officeIntro, body: table(form, PL.labels), logoUrl, year }),
      text: plain(officeTitle, officeIntro, form, PL.labels),
    },
    copy: {
      subject: copy.copySubject,
      html: layout({ title: copy.copyTitle, intro: [...copy.copyIntro, copy.copyBelow], body: table(form, copy.labels), logoUrl, year }),
      text: plain(copy.copyTitle, [...copy.copyIntro, copy.copyBelow], form, copy.labels),
    },
  };
}
