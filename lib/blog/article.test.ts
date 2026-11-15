import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Block, RichBlock } from "@/lib/strapi";

import { ctaSplit, headingSlug, prepareArticle, type Heading } from "./article";

const p = (text: string): RichBlock => ({ type: "paragraph", children: [{ type: "text", text }] });
const h = (level: 1 | 2 | 3 | 4, text: string): RichBlock => ({ type: "heading", level, children: [{ type: "text", text }] });
const content = (body: RichBlock[], title: string | null = null): Block =>
  ({ type: "content", id: "1", title, eyebrow: null, lead: null, body, align: "start", ctas: [], section: {}, collapsible: null }) as unknown as Block;

describe("headingSlug", () => {
  it("drops Polish marks and repeats get a number", () => {
    const used = new Set<string>();
    assert.equal(headingSlug("Jak wynająć auto – krok po kroku?", used), "jak-wynajac-auto-krok-po-kroku");
    assert.equal(headingSlug("Łódź i okolice", used), "lodz-i-okolice");
    assert.equal(headingSlug("Jak wynająć auto – krok po kroku?", used), "jak-wynajac-auto-krok-po-kroku-2");
  });
});

describe("prepareArticle", () => {
  it("lifts the highest heading to level 1 and anchors those for the table of contents", () => {
    const { blocks, toc } = prepareArticle([content([p("Wstęp"), h(3, "Dokumenty"), p("Prawo jazdy"), h(4, "Cudzoziemcy"), h(3, "Płatność")])]);
    const body = (blocks[0] as { body: RichBlock[] }).body;
    assert.deepEqual(
      body.filter((part) => part.type === "heading").map((part) => [(part as Heading).level, (part as Heading).anchor]),
      [
        [1, "dokumenty"],
        [2, undefined],
        [1, "platnosc"],
      ],
    );
    assert.deepEqual(toc, [
      { id: "dokumenty", text: "Dokumenty" },
      { id: "platnosc", text: "Płatność" },
    ]);
  });

  it("leaves blocks with their own title alone and counts reading time, at least a minute", () => {
    const titled = content([h(2, "Sekcja")], "Tytuł");
    const { blocks, minutes } = prepareArticle([titled, content([p("słowo ".repeat(450))])]);
    assert.equal(blocks[0], titled);
    assert.equal(minutes, 3);
    assert.equal(prepareArticle([content([p("krótko")])]).minutes, 1);
  });
});

describe("ctaSplit", () => {
  it("goes before the second section, else after the first text block", () => {
    const article = prepareArticle([content([p("a"), h(2, "Jeden"), p("b"), h(2, "Dwa"), p("c")])]).blocks;
    assert.deepEqual(ctaSplit(article), { block: 0, part: 3 });
    assert.deepEqual(ctaSplit([content([p("a"), p("b")])]), { block: 0, part: 2 });
    assert.equal(ctaSplit([]), null);
  });
});
