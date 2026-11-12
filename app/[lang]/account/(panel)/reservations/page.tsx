import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { isUpcoming, nowInWarsaw } from "@/components/account/format";
import { ReservationCard } from "@/components/account/reservation-card";
import { accountCopy } from "@/i18n/account";
import { isLang, type Lang } from "@/i18n/config";
import { getMyReservations } from "@/lib/auth/dal";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/account/reservations">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) {
    return {};
  }
  return {
    title: `${accountCopy[lang].reservations.title} | MobiCars`,
    robots: { index: false, follow: false },
  };
}

export default async function ReservationsPage({
  params,
}: PageProps<"/[lang]/account/reservations">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const t = accountCopy[lang];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-blue-dark">{t.reservations.title}</h1>
        <p className="mt-1 text-sm text-muted-dark">{t.reservations.intro}</p>
      </div>
      <Suspense
        fallback={
          <div className="flex flex-col gap-3">
            <div className="h-32 animate-pulse rounded-xl border border-muted bg-white" />
            <div className="h-32 animate-pulse rounded-xl border border-muted bg-white" />
          </div>
        }
      >
        <ReservationSections lang={lang} />
      </Suspense>
    </div>
  );
}

async function ReservationSections({ lang }: { lang: Lang }) {
  const t = accountCopy[lang].reservations;
  const reservations = await getMyReservations(lang);
  const now = nowInWarsaw();
  const upcoming = reservations
    .filter((item) => isUpcoming(item, now))
    .toSorted((a, b) => (a.pickUp.date ?? "").localeCompare(b.pickUp.date ?? ""));
  const history = reservations.filter((item) => !isUpcoming(item, now));

  return (
    <>
      <Section title={t.upcoming} empty={t.emptyUpcoming} count={upcoming.length}>
        {upcoming.map((item) => (
          <ReservationCard key={item.id} lang={lang} reservation={item} />
        ))}
      </Section>
      <Section title={t.history} empty={t.emptyHistory} count={history.length}>
        {history.map((item) => (
          <ReservationCard key={item.id} lang={lang} reservation={item} />
        ))}
      </Section>
    </>
  );
}

function Section({
  title,
  empty,
  count,
  children,
}: {
  title: string;
  empty: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-blue-dark">
        {title}
        <span className="rounded-full bg-white px-2 text-sm font-medium text-muted-dark">{count}</span>
      </h2>
      {count === 0 ? (
        <p className="rounded-xl border border-dashed border-muted bg-white/60 p-6 text-sm text-muted-dark">
          {empty}
        </p>
      ) : (
        <div className="flex flex-col gap-3">{children}</div>
      )}
    </section>
  );
}
