import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/password-forms";
import { authFormsCopy } from "@/i18n/auth-forms";
import { isLang } from "@/i18n/config";

type Props = PageProps<"/[lang]/account/forgot-password">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) {
    return {};
  }
  return {
    title: `${authFormsCopy[lang].forgot.title} | MobiCars`,
    robots: { index: false, follow: false },
  };
}

/**
 * RentCarSoft emails a numeric code, not a link. The email form opens a
 * dialog for the code and the new password.
 */
export default async function ForgotPasswordPage({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const t = authFormsCopy[lang].forgot;

  return (
    <AuthShell lang={lang} title={t.title} intro={t.intro}>
      <ForgotPasswordForm lang={lang} />
    </AuthShell>
  );
}
