import type { Lang } from "@/i18n/config";
import { salesHref } from "@/i18n/routes";

import type { SaleBySlugQuery, SaleCardFragment } from "../generated/graphql";
import { parseMedia, type Media } from "./entities";
import { parseRichBlocks, type RichBlocks } from "./rich-blocks";

/**
 * Car-sale ads (`sale`). The CMS keeps the specs in the ad's text, one
 * labelled line each ("Rok produkcji: 2022"), as the old site showed them;
 * `saleSpecs` reads them for the cards, the sorting and the filters without
 * changing the text. Only the VIN, the registration number and the first
 * registration date are fields of their own.
 */
export type SaleSpecs = {
  engine: string | null;
  year: number | null;
  /** "150 KM". */
  power: string | null;
  fuel: string | null;
  gearbox: string | null;
  /** Kilometres. */
  mileage: number | null;
  body: string | null;
};

export type SaleCard = {
  id: string;
  title: string;
  slug: string;
  /** `/pl/sprzedaz-samochodow/{slug}` (`salesHref`). */
  href: string;
  /** Gross PLN; `null` when the CMS has none. */
  price: number | null;
  /** ISO; the list's "newest" order. */
  createdAt: string | null;
  /** ISO; the sitemap's `lastmod`. */
  updatedAt: string | null;
  images: Media[];
  specs: SaleSpecs;
  /** `Seo.noIndex`: kept off the sitemap. */
  noIndex: boolean;
};

export type SaleAd = SaleCard & {
  vin: string | null;
  registrationNumber: string | null;
  /** `YYYY-MM-DD`. */
  firstRegistration: string | null;
  /** The ad's text, as the Text section renders rich text. */
  body: RichBlocks;
  seo: { title: string | null; description: string | null; noIndex: boolean; noFollow: boolean; image: Media | null };
};

const LABELS: Record<keyof SaleSpecs, string> = {
  engine: "Silnik",
  year: "Rok produkcji",
  power: "Moc",
  fuel: "Paliwo",
  gearbox: "Skrzynia biegów",
  mileage: "Przebieg",
  body: "Typ nadwozia",
};

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };

/** The ad's HTML as plain lines: a `<br>` or a closed block ends a line. */
function lines(html: string): string[] {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h\d|li|div|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, name: string) => ENTITIES[name])
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** The labelled lines of an ad's text; a value the ad leaves out is `null`. */
export function saleSpecs(html: string | null | undefined): SaleSpecs {
  const text = lines(html ?? "");
  const value = (label: string): string | null => {
    const prefix = `${label.toLowerCase()}:`;
    const line = text.find((each) => each.toLowerCase().startsWith(prefix));
    return line?.slice(prefix.length).trim() || null;
  };
  const number = (raw: string | null): number | null => {
    const digits = raw?.replace(/\D/g, "") ?? "";
    return digits ? Number(digits) : null;
  };
  const year = number(value(LABELS.year)?.match(/\d{4}/)?.[0] ?? null);
  return {
    engine: value(LABELS.engine),
    year,
    power: value(LABELS.power),
    fuel: capitalize(value(LABELS.fuel)),
    gearbox: capitalize(value(LABELS.gearbox)),
    mileage: number(value(LABELS.mileage)),
    body: capitalize(value(LABELS.body)),
  };
}

/** Body types written as abbreviations, whatever case the ad uses ("suv", "Suv" → "SUV"). */
const ABBREVIATIONS: ReadonlySet<string> = new Set(["suv", "mpv", "lpg", "cng"]);

/** One spelling per value, so the filters group "suv" with "SUV" and "benzyna" with "Benzyna". */
function capitalize(value: string | null): string | null {
  if (!value) {
    return null;
  }
  return ABBREVIATIONS.has(value.toLowerCase()) ? value.toUpperCase() : value.charAt(0).toUpperCase() + value.slice(1);
}

export function parseSaleCard(raw: SaleCardFragment, lang: Lang): SaleCard | null {
  const slug = raw.slug?.trim();
  if (!slug) {
    return null;
  }
  const price = typeof raw.Price === "number" ? raw.Price : Number(raw.Price);
  return {
    id: raw.documentId,
    title: raw.Title.trim(),
    slug,
    href: salesHref(lang, slug),
    price: Number.isFinite(price) && price > 0 ? price : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : null,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
    images: raw.Gallery.flatMap((image) => (image ? [parseMedia(image)] : [])),
    specs: saleSpecs(typeof raw.Body === "string" ? raw.Body : null),
    noIndex: raw.Seo?.noIndex === true,
  };
}

export function parseSaleAd(raw: SaleBySlugQuery["sales"][number], lang: Lang): SaleAd | null {
  const card = raw ? parseSaleCard(raw, lang) : null;
  if (!raw || !card) {
    return null;
  }
  return {
    ...card,
    vin: raw.vin?.trim() || null,
    registrationNumber: raw.registrationNumber?.trim() || null,
    firstRegistration: typeof raw.firstRegistration === "string" ? raw.firstRegistration : null,
    body: parseRichBlocks(raw.Body),
    seo: {
      title: raw.Seo?.metaTitle?.trim() || null,
      description: raw.Seo?.metaDescription?.trim() || null,
      noIndex: raw.Seo?.noIndex === true,
      noFollow: raw.Seo?.noFollow === true,
      image: raw.Seo?.shareImage ? parseMedia(raw.Seo.shareImage) : null,
    },
  };
}
