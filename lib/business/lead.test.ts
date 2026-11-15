import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { checkLead, isValidTaxId, looksAutomated } from "./lead";

function form(fields: Record<string, string | string[]>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    for (const each of Array.isArray(value) ? value : [value]) data.append(name, each);
  }
  return data;
}

const minimal = { company: "Firma Sp. z o.o.", name: "Anna Nowak", email: "anna@firma.pl", consent: "on" };

describe("checkLead", () => {
  it("accepts the minimum: company, name, one contact, consent", () => {
    const result = checkLead(form(minimal));
    assert.equal(result.ok, true);
  });

  it("accepts a phone instead of an email and stores it as E.164", () => {
    const result = checkLead(form({ ...minimal, email: "", phone: "600 100 200" }));
    assert.ok(result.ok);
    assert.equal(result.lead.phone, "+48600100200");
    assert.equal(result.lead.email, null);
  });

  it("asks for a contact when both email and phone are empty", () => {
    const result = checkLead(form({ ...minimal, email: "" }));
    assert.deepEqual(result.ok ? [] : result.errors, ["contact"]);
  });

  it("lists every missing required field", () => {
    const result = checkLead(form({}));
    assert.deepEqual(result.ok ? [] : result.errors, ["company", "name", "contact", "consent"]);
  });

  it("rejects a malformed email, phone and tax id", () => {
    const result = checkLead(form({ ...minimal, email: "anna@firma", phone: "12", taxId: "1234567890" }));
    assert.deepEqual(result.ok ? [] : result.errors, ["email", "phone", "taxId"]);
  });

  it("keeps only known choices and drops duplicates", () => {
    const result = checkLead(
      form({ ...minimal, fleetSize: "6-20", carTypes: ["van", "van", "tank"], term: "forever", start: "asap" }),
    );
    assert.ok(result.ok);
    assert.equal(result.lead.fleetSize, "6-20");
    assert.deepEqual(result.lead.carTypes, ["van"]);
    assert.equal(result.lead.term, null);
    assert.equal(result.lead.start, "asap");
  });

  it("trims texts and treats blanks as empty", () => {
    const result = checkLead(form({ ...minimal, company: "  ACME  ", location: "   " }));
    assert.ok(result.ok);
    assert.equal(result.lead.company, "ACME");
    assert.equal(result.lead.location, null);
  });
});

describe("isValidTaxId", () => {
  it("checks the NIP checksum and allows dashes and a PL prefix", () => {
    assert.equal(isValidTaxId("526-000-12-46"), true);
    assert.equal(isValidTaxId("PL5260001246"), true);
    assert.equal(isValidTaxId("5260001247"), false);
    assert.equal(isValidTaxId("526000124"), false);
  });
});

describe("looksAutomated", () => {
  it("flags a filled trap field and a form sent too fast", () => {
    assert.equal(looksAutomated(form({ website: "x", startedAt: "0" }), 10_000), true);
    assert.equal(looksAutomated(form({ startedAt: "9000" }), 10_000), true);
    assert.equal(looksAutomated(form({ startedAt: "abc" }), 10_000), true);
    assert.equal(looksAutomated(form({ startedAt: "1000" }), 10_000), false);
  });
});
