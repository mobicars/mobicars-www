import { LogOut } from "lucide-react";
import { notFound } from "next/navigation";

import { PanelNav } from "@/components/account/panel-nav";
import { accountCopy } from "@/i18n/account";
import { isLang } from "@/i18n/config";
import { logout } from "@/lib/auth/actions";

/**
 * Shell of the customer panel. It renders no client data: auth checks live
 * in the pages and the Data Access Layer, because a layout does not re-run
 * on client-side navigation.
 */
export default async function PanelLayout({
  children,
  params,
}: LayoutProps<"/[lang]/account">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const t = accountCopy[lang].nav;

  return (
    <div className="flex flex-1 flex-col bg-surface text-ink">
      {/* The site header has the logo; on phones the panel adds logout, which the side menu shows from `lg`. */}
      <div className="mx-auto flex w-full max-w-6xl justify-end px-4 pt-4 lg:hidden">
        <form action={logout}>
          <input type="hidden" name="lang" value={lang} />
          <button type="submit" className="flex items-center gap-1.5 text-sm font-medium text-red-700">
            <LogOut className="size-4" aria-hidden />
            {t.logout}
          </button>
        </form>
      </div>
      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 lg:grid-cols-[15rem_1fr] lg:gap-10 lg:py-10">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <PanelNav lang={lang} />
        </aside>
        <main className="min-w-0 pb-16">{children}</main>
      </div>
    </div>
  );
}
