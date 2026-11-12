import de from "@/messages/de.json";
import en from "@/messages/en.json";
import pl from "@/messages/pl.json";
import uk from "@/messages/uk.json";

import type { Lang } from "./config";

/**
 * UI texts, one JSON file per language in `messages/`, grouped by area
 * (`layout`, `search`, `cars`, `protection`, `extras`, `details`, …, and the
 * panel's `account`, `auth`, `accountDetails`). `pl.json` is the source: the
 * other files must have the same keys, which the assignments below check.
 *
 * Placeholders are `{name}`, filled by `fill` (import it from `i18n/fill` in
 * client code, so the browser does not get every language's JSON). Plural words are objects
 * `{ one, few?, many?, other }` for `plural` from `i18n/plural.ts`.
 * Inline links are Markdown-style `[text](href)`, rendered by `RichText`.
 */
export type Messages = typeof pl;

const all: Record<Lang, Messages> = { pl, en, de, uk };

/** Texts of one language. Server code calls it directly; client code uses `useMessages`. */
export function getMessages(lang: Lang): Messages {
  return all[lang];
}

export { fill } from "./fill";
