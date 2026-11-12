import { langs, type Lang } from "@/i18n/config";

/**
 * Absolute URLs for canonical links, hreflang and JSON-LD. The origin is the
 * `DOMAIN` env (`https://mobicars.pl` in production, `http://localhost:3000`
 * locally); a bare host gets `https://`.
 */
export function siteOrigin(): string {
  const raw = (process.env.DOMAIN || process.env.NEXT_PUBLIC_DOMAIN || "https://mobicars.pl").trim().replace(/\/+$/, "");
  return /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
}

export function absoluteUrl(path: string): string {
  return `${siteOrigin()}${path}`;
}

/** `alternates` for Next metadata: the canonical URL and one hreflang per language, plus `x-default` (Polish). */
export function alternates(lang: Lang, href: (lang: Lang) => string) {
  return {
    canonical: absoluteUrl(href(lang)),
    languages: {
      ...Object.fromEntries(langs.map((each) => [each, absoluteUrl(href(each))])),
      "x-default": absoluteUrl(href("pl")),
    },
  };
}

/** A `<script type="application/ld+json">` body, safe inside HTML. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
