import {
  ArrowLeft,
  Car,
  Gauge,
  KeyRound,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  UserRound,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  carName,
  formatDateTime,
  formatMoney,
  formatNumber,
} from "@/components/account/format";
import { StatusBadge } from "@/components/account/reservation-card";
import { accountCopy } from "@/i18n/account";
import { isLang, type Lang } from "@/i18n/config";
import { accountHref } from "@/i18n/routes";
import { getMyReservation } from "@/lib/auth/dal";
import type { ClientReservation } from "@/lib/rentcarsoft";

type Props = PageProps<"/[lang]/account/reservations/[id]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) {
    return {};
  }
  return {
    title: `${accountCopy[lang].reservations.title} | MobiCars`,
    robots: { index: false, follow: false },
  };
}

export default function ReservationPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl border border-muted bg-white" />}>
      <ReservationDetails params={params} />
    </Suspense>
  );
}

async function ReservationDetails({ params }: { params: Props["params"] }) {
  const { lang, id } = await params;
  const reservationId = Number(id);
  if (!isLang(lang) || !/^\d+$/.test(id) || !Number.isSafeInteger(reservationId)) {
    notFound();
  }
  const reservation = await getMyReservation(lang, reservationId);
  const t = accountCopy[lang].reservations;
  const name = carName(reservation) ?? reservation.offer?.segmentName ?? t.carFallback;
  const image =
    reservation.offer?.gallery.find((item) => item.cover)?.standard ??
    reservation.offer?.gallery[0]?.standard ??
    reservation.carImage;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={accountHref(lang, "reservations")}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-blue-medium hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t.back}
      </Link>

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={reservation.status} />
          {reservation.longTerm ? (
            <span className="rounded-full bg-blue-light px-2.5 py-0.5 text-xs font-semibold text-blue-dark">
              {t.longTerm}
            </span>
          ) : null}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-blue-dark">{reservation.number}</h1>
        {reservation.createdAt ? (
          <p className="text-sm text-muted-dark">
            {t.createdAt}: {formatDateTime(lang, reservation.createdAt)}
          </p>
        ) : null}
      </header>

      {reservation.pickupCode ? (
        <div className="flex items-center gap-3 rounded-2xl bg-blue-dark p-5 text-white">
          <KeyRound className="size-6 shrink-0" aria-hidden />
          <div>
            <p className="text-sm text-blue-light">{t.pickupCode}</p>
            <p className="text-2xl font-semibold tracking-[0.3em]">{reservation.pickupCode}</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-6">
          <Panel title={t.car} icon={Car}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element -- RentCarSoft serves the fleet images.
                <img
                  src={image}
                  alt={name}
                  className="h-28 w-full rounded-lg bg-muted-light object-contain sm:w-48"
                />
              ) : null}
              <div>
                <p className="text-xl font-semibold text-blue-dark">{name}</p>
                {reservation.offer?.segmentName ? (
                  <p className="text-sm text-muted-dark">{reservation.offer.segmentName}</p>
                ) : null}
              </div>
            </div>
          </Panel>

          <Panel title={`${t.pickUp} / ${t.return}`} icon={MapPin}>
            <ol className="relative flex flex-col gap-6 border-l-2 border-blue-light pl-6">
              <Stop label={t.pickUp} lang={lang} stop={reservation.pickUp} />
              <Stop label={t.return} lang={lang} stop={reservation.return} />
            </ol>
          </Panel>

          <MileagePanel lang={lang} reservation={reservation} />

          {reservation.addons.length + reservation.accessories.length > 0 ? (
            <Panel title={t.extras} icon={Package}>
              <ul className="flex flex-wrap gap-2">
                {[...reservation.addons, ...reservation.accessories].map((item) => (
                  <li
                    key={`${item.id}-${item.name}`}
                    className="rounded-full bg-muted-light px-3 py-1 text-sm"
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          {reservation.comment ? (
            <Panel title={t.comment} icon={MessageSquare}>
              <p className="text-sm whitespace-pre-line">{reservation.comment}</p>
            </Panel>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <PaymentPanel lang={lang} reservation={reservation} />
          <ManagerPanel lang={lang} reservation={reservation} />
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Car;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-muted bg-white p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-blue-dark">
        <Icon className="size-5 text-blue-medium" aria-hidden />
        {title}
      </h2>
      {children}
    </section>
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
    <li className="relative">
      <span className="absolute top-1 -left-[1.95rem] size-3.5 rounded-full border-2 border-white bg-blue-medium ring-2 ring-blue-light" />
      <p className="text-xs font-medium uppercase tracking-wide text-muted-dark">{label}</p>
      <p className="font-semibold">{formatDateTime(lang, stop.date) ?? "—"}</p>
      <p className="text-sm text-muted-dark">{stop.address ?? stop.pointName ?? "—"}</p>
    </li>
  );
}

function MileagePanel({ lang, reservation }: { lang: Lang; reservation: ClientReservation }) {
  const t = accountCopy[lang].reservations;
  const limit = reservation.mileageLimit;
  if (!limit) {
    return null;
  }
  const text = limit.enabled
    ? t.mileageLimit(formatNumber(lang, limit.dailyAmount), formatNumber(lang, limit.totalAmount))
    : t.mileageUnlimited;
  const fee = limit.enabled && limit.fee ? formatMoney(lang, limit.fee, reservation.currency) : null;

  return (
    <Panel title={t.mileage} icon={Gauge}>
      <p className="text-sm font-medium">{text || t.mileageUnlimited}</p>
      {fee ? (
        <p className="text-sm text-muted-dark">
          {t.extraKm}: {fee}
        </p>
      ) : null}
    </Panel>
  );
}

function PaymentPanel({ lang, reservation }: { lang: Lang; reservation: ClientReservation }) {
  const t = accountCopy[lang].reservations;
  const { payment, currency } = reservation;
  const remaining = payment.remainingToPay ?? 0;
  const rows: [string, string | null][] = [
    [t.amountDue, formatMoney(lang, payment.amountDue, currency)],
    [t.totalPaid, formatMoney(lang, payment.totalPaid, currency)],
    [
      t.deposit,
      payment.depositTotal
        ? `${formatMoney(lang, payment.depositPaid ?? 0, currency)} / ${formatMoney(lang, payment.depositTotal, currency)}`
        : null,
    ],
  ];

  return (
    <Panel title={t.payment} icon={Wallet}>
      <dl className="flex flex-col gap-2 text-sm">
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-muted-dark">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
      </dl>
      {reservation.status?.cancelled ? null : remaining > 0 ? (
        <div className="flex items-center justify-between gap-4 rounded-lg bg-amber-50 px-4 py-3 text-amber-900">
          <span className="text-sm">{t.remainingToPay}</span>
          <span className="text-lg font-semibold">{formatMoney(lang, remaining, currency)}</span>
        </div>
      ) : payment.amountDue ? (
        <p className="rounded-lg bg-green-light px-4 py-3 text-sm font-semibold text-green-dark">{t.paid}</p>
      ) : null}
    </Panel>
  );
}

function ManagerPanel({ lang, reservation }: { lang: Lang; reservation: ClientReservation }) {
  const t = accountCopy[lang].reservations;
  const manager = reservation.accountManager;
  if (!manager || (!manager.phone && !manager.email)) {
    return null;
  }
  const name = [manager.name, manager.surname].filter(Boolean).join(" ");

  return (
    <Panel title={t.manager} icon={UserRound}>
      {name ? <p className="font-semibold">{name}</p> : null}
      <div className="flex flex-col gap-2 text-sm">
        {manager.phone ? (
          <a href={`tel:${manager.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-blue-medium hover:underline">
            <Phone className="size-4" aria-hidden />
            {manager.phone}
          </a>
        ) : null}
        {manager.email ? (
          <a href={`mailto:${manager.email}`} className="flex items-center gap-2 break-all text-blue-medium hover:underline">
            <Mail className="size-4" aria-hidden />
            {manager.email}
          </a>
        ) : null}
      </div>
    </Panel>
  );
}
