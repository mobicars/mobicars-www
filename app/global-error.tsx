"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { HOTLINE, langOfPath, systemCopy } from "@/i18n/system-copy";

import "./globals.css";

/**
 * The last resort: the layout itself failed (header or footer data could not
 * be read). It renders its own document without the layout's providers, so it
 * takes the language from the path and the hotline from a constant.
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const lang = langOfPath(usePathname());
  const t = systemCopy(lang).error;
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <html lang={lang}>
      <body className="flex min-h-svh flex-col bg-surface font-sans text-blue-dark">
        <title>{`${t.title} | MobiCars`}</title>
        <main className="mx-auto flex w-full max-w-reading flex-1 flex-col justify-center gap-6 px-gutter py-section">
          <p className="text-eyebrow text-green-dark uppercase">MobiCars</p>
          <h1 className="text-title text-balance">{t.title}</h1>
          <p className="text-lead text-pretty text-blue-dark/75">{t.text}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => retry()}
              className="h-14 cursor-pointer rounded-control bg-blue-medium px-7 font-bold text-white hover:bg-blue-dark"
            >
              {t.retry}
            </button>
            <a
              href={HOTLINE.href}
              className="flex h-14 items-center justify-center rounded-control border border-line-strong bg-white px-7 font-bold"
            >
              {t.call} {HOTLINE.label}
            </a>
            <a href={`/${lang}`} className="flex h-14 items-center justify-center rounded-control border border-line-strong bg-white px-7 font-bold">
              {t.home}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
