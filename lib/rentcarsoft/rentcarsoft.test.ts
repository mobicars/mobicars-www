import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getRentCarSoftConfig } from "./internal/config";
import { formatRentCarSoftDateTime } from "./internal/dates";
import {
  parseCreatedReservation,
  parseExtra,
  parseOffer,
  parsePriceGroup,
  parseReservationQuote,
  parseServicePoint,
} from "./internal/entities";
import { RentCarSoftError } from "./internal/errors";
import { rentCarSoftRequest } from "./internal/http";
import { ACTIVE_SERVICE_POINT_STATUS_VALUE } from "./internal/labels";
import {
  buildCalculateQuery,
  buildLoginBody,
  buildOfferQuery,
  buildPasswordRecoveryBody,
  buildReservationBody,
} from "./internal/params";
import { normalizeClient, normalizePromoCode } from "./internal/parse";
import { serializeQuery } from "./internal/query";

const config = {
  baseUrl: "https://rcs.example.test/api/v4",
  apiKey: "test-key-should-not-leak",
};

describe("serializeQuery", () => {
  it("adds dataType and encodes arrays and accessory objects", () => {
    const query = serializeQuery({
      lang: "pl",
      keys: [2, 3],
      accessories: [{ id: 9, quantity: 2 }],
      empty: undefined,
      skipped: null,
    });

    assert.match(query, /(^|&)dataType=json(&|$)/);
    assert.match(query, /keys(?:%5B%5D|\[\])=2/);
    assert.match(query, /keys(?:%5B%5D|\[\])=3/);
    assert.match(query, /accessories(?:%5B0%5D|\[0\])(?:%5Bid%5D|\[id\])=9/);
    assert.match(
      query,
      /accessories(?:%5B0%5D|\[0\])(?:%5Bquantity%5D|\[quantity\])=2/,
    );
    assert.equal(query.includes("empty"), false);
    assert.equal(query.includes("skipped"), false);
    assert.equal(query.includes("pozycja"), false);
  });

  it("serializes booleans and the verified long-term calculate flag", () => {
    const query = serializeQuery({
      mileageLimit: true,
      longTerm: 1,
    });
    assert.match(query, /mileageLimit=true/);
    assert.match(query, /longTerm=1/);
  });
});

describe("offer and reservation parameters", () => {
  it("does not send order=pozycja and defaults to order=default", () => {
    const query = buildOfferQuery({ lang: "en" });
    assert.equal(query.order, "default");
    assert.equal(JSON.stringify(query).includes("pozycja"), false);
    assert.equal(query.shortTerm, true);
  });

  it("preserves the verified long-term offer parameters", () => {
    const query = buildOfferQuery({
      term: "long",
      longTermQuote: { months: 12, monthlyKmLimit: 1000 },
    });
    assert.equal(query.longTerm, true);
    assert.equal(query.longTermKalukator, true);
    assert.equal(query.okresLongTerm, 12);
    assert.equal(query.limitLongTerm, 1000);
  });

  it("sends longTerm=1 for a long-term quote", () => {
    const query = buildCalculateQuery({
      offerId: 1,
      pickUpPointId: 2,
      returnPointId: 3,
      pickUpDate: "2026-11-02 10:00",
      returnDate: "2027-11-02 10:00",
      longTerm: { months: 12, monthlyKmLimit: 1500 },
    });
    assert.equal(query.longTerm, 1);
    assert.equal(query.iloscMiesiecy, 12);
    assert.equal(query.limitKmMiesieczny, 1500);
    assert.equal("mileageLimit" in query, false);
  });

  it("sends mileageLimit only when the caller sets it", () => {
    const input = {
      offerId: 1,
      pickUpPointId: 2,
      returnPointId: 3,
      pickUpDate: "2026-11-02 10:00",
      returnDate: "2026-11-09 10:00",
      clientKeys: [{ id: 1, value: "Ada" }],
    };
    assert.equal("mileageLimit" in buildCalculateQuery(input), false);
    assert.equal("mileageLimit" in buildReservationBody(input), false);
    assert.equal(buildCalculateQuery({ ...input, mileageLimit: true }).mileageLimit, true);
    assert.equal(buildCalculateQuery({ ...input, mileageLimit: false }).mileageLimit, false);
    assert.equal(buildReservationBody({ ...input, mileageLimit: true }).mileageLimit, true);
    assert.equal(buildReservationBody({ ...input, mileageLimit: false }).mileageLimit, false);
  });

  it("builds a reservation body with quantity and without unverified defaults", () => {
    const body = buildReservationBody({
      offerId: 4,
      pickUpPointId: 5,
      pickUpDate: "2026-11-02 10:00",
      returnPointId: 5,
      returnDate: "2026-11-09 10:00",
      clientKeys: [{ id: 1, value: "Ada" }],
      accessories: [{ id: 8, quantity: 2 }],
      addonIds: [3],
    });
    assert.deepEqual(body.accessories, [{ id: 8, quantity: 2 }]);
    assert.equal("ilosc" in body, false);
    assert.equal("paymentMethod" in body, false);
    assert.equal("statusRez" in body, false);
    assert.equal(JSON.stringify(body).includes("pozycja"), false);
  });

  it("puts login and password changes in JSON bodies", () => {
    assert.deepEqual(buildLoginBody({ email: "a@example.test", password: "secret" }), {
      email: "a@example.test",
      password: "secret",
    });
    assert.deepEqual(buildPasswordRecoveryBody({ email: "a@example.test" }), {
      email: "a@example.test",
    });
    assert.deepEqual(
      buildPasswordRecoveryBody({ email: "a@example.test", password: "next" }),
      { email: "a@example.test", password: "next" },
    );
  });
});

describe("normalization", () => {
  it("normalizes a string promo success flag", () => {
    assert.deepEqual(normalizePromoCode({ success: "false", kod: null }), {
      valid: false,
      code: null,
    });
    assert.deepEqual(normalizePromoCode({ success: "true", kod: { kod: "X" } }), {
      valid: true,
      code: { kod: "X" },
    });
  });

  it("accepts a client object or a single-element array", () => {
    const labels = { 1: "firstName" };
    const client = {
      id: 9,
      isCompany: false,
      keys: [{ id: 1, value: "Ada" }],
    };
    assert.equal(normalizeClient(client, labels).attributes.firstName?.value, "Ada");
    assert.equal(normalizeClient([client], labels).id, 9);
    assert.throws(() => normalizeClient([client, client], labels), RentCarSoftError);
  });

  it("marks popular cars and active service points", () => {
    const offer = parseOffer({
      id: 1,
      mark: "Test",
      model: "Car",
      offerKeys: [{ id: 71, value: "81" }],
    });
    assert.equal(offer.isPopular, true);

    const point = parseServicePoint({
      id: 4,
      name: "Office",
      keys: [{ id: 2, value: ACTIVE_SERVICE_POINT_STATUS_VALUE }],
    });
    assert.equal(point.active, true);
    const labeled = parseServicePoint(
      {
        id: 6,
        name: "Office",
        keys: [{ id: 2, value: ACTIVE_SERVICE_POINT_STATUS_VALUE }],
      },
      [{ id: 2, name: "Status", values: [{ id: 6, name: "Aktywny" }] }],
    );
    assert.equal(labeled.attributes.status?.value, "Aktywny");
    assert.equal(labeled.active, true);
    assert.equal(
      parseServicePoint({
        id: 5,
        name: "Closed",
        keys: [{ id: 2, value: "7" }],
      }).active,
      false,
    );
  });

  it("reads verified long-term quote fields and does not invent a payment url on create", () => {
    const quote = parseReservationQuote({
      iloscMiesiecy: 12,
      limitKmMiesieczny: 1500,
      release: { name: "A", data: "2026-11-02 10:00" },
      return: { name: "B", data: "2027-11-02 10:00" },
      vehicle: { id: "8", name: "Car", deposit: "100.50", imageWebp: "car.webp" },
      prices: {
        total: 10,
        addons: [
          {
            id: 3,
            price: 40,
            suggested: 50,
            itemPrice: 10,
            isOneTime: false,
            name: "OC",
            nameEn: "Liability",
          },
        ],
        accessories: [],
        cena_miesieczna_najmu: 20,
        razem_jednorazowo: 5,
        razem_miesiecznie_najem_akcesoria_dodatki: 25,
        limitKmMonth: 1500,
        limitKmTotal: 18000,
        days: "365",
      },
    });
    assert.equal(quote.term, "long");
    assert.equal(quote.monthlyRent, 20);
    assert.equal(quote.oneTimeTotal, 5);
    assert.equal(quote.monthlyWithExtras, 25);
    assert.equal(quote.days, 365);
    assert.equal(quote.deposit, 100.5);
    assert.deepEqual(quote.addons, [
      {
        id: 3,
        price: 40,
        suggested: 50,
        itemPrice: 10,
        isOneTime: false,
        name: "OC",
        nameEn: "Liability",
      },
    ]);
    assert.deepEqual(quote.accessories, []);
    assert.equal("itemPriceMoi" in quote.addons[0], false);

    const created = parseCreatedReservation({
      id: 3,
      success: true,
      unique: true,
      paymentUrl: null,
    });
    assert.equal(created.success, true);
    assert.equal(created.paymentUrl, null);
    assert.throws(() => parseCreatedReservation({ id: 3 }), RentCarSoftError);
  });

  it("reads price-group monthly info and addon presentation", () => {
    const group = parsePriceGroup({
      id: 2,
      monthlyInfo: {
        monthlyPrice: 900,
        monthlyPriceNoLimit: 1100,
        monthlyKmLimit: 1500,
        monthlyExceedingLimitFee: 0.5,
      },
    });
    assert.deepEqual(group.monthlyInfo, {
      monthlyPrice: 900,
      monthlyPriceNoLimit: 1100,
      monthlyKmLimit: 1500,
      monthlyExceedingLimitFee: 0.5,
    });

    const addon = parseExtra({
      id: 4,
      name: "Guard",
      presentation: { glassDamage: "1000", theft: null },
    });
    assert.equal(addon.presentation?.glassDamage, "1000");
    assert.equal(addon.presentation?.theft, null);
    assert.equal(parseExtra({ id: 5, name: "Seat" }).presentation, null);
  });

  it("formats pickup dates in local time", () => {
    const date = new Date(2026, 9, 8, 0, 5);
    assert.equal(formatRentCarSoftDateTime(date), "2026-10-08 00:05");
  });
});

describe("http client", () => {
  it("sends the bearer token and does not put it in the url", async () => {
    let seenUrl = "";
    let seenAuth = "";
    let seenBody = "";
    await rentCarSoftRequest({
      method: "POST",
      path: "/client/login.json",
      body: { email: "a@example.test", password: "secret" },
      config,
      fetchImpl: async (url, init) => {
        seenUrl = String(url);
        seenAuth = new Headers(init?.headers).get("Authorization") ?? "";
        seenBody = String(init?.body ?? "");
        return new Response(JSON.stringify({ clientId: 1 }), { status: 200 });
      },
    });

    assert.equal(seenAuth, `Bearer ${config.apiKey}`);
    assert.equal(seenUrl.includes(config.apiKey), false);
    assert.equal(seenUrl.includes("email="), false);
    assert.match(seenUrl, /dataType=json/);
    assert.equal(seenBody, JSON.stringify({ email: "a@example.test", password: "secret" }));
  });

  it("maps status codes, timeouts, network failures, and malformed bodies", async () => {
    const cases: Array<{ status?: number; body?: string; error?: Error; code: string }> = [
      { status: 401, body: "401", code: "unauthorized" },
      { status: 400, body: "", code: "invalid_request" },
      { status: 404, body: "", code: "not_found" },
      { status: 500, body: "", code: "api" },
      { status: 200, body: "not-json", code: "malformed_response" },
      { status: 200, body: "eyJaaa.eyJbbb.eyJccc", code: "malformed_response" },
      { status: 200, body: "", code: "malformed_response" },
    ];

    for (const item of cases) {
      await assert.rejects(
        () =>
          rentCarSoftRequest({
            path: "/languages.json",
            config,
            fetchImpl: async () => new Response(item.body ?? "", { status: item.status }),
          }),
        (error: unknown) => {
          assert.ok(error instanceof RentCarSoftError);
          assert.equal(error.code, item.code);
          assert.equal(error.message.includes(config.apiKey), false);
          assert.equal(error.message.includes("eyJ"), false);
          return true;
        },
      );
    }

    await assert.rejects(
      () =>
        rentCarSoftRequest({
          path: "/languages.json",
          config,
          fetchImpl: async () => {
            const error = new Error(`timed out ${config.apiKey}`);
            error.name = "TimeoutError";
            throw error;
          },
        }),
      (error: unknown) => {
        assert.ok(error instanceof RentCarSoftError);
        assert.equal(error.code, "timeout");
        assert.equal(error.message.includes(config.apiKey), false);
        return true;
      },
    );

    await assert.rejects(
      () =>
        rentCarSoftRequest({
          path: "/languages.json",
          config,
          fetchImpl: async () => {
            throw new TypeError(`connect ${config.apiKey}`);
          },
        }),
      (error: unknown) => {
        assert.ok(error instanceof RentCarSoftError);
        assert.equal(error.code, "network");
        assert.equal(error.message.includes(config.apiKey), false);
        return true;
      },
    );
  });

  it("returns undefined for an empty success body", async () => {
    const result = await rentCarSoftRequest({
      method: "POST",
      path: "/client/password/recovery.json",
      body: { email: "a@example.test" },
      config,
      fetchImpl: async () => new Response(null, { status: 204 }),
    });
    assert.equal(result, undefined);
  });

  it("parses JSON even when the content type is text/html", async () => {
    const result = await rentCarSoftRequest({
      path: "/languages.json",
      config,
      fetchImpl: async () =>
        new Response(JSON.stringify([{ id: 1 }]), {
          status: 200,
          headers: { "Content-Type": "text/html; charset=UTF-8" },
        }),
    });
    assert.deepEqual(result, [{ id: 1 }]);
  });
});

describe("configuration", () => {
  it("fails before a request when configuration is missing", () => {
    assert.throws(
      () => getRentCarSoftConfig({} as NodeJS.ProcessEnv),
      (error: unknown) => {
        assert.ok(error instanceof RentCarSoftError);
        assert.equal(error.code, "config");
        assert.equal(error.message.includes("RCS_KEY"), false);
        return true;
      },
    );
  });
});
