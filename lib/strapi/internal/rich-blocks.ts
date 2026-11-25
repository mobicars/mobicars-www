import { safeUrl } from "./url";

/**
 * Rich text from the CMS, reduced to what the site renders. Two inputs: the
 * HTML of the CKEditor fields (preset `mobicarsContent`; read into the same
 * nodes by `htmlToNodes`) and Strapi's `blocks` JSON. Either way the input is
 * untrusted: nodes of unknown types are dropped, a link with an unsafe URL
 * keeps its text, and paragraphs with no text are left out (editors use them
 * as spacing). Nothing of the HTML is ever rendered as HTML.
 */
export type RichText = {
  type: "text";
  text: string;
  bold?: true;
  italic?: true;
  underline?: true;
  strikethrough?: true;
  code?: true;
};

/** `href` passed the same check as CMS links: a site path, http(s), `mailto:` or `tel:`. */
export type RichLink = { type: "link"; href: string; children: RichText[] };

export type RichInline = RichText | RichLink;

export type RichListItem = { type: "list-item"; children: RichInline[] };

/** A nested list sits among the items, as Strapi stores indentation. */
export type RichList = { type: "list"; format: "ordered" | "unordered"; children: (RichListItem | RichList)[] };

/** A table cell: `header` for `<th>`; spans only when above 1. */
export type RichTableCell = { header: boolean; colSpan?: number; rowSpan?: number; children: RichInline[] };

/** Rows of cells, as the editor wrote them (CKEditor's tables; Strapi blocks have none). */
export type RichTable = { type: "table"; rows: RichTableCell[][] };

/** CKEditor's text alignment of a paragraph or heading; absent means the default (start). */
export type RichAlign = "left" | "center" | "right" | "justify";

export type RichBlock =
  | { type: "paragraph"; align?: RichAlign; children: RichInline[] }
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; align?: RichAlign; children: RichInline[] }
  | { type: "quote"; children: RichInline[] }
  | RichList
  | RichTable;

export type RichBlocks = RichBlock[];

const MARKS = ["bold", "italic", "underline", "strikethrough", "code"] as const;

type Raw = Record<string, unknown>;

function nodes(value: unknown): Raw[] {
  return Array.isArray(value) ? value.filter((node): node is Raw => typeof node === "object" && node !== null) : [];
}

function parseText(raw: Raw): RichText | null {
  if (typeof raw.text !== "string" || raw.text === "") {
    return null;
  }
  const text: RichText = { type: "text", text: raw.text };
  for (const mark of MARKS) {
    if (raw[mark] === true) {
      text[mark] = true;
    }
  }
  return text;
}

function parseInlines(value: unknown): RichInline[] {
  return nodes(value).flatMap((raw): RichInline[] => {
    if (raw.type === "text") {
      const text = parseText(raw);
      return text ? [text] : [];
    }
    if (raw.type === "link") {
      const children = nodes(raw.children).flatMap((child) => {
        const text = child.type === "text" ? parseText(child) : null;
        return text ? [text] : [];
      });
      const href = safeUrl(typeof raw.url === "string" ? raw.url : null);
      if (children.length === 0) {
        return [];
      }
      return href ? [{ type: "link", href, children }] : children;
    }
    return [];
  });
}

function hasText(inlines: RichInline[]): boolean {
  return inlines.some((inline) =>
    inline.type === "text" ? inline.text.trim() !== "" : inline.children.some((text) => text.text.trim() !== ""),
  );
}

function parseList(raw: Raw): RichList | null {
  const children = nodes(raw.children).flatMap((child): (RichListItem | RichList)[] => {
    if (child.type === "list-item") {
      const inlines = parseInlines(child.children);
      return hasText(inlines) ? [{ type: "list-item", children: inlines }] : [];
    }
    if (child.type === "list") {
      const nested = parseList(child);
      return nested ? [nested] : [];
    }
    return [];
  });
  if (children.length === 0) {
    return null;
  }
  return { type: "list", format: raw.format === "ordered" ? "ordered" : "unordered", children };
}

/** Rows with at least one cell; cells keep their text even when empty, so columns stay aligned. */
function parseTable(raw: Raw): RichTable | null {
  const span = (value: unknown) => (typeof value === "number" && Number.isInteger(value) && value > 1 && value <= 50 ? value : undefined);
  const rows = nodes(raw.rows).flatMap((row): RichTableCell[][] => {
    const cells = nodes(row.cells).map((cell): RichTableCell => {
      const colSpan = span(cell.colSpan);
      const rowSpan = span(cell.rowSpan);
      return { header: cell.header === true, ...(colSpan ? { colSpan } : {}), ...(rowSpan ? { rowSpan } : {}), children: parseInlines(cell.children) };
    });
    return cells.length > 0 ? [cells] : [];
  });
  const filled = rows.some((row) => row.some((cell) => hasText(cell.children)));
  return filled ? { type: "table", rows } : null;
}

export function parseRichBlocks(value: unknown): RichBlocks {
  return nodes(typeof value === "string" ? htmlToNodes(value) : value).flatMap((raw): RichBlock[] => {
    if (raw.type === "table") {
      const table = parseTable(raw);
      return table ? [table] : [];
    }
    if (raw.type === "list") {
      const list = parseList(raw);
      return list ? [list] : [];
    }
    if (raw.type !== "paragraph" && raw.type !== "heading" && raw.type !== "quote") {
      return [];
    }
    const children = parseInlines(raw.children);
    if (!hasText(children)) {
      return [];
    }
    const align = parseAlign(raw.align);
    if (raw.type === "heading") {
      const level = typeof raw.level === "number" && raw.level >= 1 && raw.level <= 6 ? raw.level : 2;
      return [{ type: "heading", level: level as 1 | 2 | 3 | 4 | 5 | 6, ...(align ? { align } : {}), children }];
    }
    return raw.type === "paragraph" && align ? [{ type: "paragraph", align, children }] : [{ type: raw.type, children }];
  });
}

/**
 * A short text from the CKEditor preset `mobicarsBasic`: paragraphs and lists
 * with bold, italic, underline, strikethrough and links. Anything else the
 * HTML holds (a heading, a quote) reads as a paragraph, a table is dropped.
 * Plain text saved before the field became rich reads as one paragraph.
 */
export type ShortText = (Extract<RichBlock, { type: "paragraph" }> | RichList)[];

export function parseShortText(value: string | null | undefined): ShortText | null {
  const blocks = parseRichBlocks(value ?? "").flatMap((block): ShortText => {
    if (block.type === "list") {
      return [block];
    }
    return block.type === "table" ? [] : [{ type: "paragraph", children: block.children }];
  });
  return blocks.length > 0 ? blocks : null;
}

/** Plain text of parsed blocks, one space between blocks and list items: for JSON-LD and meta text. */
export function richBlocksText(blocks: readonly (RichBlock | RichListItem)[]): string {
  const inlineText = (children: RichInline[]) =>
    children.map((inline) => (inline.type === "text" ? inline.text : inline.children.map((text) => text.text).join(""))).join("");
  const parts = blocks.map((block): string =>
    block.type === "list"
      ? richBlocksText(block.children)
      : block.type === "table"
        ? block.rows.map((row) => row.map((cell) => inlineText(cell.children)).join(" ")).join(" ")
        : inlineText(block.children),
  );
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

const INLINE_MARKS: Record<string, (typeof MARKS)[number]> = {
  strong: "bold",
  b: "bold",
  em: "italic",
  i: "italic",
  u: "underline",
  s: "strikethrough",
  del: "strikethrough",
  strike: "strikethrough",
  code: "code",
};

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0" };

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, name: string) => {
    if (name[0] === "#") {
      const code = name[1] === "x" || name[1] === "X" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    }
    return ENTITIES[name.toLowerCase()] ?? match;
  });
}

function parseAlign(value: unknown): RichAlign | undefined {
  return value === "left" || value === "center" || value === "right" || value === "justify" ? value : undefined;
}

/** CKEditor's alignment (`style="text-align:center;"`, the plugin's default output); other styles are ignored. */
function textAlign(attributes: string): RichAlign | undefined {
  const match = /text-align\s*:\s*(left|center|right|justify)/i.exec(attribute(attributes, "style") ?? "");
  return parseAlign(match?.[1]?.toLowerCase());
}

function attribute(attributes: string, name: string): string | null {
  const match = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(attributes);
  return match ? decodeEntities(match[1] ?? match[2] ?? match[3] ?? "") : null;
}

/**
 * CKEditor's HTML as `blocks`-shaped nodes, for `parseRichBlocks`. The editor
 * writes a small, well-formed set of tags (p, h2–h4, ul/ol/li, blockquote,
 * table/tr/th/td, a, strong, i, u, s, code, br); anything else keeps only its
 * text. Of the attributes only `href`, table spans and the alignment of
 * paragraphs and headings (`text-align` in `style`) are kept. A nested list goes among the items of its parent list, as Strapi
 * stores indentation; a table becomes `{ type: "table", rows: [{ cells }] }`.
 */
export function htmlToNodes(html: string): Raw[] {
  const blocks: Raw[] = [];
  const lists: Raw[] = [];
  const marks: Partial<Record<(typeof MARKS)[number], number>> = {};
  let current: Raw | null = null;
  let link: Raw | null = null;
  let quote = 0;
  /** The table being read and its current row (tables do not nest in the editor). */
  let table: Raw | null = null;
  let row: Raw | null = null;
  /** Inside `<script>`, `<style>` or `<template>`: their content is not text. */
  let skip: string | null = null;

  const children = (node: Raw) => node.children as Raw[];
  const open = (node: Raw) => {
    blocks.push(node);
    current = node;
  };
  const addText = (text: string) => {
    if (!current) {
      if (text.trim() === "" || lists.length > 0) {
        return;
      }
      open({ type: quote > 0 ? "quote" : "paragraph", children: [] });
    }
    const node: Raw = { type: "text", text };
    for (const mark of MARKS) {
      if (marks[mark]) {
        node[mark] = true;
      }
    }
    children(link ?? current!).push(node);
  };

  for (const match of html.matchAll(/<(\/?)([a-z][a-z0-9]*)([^>]*)>|<!--[\s\S]*?-->|([^<]+)/gi)) {
    const [, closing, rawTag, attributes = "", text] = match;
    if (skip) {
      if (closing && rawTag?.toLowerCase() === skip) {
        skip = null;
      }
      continue;
    }
    if (text !== undefined) {
      addText(decodeEntities(text.replace(/[\t\r\n]+/g, " ")));
      continue;
    }
    if (!rawTag) {
      continue;
    }
    const tag = rawTag.toLowerCase();
    const mark = INLINE_MARKS[tag];
    if (closing) {
      if (mark) {
        marks[mark] = Math.max((marks[mark] ?? 0) - 1, 0);
      } else if (tag === "a") {
        link = null;
      } else if (tag === "ul" || tag === "ol") {
        lists.pop();
        current = null;
      } else if (tag === "blockquote") {
        quote = Math.max(quote - 1, 0);
        current = null;
      } else if (tag === "table") {
        table = null;
        row = null;
        current = null;
      } else if (tag === "tr") {
        row = null;
        current = null;
      } else if (tag === "td" || tag === "th") {
        current = null;
      } else if (tag === "li" || /^h[1-6]$/.test(tag) || (tag === "p" && !["list-item", "table-cell"].includes((current as Raw | null)?.type as string))) {
        current = null;
      }
      continue;
    }
    if (tag === "script" || tag === "style" || tag === "template") {
      skip = tag;
    } else if (mark) {
      marks[mark] = (marks[mark] ?? 0) + 1;
    } else if (tag === "br") {
      addText("\n");
    } else if (tag === "a") {
      if (!current) {
        addText("");
        if (!current) {
          continue;
        }
      }
      link = { type: "link", url: attribute(attributes, "href") ?? "", children: [] };
      children(current).push(link);
    } else if (tag === "table") {
      table = { type: "table", rows: [] };
      blocks.push(table);
      row = null;
      current = null;
    } else if (tag === "tr" && table) {
      row = { cells: [] };
      (table.rows as Raw[]).push(row);
      current = null;
    } else if ((tag === "td" || tag === "th") && table) {
      if (!row) {
        row = { cells: [] };
        (table.rows as Raw[]).push(row);
      }
      const span = (name: string) => {
        const value = Number(attribute(attributes, name));
        return Number.isInteger(value) && value > 1 ? value : undefined;
      };
      current = { type: "table-cell", header: tag === "th", colSpan: span("colspan"), rowSpan: span("rowspan"), children: [] };
      (row.cells as Raw[]).push(current);
    } else if (tag === "p") {
      if (!["list-item", "table-cell"].includes((current as Raw | null)?.type as string)) {
        open({ type: quote > 0 ? "quote" : "paragraph", align: textAlign(attributes), children: [] });
      }
    } else if (/^h[1-6]$/.test(tag)) {
      open({ type: "heading", level: Number(tag[1]), align: textAlign(attributes), children: [] });
    } else if (tag === "blockquote") {
      quote++;
      current = null;
    } else if (tag === "ul" || tag === "ol") {
      const list: Raw = { type: "list", format: tag === "ol" ? "ordered" : "unordered", children: [] };
      if (lists.length > 0) {
        children(lists[lists.length - 1]).push(list);
      } else {
        blocks.push(list);
      }
      lists.push(list);
      current = null;
    } else if (tag === "li" && lists.length > 0) {
      current = { type: "list-item", children: [] };
      children(lists[lists.length - 1]).push(current);
    }
  }
  return blocks;
}

