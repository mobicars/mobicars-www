"use client";

import { CalendarDays, LayoutDashboard, LogOut, Plus, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

import { accountCopy } from "@/i18n/account";
import type { Lang } from "@/i18n/config";
import { accountHref } from "@/i18n/routes";
import { logout } from "@/lib/auth/actions";

/**
 * With Cache Components, `usePathname()` is request data and must sit inside
 * `<Suspense>`. The prerendered shell shows the menu with no item marked.
 */
export function PanelNav({ lang }: { lang: Lang }) {
  return (
    <Suspense fallback={<PanelNavList lang={lang} pathname={null} />}>
      <ActivePanelNav lang={lang} />
    </Suspense>
  );
}

function ActivePanelNav({ lang }: { lang: Lang }) {
  return <PanelNavList lang={lang} pathname={usePathname()} />;
}

function PanelNavList({ lang, pathname }: { lang: Lang; pathname: string | null }) {
  const t = accountCopy[lang].nav;
  const items = [
    { href: accountHref(lang), label: t.overview, icon: LayoutDashboard, exact: true },
    { href: accountHref(lang, "reservations"), label: t.reservations, icon: CalendarDays, exact: false },
    { href: accountHref(lang, "details"), label: t.details, icon: UserRound, exact: false },
    { href: accountHref(lang, "security"), label: t.security, icon: ShieldCheck, exact: false },
  ];

  return (
    <nav aria-label={t.label} className="flex flex-col gap-1">
      <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active =
            pathname !== null &&
            (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-blue-light text-blue-dark"
                    : "text-muted-dark hover:bg-muted-light hover:text-blue-dark"
                }`}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
        <li className="shrink-0 lg:mt-2">
          <Link
            href={`/${lang}`}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap text-green-dark transition-colors hover:bg-green-light"
          >
            <Plus className="size-5 shrink-0" aria-hidden />
            {t.newReservation}
          </Link>
        </li>
      </ul>
      <form action={logout} className="hidden border-t border-muted pt-3 lg:mt-4 lg:block">
        <input type="hidden" name="lang" value={lang} />
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
        >
          <LogOut className="size-5 shrink-0" aria-hidden />
          {t.logout}
        </button>
      </form>
    </nav>
  );
}
