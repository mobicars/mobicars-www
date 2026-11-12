import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/fleet/breadcrumbs";
import { FleetBrowser } from "@/components/fleet/fleet-browser";
import { isLang, type Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { fleetHref } from "@/i18n/routes";
import { listFleetCars } from "@/lib/fleet/cars";
import { absoluteUrl, alternates, jsonLd } from "@/lib/fleet/seo";

/**
 * The fleet list: `/pl/flota`, `/en/fleet`, `/de/fleet`, `/uk/fleet`. Every
 * car of the daily catalog, filtered in the browser. See `lib/fleet/README.md`.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/fleet">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) {
    return {};
  }
  const t = getMessages(lang).fleet;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: alternates(lang, (each) => fleetHref(each)),
    openGraph: { title: t.metaTitle, description: t.metaDescription, url: absoluteUrl(fleetHref(lang)), type: "website" },
  };
}

export default async function FleetPage({ params }: PageProps<"/[lang]/fleet">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const t = getMessages(lang).fleet;

  return (
    <main className="flex flex-1 flex-col bg-surface">
      <div className="bg-linear-to-br from-blue-medium to-blue-dark text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-3 py-10 sm:px-6 lg:py-14">
          <div className="[&_a]:text-white/80 [&_a:hover]:text-white [&_nav]:text-white/70 [&_span[aria-current]]:text-white">
            <Breadcrumbs
              items={[
                { href: `/${lang}`, label: t.breadcrumbHome },
                { href: fleetHref(lang), label: t.breadcrumbFleet },
              ]}
            />
          </div>
          <p className="text-sm font-semibold tracking-wide text-green-light uppercase">{t.eyebrow}</p>
          <h1 className="text-3xl font-bold sm:text-4xl">{t.title}</h1>
          <p className="max-w-3xl text-white/85">{t.lead}</p>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-8 sm:px-6">
        <p className="rounded-xl bg-blue-light px-4 py-3 text-sm text-blue-dark">{t.classNote}</p>
        <Suspense fallback={<FleetSkeleton />}>
          <FleetList lang={lang} />
        </Suspense>
      </div>
    </main>
  );
}

async function FleetList({ lang }: { lang: Lang }) {
  const t = getMessages(lang).fleet;
  const cars = await listFleetCars(lang);
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t.title,
    numberOfItems: cars.length,
    itemListElement: cars.map((car, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(fleetHref(lang, car.slug)),
      name: car.name,
    })),
  };
  return (
    <>
      <FleetBrowser cars={cars} lang={lang} t={t} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemList) }} />
    </>
  );
}

function FleetSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <div className="h-20 animate-pulse rounded-2xl bg-white" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-96 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    </div>
  );
}
