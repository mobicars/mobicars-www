import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { richText } from "./text";

describe("richText", () => {
  it("keeps structure and drops editor attributes", () => {
    assert.equal(
      richText('<p class="" data-start="1">Ładowarka <b>Type 2</b></p><ul data-x="1"><li><p>Niemcy</p></li></ul>'),
      "<p>Ładowarka <strong>Type 2</strong></p><ul><li><p>Niemcy</p></li></ul>",
    );
  });

  it("drops scripts, handlers, buttons and unsafe links", () => {
    const html = richText(
      '<p onclick="x()">a<img src=x onerror=alert(1)><script>alert(1)</script><button class="b">copy</button>' +
        '<a href="javascript:alert(1)">x</a> <a href="https://maps.google.com/?a=1&amp;b=2" data-url="/m">mapa</a></p>',
    );
    assert.equal(
      html,
      '<p>a<a>x</a> <a href="https://maps.google.com/?a=1&amp;b=2" target="_blank" rel="noopener noreferrer">mapa</a></p>',
    );
  });

  it("escapes stray brackets and keeps tables", () => {
    assert.equal(
      richText('<div class="t"><table class="min-w-full"><tr><td>1 < 2</td></tr></table></div>'),
      "<table><tr><td>1 &lt; 2</td></tr></table>",
    );
  });

  it("removes empty leftovers and returns null for nothing", () => {
    assert.equal(richText("<p><u><b></b></u> Tekst<br /></p>"), "<p> Tekst</p>");
    assert.equal(richText("<p> <b></b> </p>"), null);
  });
});
