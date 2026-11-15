import type { Lang } from "@/i18n/config";

import type { OpeningHours, Weekday } from "./entities";

const WEEKDAYS: readonly Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const SCHEMA_DAYS: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

/** `Intl` locale of a site language (`uk` is already Ukrainian). */
const LOCALES: Record<Lang, string> = { pl: "pl-PL", en: "en-GB", de: "de-DE", uk: "uk-UA" };

/**
 * One row's days as text: three or more days in a row become a range
 * ("pon.–pt."), others a list ("sob., niedz."). Names come from `Intl`.
 */
export function formatDays(days: readonly Weekday[], lang: Lang): string {
  // 2024-01-01 was a Monday.
  const format = new Intl.DateTimeFormat(LOCALES[lang], { weekday: "short", timeZone: "UTC" });
  const name = (day: Weekday) => format.format(new Date(Date.UTC(2024, 0, 1 + WEEKDAYS.indexOf(day))));
  const runs: Weekday[][] = [];
  for (const day of WEEKDAYS.filter((each) => days.includes(each))) {
    const run = runs.at(-1);
    if (run && WEEKDAYS.indexOf(run.at(-1)!) + 1 === WEEKDAYS.indexOf(day)) {
      run.push(day);
    } else {
      runs.push([day]);
    }
  }
  return runs
    .map((run) => (run.length >= 3 ? `${name(run[0])}–${name(run.at(-1)!)}` : run.map(name).join(", ")))
    .join(", ");
}

/**
 * Rows as lines of text: "pon.–pt. 07:00–20:00"; a closed row uses `closed`
 * ("nieczynne"), which the caller takes from its messages.
 */
export function formatOpeningHours(hours: readonly OpeningHours[], lang: Lang, closed: string): string[] {
  return hours.map((row) => `${formatDays(row.days, lang)} ${row.closed ? closed : `${row.opens}–${row.closes}`}`);
}

/** schema.org `openingHoursSpecification` for the `Organization` / `AutoRental` JSON-LD; closed rows are left out. */
export function openingHoursSpecification(hours: readonly OpeningHours[]) {
  return hours.flatMap((row) =>
    row.closed || !row.opens || !row.closes
      ? []
      : [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: row.days.map((day) => `https://schema.org/${SCHEMA_DAYS[day]}`),
            opens: row.opens,
            closes: row.closes,
          },
        ],
  );
}
