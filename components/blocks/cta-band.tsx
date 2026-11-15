import { Apple, ArrowRight, Play, Smartphone } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { buttonClass } from "@/components/ui/button";
import { Container, Eyebrow, Section } from "@/components/ui/section";
import { SmartLink } from "@/components/ui/smart-link";
import { Ornament, Scrim } from "@/components/ui/surface";

import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getChrome, type CtaBandBlock } from "@/lib/strapi";

/** Media as the CMS sends it; only the URL matters here. */
type Picture = { url: string };

/**
 * Fields of catalog C8, read loosely until the CMS types carry them. Store
 * URLs belong to the `site` singleton; a block may also carry them resolved.
 */
type PhotoFields = {
  variant?: "band" | "photo" | null;
  image?: Picture | null;
  imageMobile?: Picture | null;
  media?: Picture | null;
  showStoreBadges?: boolean | null;
  eyebrow?: string | null;
  appStoreUrl?: string | null;
  googlePlayUrl?: string | null;
};

type StoreUrls = { appStoreUrl?: string | null; googlePlayUrl?: string | null };

/**
 * The closing call to action. `band` (the default): one sentence and one or
 * two buttons on a navy (or light blue) band. `photo` (catalog C8): an inset
 * card on a photo – or navy with line art when the photo is missing – with
 * the app's store links and an optional phone mockup. Server only.
 *
 * `lang` is needed only for the store links (their names and the site's
 * URLs); without it the photo card simply leaves them out.
 */
export async function CtaBand({ block, first, lang }: { block: CtaBandBlock; first: boolean; lang?: Lang }) {
  const fields = block as CtaBandBlock & PhotoFields;
  if (fields.variant === "photo") {
    return <PhotoCard block={fields} first={first} lang={lang} stores={fields.showStoreBadges && lang ? await storeUrls(fields, lang) : null} />;
  }
  const Heading = first ? "h1" : "h2";
  const dark = block.tone === "dark";
  const headingId = `cta-band-${block.id}`;
  return (
    <Section tone={dark ? "dark" : "tint"} labelledBy={headingId}>
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
          <div className="flex max-w-3xl flex-col gap-4">
            <Heading id={headingId} className={`text-title text-balance ${dark ? "text-white" : "text-blue-dark"}`}>
              {block.title}
            </Heading>
            {block.text ? <p className={`text-lead text-pretty ${dark ? "text-white/80" : "text-blue-dark/75"}`}>{block.text}</p> : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
            <SmartLink link={block.primary} className={buttonClass(dark ? "inverse" : "primary", "lg", "w-full sm:w-auto")}>
              {block.primary.label}
              <ArrowRight className="size-5" aria-hidden />
            </SmartLink>
            {block.secondary ? (
              <SmartLink
                link={block.secondary}
                className={buttonClass(dark ? "outline-inverse" : "secondary", "lg", "w-full sm:w-auto")}
              />
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}

/** The block's own URLs first, then the site's (read loosely from the chrome until its type has them). */
async function storeUrls(fields: PhotoFields, lang: Lang): Promise<StoreUrls> {
  if (fields.appStoreUrl || fields.googlePlayUrl) {
    return fields;
  }
  const chrome = (await getChrome(lang)) as Awaited<ReturnType<typeof getChrome>> & StoreUrls & { site?: StoreUrls | null };
  return {
    appStoreUrl: chrome.appStoreUrl ?? chrome.site?.appStoreUrl ?? null,
    googlePlayUrl: chrome.googlePlayUrl ?? chrome.site?.googlePlayUrl ?? null,
  };
}

/**
 * Catalog C8. Phones: text on top, the mockup cropped at the bottom of the
 * card. From `md`: text left, the phones right, rising over the card's top
 * edge (the photo is clipped in its own layer, the card itself is not). The
 * `tone` field is ignored: the card is always navy under white text.
 */
function PhotoCard({ block, first, lang, stores }: { block: CtaBandBlock & PhotoFields; first: boolean; lang?: Lang; stores: StoreUrls | null }) {
  const Heading = first ? "h1" : "h2";
  const headingId = `cta-band-${block.id}`;
  const t = lang ? getMessages(lang).blocks : null;
  // Plain text links with an icon until the official store badges are in the media library.
  const badges: { href: string; label: string; icon: ReactNode }[] = [];
  if (t && stores?.appStoreUrl) badges.push({ href: stores.appStoreUrl, label: t.appStore, icon: <Apple aria-hidden className="size-5" /> });
  if (t && stores?.googlePlayUrl) badges.push({ href: stores.googlePlayUrl, label: t.googlePlay, icon: <Play aria-hidden className="size-5" /> });
  return (
    <Section tone="canvas" labelledBy={headingId}>
      <Container>
        <div className="relative isolate flex flex-col rounded-[2rem] text-white md:min-h-[26rem] md:justify-center">
          <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden rounded-[2rem] bg-blue-dark">
            {block.image ? (
              <>
                {/* Decorative, below the first screen: lazy and light. */}
                <Image
                  src={block.image.url}
                  alt=""
                  fill
                  sizes="(min-width: 1344px) 80rem, 100vw"
                  quality={60}
                  className={`-z-20 object-cover ${block.imageMobile ? "hidden md:block" : ""}`}
                />
                {block.imageMobile ? (
                  <Image src={block.imageMobile.url} alt="" fill sizes="100vw" quality={60} className="-z-20 object-cover md:hidden" />
                ) : null}
                <Scrim side="start" />
                {/* Phones: more navy where the text sits (top), so white keeps 4.5:1 on any frame. */}
                <div className="absolute inset-0 -z-10 bg-linear-to-b from-blue-dark/60 via-blue-dark/25 to-transparent lg:bg-blue-dark/15 lg:bg-none" />
              </>
            ) : (
              <Ornament kind="road" />
            )}
          </div>
          <div className="flex flex-col gap-5 p-6 sm:p-10 md:max-w-[58%] lg:max-w-[50%] lg:p-14">
            {block.eyebrow ? (
              <Eyebrow dark variant="pill" icon={<Smartphone />}>
                {block.eyebrow}
              </Eyebrow>
            ) : null}
            <Heading id={headingId} className="text-title text-balance text-white">
              {block.title}
            </Heading>
            {block.text ? <p className="text-lead text-pretty text-white/90">{block.text}</p> : null}
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
              <SmartLink link={block.primary} className={buttonClass("inverse", "lg", "w-full sm:w-auto")}>
                {block.primary.label}
                <ArrowRight className="size-5" aria-hidden />
              </SmartLink>
              {block.secondary ? <SmartLink link={block.secondary} className={buttonClass("outline-inverse", "lg", "w-full sm:w-auto")} /> : null}
            </div>
            {badges.length > 0 ? (
              <ul className="flex flex-wrap gap-3">
                {badges.map((badge) => (
                  <li key={badge.href}>
                    <a
                      href={badge.href}
                      aria-label={badge.label}
                      className="inline-flex h-11 items-center gap-2 rounded-control bg-white/10 px-4 text-sm font-semibold text-white ring-1 ring-white/40 transition-colors duration-150 ease-out-soft outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
                    >
                      {badge.icon}
                      {badge.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {block.media ? (
            // Decoration: two phones showing the app. Cropped at the card's bottom on phones.
            <div className="relative -mt-2 h-56 md:absolute md:right-6 md:bottom-0 md:mt-0 md:h-[110%] md:w-[38%]">
              <Image
                src={block.media.url}
                alt=""
                fill
                sizes="(min-width: 768px) 32vw, 90vw"
                quality={60}
                className="object-contain object-bottom"
              />
            </div>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
