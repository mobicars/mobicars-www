"use client";

import { createContext, useContext, type ReactNode } from "react";
import { I18nProvider } from "react-aria-components";

import { defaultLang, intlLocales, type Lang } from "./config";

const LangContext = createContext<Lang>(defaultLang);

/**
 * Site language for client components, set once in the `[lang]` layout.
 * Also gives react-aria (calendars, number fields) the matching locale.
 */
export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <LangContext value={lang}>
      <I18nProvider locale={intlLocales[lang]}>{children}</I18nProvider>
    </LangContext>
  );
}

export function useLang(): Lang {
  return useContext(LangContext);
}
