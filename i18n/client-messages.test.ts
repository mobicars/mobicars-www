import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CLIENT_MESSAGE_SCOPES } from "./client-messages";
import { namespacesOf, scanClientMessages, scopeOf } from "./client-messages-scan";
import pl from "../messages/pl.json";

const { needs, unknown } = scanClientMessages();

/** What reaches the browser on a route of `scope`: the base set plus its own. */
function sent(scope: keyof typeof needs): Set<string> {
  return new Set<string>([...CLIENT_MESSAGE_SCOPES.base, ...(scope === "base" ? [] : CLIENT_MESSAGE_SCOPES[scope])]);
}

describe("client messages", () => {
  for (const scope of Object.keys(needs) as (keyof typeof needs)[]) {
    it(`sends every namespace the ${scope} routes' client components read`, () => {
      const missing = [...needs[scope]]
        .filter(([namespace]) => !sent(scope).has(namespace))
        .map(([namespace, readers]) => `${namespace} (read by ${[...readers].join(", ")})`);
      assert.deepEqual(missing, [], `add to CLIENT_MESSAGE_SCOPES.${scope} in i18n/client-messages.ts`);
    });
  }

  it("follows every way a client file takes texts", () => {
    assert.deepEqual(unknown, []);
  });

  it("lists only namespaces that exist", () => {
    const known = new Set(Object.keys(pl));
    const listed = Object.values(CLIENT_MESSAGE_SCOPES).flat();
    assert.deepEqual(
      listed.filter((key) => !known.has(key)),
      [],
    );
  });

  it("keeps the browser's share small: the big server-only namespaces stay out", () => {
    const everywhere = new Set<string>(Object.values(CLIENT_MESSAGE_SCOPES).flat());
    for (const namespace of ["fleet", "confirmation"]) {
      assert.equal(everywhere.has(namespace), false, `${namespace} is read on the server only`);
    }
  });

  it("reads the usual patterns", () => {
    // The scanner on files known to use each pattern.
    assert.ok(namespacesOf("components/reservation/steps.tsx").namespaces.has("steps"));
    assert.ok(namespacesOf("components/reservation/summary.tsx").namespaces.has("quoteLines"));
    assert.ok(namespacesOf("components/reservation/picker.tsx").namespaces.has("search"));
    assert.ok(namespacesOf("components/auth/login-form.tsx").namespaces.has("auth"));
    assert.equal(scopeOf("app/[lang]/reservation/page.tsx".replace(/^/, `${process.cwd()}/`)), "reservation");
  });
});
