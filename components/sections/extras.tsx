import { CtaLink } from "@/components/blocks/cta-link";
import { EXTRAS_GRID, ExtraCard } from "@/components/extras/extra-card";
import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { EXTRA_GROUPS, listCatalogExtras, type CatalogExtra } from "@/lib/extras/catalog";
import { isDarkBackground, type ExtrasSection } from "@/lib/strapi";

import { SECTION_CTA_SIZE, SectionHeading, SectionShell } from "./section-shell";

/**
 * Extras (`sections.extras`): RentCarSoft's add-ons and accessories from the
 * cached catalog (`lib/extras/catalog.ts`), each a card linking to its page.
 * `all`: every group under its own heading, in the booking's order; one group:
 * its cards only. When RentCarSoft is down, or the group is empty, the section
 * is left out and the page stays up.
 */
export async function Extras({ section, lang }: { section: ExtrasSection; lang: Lang }) {
  const catalog = await listCatalogExtras(lang).catch((error: unknown) => {
    console.error(`[sections.extras ${section.id}] RentCarSoft unavailable, the section is left out`, error);
    return [] as CatalogExtra[];
  });
  const groups = EXTRA_GROUPS.filter((group) => section.group === "all" || group === section.group)
    .map((group) => ({ group, extras: catalog.filter((extra) => extra.group === group) }))
    .filter(({ extras }) => extras.length > 0);
  if (groups.length === 0) {
    return null;
  }
  const t = getMessages(lang).extrasPage;
  const headingId = `extras-${section.id}`;
  const subheadings = section.group === "all";
  // Card names sit under the section title, and under the group headings when there are some.
  const cardHeading = subheadings ? (section.title ? "h4" : "h3") : section.title ? "h3" : "h2";
  const dark = isDarkBackground(section.background);

  return (
    <SectionShell background={section.background} spacing={section.spacing} width={section.width} labelledBy={section.title ? headingId : undefined}>
      <SectionHeading id={headingId} badge={section.badge} title={section.title} text={section.text} align={section.headerAlign} background={section.background} />
      <div className="flex flex-col gap-10 sm:gap-14">
        {groups.map(({ group, extras }) => {
          const GroupHeading = section.title ? "h3" : "h2";
          return (
            <section key={group} aria-labelledby={subheadings ? `${headingId}-${group}` : undefined} className="flex flex-col gap-5">
              {subheadings ? (
                <GroupHeading
                  id={`${headingId}-${group}`}
                  className={`text-subtitle ${dark ? "text-white" : "text-blue-dark"} ${section.headerAlign === "center" ? "text-center" : ""}`}
                >
                  {t.groups[group]}
                </GroupHeading>
              ) : null}
              <ul className={EXTRAS_GRID}>
                {extras.map((extra) => (
                  <li key={extra.id} className="flex">
                    <ExtraCard extra={extra} lang={lang} heading={cardHeading} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
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
