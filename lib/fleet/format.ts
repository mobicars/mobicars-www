import { intlLocales, type Lang } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { plural, type PluralForms } from "@/i18n/plural";

/**
 * Money and band labels for the fleet pages. Whole złoty without decimals
 * ("89 zł"), anything else with two ("95,20 zł"). Prices are gross, as the API sends them.
 */
export function formatPrice(lang: Lang, amount: number): string {
  return new Intl.NumberFormat(intlLocales[lang], {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** A RentCarSoft `YYYY-MM-DD HH:mm:ss` (Warsaw wall time) as a date: "15 gru 2026", "15 gru" without the year, "15 grudnia 2026" with the long month. */
export function formatApiDate(lang: Lang, value: string, { year = true, month = "short" }: { year?: boolean; month?: "short" | "long" } = {}): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return null;
  }
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat(intlLocales[lang], { day: "numeric", month, year: year ? "numeric" : undefined, timeZone: "UTC" }).format(date);
}

/** The plural form for `count`, with `{count}` filled in. */
export function countLabel(lang: Lang, count: number, forms: PluralForms): string {
  return fill(plural(lang, count, forms), { count });
}

export type BandTexts = { bandFirst: string; bandRange: string; bandLast: string; days: PluralForms };

/** "1 dzień", "2–3 dni", "od 30 dni": a price band's rental length. A band from 0 days (some classes start there) reads as the first one. */
export function bandLabel(lang: Lang, { from: start, to }: { from: number | null; to: number | null }, t: BandTexts): string {
  const band = { from: start === 0 ? null : start, to };
  if (band.from === null && band.to !== null) {
    return band.to === 1 ? `1 ${plural(lang, 1, t.days)}` : fill(t.bandFirst, { to: band.to, days: plural(lang, band.to, t.days) });
  }
  if (band.from !== null && band.to === null) {
    return fill(t.bandLast, { from: band.from, days: plural(lang, band.from, t.days) });
  }
  if (band.from !== null && band.to !== null) {
    if (band.from === band.to) {
      return `${band.from} ${plural(lang, band.from, t.days)}`;
    }
    return fill(t.bandRange, { from: band.from, to: band.to, days: plural(lang, band.to, t.days) });
  }
  return "";
}
