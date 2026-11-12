import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Banknote, CalendarPlus, Car, CircleCheck, Mail, MapPin, Package, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { ClearSearch } from "@/components/reservation/clear-search";
import { formatMoney } from "@/components/reservation/format";
import { QuoteLines } from "@/components/reservation/quote-lines";
import { buttonClass } from "@/components/ui/button";
import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { accountHref, reservationHref } from "@/i18n/routes";
import { readReceipt } from "@/lib/reservation/receipt";

/**
 * Thank-you page after booking: the old site's texts, then what was booked,
 * where and when. The details come from the receipt cookie the Server Action
 * wrote; without one (expired, another browser, typed URL) there is nothing to
 * thank for, so the visitor goes to the reservation page.
 */
export async function ReservationConfirmation({ lang }: { lang: Lang }) {
  const receipt = await readReceipt();
  if (!receipt) {
    redirect(reservationHref(lang));
  }
  const messages = getMessages(lang);
  const t = messages.confirmation;
  const d = messages.details;
  const [emailBefore, emailAfter = ""] = t.emailNotice.split("{email}");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-3 py-10 sm:px-6">
      <ClearSearch />
      <header className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-green-light text-green-medium">
          <CircleCheck className="size-9" strokeWidth={1.75} aria-hidden />
        </span>
        <h1 className="text-3xl font-semibold text-blue-dark sm:text-4xl">{t.title}</h1>
        <p className="max-w-xl text-blue-dark/80">{receipt.term === "long" ? t.subtitleLong : t.subtitle}</p>
        {receipt.id ? (
          <p className="rounded-full bg-white px-4 py-1.5 text-sm text-blue-dark shadow-sm">
            {t.orderNumber}: <span className="font-bold">{receipt.id}</span>
          </p>
        ) : null}
      </header>

      <section className="flex flex-col gap-3 rounded-2xl bg-white p-5 text-sm text-blue-dark/80 shadow-sm sm:p-6">
        <p>{t.text}</p>
        <p>{t.text2}</p>
        <p>{t.text3}</p>
        {receipt.email ? (
          <p className="flex items-center gap-2 text-blue-dark">
            <Mail className="size-4 shrink-0 text-blue-medium" strokeWidth={1.75} aria-hidden />
            <span>
              {emailBefore}
              <span className="font-semibold">{receipt.email}</span>
              {emailAfter}
            </span>
          </p>
        ) : null}
      </section>

      {(
        <section aria-labelledby="receipt-title" className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <h2 id="receipt-title" className="text-xl font-semibold text-blue-dark">
            {t.reservationTitle}
          </h2>
          <Row icon={Car} title={d.car}>
            <div className="flex items-center gap-4">
              {receipt.car.image ? (
                <span className="relative block h-20 w-36 shrink-0">
                  <Image src={receipt.car.image} alt="" fill sizes="144px" className="object-contain" />
                </span>
              ) : null}
              <div className="min-w-0">
                <p className="text-lg font-semibold text-blue-dark">{receipt.car.name}</p>
                <p className="text-xs text-muted-dark">{d.orSimilar} · {receipt.car.segment}</p>
              </div>
            </div>
          </Row>
          <Row icon={MapPin} title={d.trip}>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-dark">{d.pickup}</dt>
                <dd className="font-semibold text-blue-dark">{receipt.trip.start}</dd>
                <dd className="text-sm text-blue-dark/80">{receipt.trip.pickup}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-dark">{d.return}</dt>
                <dd className="font-semibold text-blue-dark">{receipt.trip.end}</dd>
                <dd className="text-sm text-blue-dark/80">{receipt.trip.dropoff ?? receipt.trip.pickup}</dd>
              </div>
            </dl>
          </Row>
          <Row icon={ShieldCheck} title={d.protection}>
            <p className="text-sm font-semibold text-blue-dark">{receipt.protection ?? d.noProtection}</p>
          </Row>
          <Row icon={Package} title={d.extras}>
            {receipt.extras.length > 0 ? (
              <ul className="flex flex-col gap-1 text-sm text-blue-dark">
                {receipt.extras.map((extra, index) => (
                  <li key={index}>
                    {extra.name}
                    {extra.quantity > 1 ? <span className="text-muted-dark"> × {extra.quantity}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-dark">{d.noExtras}</p>
            )}
          </Row>

          <QuoteLines
            lines={receipt.lines}
            total={receipt.total}
            monthly={receipt.monthly}
            messages={messages}
            lang={lang}
          />
          {receipt.deposit ? (
            <p className="flex items-center gap-2 text-xs text-muted-dark">
              <Banknote className="size-4 text-blue-medium" strokeWidth={1.75} aria-hidden />
              {d.deposit}: <span className="font-semibold text-blue-dark">{formatMoney(lang, receipt.deposit)}</span>
            </p>
          ) : null}
        </section>
      )}

      {receipt.at ? (
        // A plain download link: the file comes from the same encrypted receipt as this page.
        <div className="flex flex-col items-center gap-1.5 text-center">
          <a
            href={`/api/reservation/calendar?lang=${lang}`}
            download
            className={buttonClass("success", "md", "px-6")}
          >
            <CalendarPlus className="size-5" aria-hidden />
            {t.calendar.button}
          </a>
          <p className="text-xs text-muted-dark">{t.calendar.hint}</p>
        </div>
      ) : null}

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href={receipt.signedIn ? accountHref(lang, "reservations") : accountHref(lang, "login")}
          className={buttonClass("primary", "md", "px-6")}
        >
          {receipt.signedIn ? t.myReservations : t.loginToPanel}
        </Link>
        <Link
          href={reservationHref(lang)}
          className={buttonClass("secondary", "md", "px-6")}
        >
          {t.newReservation}
        </Link>
      </div>
    </div>
  );
}

function Row({ icon: Icon, title, children }: { icon: typeof Car; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 border-b border-muted-light pb-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-light text-blue-medium">
        <Icon className="size-4.5" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="mb-1.5 text-xs font-bold tracking-wide text-muted-dark uppercase">{title}</h3>
        {children}
      </div>
    </div>
  );
}
