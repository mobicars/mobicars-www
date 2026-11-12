import { formatMoney as formatAmount } from "@/components/account/format";
import { intlLocales, type Lang } from "@/i18n/config";
import { plural } from "@/i18n/plural";

/** Labels for the monthly options. Shared by the widget and the server summary. */

const MONTHS = {
  pl: { one: "miesiąc", few: "miesiące", many: "miesięcy", other: "miesiąca" },
  en: { one: "month", other: "months" },
  de: { one: "Monat", other: "Monate" },
  uk: { one: "місяць", few: "місяці", many: "місяців", other: "місяця" },
};

/** Rental days of 24 hours ("doba" in Polish). */
const DAYS = {
  pl: { one: "doba", few: "doby", many: "dób", other: "doby" },
  en: { one: "day", other: "days" },
  de: { one: "Tag", other: "Tage" },
  uk: { one: "доба", few: "доби", many: "діб", other: "доби" },
};

/** Calendar days, after a price ("/ 2 dni"). */
const DAY_COUNT = {
  pl: { one: "dzień", other: "dni" },
  en: { one: "day", other: "days" },
  de: { one: "Tag", other: "Tage" },
  uk: { one: "день", few: "дні", many: "днів", other: "дня" },
};

export function formatMonths(lang: Lang, count: number): string {
  return `${count} ${plural(lang, count, MONTHS[lang])}`;
}

export function formatKilometers(lang: Lang, count: number): string {
  return `${new Intl.NumberFormat(intlLocales[lang], { useGrouping: "always" }).format(count)} km`;
}

/** "1 doba", "3 doby", "6 dób"; "1 day", "3 days". */
export function formatDays(lang: Lang, count: number): string {
  return `${count} ${plural(lang, count, DAYS[lang])}`;
}

/** "1 dzień", "2 dni", "14 dni": the rental length after a price ("/ 2 dni"). */
export function formatDayCount(lang: Lang, count: number): string {
  return `${count} ${plural(lang, count, DAY_COUNT[lang])}`;
}

/** Złote in the page language, e.g. "556,00 zł". Also used on the server (thank-you page). */
export function formatMoney(lang: Lang, amount: number): string {
  return formatAmount(lang, amount, "PLN") ?? "";
}
