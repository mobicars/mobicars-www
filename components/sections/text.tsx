import { ChevronDown } from "lucide-react";

import { CtaLink } from "@/components/sections/cta-link";
import { RichBlocksView } from "@/components/sections/rich-blocks";
import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { isDarkBackground, type TextSection } from "@/lib/strapi";

import { SECTION_CTA_SIZE, SectionHeading, SectionShell } from "./section-shell";

type Blocks = TextSection["body"];

/**
 * Text (`sections.text`): rich text from CKEditor under an optional badge,
 * title and buttons, in one centred column, narrow (about 720 px, for
 * reading) or wide (the content width, for tables). The heading and buttons
 * follow `align`; each paragraph keeps the alignment set in the editor.
 *
 * A long text can fold after a few paragraphs: the rest sits in a native
 * `<details>`, all of it in the HTML (indexed, and find-in-page opens it),
 * with the last visible lines fading out and a "Read more" button; once
 * opened it stays open. On a dark background the whole text is white.
 * Server markup only.
 */
export function Text({ section, lang }: { section: TextSection; lang: Lang }) {
  const headingId = `text-${section.id}`;
  const dark = isDarkBackground(section.background);
  const centred = section.align === "center";
  // The body's top heading level sits right under the section title (`<h3>`), or is the `<h2>` without one, whichever
  // heading the editor picked; the rest keep their steps below it. `RichBlocksView` renders level n as `baseLevel + n - 1`.
  const top = Math.min(...section.body.flatMap((block) => (block.type === "heading" ? [block.level] : [])));
  const baseLevel = (section.title ? 3 : 2) - (Number.isFinite(top) ? top - 1 : 0);
  return (
    <SectionShell background={section.background} spacing={section.spacing} width={section.width} labelledBy={section.title ? headingId : undefined}>
      <div className={`mx-auto w-full ${section.textWidth === "narrow" ? "max-w-3xl" : ""}`}>
        <SectionHeading
          id={headingId}
          badge={section.badge}
          title={section.title}
          text={null}
          align={section.align}
          background={section.background}
        />
        {section.body.length > 0 ? (
          <div className={`text-base leading-relaxed ${dark ? "rich-text-dark text-white" : "text-blue-dark/85"}`}>
            <Body blocks={section.body} baseLevel={baseLevel} collapseAfter={section.collapseAfter} label={getMessages(lang).blocks.readMore} dark={dark} />
          </div>
        ) : null}
        {section.ctas.length > 0 ? (
          <div className={`mt-8 flex flex-col gap-3 sm:flex-row ${centred ? "sm:justify-center" : ""}`}>
            {section.ctas.map((cta) => (
              <CtaLink key={`${cta.href}-${cta.label}`} cta={cta} size={SECTION_CTA_SIZE} />
            ))}
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}

/**
 * Where the fold goes: after `after` paragraphs, but never right after a
 * heading (the heading moves down with its text); lists and tables stay
 * whole. -1: nothing to fold (the text is short enough).
 */
export function foldAt(blocks: Blocks, after: number): number {
  let paragraphs = 0;
  let cut = blocks.findIndex((block) => block.type === "paragraph" && ++paragraphs > after);
  while (cut > 0 && blocks[cut - 1]?.type === "heading") {
    cut -= 1;
  }
  return cut > 0 && cut < blocks.length ? cut : -1;
}

function Body({ blocks, baseLevel, collapseAfter, label, dark }: { blocks: Blocks; baseLevel: number; collapseAfter: number | null; label: string; dark: boolean }) {
  const cut = collapseAfter === null ? -1 : foldAt(blocks, collapseAfter);
  if (cut < 0) {
    return <RichBlocksView blocks={blocks} baseLevel={baseLevel} />;
  }
  return (
    <div className="group/fold">
      {/* The last visible lines fade out while the rest is folded (pure CSS: `:has` on the closed details). */}
      <div className="group-has-[details:not([open])]/fold:[mask-image:linear-gradient(to_bottom,#000_calc(100%-4.5rem),transparent)]">
        <RichBlocksView blocks={blocks.slice(0, cut)} baseLevel={baseLevel} />
      </div>
      {/* Once opened it stays open: the button goes. */}
      <details className="[&[open]>summary]:hidden">
        <summary
          className={`mt-2 inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full font-semibold outline-none hover:underline focus-visible:ring-2 [&::-webkit-details-marker]:hidden ${
            dark ? "text-white focus-visible:ring-white" : "text-blue-medium focus-visible:ring-blue-medium"
          }`}
        >
          {label}
          <ChevronDown aria-hidden className="size-4" />
        </summary>
        <div className="mt-3">
          <RichBlocksView blocks={blocks.slice(cut)} baseLevel={baseLevel} />
        </div>
      </details>
    </div>
  );
}
