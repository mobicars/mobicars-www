import { notFound } from "next/navigation";

import { ReservationPicker } from "@/components/reservation-picker";
import { isLang } from "@/i18n/config";
import { listServicePoints } from "@/lib/rentcarsoft";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  const places = await listServicePoints({ lang });

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex min-h-screen items-center bg-linear-to-br from-blue-medium to-blue-dark px-3 py-8 sm:px-6">
        <div className="mx-auto w-full max-w-6xl">
          <ReservationPicker layout="horizontal" places={places} />
        </div>
      </div>
    </main>
  );
}
