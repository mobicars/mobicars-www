import type { Lang } from "@/i18n/config";
import { sectionEdgeTone, type Section } from "@/lib/strapi";

import { Blog } from "./blog";
import { Cards } from "./cards";
import { CarClasses } from "./car-classes";
import { Cars } from "./cars";
import { Extras } from "./extras";
import { Promotions } from "./promotions";
import { Divider } from "./divider";
import { Faq } from "./faq";
import { Features } from "./features";
import { Hero } from "./hero";
import { ImageBlock } from "./image";
import { MapBlock } from "./map";
import { Reviews } from "./reviews";
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
 *
 * A divider is told the colours at its neighbours' edges, for a slant: the
 * white header above the first section, the navy footer below the last.
 */
export function Sections({
  sections,
  lang,
  title,
  pickupId,
  titled = false,
}: {
  sections: Section[];
  lang: Lang;
  title: string;
  pickupId: number | null;
  /** The page shows its own `<h1>` (a blog post's header): no hidden one here. */
  titled?: boolean;
}) {
  const firstHero = sections.findIndex((section) => section.type === "hero");
  return (
    <>
      {firstHero === -1 && !titled ? <h1 className="sr-only">{title}</h1> : null}
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
          case "extras":
            return <Extras key={`extras-${section.id}`} section={section} lang={lang} />;
          case "promotions":
            return <Promotions key={`promotions-${section.id}`} section={section} lang={lang} />;
          case "car-classes":
            return <CarClasses key={`car-classes-${section.id}`} section={section} lang={lang} pickupId={pickupId} />;
          case "map":
            return <MapBlock key={`map-${section.id}`} section={section} lang={lang} />;
          case "split":
            return <Split key={`split-${section.id}`} section={section} lang={lang} />;
          case "form":
            return <FormBlock key={`form-${section.id}`} section={section} lang={lang} />;
          case "reviews":
            return <Reviews key={`reviews-${section.id}`} section={section} lang={lang} />;
          case "image":
            return <ImageBlock key={`image-${section.id}`} section={section} />;
          case "divider": {
            const previous = sections[index - 1];
            const next = sections[index + 1];
            return (
              <Divider
                key={`divider-${section.id}`}
                section={section}
                above={previous ? sectionEdgeTone(previous, "bottom") : "white"}
                below={next ? sectionEdgeTone(next, "top") : "navy"}
              />
            );
          }
          case "variantLabel":
            return <VariantLabel key={`variant-${section.id}`} section={section} />;
        }
      })}
    </>
  );
}
