import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { checkContact } from "./contact";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.append(name, value);
  return data;
}

const topics = ["Rezerwacja", "Reklamacja"];
const minimal = { name: "Anna Nowak", email: "anna@example.com", message: "Dzień dobry", consent: "on" };

describe("checkContact", () => {
  it("accepts name, one contact, a message and the consent", () => {
    const result = checkContact(form(minimal), topics);
    assert.ok(result.ok);
    assert.deepEqual(result.message, { topic: null, name: "Anna Nowak", email: "anna@example.com", phone: null, message: "Dzień dobry" });
  });

  it("keeps a CMS topic and drops any other", () => {
    const kept = checkContact(form({ ...minimal, topic: "Reklamacja" }), topics);
    assert.equal(kept.ok && kept.message.topic, "Reklamacja");
    const dropped = checkContact(form({ ...minimal, topic: "<script>" }), topics);
    assert.equal(dropped.ok && dropped.message.topic, null);
  });

  it("takes a phone instead of an email, as E.164", () => {
    const result = checkContact(form({ ...minimal, email: "", phone: "600 100 200" }), topics);
    assert.equal(result.ok && result.message.phone, "+48600100200");
  });

  it("lists every missing or wrong field", () => {
    assert.deepEqual(checkContact(form({}), topics), { ok: false, errors: ["name", "contact", "message", "consent"] });
    assert.deepEqual(checkContact(form({ ...minimal, email: "anna@", phone: "12" }), topics), { ok: false, errors: ["email", "phone"] });
  });
});
