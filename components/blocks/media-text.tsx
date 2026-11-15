import Image from "next/image";

import { SectionHeader } from "@/components/ui/section";
import type { MediaTextBlock } from "@/lib/strapi";

import { Ctas } from "./content";
import { RichBlocksView } from "./rich-blocks";
import { SectionFrame } from "./section-frame";

/**
 * The CMS image-and-text block: a photo beside a heading, rich text and
 * buttons. Side by side from `md`, the image on the chosen side; on phones the
 * image comes first when it is on the start side, else after the text.
 */
export function MediaText({ block, first }: { block: MediaTextBlock; first: boolean }) {
  const headingId = `media-text-${block.id}`;
  const dark = block.section.tone === "dark";
  const imageFirst = block.imagePosition === "start";
  // `cutout` (catalog C16): a car photo with a transparent background, no frame, on the band itself.
  const cutout = (block as MediaTextBlock & { imageStyle?: "rounded" | "cutout" | null }).imageStyle === "cutout";
  return (
    <SectionFrame style={block.section} labelledBy={block.title ? headingId : undefined}>
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
        <div
          className={`relative aspect-[4/3] ${cutout ? "" : "overflow-hidden rounded-card bg-surface"} ${imageFirst ? "" : "md:order-last"}`}
        >
          {/* Decorative next to its heading and text; Strapi keeps one alt per file, which would be Polish in every language. */}
          <Image
            src={block.image.url}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            // Below the first screen: 60 is indistinguishable here and ~25% lighter (PageSpeed on phones).
            quality={60}
            className={cutout ? "object-contain drop-shadow-2xl" : "object-cover"}
            {...(first ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
          />
        </div>
        <div className="flex flex-col gap-6">
          {block.title ? (
            <SectionHeader id={headingId} level={first ? 1 : 2} eyebrow={block.eyebrow} title={block.title} lead={block.lead} dark={dark} />
          ) : null}
          <div className={`-mt-4 text-base leading-relaxed sm:text-lg ${dark ? "text-white/85" : "text-blue-dark/85"}`}>
            <RichBlocksView blocks={block.body} baseLevel={block.title ? 3 : 2} />
          </div>
          <Ctas ctas={block.ctas} />
        </div>
      </div>
    </SectionFrame>
  );
}
