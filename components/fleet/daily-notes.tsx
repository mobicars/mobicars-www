import type { FleetTexts } from "@/components/fleet/fleet-card";
import type { Lang } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import type { DailyFrom } from "@/lib/fleet/daily-price";
import { formatPrice } from "@/lib/fleet/format";

/**
 * What the daily "from" price needs beside it, by the client's rule that it is
 * never a bare number: the rental length it takes ("przy najmie od 30 dni")
 * and the 1-day price ("1 doba: 179 zł"). Used by the card, the booking box
 * and the phone bar, so every "od" reads the same. `oneDay` can be hidden
 * where there is no room (the phone bar).
 */
export function DailyNotes({
  daily,
  lang,
  t,
  oneDay = true,
  className = "text-xs text-muted-dark",
}: {
  daily: DailyFrom;
  lang: Lang;
  t: FleetTexts;
  oneDay?: boolean;
  className?: string;
}) {
  const condition = daily.fromDays > 1 ? fill(t.dailyFromNote, { days: daily.fromDays }) : null;
  const firstDay = oneDay && daily.oneDay !== null && daily.oneDay !== daily.price ? daily.oneDay : null;
  if (!condition && firstDay === null) {
    return null;
  }
  return (
    <p className={className}>
      {condition}
      {condition && firstDay !== null ? " · " : null}
      {firstDay !== null ? fill(t.oneDayPrice, { price: formatPrice(lang, firstDay) }) : null}
    </p>
  );
}
