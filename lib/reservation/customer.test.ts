import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { customerClientKeys, validateCustomer, type CustomerInput } from "./customer";

const consents = { regulations: true, standardTerms: true, privacyPolicy: true, transfer: false };

function input(overrides: Partial<CustomerInput>): CustomerInput {
  return {
    type: "individual",
    firstName: "Ada",
    lastName: "Nowak",
    companyName: "",
    vatNumber: "",
    contactPerson: "",
    email: "ada@example.com",
    phone: "512 345 678",
    password: "secret12",
    confirm: "secret12",
    invoice: false,
    comment: "",
    flightNumber: "",
    consents,
    ...overrides,
  };
}

const guest = { signedIn: false, airport: false };
const signedIn = { signedIn: true, airport: false };

describe("customer validation", () => {
  it("accepts a complete guest", () => {
    assert.deepEqual(validateCustomer(input({}), guest), {});
  });

  it("reports every problem of a guest", () => {
    assert.deepEqual(
      validateCustomer(
        input({ firstName: " ", email: "ada@", phone: "12", password: "abc", consents: { ...consents, privacyPolicy: false } }),
        guest,
      ),
      { firstName: "required", email: "email", password: "passwordLength", phone: "phone", consents: "consents" },
    );
    assert.deepEqual(validateCustomer(input({ confirm: "other123" }), guest), { confirm: "passwordMatch" });
  });

  it("needs company data from a company and a tax number for an invoice", () => {
    assert.deepEqual(validateCustomer(input({ type: "company" }), guest), {
      companyName: "required",
      vatNumber: "required",
      contactPerson: "required",
    });
    assert.deepEqual(validateCustomer(input({ invoice: true }), guest), { vatNumber: "required" });
  });

  it("asks a signed-in client for no identity or password, but always for the consents", () => {
    const empty = input({ firstName: "", lastName: "", email: "", password: "", confirm: "" });
    assert.deepEqual(validateCustomer(empty, signedIn), {});
    assert.deepEqual(validateCustomer({ ...empty, consents: { ...consents, regulations: false } }, signedIn), {
      consents: "consents",
    });
  });
});

describe("client keys", () => {
  it("sends a guest's identity like the old site", () => {
    assert.deepEqual(customerClientKeys(input({}), false), [
      { id: 1, value: "Ada" },
      { id: 2, value: "Nowak" },
      { id: 5, value: "ada@example.com" },
      { id: 4, value: "+48 512345678" },
      { id: 47, value: "17" },
    ]);
  });

  it("sends a company and a signed-in invoice", () => {
    const company = input({ type: "company", companyName: "Firma", vatNumber: "0000000000", contactPerson: "Jan Kowalski" });
    assert.deepEqual(customerClientKeys(company, false), [
      { id: 9, value: "Firma" },
      { id: 7, value: "0000000000" },
      { id: 5, value: "ada@example.com" },
      { id: 46, value: "Jan Kowalski" },
      { id: 4, value: "+48 512345678" },
      { id: 47, value: "17" },
    ]);
    assert.deepEqual(customerClientKeys(input({ invoice: true, vatNumber: "0000000000", consents: { ...consents, transfer: true } }), true), [
      { id: 7, value: "0000000000" },
      { id: 4, value: "+48 512345678" },
      { id: 47, value: "18" },
    ]);
  });
});
