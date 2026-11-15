"use client";

import { Phone, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { buttonClass } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";
import { useLang } from "@/i18n/lang-context";
import { HOTLINE, systemCopy } from "@/i18n/system-copy";

/**
 * A page that failed to render (the CMS or RentCarSoft did not answer). The
 * header and footer of the layout stay; the visitor gets a retry, the home
 * page and the hotline instead of the framework's English error screen.
 */
export default function PageError({ error, retry }: { error: unknown; retry: () => void }) {
  const lang = useLang();
  const t = systemCopy(lang).error;
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="flex flex-1 flex-col">
      <Section tone="surface" className="flex-1">
        <Container narrow className="flex flex-col items-start gap-6">
          <h1 className="text-title text-balance text-blue-dark">{t.title}</h1>
          <p className="text-lead text-pretty text-blue-dark/75">{t.text}</p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button type="button" onClick={() => retry()} className={buttonClass("primary", "lg", "w-full sm:w-auto")}>
              <RotateCcw className="size-5" aria-hidden />
              {t.retry}
            </button>
            <a href={HOTLINE.href} className={buttonClass("secondary", "lg", "w-full sm:w-auto")}>
              <Phone className="size-5" aria-hidden />
              {t.call} {HOTLINE.label}
            </a>
            <Link href={`/${lang}`} className={buttonClass("secondary", "lg", "w-full sm:w-auto")}>
              {t.home}
            </Link>
          </div>
        </Container>
      </Section>
    </main>
  );
}
