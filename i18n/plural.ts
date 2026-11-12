import { intlLocales, type Lang } from "./config";

/**
 * Plural forms by `Intl.PluralRules` category. English and German use `one`
 * and `other`; Polish and Ukrainian also `few` and `many`. A missing form
 * falls back to `other`.
 */
export type PluralForms = { one: string; few?: string; many?: string; other: string };

const rules = new Map<Lang, Intl.PluralRules>();

/** The word for `count`, e.g. `plural("pl", 3, { one: "doba", few: "doby", many: "dób", other: "doby" })` → "doby". */
export function plural(lang: Lang, count: number, forms: PluralForms): string {
  let rule = rules.get(lang);
  if (!rule) {
    rule = new Intl.PluralRules(intlLocales[lang]);
    rules.set(lang, rule);
  }
  const category = rule.select(count);
  return (category === "one" || category === "few" || category === "many" ? forms[category] : undefined) ?? forms.other;
}
