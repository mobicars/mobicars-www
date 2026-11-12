import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ReservationConfirmation } from "@/components/reservation/confirmation";
import { isLang } from "@/i18n/config";

export const metadata: Metadata = {
  title: "Zamówienie złożone | MobiCars",
  robots: { index: false, follow: false },
};

export default async function ReservationConfirmationPage({ params }: PageProps<"/[lang]/reservation/confirmation">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  return (
    <main className="flex flex-1 flex-col bg-surface">
      <Suspense fallback={<div className="mx-auto h-96 w-full max-w-3xl animate-pulse px-3 py-10" />}>
        <ReservationConfirmation lang={lang} />
      </Suspense>
    </main>
  );
}
