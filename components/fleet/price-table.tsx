import { BadgePercent } from "lucide-react";

import type { FleetTexts } from "@/components/fleet/fleet-card";
import type { Lang } from "@/i18n/config";
import type { FleetPriceBand } from "@/lib/fleet/cars";
import { fill } from "@/i18n/fill";
import { bandLabel, formatApiDate, formatPrice } from "@/lib/fleet/format";

/**
 * The segment's base price per day by rental length, as on the old car page
 * (1 / 2–3 / 4–7 / 8–14 / 15–29 / 30+ days). A promotional band shows the
 * regular price struck through. These are not a quote for given dates.
 */
export function PriceTable({
  bands,
  promotion,
  lang,
  t,
}: {
  bands: FleetPriceBand[];
  promotion: { name: string | null; endsAt: string | null } | null;
  lang: Lang;
  t: FleetTexts;
}) {
  const until = promotion?.endsAt ? formatApiDate(lang, promotion.endsAt) : null;
  return (
    <div className="flex flex-col gap-3">
      {promotion?.name && until ? (
        <p className="flex items-center gap-2 text-sm font-semibold text-green-dark">
          <BadgePercent className="size-4 shrink-0" aria-hidden />
          {fill(t.promotionUntil, { name: promotion.name, date: until })}
        </p>
      ) : null}
      <table className="w-full overflow-hidden rounded-xl text-sm">
        <thead className="bg-blue-light/60 text-left text-xs text-blue-dark">
          <tr>
            <th scope="col" className="px-4 py-2 font-semibold">
              {t.rentalLength}
            </th>
            <th scope="col" className="px-4 py-2 text-right font-semibold">
              {t.pricePerDay}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-muted-light bg-white">
          {bands.map((band) => (
            <tr key={`${band.from}-${band.to}`}>
              <th scope="row" className="px-4 py-3 text-left font-medium text-blue-dark">
                {bandLabel(lang, band, t)}
              </th>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                {band.promotionalPrice !== null ? (
                  <>
                    <span className="sr-only">{t.regularPrice}: </span>
                    <s className="mr-2 text-xs text-muted-dark">{formatPrice(lang, band.price)}</s>
                    <span className="sr-only">{t.promotionalPrice}: </span>
                    <span className="font-bold text-green-dark">{formatPrice(lang, band.promotionalPrice)}</span>
                  </>
                ) : (
                  <span className="font-bold text-blue-dark">{formatPrice(lang, band.price)}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
