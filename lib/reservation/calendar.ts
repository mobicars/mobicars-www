import { parseDateTime, toZoned } from "@internationalized/date";

import { reservationConfig } from "@/lib/reservation/config";

/**
 * A minimal iCalendar file (RFC 5545) for "Dodaj do kalendarza": one event
 * per entry, times in UTC so every calendar converts them the same way.
 */
export type CalendarEvent = {
  uid: string;
  /** `YYYY-MM-DDTHH:mm`, Warsaw wall time. */
  start: string;
  minutes: number;
  title: string;
  location: string;
  description: string;
};

export function toIcs(events: CalendarEvent[], stamp: Date): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MobiCars//Rezerwacja//PL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events.flatMap((event) => {
      const start = toZoned(parseDateTime(event.start), reservationConfig.timeZone).toDate();
      const end = new Date(start.getTime() + event.minutes * 60_000);
      return [
        "BEGIN:VEVENT",
        `UID:${event.uid}`,
        `DTSTAMP:${utc(stamp)}`,
        `DTSTART:${utc(start)}`,
        `DTEND:${utc(end)}`,
        `SUMMARY:${text(event.title)}`,
        `LOCATION:${text(event.location)}`,
        `DESCRIPTION:${text(event.description)}`,
        "END:VEVENT",
      ];
    }),
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** 20261201T090000Z */
function utc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Escapes a TEXT value: backslash, semicolon, comma and line breaks. */
function text(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Lines longer than 75 octets continue on the next line after a space. */
function fold(line: string): string {
  const bytes = new TextEncoder();
  if (bytes.encode(line).length <= 75) {
    return line;
  }
  const parts: string[] = [];
  let current = "";
  for (const char of line) {
    const limit = parts.length === 0 ? 75 : 74;
    if (bytes.encode(current + char).length > limit) {
      parts.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.join("\r\n ");
}
