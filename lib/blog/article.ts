import type { RichBlock, RichInline, Section, TextSection } from "@/lib/strapi";

/**
 * The blog article page (catalog C31): what the server works out from the
 * post's sections. Pure, for the tests.
 *
 * - The article's text is its Text sections without a title of their own;
 *   each renders its highest heading level as `<h2>` (`components/sections/text.tsx`).
 * - Every heading at the highest level used in that text gets an `anchor` for
 *   the table of contents.
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

function isArticleText(section: Section): section is TextSection {
  return section.type === "text" && !section.title;
}

/**
 * The sections with an `anchor` on each top-level heading of the article's
 * text, the table of contents and the reading time. The input is left as it is.
 */
export function prepareArticle(sections: readonly Section[]): { sections: Section[]; toc: TocEntry[]; minutes: number } {
  const levels = sections.flatMap((section) =>
    isArticleText(section) ? section.body.flatMap((part) => (part.type === "heading" ? [part.level] : [])) : [],
  );
  const top = levels.length > 0 ? Math.min(...levels) : null;
  const used = new Set<string>();
  const toc: TocEntry[] = [];
  let words = 0;
  const prepared = sections.map((section): Section => {
    if (!isArticleText(section)) return section;
    const body = section.body.map((part): RichBlock => {
      words += blockText(part).split(/\s+/).filter(Boolean).length;
      if (part.type !== "heading" || part.level !== top) return part;
      const text = inlineText(part.children).trim();
      const anchor = headingSlug(text, used);
      toc.push({ id: anchor, text });
      return { ...part, anchor } as Heading;
    });
    return { ...section, body };
  });
  return { sections: prepared, toc, minutes: Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)) };
}
