import type { Lang } from "@/i18n/config";
import type { Section } from "@/lib/strapi";

import { Blog } from "./blog";
import { Cards } from "./cards";
import { Cars } from "./cars";
import { Faq } from "./faq";
import { Features } from "./features";
import { Hero } from "./hero";
import { MapBlock } from "./map";
import { Social } from "./social";
import { FormBlock } from "./form";
import { Split } from "./split";
import { Text } from "./text";
import { VariantLabel } from "./variant-label";

/**
 * The page's `sections` (the new component set, `lib/strapi/internal/sections.ts`),
 * in CMS order. Each component is added here once it is described and accepted.
 *
 * The first hero is the page's `<h1>` and its photo the LCP; a page without a
 * hero gets its title as a hidden `<h1>`.
 */
export function Sections({ sections, lang, title, pickupId }: { sections: Section[]; lang: Lang; title: string; pickupId: number | null }) {
  const firstHero = sections.findIndex((section) => section.type === "hero");
  return (
    <>
      {firstHero === -1 ? <h1 className="sr-only">{title}</h1> : null}
      {sections.map((section, index) => {
        switch (section.type) {
          case "hero":
            return <Hero key={`hero-${section.id}`} section={section} lang={lang} priority={index === firstHero} pickupId={pickupId} />;
          case "features":
            return <Features key={`features-${section.id}`} section={section} />;
          case "text":
            return <Text key={`text-${section.id}`} section={section} lang={lang} />;
          case "faq":
            return <Faq key={`faq-${section.id}`} section={section} lang={lang} />;
          case "cards":
            return <Cards key={`cards-${section.id}`} section={section} />;
          case "blog":
            return <Blog key={`blog-${section.id}`} section={section} lang={lang} />;
          case "social":
            return <Social key={`social-${section.id}`} section={section} lang={lang} />;
          case "cars":
            return <Cars key={`cars-${section.id}`} section={section} lang={lang} pickupId={pickupId} />;
          case "map":
            return <MapBlock key={`map-${section.id}`} section={section} lang={lang} />;
          case "split":
            return <Split key={`split-${section.id}`} section={section} lang={lang} />;
          case "form":
            return <FormBlock key={`form-${section.id}`} section={section} lang={lang} />;
          case "variantLabel":
            return <VariantLabel key={`variant-${section.id}`} section={section} />;
        }
      })}
    </>
  );
}
