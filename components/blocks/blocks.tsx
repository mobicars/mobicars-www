import type { Lang } from "@/i18n/config";
import type { Block } from "@/lib/strapi";

import { BlogPosts } from "./blog-posts";
import { Cars } from "./cars";
import { Comparison } from "./comparison";
import { Contact } from "./contact";
import { Content } from "./content";
import { CtaBand } from "./cta-band";
import { PromoCards } from "./promo-cards";
import { Faq } from "./faq";
import { Features } from "./features";
import { Hero } from "./hero";
import { LeadForm } from "./lead-form";
import { Locations } from "./locations";
import { Logos } from "./logos";
import { MediaText } from "./media-text";
import type { Crumb } from "./page-hero";
import { Reviews } from "./reviews";
import { Scenarios } from "./scenarios";
import { TrustBar } from "./trust-bar";

/**
 * Renders a page's CMS `blocks` in order. The first block is above the fold:
 * a hero there carries the page's `<h1>` and the LCP image. `pickupId` is the
 * page's RentCarSoft pickup point (city and local pages): the hero's search
 * starts there, the locations show its town and the cars those offered there.
 */
export function Blocks({
  blocks,
  lang,
  pickupId = null,
  breadcrumbs = [],
}: {
  blocks: Block[];
  lang: Lang;
  pickupId?: number | null;
  /** The page's breadcrumbs (`pageBreadcrumbs`), for a hero with the `page` layout. */
  breadcrumbs?: Crumb[];
}) {
  return blocks.map((block, index) => {
    switch (block.type) {
      case "hero":
        return <Hero key={`hero-${block.id}`} block={block} lang={lang} first={index === 0} pickupId={pickupId} breadcrumbs={breadcrumbs} />;
      case "content":
        return <Content key={`content-${block.id}`} block={block} lang={lang} first={index === 0} />;
      case "mediaText":
        return <MediaText key={`media-text-${block.id}`} block={block} first={index === 0} />;
      case "reviews":
        return <Reviews key={`reviews-${block.id}`} block={block} lang={lang} first={index === 0} />;
      case "locations":
        return <Locations key={`locations-${block.id}`} block={block} lang={lang} first={index === 0} pickupId={pickupId} />;
      case "faq":
        return <Faq key={`faq-${block.id}`} block={block} lang={lang} first={index === 0} />;
      case "features":
        return <Features key={`features-${block.id}`} block={block} first={index === 0} />;
      case "scenarios":
        return <Scenarios key={`scenarios-${block.id}`} block={block} first={index === 0} />;
      case "comparison":
        return <Comparison key={`comparison-${block.id}`} block={block} lang={lang} first={index === 0} />;
      case "logos":
        return <Logos key={`logos-${block.id}`} block={block} />;
      case "leadForm":
        return <LeadForm key={`lead-form-${block.id}`} block={block} lang={lang} first={index === 0} />;
      case "ctaBand":
        return <CtaBand key={`cta-band-${block.id}`} block={block} first={index === 0} lang={lang} />;
      case "cars":
        return <Cars key={`cars-${block.id}`} block={block} lang={lang} first={index === 0} pickupId={pickupId} />;
      case "trustBar":
        return <TrustBar key={`trust-bar-${block.id}`} block={block} lang={lang} />;
      case "contact":
        return <Contact key={`contact-${block.id}`} block={block} lang={lang} first={index === 0} />;
      case "promoCards":
        return <PromoCards key={`promo-cards-${block.id}`} block={block} lang={lang} first={index === 0} />;
      case "blogPosts":
        return <BlogPosts key={`blog-posts-${block.id}`} block={block} lang={lang} first={index === 0} />;
    }
  });
}
