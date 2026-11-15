import type { CSSProperties } from "react";

import { CtaIcon, CtaLink } from "@/components/blocks/cta-link";
import { Carousel } from "@/components/ui/carousel";
import { isDarkBackground, type FeaturesSection } from "@/lib/strapi";

import { SECTION_CTA_SIZE, SectionHeading, SectionShell } from "./section-shell";

type Item = FeaturesSection["items"][number];
type Heading = "h2" | "h3";
type Cols = 1 | 2 | 3 | 4;

/** Desktop columns by count: up to 4 in one row, then 3 (5–6) or 4 (7–8). */
function columns(count: number): Cols {
  if (count <= 4) return count as Cols;
  return count <= 6 ? 3 : 4;
}

/** Widths for a wrapping row (`gap-6`): a short last row stays centred, which a grid would not do. */
const BASIS: Record<Cols, string> = {
  1: "lg:basis-full",
  2: "lg:basis-[calc((100%-1.5rem)/2)]",
  3: "lg:basis-[calc((100%-3rem)/3)]",
  4: "lg:basis-[calc((100%-4.5rem)/4)]",
};

/** The statements' rule (and its padding) between columns, off for the first of each desktop row. */
const ROW_START: Record<Cols, string> = {
  1: "lg:border-l-0 lg:pl-0",
  2: "lg:[&:nth-child(2n+1)]:border-l-0 lg:[&:nth-child(2n+1)]:pl-0",
  3: "lg:[&:nth-child(3n+1)]:border-l-0 lg:[&:nth-child(3n+1)]:pl-0",
  4: "lg:[&:nth-child(4n+1)]:border-l-0 lg:[&:nth-child(4n+1)]:pl-0",
};

/** The cards' cut-out: a hole in the card's bottom edge, around the icon, through which the background shows. */
const CUT_OUT: CSSProperties = {
  maskImage: "radial-gradient(circle at 50% 100%, transparent 2.25rem, #000 calc(2.25rem + 0.5px))",
  WebkitMaskImage: "radial-gradient(circle at 50% 100%, transparent 2.25rem, #000 calc(2.25rem + 0.5px))",
};

/**
 * Colours for the item's background. Light: navy text, blue-medium accents.
 * Dark (navy, blue, green, photo): white text straight on the colour, and the
 * coloured circles turn white with the icon in the background's colour.
 */
export type Palette = { title: string; text: string; badge: string; soft: string; rule: string; step: string; stepLine: string; accent: string };

export function palette(background: FeaturesSection["background"]): Palette {
  if (!isDarkBackground(background)) {
    return {
      title: "text-blue-dark",
      text: "text-blue-dark/80",
      badge: "bg-blue-medium text-white",
      soft: "bg-blue-light text-blue-medium",
      rule: "border-line",
      step: "bg-green-medium text-white",
      stepLine: "bg-green-light",
      accent: "text-go-strong",
    };
  }
  const on = background.tone === "green" ? "text-go-strong" : background.tone === "blue" ? "text-blue-medium" : "text-blue-dark";
  return {
    title: "text-white",
    // Full white: any transparency drops the green below 4.5:1.
    text: "text-white",
    badge: `bg-white ${on}`,
    soft: "bg-white/15 text-white",
    rule: "border-white/25",
    step: `bg-white ${on}`,
    stepLine: "bg-white/30",
    accent: "text-white",
  };
}

/**
 * Features (`sections.features`): 1–8 items with a Lucide icon, a title and
 * a line or two, under an optional heading (badge, title, text) and over
 * optional buttons. Four looks over the same fields:
 *
 * - `inline`: icon in a circle beside the title and text;
 * - `cards`: cards with the icon in a cut-out on the bottom edge;
 * - `statements`: a small labelled icon over a large line, rules between;
 * - `steps`: numbered in order, joined by a line (across on desktops, down on
 *   phones); a carousel keeps them across everywhere.
 *
 * As a grid, a short last row is centred; as a carousel (the site's Embla
 * one, in spotlight mode) the current item stands in the middle, with a
 * dimmed, blurred neighbour on each side; no loop, so it stops at the ends.
 * On a dark background the text is white straight on the colour; cards stay
 * white. Server markup only; the carousel loads Embla when it nears the screen.
 */
export function Features({ section }: { section: FeaturesSection }) {
  const headingId = `features-${section.id}`;
  const dark = isDarkBackground(section.background);
  const colours = palette(section.background);
  const cols = columns(section.items.length);
  const carousel = section.display === "carousel";
  // Without a section title the items are the section's headings.
  const itemHeading: Heading = section.title ? "h3" : "h2";
  const label = section.title ?? section.items.map((item) => item.title).join(", ");
  // Statements and steps stay one per row until `lg`: large lines and the joining line need the width.
  const wide = section.variant === "statements" || section.variant === "steps";

  const items = section.items.map((item, index) => {
    const last = index === section.items.length - 1;
    return (
      <li
        key={`${item.title}-${index}`}
        className={`${
          carousel
            ? // Fractions of the content width: one (85%) on phones, two on tablets, three on desktops; neighbours
              // show past it in the page margins, dimmed (`bleed`).
              "flex w-[85%] shrink-0 snap-center sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
            : `flex basis-full ${wide ? "" : "sm:basis-[calc((100%-1.5rem)/2)]"} ${BASIS[cols]}`
        } ${section.variant === "statements" ? `${colours.rule} lg:border-l lg:pl-6 ${ROW_START[cols]}` : ""}`}
      >
        {section.variant === "inline" ? <InlineItem item={item} heading={itemHeading} colours={colours} /> : null}
        {section.variant === "cards" ? <CardItem item={item} heading={itemHeading} background={section.background} /> : null}
        {section.variant === "statements" ? <StatementItem item={item} heading={itemHeading} colours={colours} first={index === 0} /> : null}
        {section.variant === "steps" ? (
          <StepItem
            item={item}
            number={index + 1}
            heading={itemHeading}
            colours={colours}
            across={carousel}
            // The line runs to the next step: none after the last, and none at the end of a desktop row.
            lineDown={!last}
            lineAcross={!last && (carousel || (index + 1) % cols !== 0)}
          />
        ) : null}
      </li>
    );
  });

  // Steps are an ordered list: screen readers say "1 of 3".
  const List = section.variant === "steps" ? "ol" : "ul";
  const list = carousel ? (
    <Carousel
      label={label}
      count={section.items.length}
      tone={dark ? "dark" : "light"}
      align="center"
      spotlight
      bleed
      className="snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <List className="flex gap-6 pb-2">{items}</List>
    </Carousel>
  ) : (
    <List aria-label={section.title ? undefined : label} className={`flex flex-wrap justify-center gap-6 ${wide ? "gap-y-8" : ""}`}>
      {items}
    </List>
  );

  return (
    <SectionShell background={section.background} spacing={section.spacing} width={section.width} labelledBy={section.title ? headingId : undefined}>
      <SectionHeading
        id={headingId}
        badge={section.badge}
        title={section.title}
        text={section.text}
        align={section.headerAlign}
        background={section.background}
      />
      {list}
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

function Icon({ name }: { name: string | null }) {
  return <CtaIcon name={name ?? "check"} className="size-[1em]" />;
}

/** Icon in a circle beside the title and text, centred on them. */
export function InlineItem({ item, heading: Title, colours }: { item: Item; heading: Heading; colours: Palette }) {
  return (
    <div className="flex w-full items-center gap-4">
      <span aria-hidden className={`grid size-14 shrink-0 place-items-center rounded-full text-[1.75rem] ${colours.badge}`}>
        <Icon name={item.icon} />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <Title className={`text-lg leading-snug font-bold text-balance ${colours.title === "text-white" ? "text-white" : "text-blue-medium"}`}>{item.title}</Title>
        {item.text ? <p className={`text-pretty ${colours.text}`}>{item.text}</p> : null}
      </div>
    </div>
  );
}

/**
 * A card with the icon on its bottom edge, sitting in a cut-out (a mask, so
 * the section's colour or photo shows around the icon on any background).
 * The icon is outside the masked card, so the mask does not cut it. Cards
 * stay white on every background.
 */
function CardItem({ item, heading: Title, background }: { item: Item; heading: Heading; background: FeaturesSection["background"] }) {
  const card = background.tone === "white" ? "bg-surface" : "bg-white";
  return (
    <div className="relative flex w-full flex-col pb-7">
      <div style={CUT_OUT} className={`flex flex-1 flex-col gap-3 rounded-card px-6 pt-8 pb-14 text-center ${card}`}>
        <Title className="text-subtitle font-bold text-balance text-blue-dark">{item.title}</Title>
        {item.text ? <p className="text-pretty text-blue-dark/75">{item.text}</p> : null}
      </div>
      <span
        aria-hidden
        className={`absolute bottom-0 left-1/2 grid size-14 -translate-x-1/2 place-items-center rounded-full text-[1.75rem] ${palette(background).badge}`}
      >
        <Icon name={item.icon} />
      </span>
    </div>
  );
}

/** A small icon and the title as a label, over the text as a large line. Without text, the title is the line. */
function StatementItem({ item, heading: Title, colours, first }: { item: Item; heading: Heading; colours: Palette; first: boolean }) {
  const big = `text-xl leading-snug font-bold text-balance sm:text-2xl ${colours.title}`;
  return (
    <div className={`flex w-full flex-col gap-4 ${first ? "" : `border-t pt-6 lg:border-t-0 lg:pt-0 ${colours.rule}`}`}>
      <div className="flex items-center gap-3">
        <span aria-hidden className={`grid size-10 shrink-0 place-items-center rounded-full text-xl ${colours.soft}`}>
          <Icon name={item.icon} />
        </span>
        {item.text ? <Title className={`text-sm font-semibold ${colours.title === "text-white" ? "text-white/80" : "text-muted-dark"}`}>{item.title}</Title> : null}
      </div>
      {item.text ? <p className={big}>{item.text}</p> : <Title className={big}>{item.title}</Title>}
    </div>
  );
}

/**
 * A numbered step: the number in a circle, the icon before the title, the
 * text under it, and a line to the next step. On phones the steps run down
 * (number on the left, line downwards); from `lg`, or always in a carousel,
 * across (number on top, line to the right).
 */
function StepItem({
  item,
  number,
  heading: Title,
  colours,
  across,
  lineDown,
  lineAcross,
}: {
  item: Item;
  number: number;
  heading: Heading;
  colours: Palette;
  across: boolean;
  lineDown: boolean;
  lineAcross: boolean;
}) {
  const layout = across ? "flex-col gap-5" : "gap-4 lg:flex-col lg:gap-5";
  const down = "top-14 -bottom-8 left-7 w-0.5 -translate-x-1/2";
  const right = "top-7 left-[4.5rem] -right-6 h-0.5 -translate-y-1/2";
  // Phones: down unless it is the last; from `lg`: across unless it ends the row. In a carousel: across only.
  const line = across
    ? lineAcross
      ? right
      : null
    : [lineDown ? down : "hidden", lineAcross ? `lg:block lg:top-7 lg:bottom-auto lg:left-[4.5rem] lg:-right-6 lg:h-0.5 lg:w-auto lg:translate-x-0 lg:-translate-y-1/2` : "lg:hidden"].join(" ");
  return (
    <div className={`relative flex w-full ${layout}`}>
      <span
        aria-hidden
        className={`relative z-[1] grid size-14 shrink-0 place-items-center rounded-full text-xl font-bold shadow-card ring-4 ring-white/70 ${colours.step}`}
      >
        {number}
      </span>
      {line ? <span aria-hidden className={`absolute ${line} ${colours.stepLine}`} /> : null}
      <div className={`flex min-w-0 flex-col gap-2 ${across ? "" : "pt-3 lg:pt-0"}`}>
        <Title className={`flex items-start gap-2 text-lg leading-snug font-bold text-balance ${colours.title}`}>
          <span aria-hidden className={`mt-1 shrink-0 text-xl ${colours.accent}`}>
            <Icon name={item.icon} />
          </span>
          {item.title}
        </Title>
        {item.text ? <p className={`text-pretty ${colours.text}`}>{item.text}</p> : null}
      </div>
    </div>
  );
}
