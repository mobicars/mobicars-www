import { Star } from "lucide-react";

import { Container } from "@/components/ui/section";
import { intlLocales, type Lang } from "@/i18n/config";
import { fill, getMessages } from "@/i18n/messages";
import { plural } from "@/i18n/plural";
import type { TrustBarBlock } from "@/lib/strapi";

import { CtaIcon } from "./cta-link";
import { RATING_FROM_SYNC } from "./reviews";

/**
 * Social proof (catalog C4): the rating of the published reviews and short
 * claims from the CMS ("Bez kaucji", "Bez limitu km w PL"). `inline` sits in
 * the hero under the search, on the dark photo; `strip` is a band of its own
 * under the hero. No counts of points or towns: the site says "over 30
 * locations" word for word (the `stats` field waits in the CMS). No rating
 * when there are no reviews; never typed in by hand. No AggregateRating data:
 * it would be self-serving, as in `Reviews`. Server markup, no JavaScript.
 */
export function TrustBar({ block: raw, lang, dark = false }: { block: TrustBarBlock; lang: Lang; dark?: boolean }) {
  // The rating is our CMS reviews' average, not the Google profile's: hidden until a real sync (`RATING_FROM_SYNC`).
  const block = RATING_FROM_SYNC ? raw : { ...raw, rating: null };
  if (!block.rating && block.claims.length === 0) {
    return null;
  }
  const items = <TrustItems block={block} lang={lang} dark={dark || block.variant === "inline"} />;
  if (block.variant === "inline") {
    return items;
  }
  return (
    <section aria-label={getMessages(lang).blocks.trustLabel} className="border-y border-line bg-white py-4">
      <Container>{items}</Container>
    </section>
  );
}

function TrustItems({ block, lang, dark }: { block: TrustBarBlock; lang: Lang; dark: boolean }) {
  const t = getMessages(lang).blocks;
  const number = new Intl.NumberFormat(intlLocales[lang], { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const strip = block.variant === "strip";
  // The review platform ("Google") once the rating carries it; never guessed.
  const source = block.rating?.source?.trim() || null;
  return (
    <ul
      className={`flex items-center gap-x-4 gap-y-2 text-sm ${dark ? "text-white" : "text-blue-dark"} ${
        strip
          ? "-mx-gutter overflow-x-auto px-gutter [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
          : // On the photo: its own navy backing, so the text reads on the lightest part of any crop (4.5:1).
            "w-fit flex-wrap rounded-2xl bg-blue-dark/75 px-3.5 py-2 backdrop-blur-sm"
      }`}
    >
      {block.rating ? (
        <li className="flex shrink-0 items-center gap-2">
          <span role="img" aria-label={fill(t.reviewsOutOf, { rating: number.format(block.rating.average) })} className="flex items-center gap-0.5 text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} aria-hidden className={`size-4 ${block.rating!.average >= star - 0.25 ? "fill-current" : "fill-transparent opacity-50"}`} />
            ))}
          </span>
          <span className="font-bold tabular-nums">
            <data value={block.rating.average}>{number.format(block.rating.average)}</data>
          </span>
          <span className={dark ? "text-white/85" : "text-muted-dark"}>
            {fill(plural(lang, block.rating.count, t.reviewsCount), { count: new Intl.NumberFormat(intlLocales[lang]).format(block.rating.count) })}
            {source ? ` ${source}` : null}
          </span>
        </li>
      ) : null}
      {block.claims.map((claim) => (
        <li
          key={claim.text}
          className={`flex shrink-0 items-center gap-1.5 font-semibold ${
            strip ? "rounded-full bg-green-light px-3 py-1.5 text-green-dark" : ""
          }`}
        >
          {claim.icon ? <CtaIcon name={claim.icon} className="size-4" /> : null}
          {claim.text}
        </li>
      ))}
    </ul>
  );
}
