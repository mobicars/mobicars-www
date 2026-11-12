import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { accountCopy } from "@/i18n/account";
import { isLang, type Lang } from "@/i18n/config";
import { safeReturnPath } from "@/lib/auth/paths";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/account/login">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) {
    return {};
  }
  return {
    title: `${accountCopy[lang].login.title} | MobiCars`,
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({
  params,
  searchParams,
}: PageProps<"/[lang]/account/login">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const t = accountCopy[lang].login;

  return (
    <AuthShell lang={lang} tab="login" title={t.title} intro={t.intro}>
      <Suspense fallback={<LoginForm lang={lang} next={null} />}>
        <LoginFormWithReturn lang={lang} searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function LoginFormWithReturn({
  lang,
  searchParams,
}: {
  lang: Lang;
  searchParams: PageProps<"/[lang]/account/login">["searchParams"];
}) {
  const { next } = await searchParams;
  const value = typeof next === "string" ? safeReturnPath(lang, next) : null;
  return <LoginForm lang={lang} next={value} />;
}
