import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DetailsForm } from "@/components/account/details-form";
import { isLang, type Lang } from "@/i18n/config";
import { detailsCopy } from "@/i18n/panel-copy";
import { getAccountDetails } from "@/lib/auth/dal";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/account/details">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) {
    return {};
  }
  return {
    title: `${detailsCopy[lang].title} | MobiCars`,
    robots: { index: false, follow: false },
  };
}

export default async function DetailsPage({ params }: PageProps<"/[lang]/account/details">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const t = detailsCopy[lang];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-blue-dark">{t.title}</h1>
        <p className="mt-1 text-sm text-muted-dark">{t.intro}</p>
      </div>
      <Suspense
        fallback={
          <div className="flex flex-col gap-6">
            <div className="h-64 animate-pulse rounded-2xl border border-muted bg-white" />
            <div className="h-48 animate-pulse rounded-2xl border border-muted bg-white" />
          </div>
        }
      >
        <LoadedForm lang={lang} />
      </Suspense>
    </div>
  );
}

async function LoadedForm({ lang }: { lang: Lang }) {
  const details = await getAccountDetails(lang);
  return <DetailsForm lang={lang} details={details} />;
}
