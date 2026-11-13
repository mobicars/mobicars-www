import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { cacheEnabled, contentPreview } from "./cache";
import { CACHE_TAGS as RCS_CACHE_TAGS } from "./rentcarsoft";
import { revalidateAccess, tagsToRevalidate } from "./revalidate";

const env = { ...process.env };
afterEach(() => {
  process.env = { ...env };
});

describe("cache switch", () => {
  it("is on unless turned off", () => {
    delete process.env.CACHE_ENABLED;
    assert.equal(cacheEnabled(), true);
    for (const on of ["true", "1", "on", "yes", ""]) {
      process.env.CACHE_ENABLED = on;
      assert.equal(cacheEnabled(), true, on);
    }
    for (const off of ["false", "0", "off", " OFF ", "False"]) {
      process.env.CACHE_ENABLED = off;
      assert.equal(cacheEnabled(), false, off);
    }
  });

  it("shows drafts exactly when the cache is off", () => {
    process.env.CACHE_ENABLED = "true";
    assert.equal(contentPreview(), false);
    process.env.CACHE_ENABLED = "false";
    assert.equal(contentPreview(), true);
    delete process.env.CACHE_ENABLED;
    assert.equal(contentPreview(), false);
  });
});

describe("revalidation tags", () => {
  it("purges every source", () => {
    const tags = tagsToRevalidate({ event: "purge" });
    assert.ok(tags?.includes("cms"));
    for (const tag of Object.values(RCS_CACHE_TAGS)) {
      assert.ok(tags?.includes(tag), tag);
    }
  });

  it("accepts known tags only", () => {
    assert.deepEqual(tagsToRevalidate({ tags: [RCS_CACHE_TAGS.catalog, "cms:page", "cms:page"] }), [
      RCS_CACHE_TAGS.catalog,
      "cms:page",
    ]);
    assert.equal(tagsToRevalidate({ tags: ["rcs:catalog", "everything"] }), null);
    assert.equal(tagsToRevalidate({ tags: [] }), null);
    assert.equal(tagsToRevalidate({ tags: "cms" }), null);
  });

  it("reads Strapi webhooks", () => {
    assert.deepEqual(tagsToRevalidate({ event: "entry.publish", model: "page" }), ["cms:page"]);
    assert.deepEqual(tagsToRevalidate({ event: "trigger-test" }), []);
    assert.equal(tagsToRevalidate({ event: "unknown" }), null);
    assert.equal(tagsToRevalidate(null), null);
  });
});

describe("revalidation access", () => {
  const request = (authorization?: string) =>
    new Request("http://localhost/api/revalidate", {
      method: "POST",
      headers: authorization ? { authorization } : {},
    });

  it("needs the secret to be configured", () => {
    delete process.env.REVALIDATE_SECRET;
    assert.equal(revalidateAccess(request("Bearer x")), "not_configured");
  });

  it("checks the bearer token", () => {
    process.env.REVALIDATE_SECRET = "s3cret";
    assert.equal(revalidateAccess(request("Bearer s3cret")), "ok");
    assert.equal(revalidateAccess(request("Bearer wrong")), "unauthorized");
    assert.equal(revalidateAccess(request("s3cret")), "unauthorized");
    assert.equal(revalidateAccess(request()), "unauthorized");
  });
});
