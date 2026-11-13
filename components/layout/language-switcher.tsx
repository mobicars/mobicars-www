"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Dialog } from "react-aria-components";
import { Globe, Square, SquareCheck } from "lucide-react";

import { DialogHeader, WidgetModal } from "@/components/reservation/dialog-parts";
import { languages, type Lang } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { useMessages } from "@/i18n/messages-context";
import { switchLangHref } from "@/i18n/routes";

/** `.pickup-modal[data-exiting]` in globals.css runs 180 ms. */
const EXIT_MS = 200;

const triggerClass = {
  header:
    "flex h-10 cursor-pointer items-center gap-2 rounded-full px-3 text-xs font-bold text-blue-dark uppercase outline-none transition-colors duration-200 ease-out hover:bg-blue-dark/[0.05] data-focus-visible:ring-2 data-focus-visible:ring-blue-medium motion-reduce:transition-none",
  footer:
    "flex cursor-pointer items-center gap-2 rounded-full py-1 text-sm font-bold text-white/85 outline-none underline-offset-4 hover:text-white hover:underline data-focus-visible:ring-2 data-focus-visible:ring-white",
};

/**
 * Language button and its dialog: the languages one under another, each with its
 * own name and, below, its name in the page's language. Languages come from
 * `i18n/config`; flags from `public/assets/flags/{lang}.svg`. Picking one
 * opens the same page in that language (`switchLangHref`), search included.
 */
export function LanguageSwitcher({ lang, variant = "header" }: { lang: Lang; variant?: "header" | "footer" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const current = languages.find((item) => item.lang === lang) ?? languages[0];
  const t = useMessages().layout;

  const choose = (target: Lang) => {
    setOpen(false);
    if (target === lang) {
      return;
    }
    // Read at the click, not with `usePathname`: that hook would make every page
    // with an unknown param (e.g. a reservation id) fail to prerender.
    const href = switchLangHref(window.location.pathname, window.location.search, target);
    // After the closing animation: Next keeps the left page hidden for the back
    // button, and a dialog hidden mid-exit came back as an invisible overlay.
    window.setTimeout(() => router.push(href), EXIT_MS);
  };

  return (
    <>
      <Button
        aria-label={fill(t.languageCurrent, { label: current.label })}
        onPress={() => setOpen(true)}
        className={triggerClass[variant]}
      >
        {variant === "header" ? <Globe className="size-4" aria-hidden /> : null}
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVG flag */}
        <img src={`/assets/flags/${current.lang}.svg`} alt="" width={20} height={14} className="h-3.5 w-5 rounded-[2px] object-cover" />
        {variant === "header" ? current.lang : current.label}
      </Button>
      <WidgetModal open={open} onOpenChange={setOpen} className="w-[min(26rem,calc(100%-1.5rem))] rounded-2xl shadow-2xl">
        <Dialog aria-labelledby={titleId} className="flex flex-col outline-none">
          <DialogHeader titleId={titleId} title={t.languageChoose} className="pt-4 pb-3" />
          <ul className="flex flex-col gap-2 px-5 pb-5">
            {languages.map((item) => {
              const selected = item.lang === lang;
              return (
                <li key={item.lang}>
                  <Button
                    onPress={() => choose(item.lang)}
                    aria-current={selected ? "true" : undefined}
                    lang={item.lang}
                    className={`relative flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left outline-none transition-colors duration-200 ease-out data-focus-visible:ring-2 data-focus-visible:ring-blue-medium data-focus-visible:ring-offset-2 motion-reduce:transition-none ${
                      selected ? "border-green-medium bg-green-medium text-white" : "border-muted hover:border-blue-dark/30 hover:bg-blue-light/60"
                    }`}
                  >
                    {/* The booking steps' "Wybrany" state: green, a check before the rest. */}
                    {selected ? (
                      <SquareCheck className="size-5 shrink-0" aria-hidden />
                    ) : (
                      <Square className="size-5 shrink-0 text-blue-dark/30" aria-hidden />
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVG flag */}
                    <img src={`/assets/flags/${item.lang}.svg`} alt="" width={28} height={20} className="h-5 w-7 shrink-0 rounded-[3px] object-cover shadow-sm" />
                    <span className="flex min-w-0 flex-col">
                      <span className="font-semibold">{item.label}</span>
                      <span className={`text-sm ${selected ? "text-white/85" : "text-muted-dark"}`} lang={lang}>
                        {t.languageNames[item.lang]}
                      </span>
                    </span>
                  </Button>
                </li>
              );
            })}
          </ul>
        </Dialog>
      </WidgetModal>
    </>
  );
}
