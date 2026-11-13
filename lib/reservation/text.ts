/** Tags kept from RentCarSoft descriptions; any other tag is dropped but its text stays. */
const KEPT = new Set(["p", "br", "strong", "em", "u", "ul", "ol", "li", "h3", "table", "thead", "tbody", "tr", "th", "td", "a"]);
const RENAMED: Record<string, string> = { b: "strong", i: "em", h1: "h3", h2: "h3", h4: "h3", h5: "h3", h6: "h3" };
/** Dropped with everything inside them. */
const REMOVED = /<(script|style|button|svg|iframe|object|template)\b[\s\S]*?<\/\1\s*>/gi;
const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g;

/**
 * Safe HTML from the descriptions RentCarSoft sends (often pasted from an
 * editor or a chatbot, full of classes and data attributes): paragraphs,
 * emphasis, lists, headings, tables and https links survive, without any
 * attribute but a link's href. Text between the tags is escaped again, so
 * nothing outside the list above can reach the page.
 */
export function richText(html: string): string | null {
  const source = html.replace(/<!--[\s\S]*?-->/g, "").replace(REMOVED, "");
  let out = "";
  let last = 0;
  for (const match of source.matchAll(TAG)) {
    out += escapeText(source.slice(last, match.index));
    last = match.index + match[0].length;
    const [, closing, rawName, attributes] = match;
    const name = RENAMED[rawName.toLowerCase()] ?? rawName.toLowerCase();
    if (!KEPT.has(name)) {
      continue;
    }
    if (name === "br") {
      out += closing ? "" : "<br>";
    } else if (closing) {
      out += `</${name}>`;
    } else if (name === "a") {
      const href = /\bhref\s*=\s*("([^"]*)"|'([^']*)')/i.exec(attributes);
      const url = safeUrl(decodeEntities(href?.[2] ?? href?.[3] ?? ""));
      out += url ? `<a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">` : "<a>";
    } else {
      out += `<${name}>`;
    }
  }
  out += escapeText(source.slice(last));

  const tidy = out
    .replace(/&nbsp;/g, " ")
    // Empty leftovers such as <strong></strong> or <p> </p>, inner ones first.
    .replace(/<(strong|em|u|a|p|li|h3)(?: [^>]*)?>\s*<\/\1>/g, "")
    .replace(/<(strong|em|u|a|p|li|h3)(?: [^>]*)?>\s*<\/\1>/g, "")
    .replace(/(<br>\s*)+(<\/(p|li|td|th)>)/g, "$2")
    .trim();
  return /[^\s]/.test(tidy.replace(/<[^>]*>/g, "")) ? tidy : null;
}

function safeUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

/** Keeps entities the source already has (&amp;, &oacute;, &#8211;); escapes bare < and >. */
function escapeText(text: string): string {
  return text.replace(/&(?![a-zA-Z][a-zA-Z0-9]*;|#\d+;|#x[0-9a-fA-F]+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}
