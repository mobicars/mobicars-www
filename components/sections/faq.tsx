import { ArrowRight } from "lucide-react";

import { CtaIcon, CtaLink } from "@/components/blocks/cta-link";
import { RichBlocksView } from "@/components/blocks/rich-blocks";
import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { isDarkBackground, type FaqSection } from "@/lib/strapi";

import { FaqGroups } from "./faq-groups";
import { SECTION_CTA_SIZE, SectionHeading, SectionShell } from "./section-shell";

/**
 * FAQ (`sections.faq`): questions in one or more groups as an accordion
 * (`FaqList`, React Aria), under the shared heading and over up to two buttons.
 *
 * The layout follows the content, not a setting: one group is a plain list
 * (its title, when set, a heading over it); two or more titled groups get a
 * heading each and a menu of anchors to them, pills over the list or, in a
 * wide column on desktops, a side panel that stays in view. Every answer is in
 * the HTML (closed ones `hidden="until-found"`), so search engines read them
 * and find-in-page opens them; the optional search only hides what does not
 * match. With `structuredData` the questions are printed as schema.org FAQPage.
 */
export function Faq({ section, lang }: { section: FaqSection; lang: Lang }) {
  const t = getMessages(lang).blocks;
  const headingId = `faq-${section.id}`;
  const dark = isDarkBackground(section.background);
  // Flat, like the Features cards: grey on a white background, white on any other.
  const surface = section.background.tone === "white" ? "bg-surface" : "bg-white";
  const titled = section.groups.filter((group) => group.title);
  const menu = titled.length >= 2;
  const side = menu && section.textWidth === "wide";
  // No skipped levels: group titles sit under the section title, a group's questions under its title (or in its place).
  const groupLevel = section.title ? 3 : 2;

  const groups = section.groups.map((group) => {
    const level = (group.title ? groupLevel + 1 : groupLevel) as 2 | 3 | 4;
    return {
      anchor: group.anchor,
      title: group.title,
      level,
      items: group.items.map((item, index) => ({
        id: `${group.anchor}-${index + 1}`,
        question: item.question,
        text: `${item.question} ${item.answerText}`,
        // The editor's Heading 2 lands one level under the question.
        answer: <RichBlocksView blocks={item.answer} baseLevel={level} />,
      })),
    };
  });

  return (
    <SectionShell background={section.background} spacing={section.spacing} width={section.width} labelledBy={section.title ? headingId : undefined}>
      <div className={`mx-auto w-full ${section.textWidth === "narrow" ? "max-w-3xl" : ""}`}>
        <SectionHeading id={headingId} badge={section.badge} title={section.title} text={section.text} align={section.headerAlign} background={section.background} />
        <div className={side ? "lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-10" : undefined}>
          {menu ? <FaqMenu groups={titled} label={t.faqCategories} side={side} surface={surface} /> : null}
          <FaqGroups
            groups={groups}
            groupLevel={groupLevel}
            dark={dark}
            surface={surface}
            search={section.search ? { label: t.faqSearch, placeholder: t.faqSearchPlaceholder, empty: t.faqNoResults } : null}
          />
        </div>
        {section.ctas.length > 0 ? (
          <div className={`mt-10 flex flex-col gap-3 sm:flex-row ${section.headerAlign === "center" ? "sm:justify-center" : ""}`}>
            {section.ctas.map((cta) => (
              <CtaLink key={`${cta.href}-${cta.label}`} cta={cta} size={SECTION_CTA_SIZE} />
            ))}
          </div>
        ) : null}
      </div>
      {section.structuredData ? <FaqStructuredData section={section} /> : null}
    </SectionShell>
  );
}

/**
 * Anchors to the titled groups: pills in one row that scrolls sideways on
 * phones (wrapped from `sm`); with `side`, from `lg` a white panel beside the
 * questions that stays under the site header. Plain links, no JavaScript.
 */
function FaqMenu({ groups, label, side, surface }: { groups: FaqSection["groups"]; label: string; side: boolean; surface: string }) {
  return (
    <nav aria-label={label} className={`mb-8 ${side ? "lg:sticky lg:top-28 lg:mb-0" : ""}`}>
      <ul
        className={`-mx-gutter flex gap-2 overflow-x-auto px-gutter pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 ${
          side ? `lg:flex-col lg:gap-0 lg:rounded-card lg:p-2 ${surface === "bg-surface" ? "lg:bg-surface" : "lg:bg-white"}` : ""
        }`}
      >
        {groups.map((group) => (
          <li key={group.anchor} className="shrink-0">
            <a
              href={`#${group.anchor}`}
              className={`group inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-blue-dark ring-1 ring-line transition-colors hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-medium motion-reduce:transition-none ${
                side ? "lg:flex lg:min-h-12 lg:w-full lg:rounded-xl lg:bg-transparent lg:px-3 lg:text-base lg:ring-0 lg:hover:bg-tint" : ""
              }`}
            >
              {group.icon ? <CtaIcon name={group.icon} className="size-4 shrink-0 text-blue-medium" /> : null}
              <span className={side ? "lg:flex-1" : undefined}>{group.title}</span>
              {side ? <ArrowRight aria-hidden className="hidden size-4 shrink-0 text-blue-medium transition-transform group-hover:translate-x-0.5 lg:block" /> : null}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FaqStructuredData({ section }: { section: FaqSection }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: section.groups.flatMap((group) =>
      group.items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answerText } })),
    ),
  };
  return (
    <script
      type="application/ld+json"
      // JSON in a script tag: `<` is escaped so a "</script>" in an answer cannot close it.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
