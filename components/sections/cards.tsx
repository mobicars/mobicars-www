import { ArrowRight } from "lucide-react";
import { getImageProps } from "next/image";

import { CtaIcon, CtaLink } from "@/components/blocks/cta-link";
import { buttonClass } from "@/components/ui/button";
import { Carousel } from "@/components/ui/carousel";
import { isDarkBackground, type Card, type CardsSection, type Media } from "@/lib/strapi";

import { Pattern } from "./pattern";
import { SECTION_CTA_SIZE, SectionHeading, SectionShell } from "./section-shell";

type Heading = "h2" | "h3";

/** Desktop widths in the grid: as many per row as cards up to four; five and six in rows of three, seven and eight in rows of four. */
const GRID_LG: Record<number, string> = {
  1: "lg:basis-full",
  2: "lg:basis-[calc((100%-1.5rem)/2)]",
  3: "lg:basis-[calc((100%-3rem)/3)]",
  4: "lg:basis-[calc((100%-4.5rem)/4)]",
};
const gridLg = (count: number) => GRID_LG[count <= 4 ? count : count <= 6 ? 3 : 4];

/** Desktop slide widths in the carousel: three or four in view. */
const SLIDE_LG = { 3: "lg:w-[calc((100%-3rem)/3)]", 4: "lg:w-[calc((100%-4.5rem)/4)]" };

const TONES = { navy: "bg-blue-dark", blue: "bg-blue-medium", green: "bg-green-medium", image: "bg-blue-dark" };
/** The icon's colour in its white circle: the card's own. */
const ICON = { navy: "text-blue-dark", blue: "text-blue-medium", green: "text-go-strong", image: "text-blue-medium" };

/**
 * Cards (`sections.cards`): 1–8 cards (icon, title, optional line) on a brand
 * colour with its pattern, or on a photo, under the shared heading and over
 * up to two buttons. A card with a link is clickable as a whole and shows an
 * arrow; on hover its photo slowly zooms in and the arrow fills like a button.
 *
 * `grid`: the width follows the number of cards, so a row is always full:
 * one card spans it, two halve it, three or four share it; on tablets two per
 * row, on phones one under another. Cards in a short last row grow to fill it.
 * `carousel`: our shared carousel, one card in view on phones (a peek of the
 * next), two on tablets, three or four on desktops. Server markup only, apart
 * from the carousel.
 */
export function Cards({ section }: { section: CardsSection }) {
  const headingId = `cards-${section.id}`;
  const dark = isDarkBackground(section.background);
  const carousel = section.display === "carousel";
  const count = section.cards.length;
  // Without a section title the cards' titles are the section's headings.
  const heading: Heading = section.title ? "h3" : "h2";
  const label = section.title ?? section.cards.map((card) => card.title).join(", ");
  const lgWidth = carousel ? SLIDE_LG[section.visibleCards] : gridLg(count);
  const sizes =
    count === 1 && !carousel
      ? "100vw"
      : `(min-width: 1024px) ${carousel ? Math.round(100 / section.visibleCards) : Math.round(100 / Math.min(4, count <= 4 ? count : count <= 6 ? 3 : 4))}vw, (min-width: 640px) 50vw, 90vw`;

  const items = section.cards.map((card, index) => (
    <li
      key={`${card.title}-${index}`}
      className={
        carousel
          ? `flex w-[85%] shrink-0 snap-center sm:w-[calc((100%-1.5rem)/2)] ${lgWidth}`
          : `flex grow basis-full sm:basis-[calc((100%-1.5rem)/2)] ${lgWidth}`
      }
    >
      <CardItem card={card} heading={heading} sizes={sizes} banner={count === 1 && !carousel} />
    </li>
  ));

  return (
    <SectionShell background={section.background} spacing={section.spacing} width={section.width} labelledBy={section.title ? headingId : undefined}>
      <SectionHeading id={headingId} badge={section.badge} title={section.title} text={section.text} align={section.headerAlign} background={section.background} />
      {carousel ? (
        <Carousel
          label={label}
          count={count}
          tone={dark ? "dark" : "light"}
          align="center"
          spotlight
          bleed
          className="snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex gap-6 pb-2">{items}</ul>
        </Carousel>
      ) : (
        <ul aria-label={section.title ? undefined : label} className="flex flex-wrap gap-6">
          {items}
        </ul>
      )}
      {section.ctas.length > 0 ? (
        <div className={`mt-10 flex flex-col gap-3 sm:flex-row ${section.headerAlign === "center" ? "sm:justify-center" : ""}`}>
          {section.ctas.map((cta) => (
            <CtaLink key={`${cta.href}-${cta.label}`} cta={cta} size={SECTION_CTA_SIZE} />
          ))}
        </div>
      ) : null}
    </SectionShell>
  );
}

/**
 * One card, tall (a portrait card, as a single banner wider and lower): the colour (with its pattern) or the photo
 * under a navy layer, darker at the top where the title sits; the title and
 * line at the top, the icon in a white circle and (with a link) the arrow at
 * the bottom. The link is on the title, stretched over the whole card, so the
 * card reads as one link named by its title.
 */
export function CardItem({ card, heading: Title, sizes, banner }: { card: Card; heading: Heading; sizes: string; banner: boolean }) {
  const tone = card.background.tone;
  return (
    <div
      className={`group relative isolate flex w-full flex-col overflow-clip rounded-card p-6 text-white sm:p-8 ${banner ? "min-h-80" : "min-h-[24rem] lg:min-h-[26rem]"} ${TONES[tone]} ${
        card.link ? "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-blue-medium has-[a:focus-visible]:ring-offset-2" : ""
      }`}
    >
      {card.background.tone === "image" ? (
        <CardPhoto image={card.background.image} imageMobile={card.background.imageMobile} sizes={sizes} zoom={card.link !== null} />
      ) : card.background.pattern ? (
        <Pattern tone={card.background.tone} place="card" />
      ) : null}

      <div className="relative flex flex-col gap-3">
        <Title className="text-2xl leading-tight font-bold text-balance sm:text-[1.75rem]">
          {card.link ? (
            <a
              href={card.link.href}
              {...(card.link.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              // Stretched over the whole card: oversized, and clipped to the card by its `overflow-clip`.
              className="outline-none after:absolute after:inset-[-100vmax] after:content-['']"
            >
              {card.title}
            </a>
          ) : (
            card.title
          )}
        </Title>
        {card.text ? <p className="text-sm leading-relaxed text-pretty text-white sm:text-base">{card.text}</p> : null}
      </div>

      {/* Click-through: the stretched link underneath takes the click. */}
      <div className="pointer-events-none relative mt-auto flex items-end justify-between gap-4 pt-8">
        {card.icon ? (
          <span aria-hidden className={`grid size-14 place-items-center rounded-full bg-white text-[1.75rem] ${ICON[tone]}`}>
            <CtaIcon name={card.icon} className="size-[1em]" />
          </span>
        ) : (
          <span />
        )}
        {card.link ? (
          <span
            aria-hidden
            className={buttonClass("outline-inverse", "icon", "group-hover:border-white group-hover:before:scale-[20] group-hover:before:duration-600 group-hover:before:ease-in-out")}
          >
            <ArrowRight className="size-5" />
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** The card's photo (a separate crop on phones), loaded lazily, under a navy layer darkest behind the title. */
function CardPhoto({ image, imageMobile, sizes, zoom }: { image: Media; imageMobile: Media | null; sizes: string; zoom: boolean }) {
  const common = { alt: "", sizes, quality: 60 };
  const { props: desktop } = getImageProps({ ...common, src: image.url, width: image.width ?? 1200, height: image.height ?? 800 });
  const mobile = imageMobile ? getImageProps({ ...common, src: imageMobile.url, width: imageMobile.width ?? 768, height: imageMobile.height ?? 1024 }).props : null;
  return (
    <>
      <picture>
        {mobile ? <source media="(max-width: 767px)" srcSet={mobile.srcSet} sizes={mobile.sizes} /> : null}
        <img
          {...desktop}
          alt=""
          className={`absolute inset-0 size-full object-cover ${
            zoom ? "transition-transform duration-700 ease-out-soft group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" : ""
          }`}
        />
      </picture>
      <div aria-hidden className="absolute inset-0 bg-linear-to-b from-blue-dark/85 via-blue-dark/50 to-blue-dark/30" />
    </>
  );
}
