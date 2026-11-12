export const langs = ["pl", "en", "de", "uk"] as const;

export type Lang = (typeof langs)[number];

export const defaultLang: Lang = "pl";

export const languages: readonly { lang: Lang; label: string }[] = [
  { lang: "pl", label: "Polski" },
  { lang: "en", label: "English" },
  { lang: "de", label: "Deutsch" },
  { lang: "uk", label: "Українська" },
];

/** BCP 47 locale for `Intl` and react-aria, per site language. */
export const intlLocales: Record<Lang, string> = { pl: "pl-PL", en: "en-GB", de: "de-DE", uk: "uk-UA" };

export function isLang(value: string): value is Lang {
  return (langs as readonly string[]).includes(value);
}

export function langStaticParams(): { lang: Lang }[] {
  return langs.map((lang) => ({ lang }));
}

/**
 * First path segment when it is a supported language.
 * `canonical` lowercases that segment and keeps the rest of the path.
 */
export function langFromPath(
  pathname: string,
): { lang: Lang; canonical: string } | null {
  if (!pathname.startsWith("/")) {
    return null;
  }
  const slash = pathname.indexOf("/", 1);
  const head = slash === -1 ? pathname.slice(1) : pathname.slice(1, slash);
  const lower = head.toLowerCase();
  if (!isLang(lower)) {
    return null;
  }
  const tail = slash === -1 ? "" : pathname.slice(slash);
  return { lang: lower, canonical: `/${lower}${tail}` };
}

/** Best supported language from an Accept-Language header. Falls back to Polish. */
export function preferredLang(acceptLanguage: string | null): Lang {
  if (!acceptLanguage) {
    return defaultLang;
  }

  const ranked: { lang: Lang; q: number; index: number }[] = [];
  const parts = acceptLanguage.split(",");

  for (let index = 0; index < parts.length; index += 1) {
    const [rawTag, ...params] = parts[index].split(";");
    const tag = rawTag.trim().toLowerCase();
    if (!tag || tag === "*") {
      continue;
    }
    const base = tag.split("-")[0];
    if (!isLang(base)) {
      continue;
    }
    let q = 1;
    for (const param of params) {
      const trimmed = param.trim();
      if (!trimmed.startsWith("q=")) {
        continue;
      }
      const parsed = Number(trimmed.slice(2));
      if (Number.isFinite(parsed)) {
        q = parsed;
      }
    }
    ranked.push({ lang: base, q, index });
  }

  ranked.sort((left, right) => right.q - left.q || left.index - right.index);
  return ranked[0]?.lang ?? defaultLang;
}
