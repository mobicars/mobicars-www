import { ChevronDown } from "lucide-react";

import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { SectionHeader } from "@/components/ui/section";
import type { ContentBlock } from "@/lib/strapi";

import { CtaLink } from "./cta-link";
import { RichBlocksView } from "./rich-blocks";
import { SectionFrame } from "./section-frame";

/**
 * The CMS text block: an optional heading, rich text and up to a few
 * buttons, left or centred. Pure server markup. For a long SEO text the editor
 * picks `width: reading` in the section settings, so lines stay readable.
 */
export function Content({ block, lang, first }: { block: ContentBlock; lang: Lang; first: boolean }) {
  const headingId = `content-${block.id}`;
  const centered = block.align === "center";
  const dark = block.section.tone === "dark";
  return (
    <SectionFrame style={block.section} labelledBy={block.title ? headingId : undefined}>
      {block.title ? (
        <SectionHeader
          id={headingId}
          level={first ? 1 : 2}
          eyebrow={block.eyebrow}
          title={block.title}
          lead={block.lead}
          align={block.align}
          dark={dark}
        />
      ) : null}
      <div className={`flex flex-col gap-8 ${centered ? "items-center text-center" : ""}`}>
        <div className={`text-base leading-relaxed sm:text-lg ${dark ? "text-white/85" : "text-blue-dark/85"} ${centered ? "max-w-3xl" : ""}`}>
          <Body block={block} lang={lang} />
        </div>
        <Ctas ctas={block.ctas} />
      </div>
    </SectionFrame>
  );
}

/**
 * Catalog C36: a long SEO text shows its first paragraphs and keeps the rest
 * in a `<details>` – all of it in the HTML (indexed, found by find-in-page),
 * no JavaScript. Short texts, or `collapsible` off, render whole.
 */
function Body({ block, lang }: { block: ContentBlock; lang: Lang }) {
  const baseLevel = block.title ? 3 : 2;
  const collapse = block.collapsible;
  let paragraphs = 0;
  const cut = collapse ? block.body.findIndex((part) => part.type === "paragraph" && ++paragraphs > Math.max(1, collapse.previewParagraphs)) : -1;
  if (cut <= 0) {
    return <RichBlocksView blocks={block.body} baseLevel={baseLevel} />;
  }
  return (
    <>
      <RichBlocksView blocks={block.body.slice(0, cut)} baseLevel={baseLevel} />
      <details className="group mt-3 [&[open]>summary]:hidden">
        <summary className="inline-flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-control font-semibold text-blue-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-blue-medium [&::-webkit-details-marker]:hidden">
          {collapse?.label ?? getMessages(lang).blocks.readMore}
          <ChevronDown aria-hidden className="size-4" />
        </summary>
        <RichBlocksView blocks={block.body.slice(cut)} baseLevel={baseLevel} />
      </details>
    </>
  );
}

export function Ctas({ ctas }: { ctas: ContentBlock["ctas"] }) {
  return ctas.length > 0 ? (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {ctas.map((cta) => (
        <CtaLink key={`${cta.href}-${cta.label}`} cta={cta} />
      ))}
    </div>
  ) : null;
}
