import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { checkContactForm } from "./form";
import { contactMails, escapeHtml } from "./mail";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.append(name, value);
  return data;
}

const minimal = { name: "Anna Nowak", email: "anna@example.com", message: "Dzień dobry", consent: "on" };

describe("checkContactForm", () => {
  it("accepts name, email, message and the consent; city and phone are optional", () => {
    const result = checkContactForm(form(minimal));
    assert.ok(result.ok);
    assert.deepEqual(result.form, { name: "Anna Nowak", city: null, email: "anna@example.com", phone: null, message: "Dzień dobry" });
  });

  it("keeps the city and stores the phone as E.164", () => {
    const result = checkContactForm(form({ ...minimal, city: " Kraków ", phone: "+48 512 345 678" }));
    assert.ok(result.ok);
    assert.equal(result.form.city, "Kraków");
    assert.equal(result.form.phone, "+48512345678");
  });

  it("lists every missing or wrong field", () => {
    const result = checkContactForm(form({ email: "anna@", phone: "123" }));
    assert.ok(!result.ok);
    assert.deepEqual(result.errors, ["name", "email", "phone", "message", "consent"]);
  });

  it("requires the email even with a phone", () => {
    const result = checkContactForm(form({ ...minimal, email: "", phone: "+48 512 345 678" }));
    assert.ok(!result.ok);
    assert.deepEqual(result.errors, ["email"]);
  });
});

describe("contactMails", () => {
  const options = { lang: "pl" as const, page: "/pl/kontakt", logoUrl: "https://mobicars.pl/assets/mobilogo.png", now: new Date("2026-11-15T10:00:00Z") };
  const hostile = { name: 'Jan <script>alert(1)</script>\nBcc: x@y.z', city: null, email: "jan@example.com", phone: "+48512345678", message: '<a href="https://evil.example">Kliknij</a>\nDruga linia' };

  it("escapes everything the customer typed in both emails", () => {
    const { office, copy } = contactMails(hostile, options);
    for (const html of [office.html, copy.html]) {
      assert.ok(!html.includes("<script>"));
      assert.ok(!html.includes('<a href="https://evil.example">'));
      assert.ok(html.includes("&lt;script&gt;"));
    }
  });

  it("keeps the office subject on one line", () => {
    const { office } = contactMails(hostile, options);
    assert.ok(!/[\r\n]/.test(office.subject));
  });

  it("writes the office in Polish and the copy in the page's language (German and Ukrainian get English)", () => {
    assert.match(contactMails(hostile, options).copy.subject, /Kopia/);
    assert.match(contactMails(hostile, { ...options, lang: "de" }).copy.subject, /copy/);
    assert.match(contactMails(hostile, { ...options, lang: "en" }).office.text, /Wiadomość/);
  });

  it("shows the phone in international format and leaves out an empty city", () => {
    const { office } = contactMails(hostile, options);
    assert.match(office.text, /Telefon: \+48 512 345 678/);
    assert.ok(!office.text.includes("Miasto"));
  });

  it("escapes quotes and ampersands", () => {
    assert.equal(escapeHtml(`a & "b" <c> 'd'`), "a &amp; &quot;b&quot; &lt;c&gt; &#39;d&#39;");
  });
});
