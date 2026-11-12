import { KeyRound } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ChangePasswordForm } from "@/components/auth/password-forms";
import { authFormsCopy } from "@/i18n/panel-copy";
import { isLang, type Lang } from "@/i18n/config";
import { requireSession } from "@/lib/auth/dal";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/account/security">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) {
    return {};
  }
  return {
    title: `${authFormsCopy[lang].security.title} | MobiCars`,
    robots: { index: false, follow: false },
  };
}

export default async function SecurityPage({ params }: PageProps<"/[lang]/account/security">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const t = authFormsCopy[lang].security;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-blue-dark">{t.title}</h1>
        <p className="mt-1 text-sm text-muted-dark">{t.intro}</p>
      </div>
      <section className="flex max-w-xl flex-col gap-4 rounded-2xl border border-muted bg-white p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-blue-dark">
          <KeyRound className="size-5 text-blue-medium" aria-hidden />
          {t.changeTitle}
        </h2>
        <Suspense fallback={<div className="h-72 animate-pulse rounded-lg bg-muted-light" />}>
          <SignedInForm lang={lang} />
        </Suspense>
      </section>
    </div>
  );
}

async function SignedInForm({ lang }: { lang: Lang }) {
  await requireSession(lang);
  return <ChangePasswordForm lang={lang} />;
}
