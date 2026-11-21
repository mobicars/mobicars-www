import { MessageCircleQuestion, MessagesSquare } from "lucide-react";

import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { faqGroups, type FaqBlock, type FaqItem } from "@/lib/strapi";

import { buttonClass } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section";
import { SmartLink } from "@/components/ui/smart-link";
import { cardClass, IconBadge } from "@/components/ui/surface";

import { CtaIcon } from "./cta-link";
import { FaqList } from "./faq-list";
import { SectionFrame } from "./section-frame";
import { RichBlocksView } from "./rich-blocks";

/**
 * The CMS FAQ block: a heading, an optional intro and the questions as an
 * accordion (`FaqList`, the only client part). Answers are rendered here on
 * the server. With `structuredData` (one FAQ per page) it also prints
 * schema.org FAQPage data, so the questions can show in search results.
 */
export function Faq({ block, lang, first }: { block: FaqBlock; lang: Lang; first: boolean }) {
  const headingId = `faq-${block.id}`;
  const structured = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: block.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answerText },
    })),
  };
  return (
    <SectionFrame style={block.section} labelledBy={headingId} defaultTone="glow">
        <SectionHeader
          id={headingId}
          level={first ? 1 : 2}
          eyebrow={block.eyebrow ?? "FAQ"}
          eyebrowVariant="pill"
          eyebrowIcon={<MessageCircleQuestion />}
          title={block.title ?? getMessages(lang).blocks.faqTitle}
          lead={block.lead}
          align="center"
          dark={block.section.tone === "dark"}
        />
        <div className="mx-auto w-full max-w-4xl">
          {block.groupByCategory ? (
            <FaqCategories block={block} lang={lang} level={first ? 2 : 3} />
          ) : (
            <FaqList items={block.items.map(listItem)} />
          )}
          {block.cta ? <FaqMore cta={block.cta} lang={lang} /> : null}
        </div>
      {block.structuredData ? (
      <script
        type="application/ld+json"
        // JSON in a script tag: `<` is escaped so a "</script>" in an answer cannot close it.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }}
      />
      ) : null}
    </SectionFrame>
  );
}

/** Catalog C10: the way out when the list has no answer – to the contact page (the link comes from the CMS). */
function FaqMore({ cta, lang }: { cta: NonNullable<FaqBlock["cta"]>; lang: Lang }) {
  const t = getMessages(lang).blocks;
  return (
    <div className={cardClass("light", false, "mt-8 flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:p-6")}>
      <IconBadge tone="soft">
        <MessagesSquare />
      </IconBadge>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-lg font-bold text-blue-dark">{t.faqMoreTitle}</p>
        <p className="text-pretty text-blue-dark/75">{t.faqMoreText}</p>
      </div>
      <SmartLink link={cta} className={buttonClass("primary", "md", "w-full sm:w-auto")} />
    </div>
  );
}

function listItem(item: FaqItem) {
  return { question: item.question, answer: <RichBlocksView blocks={item.answer} baseLevel={4} /> };
}

/**
 * The FAQ page's categories (catalog C11): anchor pills that stay under the
 * site header, then a heading per category with its questions. Every question
 * stays in the HTML (all groups shown, no tabs), so the FAQPage data and
 * search engines see them all; the pills are plain links, no JavaScript.
 */
function FaqCategories({ block, lang, level }: { block: FaqBlock; lang: Lang; level: 2 | 3 }) {
  const t = getMessages(lang).blocks;
  const groups = faqGroups(block.items).map((group) => ({
    ...group,
    id: `faq-${block.id}-${group.category?.slug ?? "other"}`,
    name: group.category?.name ?? t.faqOther,
  }));
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <div className="flex flex-col gap-10">
      {groups.length > 1 ? (
        <nav aria-label={t.faqCategories} className="sticky top-[var(--site-header,4rem)] z-10 transition-[top] duration-300 ease-in-out -mx-gutter bg-white/90 px-gutter py-2 backdrop-blur-sm sm:mx-0 sm:rounded-full sm:px-2">
          <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none] sm:flex-wrap sm:overflow-visible">
            {groups.map((group) => (
              <li key={group.id} className="shrink-0">
                <a
                  href={`#${group.id}`}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-blue-dark ring-1 ring-line transition-colors hover:bg-blue-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-medium motion-reduce:transition-none"
                >
                  {group.category?.icon ? <CtaIcon name={group.category.icon} className="size-4 text-blue-medium" /> : null}
                  {group.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      {groups.map((group) => (
        <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`} className="flex scroll-mt-32 flex-col gap-4">
          <Heading id={`${group.id}-title`} className="text-subtitle text-blue-dark">
            {group.name}
          </Heading>
          <FaqList items={group.items.map(listItem)} level={level === 2 ? 3 : 4} />
        </section>
      ))}
    </div>
  );
}
