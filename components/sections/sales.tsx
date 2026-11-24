import { SalesBrowser } from "@/components/sales/sales-browser";
import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { listSales, type SalesSection } from "@/lib/strapi";

import { CtaLink } from "./cta-link";
import { SECTION_CTA_SIZE, SectionHeading, SectionShell } from "./section-shell";

/**
 * Car sales (`sections.sales`): every published ad of the `sale` collection,
 * newest first, with the count, sorting and filters (`SalesBrowser`); each card
 * leads to the ad's page (`app/[lang]/sales/[slug]`). When the CMS cannot give
 * the ads the section is left out and the page stays up.
 */
export async function Sales({ section, lang }: { section: SalesSection; lang: Lang }) {
  const sales = await listSales(lang).catch((error: unknown) => {
    console.error(`[strapi] car-sale ads (${lang}) unavailable, the Car sales section is left out`, error);
    return null;
  });
  if (!sales) {
    return null;
  }
  const headingId = `sales-${section.id}`;
  return (
    <SectionShell background={section.background} spacing={section.spacing} width={section.width} labelledBy={section.title ? headingId : undefined}>
      <SectionHeading id={headingId} badge={section.badge} title={section.title} text={section.text} align={section.headerAlign} background={section.background} />
      <SalesBrowser sales={sales} lang={lang} t={getMessages(lang).sales} />
      {section.ctas.length > 0 ? (
        <div className={`mt-10 flex flex-col gap-3 sm:flex-row ${section.headerAlign === "center" ? "sm:justify-center" : ""}`}>
          {section.ctas.map((cta) => (
            <CtaLink key={`${cta.href}-${cta.label}`} cta={cta} size={SECTION_CTA_SIZE} />
          ))}
        </div>
      ) : null}
    </SectionShell>
  );
}
