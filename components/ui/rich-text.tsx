import { Fragment } from "react";

/**
 * Renders a translated text with Markdown-style links, e.g.
 * "Akceptuję [Regulamin](/pl/dokumenty/regulamin)." Links open in a new tab,
 * so a form in progress is not lost. Nothing else is interpreted: no HTML.
 */
export function RichText({ text, linkClassName }: { text: string; linkClassName?: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)\s]+\))/g);
  return (
    <>
      {parts.map((part, index) => {
        const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
        if (!link) {
          return <Fragment key={index}>{part}</Fragment>;
        }
        return (
          <a
            key={index}
            href={link[2]}
            target="_blank"
            rel="noopener"
            className={linkClassName ?? "font-semibold text-blue-medium underline underline-offset-2"}
          >
            {link[1]}
          </a>
        );
      })}
    </>
  );
}
