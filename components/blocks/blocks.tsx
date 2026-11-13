import type { Lang } from "@/i18n/config";
import type { Block } from "@/lib/strapi";

import { Hero } from "./hero";

/**
 * Renders a page's CMS `blocks` in order. The first block is above the fold:
 * a hero there carries the page's `<h1>` and the LCP image.
 */
export function Blocks({ blocks, lang }: { blocks: Block[]; lang: Lang }) {
  return blocks.map((block, index) => {
    switch (block.type) {
      case "hero":
        return <Hero key={`hero-${block.id}`} block={block} lang={lang} first={index === 0} />;
    }
  });
}
