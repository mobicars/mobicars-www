import { Quote, Star } from "lucide-react";

import { Carousel } from "@/components/ui/carousel";
import { IconSymbols, UseIcon } from "@/components/ui/icon-symbols";

import { Container, Section, SectionHeader, type SectionBackdrop } from "@/components/ui/section";
import type { OrnamentKind } from "@/components/ui/surface";
import { intlLocales, type Lang } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { getMessages } from "@/i18n/messages";
import { plural } from "@/i18n/plural";
import type { Review, ReviewsBlock, SectionStyle } from "@/lib/strapi";

import { SectionFrame } from "./section-frame";

/** Longer texts fold behind "…" with a native `<details>`: no JavaScript. */
const FOLD_AT = 240;

/**
 * The CMS reviews block: the source's overall rating when the CMS gives one
 * (never a made-up or merged number), then the reviews as cards: author,
 * stars (read out as "5 na 5"), date, text and source. A swipe row on phones
 * (CSS scroll-snap), a grid from `md`. Server markup only. No schema.org
 * ratings: Google treats a company's own reviews of itself as self-serving.
 *
 * The note on where the reviews come from and how they are checked (UOKiK)
 * waits for its CMS field.
 *
 * `layout: "spotlight"` (catalog C7) shows the same reviews over a photo, one
 * at a time; `cards` (and an entry without the field) keeps the cards.
 */
export function Reviews({ block, lang, first }: { block: ReviewsBlock; lang: Lang; first: boolean }) {
  // Read loosely until the CMS types carry `layout`.
  if ((block as ReviewsBlock & { layout?: "cards" | "spotlight" | null }).layout === "spotlight") {
    return <Spotlight block={block} lang={lang} first={first} />;
  }
  const headingId = `reviews-${block.id}`;
  const dark = block.section.tone === "dark";
  // Five stars per review: the star is drawn once and reused.
  const icons = `${headingId}-icon`;
  return (
    <SectionFrame style={block.section} labelledBy={block.title ? headingId : undefined}>
      <IconSymbols prefix={icons} icons={{ star: Star }} props={{ fill: "inherit" }} />
      {block.title ? (
        <SectionHeader id={headingId} level={first ? 1 : 2} eyebrow={block.eyebrow} title={block.title} lead={block.lead} dark={dark} />
      ) : null}
      <Summary
        block={block}
        lang={lang}
        icons={icons}
        className={dark ? "text-white" : "text-blue-dark"}
        muted={dark ? "text-white/75" : "text-muted-dark"}
      />
      <ul className="-mx-gutter flex snap-x snap-mandatory scroll-px-gutter gap-4 overflow-x-auto px-gutter pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
        {block.reviews.map((review) => (
          <li key={review.id} className="flex w-[85%] shrink-0 snap-center md:w-auto">
            <ReviewCard review={review} lang={lang} icons={icons} />
          </li>
        ))}
      </ul>
    </SectionFrame>
  );
}

function ReviewCard({ review, lang, icons }: { review: Review; lang: Lang; icons: string }) {
  const t = getMessages(lang).blocks;
  const date = new Intl.DateTimeFormat(intlLocales[lang], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(review.date));
  return (
    <article className="flex w-full flex-col gap-3 rounded-card border border-line bg-white p-5 text-blue-dark shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <Stars icons={icons} rating={review.rating} label={fill(t.reviewsOutOf, { rating: String(review.rating) })} />
        <time dateTime={review.date} className="text-xs text-muted-dark">
          {date}
        </time>
      </div>
      <ReviewBody text={review.text} readMore={t.readMore} className="text-sm leading-relaxed" />
      <p className="mt-auto flex items-center justify-between gap-3 pt-2 text-sm">
        <span className="font-semibold">{review.author}</span>
        <span className="text-xs text-muted-dark">{review.source}</span>
      </p>
    </article>
  );
}

/** The backdrop fields of `SectionStyle` (catalog C1), read loosely like `SectionFrame` does. */
type BackdropFields = {
  backgroundImage?: { url: string } | null;
  backgroundImageMobile?: { url: string } | null;
  ornament?: OrnamentKind | "none" | null;
};

/** Spotlight always sits on navy: the section's photo when it has one, else the brand colour with line art. */
function spotlightBackdrop(style: SectionStyle): SectionBackdrop {
  const fields = style as SectionStyle & BackdropFields;
  if (fields.backgroundImage) {
    return {
      kind: "photo",
      image: fields.backgroundImage,
      imageMobile: fields.backgroundImageMobile ?? null,
    };
  }
  return {
    kind: "brand",
    ornament: fields.ornament === "none" ? null : (fields.ornament ?? "road"),
  };
}

/**
 * Catalog C7: a full-width photo under navy, the rating, then one review at a
 * time in the middle of a swipe row. `Carousel` (Embla, loaded when the row
 * nears the screen) adds drag, a loop, dots and arrows and marks the middle
 * card so the others step back; before it, the row swipes with scroll-snap
 * and every card is full.
 */
function Spotlight({ block, lang, first }: { block: ReviewsBlock; lang: Lang; first: boolean }) {
  const headingId = `reviews-${block.id}`;
  const icons = `${headingId}-icon`;
  const t = getMessages(lang).blocks;
  const backdrop = spotlightBackdrop(block.section);
  return (
    <Section
      backdrop={backdrop}
      spacing={block.section.spacing}
      anchor={block.section.anchor}
      labelledBy={block.title ? headingId : undefined}
    >
      <IconSymbols prefix={icons} icons={{ star: Star }} props={{ fill: "inherit" }} />
      {/* A second layer behind the heading: white text keeps 4.5:1 on the lightest part of any photo. */}
      {backdrop.kind === "photo" ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-2/3 bg-linear-to-b from-blue-dark/70 to-transparent"
        />
      ) : null}
      <Container width={block.section.width}>
        {block.title ? (
          <SectionHeader
            id={headingId}
            level={first ? 1 : 2}
            eyebrow={block.eyebrow}
            eyebrowVariant="pill"
            eyebrowIcon={<Star />}
            title={block.title}
            lead={block.lead}
            align="center"
            dark
          />
        ) : null}
        <Summary block={block} lang={lang} icons={icons} className="justify-center text-white" muted="text-white/90" />
      </Container>
      {/* Edge to edge; the spacers before and after let the first and last card reach the middle (native row only). */}
      <Carousel
        label={block.title ?? t.reviewsListLabel}
        count={block.reviews.length}
        texts={{
          previous: t.reviewsPrevious,
          next: t.reviewsNext,
          goTo: t.reviewsGoTo,
        }}
        loop
        align="center"
        spotlight
        tone="dark"
        className="snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="reviews-spotlight flex gap-4 py-4 before:w-[calc(7.5%-1rem)] before:shrink-0 after:w-[calc(7.5%-1rem)] after:shrink-0 sm:before:w-[calc(20%-1rem)] sm:after:w-[calc(20%-1rem)] lg:before:w-[calc(50%-20rem)] lg:after:w-[calc(50%-20rem)]">
          {block.reviews.map((review) => (
            <li key={review.id} className="flex w-[85%] shrink-0 snap-center sm:w-[60%] lg:w-[38rem]">
              <SpotlightCard review={review} lang={lang} icons={icons} />
            </li>
          ))}
        </ul>
      </Carousel>
    </Section>
  );
}

function SpotlightCard({ review, lang, icons }: { review: Review; lang: Lang; icons: string }) {
  const t = getMessages(lang).blocks;
  const date = new Intl.DateTimeFormat(intlLocales[lang], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(review.date));
  return (
    <article className="flex w-full flex-col gap-4 rounded-card bg-white/95 p-6 text-blue-dark shadow-float">
      <Quote aria-hidden className="size-8 text-green-medium" />
      <ReviewBody text={review.text} readMore={t.readMore} className="text-lg leading-relaxed" />
      <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-2 pt-2">
        <div className="flex flex-col gap-1">
          <span className="font-semibold">{review.author}</span>
          <Stars icons={icons} rating={review.rating} label={fill(t.reviewsOutOf, { rating: String(review.rating) })} />
        </div>
        <p className="flex flex-col items-end text-xs text-muted-dark">
          <time dateTime={review.date}>{date}</time>
          <span>{review.source}</span>
        </p>
      </div>
    </article>
  );
}

/**
 * The source's overall rating ("4,8 ★ Google · 120 opinii"). Only when every
 * shown review has one source: never a merged number.
 */
/** No CMS field says the summary comes from the review platform yet (see `Summary`). */
export const RATING_FROM_SYNC = false;

function Summary({
  block,
  lang,
  icons,
  className,
  muted,
}: {
  block: ReviewsBlock;
  lang: Lang;
  icons: string;
  className: string;
  muted: string;
}) {
  const source = block.reviews.every((review) => review.source === block.reviews[0].source) ? block.reviews[0].source : null;
  // The average and count are worked out from the reviews typed into the CMS,
  // not the Google profile: shown again once a real sync (the profile's own
  // aggregate) feeds `summary`. The source under each review stays.
  if (!RATING_FROM_SYNC || !block.summary || !source) {
    return null;
  }
  const t = getMessages(lang).blocks;
  const number = new Intl.NumberFormat(intlLocales[lang], {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });
  return (
    <div className={`mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}>
      <span className="text-4xl font-bold tabular-nums">{number.format(block.summary.average)}</span>
      <Stars
        icons={icons}
        rating={block.summary.average}
        label={fill(t.reviewsOutOf, {
          rating: number.format(block.summary.average),
        })}
      />
      <span className={`text-sm ${muted}`}>
        {source} ·{" "}
        {fill(plural(lang, block.summary.count, t.reviewsCount), {
          count: new Intl.NumberFormat(intlLocales[lang]).format(block.summary.count),
        })}
      </span>
    </div>
  );
}

/** The review's text; a long one folds behind "…" with a native `<details>`. */
function ReviewBody({ text, readMore, className }: { text: string; readMore: string; className: string }) {
  if (text.length <= FOLD_AT) {
    return (
      <p className={className}>
        <ReviewText text={text} />
      </p>
    );
  }
  return (
    <details className={`group ${className}`}>
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">
          <ReviewText text={text.slice(0, FOLD_AT).trimEnd()} />…{" "}
          <span className="font-semibold text-blue-medium underline underline-offset-2">{readMore}</span>
        </span>
        <span className="hidden group-open:inline">
          <ReviewText text={text} />
        </span>
      </summary>
    </details>
  );
}

/** Five stars, filled to the rating; one label for screen readers ("4,8 na 5"). */
function Stars({ icons, rating, label }: { icons: string; rating: number; label: string }) {
  return (
    <span role="img" aria-label={label} className="flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((star) => (
        <UseIcon
          key={star}
          prefix={icons}
          name="star"
          className={`size-4 ${rating >= star - 0.25 ? "fill-current" : "fill-transparent text-muted"}`}
        />
      ))}
    </span>
  );
}

/** Emoji with their joiners and modifiers ("🙋‍♂️", "👍🏻"). */
const EMOJI = /(\p{Extended_Pictographic}(?:\p{Emoji_Modifier}|\uFE0F|\u200D\p{Extended_Pictographic})*)/u;
const EMOJI_FONTS = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

/**
 * Review text with each emoji in the system emoji font. Left in Poppins, the
 * zero-width joiner inside "🙋‍♂️" falls in the range of Poppins' Devanagari
 * file, so the browser fetches 39 KB of font (at top priority, beside the
 * hero photo) for one invisible character.
 */
function ReviewText({ text }: { text: string }) {
  return text.split(EMOJI).map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} style={{ fontFamily: EMOJI_FONTS }}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}
