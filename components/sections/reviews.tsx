import { Star } from "lucide-react";

import { CtaLink } from "@/components/sections/cta-link";
import { ReviewText } from "@/components/sections/review-text";
import { IconSymbols, UseIcon } from "@/components/ui/icon-symbols";
import { intlLocales, type Lang } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { getMessages } from "@/i18n/messages";
import { isDarkBackground, type ReviewsSection, type SectionReview } from "@/lib/strapi";

import { LazyCarousel as Carousel } from "./lazy";
import { SECTION_CTA_SIZE, SectionHeading, SectionShell } from "./section-shell";

/**
 * Reviews (`sections.reviews`): customer reviews in the page's language under
 * the shared heading, the overall score the editor typed under it (a number
 * and stars filled to it), and up to two buttons. No date and no source on a
 * review. No schema.org rating: Google treats a company's reviews of itself
 * on its own site as self-serving.
 *
 * `carousel`: cards (stars, text, name), one in view on phones with a peek of
 * the next, two on tablets, three on desktops. `spotlight`: one large review
 * in the middle, the others dimmed at the sides. The whole text always: the
 * editors pick short reviews. Server markup only, apart from the carousel.
 */
export function Reviews({ section, lang }: { section: ReviewsSection; lang: Lang }) {
  const headingId = `reviews-${section.id}`;
  const icons = `${headingId}-icon`;
  const dark = isDarkBackground(section.background);
  const t = getMessages(lang).blocks;
  const spotlight = section.layout === "spotlight";
  const outOf = (value: number) => fill(t.reviewsOutOf, { rating: new Intl.NumberFormat(intlLocales[lang], { maximumFractionDigits: 2 }).format(value) });
  // On a white section the cards are light grey, on any other white.
  const card = section.background.tone === "white" ? "bg-tint" : "bg-white";

  const items = section.reviews.map((review) => (
    <li
      key={review.id}
      className={
        spotlight
          ? "flex w-[85%] shrink-0 snap-center sm:w-[70%] lg:w-[60%]"
          : "flex w-[85%] shrink-0 snap-center sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
      }
    >
      {spotlight ? (
        <SpotlightReview review={review} icons={icons} dark={dark} label={outOf(review.rating)} />
      ) : (
        <ReviewCard review={review} icons={icons} surface={card} label={outOf(review.rating)} />
      )}
    </li>
  ));

  return (
    <SectionShell
      background={section.background}
      spacing={section.spacing}
      width={section.width}
      labelledBy={section.title ? headingId : undefined}
      // The spotlight's text sits straight on the photo, not on cards: a darker layer keeps it readable on a light photo.
      strongOverlay={spotlight}
    >
      {/* The star is drawn once and reused by every review and the score. */}
      <IconSymbols prefix={icons} icons={{ star: Star }} props={{ fill: "inherit" }} />
      <SectionHeading id={headingId} badge={section.badge} title={section.title} text={section.text} align={section.headerAlign} background={section.background}>
        {section.score ? <Score score={section.score} lang={lang} icons={icons} dark={dark} label={outOf(section.score.value)} align={section.headerAlign} /> : null}
      </SectionHeading>
      <Carousel
        label={section.title ?? t.reviewsListLabel}
        count={section.reviews.length}
        texts={{ previous: t.reviewsPrevious, next: t.reviewsNext, goTo: t.reviewsGoTo }}
        tone={dark ? "dark" : "light"}
        align="center"
        loop={spotlight}
        spotlight
        bleed
        className="snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex gap-6 pb-2">{items}</ul>
      </Carousel>
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

/** The overall score: the number, the stars filled to it (one label for screen readers: "4,75 na 5") and the editor's note. */
function Score({
  score,
  lang,
  icons,
  dark,
  label,
  align,
}: {
  score: NonNullable<ReviewsSection["score"]>;
  lang: Lang;
  icons: string;
  dark: boolean;
  label: string;
  align: ReviewsSection["headerAlign"];
}) {
  const number = new Intl.NumberFormat(intlLocales[lang], { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(score.value);
  return (
    <div className={`mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 ${align === "center" ? "justify-center" : ""} ${dark ? "text-white" : "text-blue-dark"}`}>
      <span aria-hidden className="text-5xl leading-none font-bold tabular-nums">
        {number}
      </span>
      <span className="flex flex-col items-start gap-1">
        <Stars icons={icons} value={score.value} label={label} size="size-6" dark={dark} />
        {score.label ? <span className={`text-sm ${dark ? "text-white/85" : "text-blue-dark/75"}`}>{score.label}</span> : null}
      </span>
    </div>
  );
}

/**
 * Five stars filled to `value`, a part of one included (4,75: four and three
 * quarters): the filled row is clipped to its share of the width over the
 * empty one. The stars touch, so the share is exact.
 */
function Stars({ icons, value, label, size, dark }: { icons: string; value: number; label: string; size: string; dark: boolean }) {
  const row = (className: string) => [1, 2, 3, 4, 5].map((star) => <UseIcon key={star} prefix={icons} name="star" className={`${size} shrink-0 ${className}`} />);
  return (
    <span role="img" aria-label={label} className="relative inline-flex">
      <span className={`flex ${dark ? "text-white/30" : "text-blue-dark/15"}`}>{row("fill-current")}</span>
      <span className="absolute inset-y-0 left-0 flex overflow-hidden text-amber-400" style={{ width: `${(value / 5) * 100}%` }}>
        {row("fill-current")}
      </span>
    </span>
  );
}

function ReviewCard({ review, icons, surface, label }: { review: SectionReview; icons: string; surface: string; label: string }) {
  return (
    <figure className={`flex w-full flex-col gap-4 rounded-card p-6 text-blue-dark sm:p-8 ${surface}`}>
      <Stars icons={icons} value={review.rating} label={label} size="size-5" dark={false} />
      <blockquote className="text-base leading-relaxed text-blue-dark/85">
        <p>
          <ReviewText text={review.text} />
        </p>
      </blockquote>
      <figcaption className="mt-auto pt-2 font-semibold">{review.author}</figcaption>
    </figure>
  );
}

function SpotlightReview({ review, icons, dark, label }: { review: SectionReview; icons: string; dark: boolean; label: string }) {
  return (
    // In the middle of the slide: the row is as tall as its longest review, a shorter one sits centred instead of leaving a gap below.
    <figure className={`flex w-full flex-col items-center justify-center gap-5 px-2 py-4 text-center ${dark ? "text-white" : "text-blue-dark"}`}>
      <Stars icons={icons} value={review.rating} label={label} size="size-6" dark={dark} />
      <blockquote className="text-lg leading-relaxed font-medium text-pretty sm:text-2xl sm:leading-relaxed">
        <p>
          <ReviewText text={review.text} />
        </p>
      </blockquote>
      <figcaption className={`font-semibold ${dark ? "text-white/85" : "text-blue-dark/75"}`}>{review.author}</figcaption>
    </figure>
  );
}
