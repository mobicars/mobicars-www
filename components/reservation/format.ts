import { formatMoney as formatAmount } from "@/components/account/format";

/** Polish labels for the monthly options. Shared by the widget and the server summary. */

export function formatMonths(count: number): string {
  if (count === 1) {
    return "1 miesiąc";
  }
  const last = count % 10;
  const lastTwo = count % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return `${count} miesiące`;
  }
  return `${count} miesięcy`;
}

export function formatKilometers(count: number): string {
  const grouped = String(count).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped} km`;
}

/** "1 doba", "3 doby", "6 dób". */
export function formatDays(count: number): string {
  if (count === 1) {
    return "1 doba";
  }
  const last = count % 10;
  const lastTwo = count % 100;
  return `${count} ${last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? "doby" : "dób"}`;
}

/** "1 dzień", "2 dni", "14 dni": the rental length after a price ("/ 2 dni"). */
export function formatDayCount(count: number): string {
  return count === 1 ? "1 dzień" : `${count} dni`;
}

/** Złote as the summary shows them, e.g. "556,00 zł". Also used on the server (thank-you page). */
export function formatMoney(amount: number): string {
  return formatAmount("pl", amount, "PLN") ?? "";
}
