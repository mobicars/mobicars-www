import { ArrowRight, Car, MapPin } from "lucide-react";
import Link from "next/link";

import { accountCopy } from "@/i18n/panel-copy";
import type { Lang } from "@/i18n/config";
import { accountHref } from "@/i18n/routes";
import type { ClientReservation, ReservationStatus } from "@/lib/rentcarsoft";

import { carName, formatDateTime, formatMoney, needsPayment } from "./format";

export function StatusBadge({ status }: { status: ReservationStatus | null }) {
  if (!status?.name) {
    return null;
  }
  const tone = status.cancelled
    ? "bg-red-50 text-red-700"
    : status.pickedUp
      ? "bg-blue-light text-blue-dark"
      : status.blocksCar && !status.ending
        ? "bg-green-light text-green-dark"
        : "bg-muted-light text-muted-dark";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
      {status.name}
    </span>
  );
}

export function ReservationCard({
  lang,
  reservation,
}: {
  lang: Lang;
  reservation: ClientReservation;
}) {
  const t = accountCopy[lang].reservations;
  const name = carName(reservation) ?? reservation.offer?.segmentName ?? t.carFallback;
  const href = accountHref(lang, "reservations", reservation.id);
  const toPay = needsPayment(reservation)
    ? formatMoney(lang, reservation.payment.remainingToPay, reservation.currency)
    : null;

  return (
    <article className="relative flex flex-col gap-4 rounded-xl border border-muted bg-white p-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={reservation.status} />
          <span className="text-xs text-muted-dark">{reservation.number}</span>
          {toPay ? (
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              {t.unpaid}: {toPay}
            </span>
          ) : null}
        </div>
        <h3 className="flex items-center gap-2 text-base font-semibold text-blue-dark">
          <Car className="size-5 shrink-0 text-blue-medium" aria-hidden />
          <Link href={href} className="after:absolute after:inset-0 after:rounded-xl">
            {name}
          </Link>
        </h3>
        <dl className="grid gap-1 text-sm text-ink sm:grid-cols-2 sm:gap-4">
          <Stop label={t.pickUp} lang={lang} stop={reservation.pickUp} />
          <Stop label={t.return} lang={lang} stop={reservation.return} />
        </dl>
      </div>
      <span className="hidden items-center gap-1 text-sm font-medium text-blue-medium sm:flex">
        {t.details}
        <ArrowRight className="size-4" aria-hidden />
      </span>
    </article>
  );
}

function Stop({
  label,
  lang,
  stop,
}: {
  label: string;
  lang: Lang;
  stop: ClientReservation["pickUp"];
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-dark">{label}</dt>
      <dd className="font-medium">{formatDateTime(lang, stop.date) ?? "—"}</dd>
      <dd className="flex items-center gap-1 truncate text-muted-dark">
        <MapPin className="size-3.5 shrink-0" aria-hidden />
        <span className="truncate">{stop.address ?? stop.pointName ?? "—"}</span>
      </dd>
    </div>
  );
}
