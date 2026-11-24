import { CalendarDays, Car, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { lang as rootLang } from "next/root-params";

import { buttonClass } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";
import { Sections } from "@/components/sections/sections";
import { defaultLang, isLang, type Lang } from "@/i18n/config";
import { fleetHref, reservationHref } from "@/i18n/routes";
import { HOTLINE, systemCopy } from "@/i18n/system-copy";
import { getNotFoundPage, type Page } from "@/lib/strapi";

/**
 * "Page not found" in the URL's language (`next/root-params`), inside the
 * header and footer, still answered with 404: the sections of the CMS page
 * with slug `404`, as on the old site. Without that page, with none of its
 * sections, or with the CMS down, the copy below stands in, so a 404 is never blank.
 */
export default async function NotFound() {
  const value = await rootLang();
  const lang: Lang = isLang(value) ? value : defaultLang;
  const page = await getNotFoundPage(lang).catch((error: unknown) => {
    console.error(`[strapi] not-found page (${lang}) unavailable, showing the built-in copy`, error);
    return null;
  });
  return page && page.sections.length > 0 ? <CmsNotFound page={page} lang={lang} /> : <BuiltInNotFound lang={lang} />;
}

function CmsNotFound({ page, lang }: { page: Page; lang: Lang }) {
  return (
    <main className="flex flex-1 flex-col">
      {/* React hoists it into <head>: a not-found page has no metadata of its own. */}
      <title>{page.seo.title ?? `${page.title} | MobiCars`}</title>
      <Sections sections={page.sections} lang={lang} title={page.title} pickupId={null} />
    </main>
  );
}

function BuiltInNotFound({ lang }: { lang: Lang }) {
  const t = systemCopy(lang).notFound;
  return (
    <main className="flex flex-1 flex-col">
      {/* React hoists it into <head>: a not-found page has no metadata of its own. */}
      <title>{t.metaTitle}</title>
      <Section tone="surface" className="flex-1">
        <Container narrow className="flex flex-col items-start gap-6">
          <p className="text-eyebrow text-green-dark uppercase">404</p>
          <h1 className="text-title text-balance text-blue-dark">{t.title}</h1>
          <p className="text-lead text-pretty text-blue-dark/75">{t.text}</p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href={`/${lang}`} className={buttonClass("primary", "lg", "w-full sm:w-auto")}>
              {t.home}
            </Link>
            <Link href={fleetHref(lang)} className={buttonClass("secondary", "lg", "w-full sm:w-auto")}>
              {t.fleet}
            </Link>
          </div>
          <nav aria-label={t.shortcuts} className="flex w-full flex-col gap-3 border-t border-line pt-6">
            <p className="text-sm font-semibold text-muted-dark">{t.shortcuts}</p>
            <ul className="flex flex-wrap gap-2">
              {[
                { href: fleetHref(lang), label: t.fleet, icon: Car },
                { href: reservationHref(lang, "short"), label: t.reservation, icon: CalendarDays },
                { href: `/${lang}/${t.contactPath}`, label: t.contact, icon: MessageCircle },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-blue-dark ring-1 ring-line transition-colors hover:bg-blue-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-medium motion-reduce:transition-none"
                  >
                    <link.icon className="size-4 text-blue-medium" aria-hidden />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* The hotline as in the CMS; this client page cannot read the site contact. */}
            <a href={HOTLINE.href} className="inline-flex items-center gap-2 font-bold text-blue-dark underline-offset-4 hover:underline">
              <Phone className="size-4 text-blue-medium" aria-hidden />
              {t.call}: {HOTLINE.label}
            </a>
          </nav>
        </Container>
      </Section>
    </main>
  );
}
