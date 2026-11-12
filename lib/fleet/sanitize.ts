/**
 * Car descriptions are HTML typed into RentCarSoft (offer keys 10 and 133).
 * They are trusted staff input, but they go into the page as markup, so only
 * text formatting survives: an allowlist of tags, no attributes except a safe
 * `href`, no scripts, styles or comments. Headings move one level down: the
 * page has its own `h1`, and the descriptions start with one.
 */

const ALLOWED = new Set(["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "h2", "h3", "h4", "h5", "a"]);
const DEMOTE: Record<string, string> = { h1: "h2", h2: "h3", h3: "h4", h4: "h5", h5: "h6", h6: "h6" };

export function sanitizeDescription(html: string): string {
  const cleaned = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|template)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi, (tag, rawName: string, attributes: string) => {
      const closing = tag.startsWith("</");
      const lower = rawName.toLowerCase();
      const name = DEMOTE[lower] ?? lower;
      if (!ALLOWED.has(name) && name !== "h6") {
        return "";
      }
      if (closing) {
        return `</${name}>`;
      }
      if (name === "a") {
        const href = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attributes);
        const url = (href?.[1] ?? href?.[2] ?? "").trim();
        return /^(https?:\/\/|\/(?!\/)|mailto:|tel:)/i.test(url) ? `<a href="${escapeAttribute(url)}">` : "<a>";
      }
      return name === "br" ? "<br>" : `<${name}>`;
    })
    .replace(/\r\n?/g, "\n")
    .trim();
  return cleaned;
}

/** True when the HTML has no visible text. */
export function isBlankHtml(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim() === "";
}

function escapeAttribute(value: string): string {
  return value.replace(/&(?!amp;|#\d+;)/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
