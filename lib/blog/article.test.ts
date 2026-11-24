import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { RichBlock, Section } from "@/lib/strapi";

import { headingSlug, prepareArticle, type Heading } from "./article";

const p = (text: string): RichBlock => ({ type: "paragraph", children: [{ type: "text", text }] });
const h = (level: 1 | 2 | 3 | 4, text: string): RichBlock => ({ type: "heading", level, children: [{ type: "text", text }] });
const text = (body: RichBlock[], title: string | null = null): Section =>
  ({ type: "text", id: "1", badge: null, title, body, align: "start", textWidth: "narrow", collapseAfter: null, ctas: [] }) as unknown as Section;

describe("headingSlug", () => {
  it("drops Polish marks and repeats get a number", () => {
    const used = new Set<string>();
    assert.equal(headingSlug("Jak wynająć auto – krok po kroku?", used), "jak-wynajac-auto-krok-po-kroku");
    assert.equal(headingSlug("Łódź i okolice", used), "lodz-i-okolice");
    assert.equal(headingSlug("Jak wynająć auto – krok po kroku?", used), "jak-wynajac-auto-krok-po-kroku-2");
  });
});

describe("prepareArticle", () => {
  it("anchors the highest heading level of the text for the table of contents, across sections", () => {
    const { sections, toc } = prepareArticle([text([p("Wstęp"), h(3, "Dokumenty"), p("Prawo jazdy"), h(4, "Cudzoziemcy")]), text([h(3, "Płatność")])]);
    const headings = sections.flatMap((section) => (section as { body: RichBlock[] }).body.filter((part) => part.type === "heading"));
    assert.deepEqual(
      headings.map((part) => [(part as Heading).level, (part as Heading).anchor]),
      [
        [3, "dokumenty"],
        [4, undefined],
        [3, "platnosc"],
      ],
    );
    assert.deepEqual(toc, [
      { id: "dokumenty", text: "Dokumenty" },
      { id: "platnosc", text: "Płatność" },
    ]);
  });

  it("leaves sections with their own title alone and counts reading time, at least a minute", () => {
    const titled = text([h(2, "Sekcja")], "Tytuł");
    const { sections, minutes } = prepareArticle([titled, text([p("słowo ".repeat(450))])]);
    assert.equal(sections[0], titled);
    assert.equal(minutes, 3);
    assert.equal(prepareArticle([text([p("krótko")])]).minutes, 1);
  });
});
