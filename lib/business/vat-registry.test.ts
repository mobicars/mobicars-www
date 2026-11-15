import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isValidTaxId } from "./tax-id";
import { lookupTaxId, parseRegistryAddress, readRegistryResponse, tidyCapitals } from "./vat-registry";

describe("isValidTaxId", () => {
  it("accepts a correct checksum with dashes, spaces or a PL prefix", () => {
    assert.equal(isValidTaxId("7740001454"), true);
    assert.equal(isValidTaxId("774-000-14-54"), true);
    assert.equal(isValidTaxId("PL 774 000 14 54"), true);
  });

  it("rejects a wrong checksum or length", () => {
    assert.equal(isValidTaxId("7740001455"), false);
    assert.equal(isValidTaxId("1234567890"), false);
    assert.equal(isValidTaxId("774000145"), false);
  });
});

describe("tidyCapitals", () => {
  it("writes register capitals as a name is written", () => {
    assert.equal(tidyCapitals("PŁOCK"), "Płock");
    assert.equal(tidyCapitals("UL. JANA PAWŁA II 10A LOK. 5"), "ul. Jana Pawła II 10A lok. 5");
    assert.equal(tidyCapitals("KĘDZIERZYN-KOŹLE"), "Kędzierzyn-Koźle");
    assert.equal(tidyCapitals("NOWE MIASTO NAD PILICĄ"), "Nowe Miasto nad Pilicą");
    assert.equal(tidyCapitals("AL. 3 MAJA 12/14"), "al. 3 Maja 12/14");
  });

  it("leaves text that already has lower-case letters", () => {
    assert.equal(tidyCapitals("ul. Długa 5"), "ul. Długa 5");
  });
});

describe("parseRegistryAddress", () => {
  it("splits street, postal code and city", () => {
    assert.deepEqual(parseRegistryAddress("CHEMIKÓW 7, 09-411 PŁOCK"), { street: "Chemików 7", postalCode: "09-411", city: "Płock" });
  });

  it("keeps a flat number", () => {
    assert.deepEqual(parseRegistryAddress("UL. MARSZAŁKOWSKA 10/12 LOK. 5, 00-001 WARSZAWA"), {
      street: "ul. Marszałkowska 10/12 lok. 5",
      postalCode: "00-001",
      city: "Warszawa",
    });
  });

  it("keeps a village address without a street", () => {
    assert.deepEqual(parseRegistryAddress("RUDNA MAŁA 47, 36-060 GŁOGÓW MAŁOPOLSKI"), {
      street: "Rudna Mała 47",
      postalCode: "36-060",
      city: "Głogów Małopolski",
    });
    assert.deepEqual(parseRegistryAddress("36-060 GŁOGÓW MAŁOPOLSKI"), { street: "", postalCode: "36-060", city: "Głogów Małopolski" });
  });

  it("returns null for nothing and keeps an unknown shape as the street", () => {
    assert.equal(parseRegistryAddress(null), null);
    assert.equal(parseRegistryAddress("  "), null);
    assert.deepEqual(parseRegistryAddress("SKRYTKA 12"), { street: "Skrytka 12", postalCode: "", city: "" });
  });
});

describe("readRegistryResponse", () => {
  const subject = { name: "ORLEN SPÓŁKA AKCYJNA", residenceAddress: "CHEMIKÓW 7, 09-411 PŁOCK", workingAddress: null };

  it("takes the name as written and the working address first", () => {
    assert.deepEqual(readRegistryResponse(200, { result: { subject } }), {
      status: "found",
      company: { name: "ORLEN SPÓŁKA AKCYJNA", street: "Chemików 7", postalCode: "09-411", city: "Płock" },
    });
    const working = readRegistryResponse(200, { result: { subject: { ...subject, workingAddress: "DŁUGA 1, 00-950 WARSZAWA" } } });
    assert.equal(working.status === "found" && working.company.city, "Warszawa");
  });

  it("reports a number outside the register, a rejected number, the limit and errors", () => {
    assert.deepEqual(readRegistryResponse(200, { result: { subject: null } }), { status: "notFound" });
    assert.deepEqual(readRegistryResponse(400, { code: "WL-115", message: "Nieprawidłowy NIP." }), { status: "invalid" });
    assert.deepEqual(readRegistryResponse(429, null), { status: "limit" });
    assert.deepEqual(readRegistryResponse(400, { code: "WL-190" }), { status: "error" });
    assert.deepEqual(readRegistryResponse(500, null), { status: "error" });
    assert.deepEqual(readRegistryResponse(200, "<html>"), { status: "error" });
  });
});

describe("lookupTaxId", () => {
  const ok = (body: unknown, status = 200) => (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

  it("asks once per NIP and searches as of today in Poland", async () => {
    const urls: string[] = [];
    const fetchOnce = (async (url: string) => {
      urls.push(url);
      return new Response(JSON.stringify({ result: { subject: { name: "FIRMA", residenceAddress: "DŁUGA 1, 00-950 WARSZAWA" } } }));
    }) as unknown as typeof fetch;
    const now = new Date("2026-11-13T23:30:00Z");
    await lookupTaxId("526-025-09-95", fetchOnce, now);
    await lookupTaxId("5260250995", fetchOnce, now);
    assert.deepEqual(urls, ["https://wl-api.mf.gov.pl/api/search/nip/5260250995?date=2026-11-14"]);
  });

  it("forgets failures so a later click tries again", async () => {
    assert.deepEqual(await lookupTaxId("1132853869", ok({}, 503)), { status: "error" });
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.deepEqual(await lookupTaxId("1132853869", ok({ result: { subject: null } })), { status: "notFound" });
  });

  it("turns a network failure into an error", async () => {
    const broken = (async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;
    assert.deepEqual(await lookupTaxId("9512338476", broken), { status: "error" });
  });
});
