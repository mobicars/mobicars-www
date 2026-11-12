import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { toRentCarSoftPhone } from "./phone";

describe("toRentCarSoftPhone", () => {
  it("stores the RentCarSoft format: +code, one space, national digits", () => {
    assert.equal(toRentCarSoftPhone("+48 512 345 678"), "+48 512345678");
    assert.equal(toRentCarSoftPhone("+48512345678"), "+48 512345678");
    assert.equal(toRentCarSoftPhone("512-345-678"), "+48 512345678");
  });

  it("reads 00 as + and keeps foreign numbers", () => {
    assert.equal(toRentCarSoftPhone("0049 1512 3456789"), "+49 15123456789");
    assert.equal(toRentCarSoftPhone("+380 67 123 4567"), "+380 671234567");
    assert.equal(toRentCarSoftPhone("+44 7911 123456"), "+44 7911123456");
  });

  it("rejects numbers that are not valid for their country", () => {
    assert.equal(toRentCarSoftPhone("123"), null);
    assert.equal(toRentCarSoftPhone("+48 12"), null);
    assert.equal(toRentCarSoftPhone(""), null);
    assert.equal(toRentCarSoftPhone("telefon"), null);
  });
});
