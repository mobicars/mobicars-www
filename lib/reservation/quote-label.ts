import { formatDays } from "@/components/reservation/format";
import type { Lang } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import type { Messages } from "@/i18n/messages";
import type { QuoteLineView } from "@/lib/reservation/quote";

/**
 * The label of one quote line in the page language: "Wynajem (2 doby)",
 * "Podstawienie auta", or the API's own name for protection and extras.
 * Shared by the summary panel, the last step's review and the thank-you page.
 */
export function quoteLineLabel(line: QuoteLineView, t: Messages["quoteLines"], lang: Lang): string {
  switch (line.kind) {
    case "rent":
      return line.days ? fill(t.rentDays, { days: formatDays(lang, line.days) }) : t.rent;
    case "item":
      return line.name ?? t.item;
    default:
      return t[line.kind];
  }
}
