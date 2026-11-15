import { getImageProps } from "next/image";

import { CtaLink } from "@/components/blocks/cta-link";
import { FaqList } from "@/components/blocks/faq-list";
import { RichBlocksView } from "@/components/blocks/rich-blocks";
import type { Lang } from "@/i18n/config";
import { isDarkBackground, type Media, type SplitSection } from "@/lib/strapi";

import { InlineItem, palette } from "./features";
import { halfSizes } from "./image-sizes";
import { ContactFormView } from "./form";
import { loadMapPoints, PointsMapView } from "./map";
import { SECTION_CTA_SIZE, SectionHeading, SectionShell } from "./section-shell";

/**
 * Two columns (`sections.split`): a photo, or the pickup points map (the Map
 * section's, with its legend), beside the heading and one kind of content, built from the other sections' parts: the editor's rich text (as
 * in Text), features in a column (Features' inline items), questions (the
 * FAQ accordion, optionally with FAQPage data) or the contact form (the Form
 * section's, in one column). The photo can be a collage of
 * two and carry a stat badge ("1000+ rentals a month").
 *
 * Desktops: two halves, the photo on the side the CMS says. Phones: the photo
 * above the text (the text stays first in the HTML). Photos are cropped to
 * fixed frames and load lazily, so nothing shifts; so does the map. Without
 * the map (no Maps key, RentCarSoft down) the content takes the whole width.
 * Server markup only, apart from the accordion and the map.
 */
export async function Split({ section, lang }: { section: SplitSection; lang: Lang }) {
  const headingId = `split-${section.id}`;
  const dark = isDarkBackground(section.background);
  const heading = section.title ? "h3" : "h2";
  const content = section.content;
  const media = section.media;
  const points = media.kind === "map" ? await loadMapPoints(lang, `sections.split ${section.id}`) : [];
  const aside =
    media.kind === "image" ? (
      <Photos media={media} width={section.width} />
    ) : points.length > 0 ? (
      <PointsMapView points={points} lang={lang} dark={dark} legend={media.legend} />
    ) : null;
  return (
    <SectionShell background={section.background} spacing={section.spacing} width={section.width} labelledBy={section.title ? headingId : undefined}>
      {/* Desktops: the row is as tall as the content or the photo's 4:5 frame, whichever is taller; the photo fills it, a shorter content sits in the middle. */}
      <div className={`grid gap-10 lg:gap-16 ${aside ? "lg:grid-cols-2" : ""}`}>
        <div className={`flex min-w-0 flex-col lg:self-center ${aside ? "" : "max-w-3xl"}`}>
          <SectionHeading id={headingId} badge={section.badge} title={section.title} text={section.text} align="start" background={section.background} />
          {content?.kind === "text" ? (
            <div className={`text-base leading-relaxed ${dark ? "rich-text-dark text-white" : "text-blue-dark/85"}`}>
              <RichBlocksView blocks={content.body} baseLevel={bodyLevel(content.body, Boolean(section.title))} />
            </div>
          ) : null}
          {content?.kind === "features" ? (
            <ul className="flex flex-col gap-6">
              {content.items.map((item, index) => (
                <li key={`${item.title}-${index}`} className="flex">
                  <InlineItem item={item} heading={heading} colours={palette(section.background)} />
                </li>
              ))}
            </ul>
          ) : null}
          {content?.kind === "faq" ? (
            <>
              <FaqList
                level={section.title ? 3 : 2}
                flat={{ surface: section.background.tone === "white" ? "bg-surface" : "bg-white" }}
                items={content.items.map((item, index) => ({
                  id: `${headingId}-q${index + 1}`,
                  question: item.question,
                  answer: <RichBlocksView blocks={item.answer} baseLevel={section.title ? 3 : 2} />,
                }))}
              />
              {content.structuredData ? <FaqData items={content.items} /> : null}
            </>
          ) : null}
          {content?.kind === "form" ? <ContactFormView lang={lang} wide={false} framed={section.background.tone === "white"} /> : null}
          {section.ctas.length > 0 ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {section.ctas.map((cta) => (
                <CtaLink key={`${cta.href}-${cta.label}`} cta={cta} size={SECTION_CTA_SIZE} />
              ))}
            </div>
          ) : null}
        </div>
        {/* First on phones (the photo or map above the text), then on the CMS's side. */}
        {aside ? (
          <div className={`order-first min-w-0 ${section.mediaSide === "end" ? "lg:order-last" : ""} ${media.kind === "image" && media.fit === "contain" ? "lg:self-center" : ""}`}>
            {aside}
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}

/** The editor's top heading level right under the section title (`<h3>`), or `<h2>` without one, as in Text. */
function bodyLevel(body: Extract<SplitSection["content"], { kind: "text" }>["body"], titled: boolean): number {
  const top = Math.min(...body.flatMap((block) => (block.type === "heading" ? [block.level] : [])));
  return (titled ? 3 : 2) - (Number.isFinite(top) ? top - 1 : 0);
}

/**
 * The photo (4:3 on phones; on desktops at least 4:5, taller with a taller
 * content beside it, cropped), or the collage: the second, smaller photo over
 * its lower corner; the stat badge on top.
 */
function Photos({ media, width }: { media: Extract<SplitSection["media"], { kind: "image" }>; width: SplitSection["width"] }) {
  if (media.fit === "contain") {
    return <WholePhoto image={media.image} width={width} />;
  }
  const collage = media.imageSecond !== null;
  return (
    <div className={`relative h-full ${collage ? "pr-[14%] pb-[14%]" : ""}`}>
      <Photo image={media.image} sizes={halfSizes(width, collage ? 0.86 : 1)} className="relative h-full" frame="aspect-[4/3] lg:aspect-[4/5]" />
      {media.imageSecond ? (
        <Photo
          image={media.imageSecond}
          sizes={halfSizes(width, 0.48)}
          className="absolute right-0 bottom-0 aspect-square w-[48%] ring-8 ring-white"
        />
      ) : null}
      {media.stat ? (
        <p className="absolute top-3 left-3 flex flex-col rounded-xl bg-blue-medium px-3.5 py-2.5 text-white sm:top-6 sm:left-6 sm:rounded-2xl sm:px-5 sm:py-4">
          <span className="text-2xl leading-none font-bold sm:text-4xl">{media.stat.value}</span>
          {media.stat.label ? <span className="mt-1 text-xs font-semibold sm:text-sm">{media.stat.label}</span> : null}
        </p>
      ) : null}
    </div>
  );
}

/** `frame`: the smallest proportions (an empty box sets them, the photo fills whatever height the box ends up with); without it the box's own size. */
function Photo({ image, sizes, className, frame }: { image: Media; sizes: string; className: string; frame?: string }) {
  const { props } = getImageProps({ src: image.url, alt: image.alt, width: image.width ?? 1200, height: image.height ?? 900, sizes, quality: 70 });
  return (
    <div className={`overflow-clip rounded-card bg-tint ${className}`}>
      {frame ? <div aria-hidden className={frame} /> : null}
      <img {...props} alt={image.alt} className={`size-full object-cover ${frame ? "absolute inset-0" : ""}`} />
    </div>
  );
}

/**
 * The whole image in its own proportions (a screenshot, a graphic picked to
 * fit): the column's full width, its own height, nothing cropped and no
 * background under it (a transparent PNG stays clean). Its width and height
 * reserve the space, so nothing shifts. The site's top quality (75), so small
 * text in a screenshot stays sharp.
 */
function WholePhoto({ image, width }: { image: Media; width: SplitSection["width"] }) {
  const { props } = getImageProps({ src: image.url, alt: image.alt, width: image.width ?? 1200, height: image.height ?? 900, sizes: halfSizes(width), quality: 75 });
  return <img {...props} alt={image.alt} className="block h-auto w-full rounded-card" />;
}

function FaqData({ items }: { items: Extract<SplitSection["content"], { kind: "faq" }>["items"] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answerText } })),
  };
  // JSON in a script tag: `<` is escaped so a "</script>" in an answer cannot close it.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
