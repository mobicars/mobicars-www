import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReservationSearchPage } from "@/components/reservation/search-page";
import { isLang } from "@/i18n/config";

export const metadata: Metadata = {
  title: "Wynajem krótkoterminowy | MobiCars",
  // Every search is its own URL. None of them should be indexed.
  robots: { index: false, follow: true },
};

export default async function ShortTermReservationPage({
  params,
  searchParams,
}: PageProps<"/[lang]/reservation">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  return <ReservationSearchPage lang={lang} term="short" searchParams={searchParams} />;
}
