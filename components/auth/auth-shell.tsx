import Link from "next/link";
import type { ReactNode } from "react";

import { authFormsCopy } from "@/i18n/auth-forms";
import type { Lang } from "@/i18n/config";
import { accountHref } from "@/i18n/routes";

/** Page frame for the signed-out pages: one centered card under the site header. */
export function AuthShell({
  lang,
  tab,
  title,
  intro,
  wide,
  children,
}: {
  lang: Lang;
  /** Shows the sign-in / create-account switch with this side selected. */
  tab?: "login" | "register";
  title: string;
  intro: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  const t = authFormsCopy[lang];

  return (
    <div className="flex flex-1 flex-col bg-surface text-ink">
      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:py-14">
        <div className={`flex w-full flex-col gap-6 ${wide ? "max-w-xl" : "max-w-md"}`}>
          {tab ? (
            <nav className="grid grid-cols-2 rounded-full bg-muted-light p-1 text-sm font-semibold">
              {(["login", "register"] as const).map((key) => (
                <Link
                  key={key}
                  href={accountHref(lang, key)}
                  aria-current={tab === key ? "page" : undefined}
                  className={`rounded-full py-2.5 text-center transition-colors ${
                    tab === key ? "bg-white text-blue-dark shadow-sm" : "text-muted-dark hover:text-blue-dark"
                  }`}
                >
                  {t.tabs[key]}
                </Link>
              ))}
            </nav>
          ) : null}
          <div className="rounded-2xl border border-muted bg-white p-6 shadow-sm sm:p-10">
            <h1 className="text-2xl font-semibold text-blue-dark">{title}</h1>
            <div className="mt-1 mb-8 text-sm text-muted-dark">{intro}</div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
