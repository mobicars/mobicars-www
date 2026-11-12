import Link from "next/link";
import { Phone, UserRound } from "lucide-react";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import type { Lang } from "@/i18n/config";
import { accountHref, reservationHref } from "@/i18n/routes";

/**
 * Provisional site header and footer, until the CMS navigation is wired in:
 * the logo, the hotline, the language menu and the customer panel. The phone
 * number is the old site's (`mobicars-pl/components/layout/header.tsx`).
 */

const HOTLINE = { href: "tel:+48881328328", label: "+48 881 328 328" };

const COPY: Record<
  Lang,
  { account: string; hotline: string; home: string; shortTerm: string; longTerm: string; documents: string }
> = {
  pl: {
    account: "Moje konto",
    hotline: "Infolinia",
    home: "Strona główna MobiCars",
    shortTerm: "Wynajem krótkoterminowy",
    longTerm: "Wynajem długoterminowy",
    documents: "Dokumenty",
  },
  en: {
    account: "My account",
    hotline: "Hotline",
    home: "MobiCars home page",
    shortTerm: "Short-term rental",
    longTerm: "Long-term rental",
    documents: "Documents",
  },
  de: {
    account: "Mein Konto",
    hotline: "Hotline",
    home: "MobiCars Startseite",
    shortTerm: "Kurzzeitmiete",
    longTerm: "Langzeitmiete",
    documents: "Dokumente",
  },
  uk: {
    account: "Мій акаунт",
    hotline: "Гаряча лінія",
    home: "Головна сторінка MobiCars",
    shortTerm: "Короткострокова оренда",
    longTerm: "Довгострокова оренда",
    documents: "Документи",
  },
};

export function SiteHeader({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  return (
    <header className="border-b border-muted bg-white">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 lg:h-20">
        <Link href={`/${lang}`} aria-label={t.home} className="shrink-0">
          <Logo className="h-8 w-auto fill-blue-medium lg:h-10" label="MobiCars" />
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href={HOTLINE.href}
            className="flex h-10 items-center gap-2 rounded-full bg-green-medium px-3 text-sm font-bold text-white transition-colors duration-200 ease-out hover:bg-green-dark motion-reduce:transition-none"
          >
            <Phone className="size-4" aria-hidden />
            <span className="sr-only sm:not-sr-only">{HOTLINE.label}</span>
            <span className="sr-only">{t.hotline}</span>
          </a>
          <LanguageSwitcher lang={lang} />
          <Link
            href={accountHref(lang)}
            className="flex h-10 items-center gap-2 rounded-full px-3 text-sm font-bold text-blue-dark transition-colors duration-200 ease-out hover:bg-blue-dark/[0.05] motion-reduce:transition-none"
          >
            <UserRound className="size-5 text-blue-medium" aria-hidden />
            <span className="sr-only md:not-sr-only">{t.account}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const links = [
    { href: reservationHref(lang), label: t.shortTerm },
    { href: reservationHref(lang, "long"), label: t.longTerm },
    { href: accountHref(lang), label: t.account },
    // The documents still live on the old site's path; the consents link there too.
    { href: "/pl/dokumenty", label: t.documents },
  ];
  return (
    <footer className="bg-blue-medium text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-3 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4">
          <Logo className="h-auto w-40 fill-white" label="MobiCars" />
          <a
            href={HOTLINE.href}
            className="flex items-center gap-2 text-sm font-bold underline-offset-4 hover:underline"
          >
            <Phone className="size-4 text-green-light" aria-hidden />
            {t.hotline}: {HOTLINE.label}
          </a>
        </div>
        <nav aria-label="MobiCars">
          <ul className="grid gap-3 text-sm sm:grid-cols-2 sm:gap-x-10">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-white/85 underline-offset-4 hover:text-white hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="bg-black/10">
        <p className="mx-auto w-full max-w-7xl px-3 py-4 text-xs text-white/70 sm:px-6">© MobiCars</p>
      </div>
    </footer>
  );
}
