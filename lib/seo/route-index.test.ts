import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { checkBlog, checkPage, checkSale, compileRouteIndex, type RouteIndex } from "./route-index";

const index: RouteIndex = {
  pages: [["wynajem-na-dni"], ["lokalna-wypozyczalnia-samochodow", "warszawa-bemowo"], ["łódź"]],
  blog: ["Jak-wynajac-auto"],
  sales: ["toyota-c-hr-1"],
};
const lookup = compileRouteIndex(index);
const unknown = compileRouteIndex({ pages: null, blog: null, sales: null });

describe("route index", () => {
  it("lets an existing CMS page, city or local page through", () => {
    assert.deepEqual(checkPage(lookup, ["wynajem-na-dni"]), { kind: "ok" });
    assert.deepEqual(checkPage(lookup, ["lokalna-wypozyczalnia-samochodow", "warszawa-bemowo"]), { kind: "ok" });
    assert.deepEqual(checkPage(lookup, ["%C5%82%C3%B3d%C5%BA"]), { kind: "ok" });
  });

  it("redirects a wrongly cased path to the canonical one", () => {
    assert.deepEqual(checkPage(lookup, ["WYNAJEM-NA-DNI"]), { kind: "redirect", segments: ["wynajem-na-dni"] });
  });

  it("answers 404 for a path no page has", () => {
    assert.deepEqual(checkPage(lookup, ["nie-ma"]), { kind: "missing" });
    assert.deepEqual(checkPage(lookup, ["wynajem-na-dni", "x"]), { kind: "missing" });
  });

  it("matches blog slugs regardless of case and redirects to the stored one", () => {
    assert.deepEqual(checkBlog(lookup, "Jak-wynajac-auto"), { kind: "ok" });
    assert.deepEqual(checkBlog(lookup, "jak-wynajac-auto"), { kind: "redirect", segments: ["Jak-wynajac-auto"] });
    assert.deepEqual(checkBlog(lookup, "nie-ma"), { kind: "missing" });
  });

  it("matches sale slugs exactly", () => {
    assert.deepEqual(checkSale(lookup, "toyota-c-hr-1"), { kind: "ok" });
    assert.deepEqual(checkSale(lookup, "nie-ma"), { kind: "missing" });
  });

  it("leaves everything to the pages when a list could not be read", () => {
    assert.deepEqual(checkPage(unknown, ["nie-ma"]), { kind: "ok" });
    assert.deepEqual(checkBlog(unknown, "nie-ma"), { kind: "ok" });
    assert.deepEqual(checkSale(unknown, "nie-ma"), { kind: "ok" });
  });
});
