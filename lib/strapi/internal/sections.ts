import type { Lang } from "@/i18n/config";
import type { ReservationTerm } from "@/lib/reservation/search";

import { slugWords } from "@/lib/fleet/slug";

import type { BlogCardFragment, BlogSectionFragment, CarsSectionFragment, MapSectionFragment, SplitSectionFragment, FormSectionFragment, PartCardFragment, SocialSectionFragment, CardsSectionFragment, FaqSectionFragment, FeaturesSectionFragment, HeroSectionFragment, PageQuery, SectionBackgroundFragment, TextSectionFragment } from "../generated/graphql";
import { parseBlogCard, parseCtas, parseMedia, resolveLink, sectionPostsKey, type BlogPostCard, type Cta, type Media } from "./entities";
import { parseRichBlocks, richBlocksText, type RichBlocks } from "./rich-blocks";
import type { PageRoute } from "./routes";

/**
 * The new component set (`sections.*` in Strapi, the page's `sections`
 * zone), built one component at a time and shown first on the component base
 * page. A page with sections shows them instead of its `blocks`; the old
 * zone goes once nothing uses it.
 */

/**
 * The page's opening section: a photo and/or a looping video under the whole
 * of it (navy without either), the `<h1>`, up to two buttons and optionally the booking
 * search. Every field is the CMS's.
 */
export type HeroSection = {
  type: "hero";
  id: string;
  badge: string | null;
  title: string;
  subtitle: string | null;
  ctas: Cta[];
  /** Optional: without it (and without a video) the section is navy. */
  image: Media | null;
  imageMobile: Media | null;
  video: Media | null;
  /** Falls back to `video` on phones when empty. */
  videoMobile: Media | null;
  overlay: "none" | "light" | "strong";
  /** The booking search, or `null` for none. */
  search: { layout: "vertical" | "horizontal"; term: ReservationTerm; side: "left" | "right" } | null;
  /** `full`: edge to edge; `boxed`: nearly so, with a margin and rounded corners; `contained`: the content width, rounded. */
  width: "full" | "boxed" | "contained";
  /** The same inside space above and below the content. */
  spacing: "small" | "medium" | "large";
  /** Where the copy sits when it is not beside a vertical search. */
  align: "start" | "center";
};

/**
 * A section's background (`parts.background`, shared by the new sections).
 * `light` is the pale blue-grey tint, `fade` that tint running down to white.
 * On `navy`, `blue`, `green` and `image` the heading turns white and small
 * text stands on white (cards or a white panel), so contrast always holds.
 */
export type SectionBackground =
  | { tone: "white" | "light" | "fade" }
  /** `pattern`: the colour's line art in one corner (`components/sections/pattern.tsx`). */
  | { tone: "navy" | "blue" | "green"; pattern: boolean }
  | { tone: "image"; image: Media; imageMobile: Media | null };

/** Whether the background is dark: white heading, small text on white. */
export function isDarkBackground(background: SectionBackground): boolean {
  return background.tone === "navy" || background.tone === "blue" || background.tone === "green" || background.tone === "image";
}

/**
 * 1–8 features (icon, title, text), with an optional heading and buttons.
 * `inline`: icon beside the text; `cards`: cards with the icon in a cut-out
 * on the bottom edge; `statements`: a small labelled icon over a large line;
 * `steps`: numbered, in order, joined by a line.
 */
export type FeaturesSection = {
  type: "features";
  id: string;
  badge: string | null;
  title: string | null;
  text: string | null;
  headerAlign: "center" | "start";
  items: { icon: string | null; title: string; text: string | null }[];
  variant: "inline" | "cards" | "statements" | "steps";
  display: "grid" | "carousel";
  ctas: Cta[];
  background: SectionBackground;
  /** As the hero's: `full`, `boxed` or `contained`. */
  width: "full" | "boxed" | "contained";
  spacing: "small" | "medium" | "large";
};

/**
 * Rich text from CKEditor (alignment set in the editor) under an optional
 * badge, title and buttons, in a centred narrow (reading) or wide column.
 */
export type TextSection = {
  type: "text";
  id: string;
  badge: string | null;
  title: string | null;
  body: RichBlocks;
  /** The badge, title and buttons; the text keeps the editor's alignment. */
  align: "start" | "center";
  /** `narrow`: about 720 px, for reading; `wide`: the content width (tables). Always centred, heading included. */
  textWidth: "narrow" | "wide";
  /** Paragraphs shown before "Read more"; `null`: the whole text. */
  collapseAfter: number | null;
  ctas: Cta[];
  background: SectionBackground;
  width: "full" | "boxed" | "contained";
  spacing: "small" | "medium" | "large";
};

/**
 * Questions and answers in 1–10 groups. A group's title is optional: with two
 * or more titled groups the section shows a heading per group and a category
 * menu (anchors, `anchor` per group); one group is a plain list.
 */
export type FaqSection = {
  type: "faq";
  id: string;
  badge: string | null;
  title: string | null;
  text: string | null;
  headerAlign: "start" | "center";
  groups: FaqGroup[];
  /** The "Search questions" field over the list. */
  search: boolean;
  /** schema.org FAQPage data for every question (one FAQ section per page should have it). */
  structuredData: boolean;
  ctas: Cta[];
  /** `narrow`: about 768 px; `wide`: the content width, with the side menu on desktops. */
  textWidth: "narrow" | "wide";
  background: SectionBackground;
  width: "full" | "boxed" | "contained";
  spacing: "small" | "medium" | "large";
};

export type FaqGroup = {
  /** Unique on the page: the group's anchor (from its title). */
  anchor: string;
  title: string | null;
  icon: string | null;
  items: { question: string; answer: RichBlocks; answerText: string }[];
};

/**
 * 1–8 cards on brand colours or photos. `grid`: the width follows the number
 * of cards (one spans the row); `carousel`: one card in view on phones, two on
 * tablets, `visibleCards` on desktops.
 */
export type CardsSection = {
  type: "cards";
  id: string;
  badge: string | null;
  title: string | null;
  text: string | null;
  headerAlign: "start" | "center";
  cards: Card[];
  display: "grid" | "carousel";
  visibleCards: 3 | 4;
  ctas: Cta[];
  background: SectionBackground;
  width: "full" | "boxed" | "contained";
  spacing: "small" | "medium" | "large";
};

export type Card = {
  icon: string | null;
  title: string;
  text: string | null;
  /** Where the whole card leads; `null`: not a link (no arrow, no hover). */
  link: { href: string; newTab: boolean } | null;
  /** The card's own colour or photo, with the colour's pattern unless turned off. */
  background: Exclude<SectionBackground, { tone: "white" | "light" | "fade" }>;
};

/**
 * Four blog posts, the newest or picked. `grid`: four in a row (two by two on
 * tablets); `featured`: the first large, the other three in a list beside it.
 * Phones get a compact list either way.
 */
export type BlogSection = {
  type: "blog";
  id: string;
  badge: string | null;
  title: string | null;
  text: string | null;
  headerAlign: "start" | "center";
  posts: BlogPostCard[];
  layout: "grid" | "featured";
  ctas: Cta[];
  background: SectionBackground;
  width: "full" | "boxed" | "contained";
  spacing: "small" | "medium" | "large";
};

/**
 * The site's social profiles as large tiles and, with `showContact`, the
 * phone and e-mail as buttons. Those come from Site settings, not from the
 * section: one place to change them for the whole site.
 */
export type SocialSection = {
  type: "social";
  id: string;
  badge: string | null;
  title: string | null;
  text: string | null;
  layout: "split" | "centered";
  showContact: boolean;
  background: SectionBackground;
  width: "full" | "boxed" | "contained";
  spacing: "small" | "medium" | "large";
};

/**
 * Cars from RentCarSoft on the fleet cards. The CMS keeps only the choice:
 * the whole fleet, a category (passenger, delivery or popular, as marked in
 * RentCarSoft), classes or picked cars in the editor's order. `full`: every
 * car, 12 at a time with "Show more"; `grid` and `carousel`: up to `limit`
 * cars and the optional last card.
 */
export type CarsSection = {
  type: "cars";
  id: string;
  badge: string | null;
  title: string | null;
  text: string | null;
  headerAlign: "start" | "center";
  source: "all" | "category" | "classes" | "cars";
  category: "passenger" | "delivery" | "popular";
  segmentIds: number[];
  carIds: number[];
  layout: "full" | "grid" | "carousel";
  /** `null`: no limit (0 in the CMS, and always in `full`). */
  limit: number | null;
  /** The same card as a Cards section's (`parts.card`), after the cars. */
  moreCard: Card | null;
  ctas: Cta[];
  background: SectionBackground;
  width: "full" | "boxed" | "contained";
  spacing: "small" | "medium" | "large";
};

/** A Google map of the RentCarSoft pickup points that are an office, an airport or a station; the section holds only its heading and looks. */
export type MapSection = {
  type: "map";
  id: string;
  badge: string | null;
  title: string | null;
  text: string | null;
  headerAlign: "start" | "center";
  /** A searchable list of the points beside the map (above it on phones). */
  showList: boolean;
  /** The map from side to side of the section, not inside the page's width. */
  fullBleed: boolean;
  /** The legend under the map: the kinds with their counts, each a filter. */
  showLegend: boolean;
  ctas: Cta[];
  background: SectionBackground;
  width: "full" | "boxed" | "contained";
  spacing: "small" | "medium" | "large";
};

/**
 * Two columns: a photo (or a collage of two, with an optional stat badge),
 * or the pickup points map, beside the heading and one kind of content: rich text, up to 6 features or
 * up to 10 questions. Only the chosen content is read.
 */
export type SplitSection = {
  type: "split";
  id: string;
  /** The other half: a photo (or a collage of two, with an optional stat badge), or the pickup points map (the Map section's). */
  media:
    | {
        kind: "image";
        image: Media;
        /** The smaller photo of a collage; `null`: one photo. */
        imageSecond: Media | null;
        stat: { value: string; label: string | null } | null;
      }
    | { kind: "map"; legend: boolean };
  badge: string | null;
  title: string | null;
  text: string | null;
  content:
    | { kind: "text"; body: RichBlocks }
    | { kind: "features"; items: { icon: string | null; title: string; text: string | null }[] }
    | { kind: "faq"; items: { question: string; answer: RichBlocks; answerText: string }[]; structuredData: boolean }
    /** The contact form (the Form section's), in one column. */
    | { kind: "form" }
    | null;
  /** On desktops; on phones the photo is always above the text. */
  mediaSide: "start" | "end";
  ctas: Cta[];
  background: SectionBackground;
  width: "full" | "boxed" | "contained";
  spacing: "small" | "medium" | "large";
};

/** A form sent by email (`sections.form`); the fields are the chosen form's, in the code. */
export type FormSection = {
  type: "form";
  id: string;
  badge: string | null;
  title: string | null;
  text: string | null;
  headerAlign: "start" | "center";
  /** For now only the contact form (the old site's fields). */
  form: "contact";
  /** `wide`: the fields in pairs on desktops; `narrow`: one column. */
  formWidth: "narrow" | "wide";
  background: SectionBackground;
  width: "full" | "boxed" | "contained";
  spacing: "small" | "medium" | "large";
};

/** Test page only: the name and note of the variant shown under it. */
export type VariantLabelSection = { type: "variantLabel"; id: string; title: string; note: string | null };

export type Section = HeroSection | FeaturesSection | TextSection | FaqSection | CardsSection | BlogSection | SocialSection | CarsSection | MapSection | SplitSection | FormSection | VariantLabelSection;

type RawSection = NonNullable<NonNullable<PageQuery["page"]>["sections"]>[number];

export function parseSections(
  raw: readonly RawSection[],
  lang: Lang,
  routes: readonly PageRoute[],
  latestPosts: Readonly<Record<string, readonly (BlogCardFragment | null)[]>> = {},
): Section[] {
  // Anchors taken on this page, so two FAQ sections with the same group titles do not share an id.
  const anchors = new Set<string>();
  return raw.flatMap((section): Section[] => {
    switch (section?.__typename) {
      case "ComponentSectionsHero":
        return [parseHeroSection(section, lang, routes)];
      case "ComponentSectionsFeatures": {
        const features = parseFeaturesSection(section, lang, routes);
        return features ? [features] : [];
      }
      case "ComponentSectionsText": {
        const text = parseTextSection(section, lang, routes);
        return text ? [text] : [];
      }
      case "ComponentSectionsFaq": {
        const faq = parseFaqSection(section, lang, routes, anchors);
        return faq ? [faq] : [];
      }
      case "ComponentSectionsCards": {
        const cards = parseCardsSection(section, lang, routes);
        return cards ? [cards] : [];
      }
      case "ComponentSectionsBlog": {
        const blog = parseBlogSection(section, lang, routes, latestPosts[sectionPostsKey(section.id)] ?? []);
        return blog ? [blog] : [];
      }
      case "ComponentSectionsSocial":
        return [parseSocialSection(section)];
      case "ComponentSectionsCars":
        return [parseCarsSection(section, lang, routes)];
      case "ComponentSectionsMap":
        return [parseMapSection(section, lang, routes)];
      case "ComponentSectionsForm":
        return [parseFormSection(section)];
      case "ComponentSectionsSplit": {
        const split = parseSplitSection(section, lang, routes);
        return split ? [split] : [];
      }
      case "ComponentSectionsVariantLabel":
        return [{ type: "variantLabel", id: section.id, title: section.title, note: section.note || null }];
      default:
        // A component the CMS has and this build does not know yet: skipped, never an error page.
        return [];
    }
  });
}

function parseHeroSection(raw: HeroSectionFragment, lang: Lang, routes: readonly PageRoute[]): HeroSection {
  const search =
    raw.search === "none"
      ? null
      : {
          layout: raw.search,
          term: raw.searchTerm === "long" ? ("long" as const) : ("short" as const),
          side: raw.searchSide === "right" ? ("right" as const) : ("left" as const),
        };
  return {
    type: "hero",
    id: raw.id,
    badge: raw.badge || null,
    title: raw.title,
    subtitle: raw.subtitle || null,
    ctas: parseCtas(raw.ctas ?? [], lang, routes).slice(0, 2),
    image: raw.image?.url ? parseMedia(raw.image) : null,
    imageMobile: raw.imageMobile?.url ? parseMedia(raw.imageMobile) : null,
    video: raw.video?.url ? parseMedia(raw.video) : null,
    videoMobile: raw.videoMobile?.url ? parseMedia(raw.videoMobile) : null,
    overlay: raw.overlay,
    search,
    width: raw.width,
    spacing: raw.spacing,
    align: raw.align === "center" ? "center" : "start",
  };
}

function parseFeaturesSection(raw: FeaturesSectionFragment, lang: Lang, routes: readonly PageRoute[]): FeaturesSection | null {
  const items = (raw.items ?? []).flatMap((item) => (item?.title ? [{ icon: item.icon || null, title: item.title, text: item.text || null }] : [])).slice(0, 8);
  // A section with no features left is not drawn.
  if (items.length === 0) {
    return null;
  }
  return {
    type: "features",
    id: raw.id,
    badge: raw.badge || null,
    title: raw.featuresTitle || null,
    text: raw.text || null,
    headerAlign: raw.headerAlign === "start" ? "start" : "center",
    items,
    variant: raw.variant,
    display: raw.display === "carousel" ? "carousel" : "grid",
    ctas: parseCtas(raw.ctas ?? [], lang, routes).slice(0, 2),
    background: parseBackground(raw.background),
    width: raw.featuresWidth,
    spacing: raw.featuresSpacing,
  };
}

/** An image background without its image falls back to navy, the colour it is drawn on. */
function parseBackground(raw: SectionBackgroundFragment | null | undefined): SectionBackground {
  if (!raw) {
    return { tone: "white" };
  }
  if (raw.tone === "image") {
    return raw.image?.url
      ? { tone: "image", image: parseMedia(raw.image), imageMobile: raw.imageMobile?.url ? parseMedia(raw.imageMobile) : null }
      : { tone: "navy", pattern: false };
  }
  if (raw.tone === "navy" || raw.tone === "blue" || raw.tone === "green") {
    // On unless turned off (sections saved before the switch have no value).
    return { tone: raw.tone, pattern: raw.pattern !== false };
  }
  return { tone: raw.tone };
}

function parseTextSection(raw: TextSectionFragment, lang: Lang, routes: readonly PageRoute[]): TextSection | null {
  const body = parseRichBlocks(raw.body ?? "");
  const title = raw.textTitle || null;
  const ctas = parseCtas(raw.ctas ?? [], lang, routes).slice(0, 2);
  // Nothing to show: no text, title or button.
  if (body.length === 0 && !title && ctas.length === 0) {
    return null;
  }
  return {
    type: "text",
    id: raw.id,
    badge: raw.badge || null,
    title,
    body,
    align: raw.textAlign === "center" ? "center" : "start",
    textWidth: raw.textWidth === "wide" ? "wide" : "narrow",
    collapseAfter: raw.collapsible ? Math.min(10, Math.max(1, raw.previewParagraphs ?? 2)) : null,
    ctas,
    background: parseBackground(raw.background),
    width: raw.textFrameWidth,
    spacing: raw.textSpacing,
  };
}

function parseFaqSection(raw: FaqSectionFragment, lang: Lang, routes: readonly PageRoute[], used: Set<string>): FaqSection | null {
  const groups = (raw.groups ?? []).slice(0, 10).flatMap((group, index): FaqGroup[] => {
    const items = (group?.items ?? []).slice(0, 30).flatMap((item) => {
      const question = item?.question.trim();
      const answer = parseRichBlocks(item?.answer ?? "");
      return question && answer.length > 0 ? [{ question, answer, answerText: richBlocksText(answer) }] : [];
    });
    if (items.length === 0) {
      return [];
    }
    const title = group?.title?.trim() || null;
    // A readable anchor from the title (`#kaucja-i-ubezpieczenie`), numbered when it repeats or has no Latin letters.
    const base = `faq-${(title && slugWords(title)) || index + 1}`;
    let anchor = base;
    for (let n = 2; used.has(anchor); n += 1) {
      anchor = `${base}-${n}`;
    }
    used.add(anchor);
    return [{ anchor, title, icon: group?.icon || null, items }];
  });
  // No questions left: nothing to show.
  if (groups.length === 0) {
    return null;
  }
  return {
    type: "faq",
    id: raw.id,
    badge: raw.badge || null,
    title: raw.faqTitle || null,
    text: raw.faqText || null,
    headerAlign: raw.faqHeaderAlign === "start" ? "start" : "center",
    groups,
    search: raw.faqSearch === true,
    structuredData: raw.structuredData !== false,
    ctas: parseCtas(raw.ctas ?? [], lang, routes).slice(0, 2),
    textWidth: raw.faqTextWidth === "wide" ? "wide" : "narrow",
    background: parseBackground(raw.background),
    width: raw.faqWidth,
    spacing: raw.faqSpacing,
  };
}

/** A `parts.card` (a Cards section's card, the Cars section's last card); `null` without a title. */
function parseCard(card: PartCardFragment, lang: Lang, routes: readonly PageRoute[]): Card | null {
  const title = card.title.trim();
  if (!title) {
    return null;
  }
  // The card's title stands in for an empty link label: the link is the whole card.
  const target = card.link ? resolveLink(card.link, lang, routes, title) : null;
  return {
    icon: card.icon || null,
    title,
    text: card.text?.trim() || null,
    link: target ? { href: target.href, newTab: target.newTab } : null,
    background:
      card.tone === "image" && card.image?.url
        ? { tone: "image", image: parseMedia(card.image), imageMobile: card.imageMobile?.url ? parseMedia(card.imageMobile) : null }
        : { tone: card.tone === "image" ? "navy" : card.tone, pattern: card.tone !== "image" && card.pattern !== false },
  };
}

function parseCardsSection(raw: CardsSectionFragment, lang: Lang, routes: readonly PageRoute[]): CardsSection | null {
  const cards = (raw.cards ?? []).slice(0, 8).flatMap((card) => {
    const parsed = card ? parseCard(card, lang, routes) : null;
    return parsed ? [parsed] : [];
  });
  // A section with no cards left is not drawn.
  if (cards.length === 0) {
    return null;
  }
  return {
    type: "cards",
    id: raw.id,
    badge: raw.badge || null,
    title: raw.cardsTitle || null,
    text: raw.cardsText || null,
    headerAlign: raw.cardsHeaderAlign === "start" ? "start" : "center",
    cards,
    display: raw.cardsDisplay === "carousel" ? "carousel" : "grid",
    visibleCards: raw.visibleCards === 4 ? 4 : 3,
    ctas: parseCtas(raw.ctas ?? [], lang, routes).slice(0, 2),
    background: parseBackground(raw.background),
    width: raw.cardsWidth,
    spacing: raw.cardsSpacing,
  };
}

function parseBlogSection(raw: BlogSectionFragment, lang: Lang, routes: readonly PageRoute[], latest: readonly (BlogCardFragment | null)[]): BlogSection | null {
  const source = raw.blogSource === "selected" ? (raw.posts ?? []) : latest;
  const posts = source.flatMap((post) => (post?.slug ? [parseBlogCard(post, lang)] : [])).slice(0, 4);
  // No posts (none picked, or none published yet): nothing to show.
  if (posts.length === 0) {
    return null;
  }
  return {
    type: "blog",
    id: raw.id,
    badge: raw.badge || null,
    title: raw.blogTitle || null,
    text: raw.blogText || null,
    headerAlign: raw.blogHeaderAlign === "start" ? "start" : "center",
    posts,
    layout: raw.blogLayout === "featured" ? "featured" : "grid",
    ctas: parseCtas(raw.ctas ?? [], lang, routes).slice(0, 2),
    background: parseBackground(raw.background),
    width: raw.blogWidth,
    spacing: raw.blogSpacing,
  };
}

function parseSocialSection(raw: SocialSectionFragment): SocialSection {
  return {
    type: "social",
    id: raw.id,
    badge: raw.badge || null,
    title: raw.socialTitle || null,
    text: raw.socialText || null,
    layout: raw.socialLayout === "centered" ? "centered" : "split",
    showContact: raw.showContact !== false,
    background: parseBackground(raw.background),
    width: raw.socialWidth,
    spacing: raw.socialSpacing,
  };
}

/** Ids from a JSON custom field (`rcs-segments`, `rcs-cars`): positive integers only, in order, without repeats. */
function idList(value: unknown): number[] {
  return Array.isArray(value) ? [...new Set(value.filter((id): id is number => Number.isInteger(id) && id > 0))] : [];
}

function parseCarsSection(raw: CarsSectionFragment, lang: Lang, routes: readonly PageRoute[]): CarsSection {
  const layout = raw.carsLayout === "full" || raw.carsLayout === "carousel" ? raw.carsLayout : "grid";
  return {
    type: "cars",
    id: raw.id,
    badge: raw.badge || null,
    title: raw.carsTitle || null,
    text: raw.carsText || null,
    headerAlign: raw.carsHeaderAlign === "start" ? "start" : "center",
    source: raw.carsSource,
    category: raw.carsCategory === "delivery" || raw.carsCategory === "popular" ? raw.carsCategory : "passenger",
    segmentIds: idList(raw.segmentIds),
    carIds: idList(raw.carIds),
    layout,
    limit: layout === "full" || !raw.limit || raw.limit <= 0 ? null : raw.limit,
    moreCard: raw.moreCard && layout !== "full" ? parseCard(raw.moreCard, lang, routes) : null,
    ctas: parseCtas(raw.ctas ?? [], lang, routes).slice(0, 2),
    background: parseBackground(raw.background),
    width: raw.carsWidth,
    spacing: raw.carsSpacing,
  };
}

function parseMapSection(raw: MapSectionFragment, lang: Lang, routes: readonly PageRoute[]): MapSection {
  return {
    type: "map",
    id: raw.id,
    badge: raw.badge || null,
    title: raw.mapTitle || null,
    text: raw.mapText || null,
    headerAlign: raw.mapHeaderAlign === "start" ? "start" : "center",
    showList: raw.showList === true,
    fullBleed: raw.fullBleed === true,
    showLegend: raw.mapShowLegend === true,
    ctas: parseCtas(raw.ctas ?? [], lang, routes).slice(0, 2),
    background: parseBackground(raw.background),
    width: raw.mapWidth,
    spacing: raw.mapSpacing,
  };
}

function parseSplitContent(raw: SplitSectionFragment): SplitSection["content"] {
  if (raw.content === "form") {
    return { kind: "form" };
  }
  if (raw.content === "features") {
    const items = (raw.features ?? []).flatMap((item) => (item?.title ? [{ icon: item.icon || null, title: item.title, text: item.text || null }] : [])).slice(0, 6);
    return items.length > 0 ? { kind: "features", items } : null;
  }
  if (raw.content === "faq") {
    const items = (raw.faqs ?? []).slice(0, 10).flatMap((item) => {
      const question = item?.question.trim();
      const answer = parseRichBlocks(item?.answer ?? "");
      return question && answer.length > 0 ? [{ question, answer, answerText: richBlocksText(answer) }] : [];
    });
    return items.length > 0 ? { kind: "faq", items, structuredData: raw.splitStructuredData === true } : null;
  }
  const body = parseRichBlocks(raw.splitBody ?? "");
  return body.length > 0 ? { kind: "text", body } : null;
}

function parseFormSection(raw: FormSectionFragment): FormSection {
  return {
    type: "form",
    id: raw.id,
    badge: raw.badge || null,
    title: raw.formTitle || null,
    text: raw.formText || null,
    headerAlign: raw.formHeaderAlign === "center" ? "center" : "start",
    form: "contact",
    formWidth: raw.formWidth === "wide" ? "wide" : "narrow",
    background: parseBackground(raw.background),
    width: raw.formFrameWidth,
    spacing: raw.formSpacing,
  };
}

function parseSplitMedia(raw: SplitSectionFragment): SplitSection["media"] | null {
  if (raw.splitMedia === "map") {
    return { kind: "map", legend: raw.splitShowLegend === true };
  }
  if (!raw.splitImage?.url) {
    return null;
  }
  const stat = raw.statValue?.trim();
  return {
    kind: "image",
    image: parseMedia(raw.splitImage),
    imageSecond: raw.imageStyle === "collage" && raw.imageSecond?.url ? parseMedia(raw.imageSecond) : null,
    stat: stat ? { value: stat, label: raw.statLabel?.trim() || null } : null,
  };
}

function parseSplitSection(raw: SplitSectionFragment, lang: Lang, routes: readonly PageRoute[]): SplitSection | null {
  const media = parseSplitMedia(raw);
  // The photo or the map is the section's other half: without it there is nothing to stand beside the text.
  if (!media) {
    return null;
  }
  return {
    type: "split",
    id: raw.id,
    media,
    badge: raw.badge || null,
    title: raw.splitTitle || null,
    text: raw.splitText || null,
    content: parseSplitContent(raw),
    mediaSide: raw.mediaSide === "end" ? "end" : "start",
    ctas: parseCtas(raw.ctas ?? [], lang, routes).slice(0, 2),
    background: parseBackground(raw.background),
    width: raw.splitWidth,
    spacing: raw.splitSpacing,
  };
}
