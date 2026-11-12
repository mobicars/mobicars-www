import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { authFormsCopy } from "@/i18n/auth-forms";
import { isLang } from "@/i18n/config";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/account/register">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) {
    return {};
  }
  return {
    title: `${authFormsCopy[lang].register.title} | MobiCars`,
    robots: { index: false, follow: false },
  };
}

export default async function RegisterPage({ params }: PageProps<"/[lang]/account/register">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const t = authFormsCopy[lang].register;

  return (
    <AuthShell lang={lang} tab="register" title={t.title} intro={t.intro} wide>
      <RegisterForm lang={lang} />
    </AuthShell>
  );
}
