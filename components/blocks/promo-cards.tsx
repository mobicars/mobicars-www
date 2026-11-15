import Image from "next/image";

import type { Lang } from "@/i18n/config";
import { intlLocales } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { getMessages } from "@/i18n/messages";
import type { PromoCard, PromoCardsBlock } from "@/lib/strapi";

import { SectionHeader } from "@/components/ui/section";
import { SmartLink } from "@/components/ui/smart-link";
import { Ornament, Pill, Rail, RailItem, Scrim } from "@/components/ui/surface";

import { PromoCopy } from "./promo-copy";
import { SectionFrame } from "./section-frame";

/**
 * Catalog C19 (carfree.pl): up to three promotion cards right under the hero.
 * Only cards valid today reach here (the parser drops the others, and the page
 * cache ends when the next one starts or ends), so nothing counts down. The
 * card is the link; the code has its own copy button above it.
 */
export function PromoCards({ block, lang, first }: { block: PromoCardsBlock; lang: Lang; first: boolean }) {
  const headingId = `promo-cards-${block.id}`;
  return (
    <SectionFrame style={block.section} labelledBy={block.title ? headingId : undefined}>
      {block.title ? (
        <SectionHeader id={headingId} level={first ? 1 : 2} eyebrow={block.eyebrow} title={block.title} lead={block.lead} />
      ) : null}
      <Rail label={block.title ?? block.items[0].title} columns={3}>
        {block.items.map((card, index) => (
          <RailItem key={`${card.title}-${index}`} className="sm:w-[60%]">
            <Card card={card} lang={lang} headingLevel={block.title ? "h3" : first ? "h1" : "h2"} />
          </RailItem>
        ))}
      </Rail>
    </SectionFrame>
  );
}

function Card({ card, lang, headingLevel }: { card: PromoCard; lang: Lang; headingLevel: "h1" | "h2" | "h3" }) {
  const t = getMessages(lang).blocks;
  const Heading = headingLevel;
  const until = card.validUntil
    ? new Intl.DateTimeFormat(intlLocales[lang], { day: "numeric", month: "long", timeZone: "Europe/Warsaw" }).format(new Date(`${card.validUntil}T12:00:00Z`))
    : null;
  const surface = card.tone === "go" ? "bg-go-strong" : "bg-blue-dark";
  return (
    <article className={`group relative isolate flex min-h-56 w-full flex-col gap-3 overflow-hidden rounded-card p-5 text-white shadow-card sm:p-6 ${surface}`}>
      {card.tone === "photo" && card.image ? (
        <>
          <Image
            src={card.image.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 26rem, 82vw"
            quality={60}
            className={`-z-20 object-cover ${card.imageMobile ? "hidden sm:block" : ""}`}
          />
          {card.imageMobile ? (
            <Image src={card.imageMobile.url} alt="" fill sizes="82vw" quality={60} className="-z-20 object-cover sm:hidden" />
          ) : null}
          <Scrim side="bottom" />
          <Scrim side="even" />
        </>
      ) : (
        <Ornament kind={card.tone === "go" ? "contour" : "road"} className="text-white/15" />
      )}
      {until ? <Pill tone="glass">{fill(t.promoUntil, { date: until })}</Pill> : null}
      <Heading className="text-subtitle font-bold text-balance">
        {card.link ? (
          <SmartLink
            link={card.link}
            className="outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:ring-2 focus-visible:after:ring-white focus-visible:after:ring-inset"
          >
            {card.title}
          </SmartLink>
        ) : (
          card.title
        )}
      </Heading>
      {card.text ? <p className="text-pretty text-white/85">{card.text}</p> : null}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
        {card.code ? (
          <PromoCopy code={card.code} label={t.promoCopy} copied={fill(t.promoCopied, { code: card.code })} />
        ) : (
          <span />
        )}
        {card.terms ? (
          <SmartLink link={card.terms} className="relative z-10 text-xs text-white/80 underline underline-offset-2 hover:text-white">
            {card.terms.label}
          </SmartLink>
        ) : null}
      </div>
    </article>
  );
}
