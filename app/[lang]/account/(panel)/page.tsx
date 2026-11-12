import { ArrowRight, CalendarDays, KeyRound, UserRound, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  carName,
  formatDateTime,
  formatMoney,
  isUpcoming,
  needsPayment,
  nowInWarsaw,
} from "@/components/account/format";
import { StatusBadge } from "@/components/account/reservation-card";
import { accountCopy } from "@/i18n/panel-copy";
import { isLang, type Lang } from "@/i18n/config";
import { accountHref } from "@/i18n/routes";
import { getAccount, getMyReservations } from "@/lib/auth/dal";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/account">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) {
    return {};
  }
  return {
    title: `${accountCopy[lang].overview.title} | MobiCars`,
    robots: { index: false, follow: false },
  };
}

export default async function OverviewPage({ params }: PageProps<"/[lang]/account">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const t = accountCopy[lang];

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<PageHeading title={t.overview.title} intro={t.overview.intro} />}>
        <Greeting lang={lang} />
      </Suspense>
      <div className="grid gap-6 xl:grid-cols-2">
        <Suspense fallback={<CardSkeleton />}>
          <NextReservationCard lang={lang} />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <PaymentsCard lang={lang} />
        </Suspense>
      </div>
      <Suspense fallback={<CardSkeleton />}>
        <DetailsCard lang={lang} />
      </Suspense>
    </div>
  );
}

function PageHeading({ title, intro }: { title: string; intro: string }) {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-blue-dark">{title}</h1>
      <p className="mt-1 text-sm text-muted-dark">{intro}</p>
    </div>
  );
}

async function Greeting({ lang }: { lang: Lang }) {
  const t = accountCopy[lang].overview;
  const account = await getAccount(lang);
  return <PageHeading title={t.greeting(account.firstName)} intro={t.intro} />;
}

function Card({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: typeof Wallet;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-muted bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-blue-dark">
          <Icon className="size-5 text-blue-medium" aria-hidden />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function CardSkeleton() {
  return <div className="h-48 animate-pulse rounded-2xl border border-muted bg-white" />;
}

async function NextReservationCard({ lang }: { lang: Lang }) {
  const t = accountCopy[lang];
  const reservations = await getMyReservations(lang);
  const now = nowInWarsaw();
  const upcoming = reservations
    .filter((item) => isUpcoming(item, now))
    .toSorted((a, b) => (a.pickUp.date ?? "").localeCompare(b.pickUp.date ?? ""));
  const next = upcoming.find((item) => item.status?.pickedUp) ?? upcoming[0];

  const allLink = (
    <Link
      href={accountHref(lang, "reservations")}
      className="flex items-center gap-1 text-sm font-medium text-blue-medium hover:underline"
    >
      {t.overview.allReservations}
      <ArrowRight className="size-4" aria-hidden />
    </Link>
  );

  if (!next) {
    return (
      <Card title={t.overview.nextReservation} icon={CalendarDays} action={allLink}>
        <p className="text-sm text-muted-dark">{t.overview.noUpcoming}</p>
        <Link
          href={`/${lang}`}
          className="inline-flex h-11 w-fit items-center rounded-lg bg-green-medium px-5 text-sm font-semibold text-white hover:bg-green-dark"
        >
          {t.overview.bookCar}
        </Link>
      </Card>
    );
  }

  const title = next.status?.pickedUp ? t.overview.currentReservation : t.overview.nextReservation;
  return (
    <Card title={title} icon={CalendarDays} action={allLink}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={next.status} />
        <span className="text-xs text-muted-dark">{next.number}</span>
      </div>
      <p className="text-xl font-semibold text-blue-dark">
        {carName(next) ?? next.offer?.segmentName ?? t.reservations.carFallback}
      </p>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-dark">{t.reservations.pickUp}</dt>
          <dd className="font-medium">{formatDateTime(lang, next.pickUp.date) ?? "—"}</dd>
          <dd className="text-muted-dark">{next.pickUp.address ?? next.pickUp.pointName ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-dark">{t.reservations.return}</dt>
          <dd className="font-medium">{formatDateTime(lang, next.return.date) ?? "—"}</dd>
          <dd className="text-muted-dark">{next.return.address ?? next.return.pointName ?? "—"}</dd>
        </div>
      </dl>
      {next.pickupCode ? (
        <p className="flex items-center gap-2 rounded-lg bg-blue-light px-3 py-2 text-sm text-blue-dark">
          <KeyRound className="size-4" aria-hidden />
          {t.reservations.pickupCode}: <strong className="tracking-widest">{next.pickupCode}</strong>
        </p>
      ) : null}
      <Link
        href={accountHref(lang, "reservations", next.id)}
        className="inline-flex h-11 w-fit items-center gap-2 rounded-lg border border-blue-medium px-5 text-sm font-semibold text-blue-medium hover:bg-blue-light"
      >
        {t.reservations.details}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </Card>
  );
}

async function PaymentsCard({ lang }: { lang: Lang }) {
  const t = accountCopy[lang];
  const unpaid = (await getMyReservations(lang)).filter(needsPayment);

  return (
    <Card title={t.overview.toPay} icon={Wallet}>
      {unpaid.length === 0 ? (
        <p className="text-sm text-muted-dark">{t.overview.nothingToPay}</p>
      ) : (
        <>
          <p className="text-sm text-muted-dark">{t.overview.toPayCount(unpaid.length)}</p>
          <ul className="flex flex-col divide-y divide-muted">
            {unpaid.map((item) => (
              <li key={item.id}>
                <Link
                  href={accountHref(lang, "reservations", item.id)}
                  className="flex items-center justify-between gap-4 py-3 text-sm hover:text-blue-medium"
                >
                  <span>
                    <span className="block font-medium">{item.number}</span>
                    <span className="text-muted-dark">{formatDateTime(lang, item.pickUp.date)}</span>
                  </span>
                  <span className="font-semibold text-amber-800">
                    {formatMoney(lang, item.payment.remainingToPay, item.currency)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

async function DetailsCard({ lang }: { lang: Lang }) {
  const t = accountCopy[lang].overview;
  const account = await getAccount(lang);
  const fullName = [account.firstName, account.lastName].filter(Boolean).join(" ") || null;

  const rows: [string, string | null][] = [
    [t.name, fullName],
    [t.company, account.isCompany ? account.companyName : null],
    [t.email, account.email],
    [t.phone, account.phone],
    [t.clientNumber, String(account.clientId)],
    [t.lastLogin, formatDateTime(lang, account.lastLogin) ?? account.lastLogin],
  ];

  return (
    <Card
      title={t.details}
      icon={UserRound}
      action={
        <Link
          href={accountHref(lang, "details")}
          className="flex items-center gap-1 text-sm font-medium text-blue-medium hover:underline"
        >
          {t.editDetails}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      }
    >
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-dark">{label}</dt>
              <dd className="mt-0.5 text-sm font-medium break-words">{value}</dd>
            </div>
          ))}
      </dl>
    </Card>
  );
}
