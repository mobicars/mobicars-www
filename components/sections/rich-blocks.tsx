import Link from "next/link";
import type { ReactNode } from "react";

import type { RichBlock, RichBlocks, RichInline, RichList, RichTable, ShortText } from "@/lib/strapi";

/**
 * Renders Strapi rich text on the server, as React elements (no HTML string).
 * Headings start one level below `baseLevel`'s parent: a CMS "Heading 1"
 * inside an FAQ answer must not become a second `<h1>`, so levels are shifted
 * to start at `baseLevel` and capped at h6.
 */
export function RichBlocksView({ blocks, baseLevel = 3 }: { blocks: RichBlocks; baseLevel?: number }) {
  return (
    <div className="rich-text flex flex-col gap-3">
      {blocks.map((block, index) => (
        <Block key={index} block={block} baseLevel={baseLevel} />
      ))}
    </div>
  );
}

/**
 * A short text (`mobicarsBasic`: a section's text, the hero's subtitle, a card
 * or feature text) in the type of its place: `className` sets the size and
 * colour, links and lists take the text's colour, so they read on dark
 * backgrounds too. One paragraph stays a single `<p>`, as the plain text was.
 */
export function ShortTextView({ text, className }: { text: ShortText; className?: string }) {
  if (text.length === 1 && text[0].type === "paragraph") {
    return <p className={className}>{inlines(text[0].children, SHORT_LINK)}</p>;
  }
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      {text.map((block, index) =>
        block.type === "list" ? <ListView key={index} list={block} linkClassName={SHORT_LINK} /> : <p key={index}>{inlines(block.children, SHORT_LINK)}</p>,
      )}
    </div>
  );
}

const SHORT_LINK = "font-semibold underline underline-offset-2 hover:no-underline";

/** CKEditor's alignment of a paragraph or heading. */
const ALIGN: Record<NonNullable<Extract<RichBlock, { type: "paragraph" }>["align"]>, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
  justify: "text-justify",
};

function Block({ block, baseLevel }: { block: RichBlock; baseLevel: number }) {
  switch (block.type) {
    case "paragraph":
      return <p className={block.align ? ALIGN[block.align] : undefined}>{inlines(block.children)}</p>;
    case "heading": {
      const level = Math.min(6, baseLevel + block.level - 1);
      const Heading = `h${level}` as "h3";
      // `anchor`: set by the blog article for its table of contents (`lib/blog/article.ts`).
      const anchor = (block as { anchor?: string }).anchor;
      return (
        <Heading id={anchor} className={`font-semibold text-blue-dark ${anchor ? "scroll-mt-28" : ""} ${block.align ? ALIGN[block.align] : ""}`}>
          {inlines(block.children)}
        </Heading>
      );
    }
    case "list":
      return <ListView list={block} />;
    case "quote":
      return <blockquote className="border-l-4 border-blue-light pl-4 italic">{inlines(block.children)}</blockquote>;
    case "table":
      return <TableView table={block} />;
  }
}

/** A table from the editor; wide ones scroll sideways inside their box, not the page. */
function TableView({ table }: { table: RichTable }) {
  return (
    <div className="overflow-x-auto rounded-card border border-line">
      <table className="w-full border-collapse text-left text-sm">
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-line last:border-b-0">
              {row.map((cell, cellIndex) => {
                const Cell = cell.header ? "th" : "td";
                return (
                  <Cell
                    key={cellIndex}
                    colSpan={cell.colSpan}
                    rowSpan={cell.rowSpan}
                    {...(cell.header ? { scope: rowIndex === 0 ? "col" : "row" } : {})}
                    className={`px-3 py-2 align-top ${cell.header ? "bg-surface font-semibold text-blue-dark" : ""}`}
                  >
                    {inlines(cell.children)}
                  </Cell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A list; a nested list sits between items, as Strapi stores it, and is drawn inside the item before it. */
function ListView({ list, linkClassName }: { list: RichList; linkClassName?: string }) {
  const List = list.format === "ordered" ? "ol" : "ul";
  const items: { content: ReactNode[]; nested: RichList[] }[] = [];
  for (const child of list.children) {
    if (child.type === "list") {
      if (items.length > 0) {
        items[items.length - 1].nested.push(child);
      } else {
        items.push({ content: [], nested: [child] });
      }
    } else {
      items.push({ content: inlines(child.children, linkClassName), nested: [] });
    }
  }
  return (
    <List className={`flex flex-col gap-1 pl-5 ${list.format === "ordered" ? "list-decimal" : "list-disc"}`}>
      {items.map((item, index) => (
        <li key={index}>
          {item.content}
          {item.nested.map((nested, nestedIndex) => (
            <ListView key={nestedIndex} list={nested} linkClassName={linkClassName} />
          ))}
        </li>
      ))}
    </List>
  );
}

function inlines(children: RichInline[], linkClassName = "font-semibold text-blue-medium underline underline-offset-2 hover:text-blue-dark"): ReactNode[] {
  return children.map((child, index) => {
    if (child.type === "link") {
      const content = inlines(child.children);
      const className = linkClassName;
      return /^(https?:|mailto:|tel:)/i.test(child.href) ? (
        <a key={index} href={child.href} className={className} {...(/^https?:/i.test(child.href) ? { rel: "noopener noreferrer" } : {})}>
          {content}
        </a>
      ) : (
        <Link key={index} href={child.href} className={className}>
          {content}
        </Link>
      );
    }
    // A line break inside a paragraph (`<br>` in CKEditor, kept as "\n" by the parser).
    let node: ReactNode = child.text.includes("\n")
      ? child.text.split("\n").flatMap((line, lineIndex) => (lineIndex === 0 ? [line] : [<br key={lineIndex} />, line]))
      : child.text;
    if (child.code) node = <code className="rounded bg-surface px-1 text-[0.9em]">{node}</code>;
    if (child.bold) node = <strong className="font-semibold">{node}</strong>;
    if (child.italic) node = <em>{node}</em>;
    if (child.underline) node = <span className="underline">{node}</span>;
    if (child.strikethrough) node = <s>{node}</s>;
    return <span key={index}>{node}</span>;
  });
}
