import { intlLocales as LOCALES, type Lang } from "@/i18n/config";
import type { ClientReservation } from "@/lib/rentcarsoft";

/**
 * RentCarSoft dates are Warsaw wall time without an offset (`YYYY-MM-DD HH:mm:ss`).
 * They are formatted as given, so server and browser print the same text.
 */
function wallTime(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
  if (!match) {
    return null;
  }
  const [, y, m, d, h, min] = match.map(Number);
  return new Date(Date.UTC(y, m - 1, d, h, min));
}

export function formatDateTime(lang: Lang, value: string | null): string | null {
  const date = value ? wallTime(value) : null;
  return date
    ? new Intl.DateTimeFormat(LOCALES[lang], {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(date)
    : null;
}

export function formatDate(lang: Lang, value: string | null): string | null {
  const date = value ? wallTime(value) : null;
  return date
    ? new Intl.DateTimeFormat(LOCALES[lang], { dateStyle: "medium", timeZone: "UTC" }).format(date)
    : null;
}

export function formatMoney(
  lang: Lang,
  amount: number | null,
  currency: string | null,
): string | null {
  if (amount === null) {
    return null;
  }
  try {
    return new Intl.NumberFormat(LOCALES[lang], {
      style: "currency",
      currency: currency ?? "PLN",
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency ?? "PLN"}`;
  }
}

export function formatNumber(lang: Lang, value: number | null): string | null {
  return value === null || value === 0
    ? null
    : new Intl.NumberFormat(LOCALES[lang]).format(value);
}

/** Current Warsaw wall time in the RentCarSoft format, for comparisons. */
export function nowInWarsaw(): string {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
  return parts.replace("T", " ");
}

/** Upcoming or running: not cancelled or finished, and not yet returned. */
export function isUpcoming(reservation: ClientReservation, now: string): boolean {
  if (reservation.status?.cancelled || reservation.status?.ending) {
    return false;
  }
  return (reservation.return.date ?? "") >= now;
}

export function needsPayment(reservation: ClientReservation): boolean {
  if (reservation.status?.cancelled) {
    return false;
  }
  return (reservation.payment.remainingToPay ?? 0) > 0;
}

export function carName(reservation: ClientReservation): string | null {
  const offer = reservation.offer;
  if (!offer) {
    return null;
  }
  return [offer.brand, offer.model].filter(Boolean).join(" ") || null;
}
