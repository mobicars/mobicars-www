import type { Block, RichBlock, RichBlocks, RichInline } from "@/lib/strapi";

/**
 * The blog article page (catalog C31): what the server works out from the
 * post's blocks. Pure, for the tests.
 *
 * - Heading levels: editors often start sections at "Heading 3", which left
 *   the article's outline jumping from the `<h1>` to an `<h3>`/`<h4>`. The
 *   highest level used in the text becomes the first one (rendered `<h2>` in
 *   a content block without its own title), the rest keep their distance.
 * - Every first-level heading gets an `anchor` for the table of contents.
 * - Reading time: words / 200, rounded up.
 */

export type Heading = Extract<RichBlock, { type: "heading" }> & { anchor?: string };

export type TocEntry = { id: string; text: string };

const WORDS_PER_MINUTE = 200;

function inlineText(children: readonly RichInline[]): string {
  return children.map((child) => (child.type === "link" ? inlineText(child.children) : child.text)).join("");
}

function blockText(block: RichBlock): string {
  switch (block.type) {
    case "paragraph":
    case "heading":
    case "quote":
      return inlineText(block.children);
    case "list":
      return block.children.map((child) => (child.type === "list" ? blockText(child) : inlineText(child.children))).join(" ");
    case "table":
      return block.rows.flatMap((row) => row.map((cell) => inlineText(cell.children))).join(" ");
  }
}

/** `"Jak wynająć auto?"` → `"jak-wynajac-auto"`; repeats get `-2`, `-3`. */
export function headingSlug(text: string, used: Set<string>): string {
  const base =
    text
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/ł/g, "l")
      .replace(/Ł/g, "L")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "sekcja";
  let slug = base;
  for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
  used.add(slug);
  return slug;
}

/** The text blocks of the article: content blocks without a title of their own. */
function articleBodies(blocks: readonly Block[]): RichBlocks[] {
  return blocks.flatMap((block) => (block.type === "content" && !block.title ? [block.body] : []));
}

/**
 * The blocks with heading levels lifted so the highest one is level 1, and an
 * `anchor` on each level-1 heading. The input is left as it is.
 */
export function prepareArticle(blocks: readonly Block[]): { blocks: Block[]; toc: TocEntry[]; minutes: number } {
  const levels = articleBodies(blocks).flatMap((body) => body.flatMap((part) => (part.type === "heading" ? [part.level] : [])));
  const shift = levels.length > 0 ? Math.min(...levels) - 1 : 0;
  const used = new Set<string>();
  const toc: TocEntry[] = [];
  let words = 0;
  const prepared = blocks.map((block): Block => {
    if (block.type !== "content" || block.title) return block;
    const body = block.body.map((part): RichBlock => {
      words += blockText(part).split(/\s+/).filter(Boolean).length;
      if (part.type !== "heading") return part;
      const level = Math.max(1, part.level - shift) as Heading["level"];
      if (level !== 1) return { ...part, level };
      const text = inlineText(part.children).trim();
      const anchor = headingSlug(text, used);
      toc.push({ id: anchor, text });
      return { ...part, level, anchor } as Heading;
    });
    return { ...block, body };
  });
  return { blocks: prepared, toc, minutes: Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)) };
}

/**
 * Where the booking card goes: before the second first-level heading of the
 * article, else after the first content block. Returns the index of the
 * content block and of the part inside it to split at, or `null` for a post
 * without a text block.
 */
export function ctaSplit(blocks: readonly Block[]): { block: number; part: number } | null {
  let seen = 0;
  for (const [index, block] of blocks.entries()) {
    if (block.type !== "content" || block.title) continue;
    for (const [part, item] of block.body.entries()) {
      if (item.type === "heading" && item.level === 1 && ++seen === 2 && part > 0) return { block: index, part };
    }
  }
  const first = blocks.findIndex((block) => block.type === "content" && !block.title);
  return first === -1 ? null : { block: first, part: blocks[first].type === "content" ? (blocks[first] as { body: RichBlocks }).body.length : 0 };
}
