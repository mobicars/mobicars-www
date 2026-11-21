import type { Lang } from "@/i18n/config";
import type { ReservationTerm } from "@/lib/reservation/search";

import type {
  BlogCardFragment,
  FaqBlockFragment,
  SectionFragment,
  SectionHeaderFragment,
  BlogPostsBlockFragment,
  CarsBlockFragment,
  ChromeQuery,
  ComparisonBlockFragment,
  ContactBlockFragment,
  ContentBlockFragment,
  CtaBandBlockFragment,
  CtaFragment,
  FeaturesBlockFragment,
  HeroBlockFragment,
  LatestPostsQuery,
  LeadFormBlockFragment,
  LinkFragment,
  LocationsBlockFragment,
  LogosBlockFragment,
  MediaFragment,
  MediaTextBlockFragment,
  PageQuery,
  PartCtaFragment,
  PartLinkFragment,
  ReviewsBlockFragment,
  ReviewsQuery,
  SectionReviewFragment,
  ScenariosBlockFragment,
  SeoFragment,
  TrustBarBlockFragment,
  DepartmentFragment,
  PromoCardsBlockFragment,
} from "../generated/graphql";
import { strapiUrl } from "./config";
import { parseRichBlocks, richBlocksText, type RichBlocks } from "./rich-blocks";
import { parseSections, reviewsLimit, type Section } from "./sections";
import { blogHref, pageHref, type PageRoute } from "./routes";
import { safeUrl } from "./url";

export type Media = {
  /** Absolute URL. */
  url: string;
  mime: string;
  width: number | null;
  height: number | null;
  /** Empty when the editor left it out: the image is then decorative. */
  alt: string;
};

export type NavLink = {
  label: string;
  href: string;
  /** Only external links (`customUrl`) open in a new tab. */
  newTab: boolean;
};

export type CtaVariant = "primary" | "secondary" | "success";

export type Cta = NavLink & {
  variant: CtaVariant;
  /** Lucide icon name in kebab case (`arrow-right`), from strapi-lucide-icons. */
  icon: string | null;
};

type HeroBase = {
  type: "hero";
  id: string;
  badge: string | null;
  title: string;
  subtitle: string | null;
  ctas: Cta[];
  imageMobile: Media | null;
  video: Media | null;
  overlay: "none" | "light" | "medium" | "strong";
  height: "compact" | "default" | "fullscreen";
  /**
   * `null` when the hero has no booking form. Strapi's `reservationLayout`
   * `none | default | horizontal` maps to `null | vertical | horizontal`
   * (`default` is the vertical card beside the copy). The search's start
   * point is the page's (`Page.pickupId`), not the hero's.
   */
  reservation: {
    layout: "vertical" | "horizontal";
    defaultTerm: ReservationTerm;
  } | null;
  /** Which side the booking form stands on, on desktops. */
  searchSide: "start" | "end";
  /** The part of the photo to keep in view when it is cropped. */
  focalPoint: "left" | "center" | "right";
  /** Rating, figures and claims under the form; `null`: none. */
  trust: TrustBarBlock | null;
  /** Short advantages under the subtitle (at most 4). */
  highlights: { icon: string | null; text: string }[];
  /** The last breadcrumb instead of the page title (`page` layout). */
  breadcrumbLabel: string | null;
};

/**
 * `cover`: image behind the text; `split`: text beside the image; `page`:
 * the low dark hero of an inner page, with breadcrumbs (no booking form).
 * Only `page` may go without a photo: a `cover` or `split` hero without one
 * is left out of the page.
 */
export type HeroBlock = HeroBase & ({ layout: "cover" | "split"; image: Media } | { layout: "page"; image: Media | null });

export type BlogPostCard = {
  id: string;
  title: string;
  /** `/pl/blog/{slug}` (`blogHref`). */
  href: string;
  excerpt: string | null;
  category: string | null;
  /** The category's colour (`blog-category.color`), a design token, never a hex. */
  categoryColor: "blue" | "green" | "navy" | "sand" | null;
  /**
   * ISO date the post was first created (`createdAt`). Strapi resets
   * `publishedAt` on every publish, so an edit or a migration would make every
   * post look published today; `publishedAt` is used only when `createdAt` is missing.
   */
  publishedAt: string | null;
  image: Media | null;
};

export type BlogPostsBlock = {
  type: "blogPosts";
  id: string;
  badge: string | null;
  title: string;
  subtitle: string | null;
  cta: Cta | null;
  /** Never empty: a block with no post to show is left out of the page. */
  posts: BlogPostCard[];
};

export type FeatureItem = {
  /** Lucide icon name in kebab case; the image wins when both are set. */
  icon: string | null;
  image: Media | null;
  title: string;
  text: string | null;
  /** The link's label may be empty in Strapi: the item's title stands in. */
  link: NavLink | null;
  /** The card's look in the `overlay` variant: a photo, or a brand colour with line art. */
  tone: "photo" | "brand" | "go" | "studio";
  /** A separate crop for phones (`overlay`). */
  imageMobile: Media | null;
};

export type FeaturesBlock = {
  type: "features";
  id: string;
  title: string | null;
  /** `photo`: cards led by a photo; `steps`: numbered steps; `overlay`: tall photo tiles; `benefits`: a short row of advantages. */
  variant: "plain" | "cards" | "circles" | "photo" | "steps" | "overlay" | "benefits";
  /** Never empty: a block with no item is left out of the page. */
  items: FeatureItem[];
};

/**
 * The band behind a block (`elements.section`), with the CMS defaults when the
 * editor left it empty. Values match `components/ui/section.tsx`.
 */
export type SectionStyle = {
  tone: "canvas" | "surface" | "tint" | "dark";
  spacing: "default" | "compact" | "none";
  width: "page" | "reading" | "full";
  /** `id` of the section for `#anchor` links. */
  anchor: string | null;
  /** Over the tone: a gradient wash, a photo (only with `backgroundImage`) or the brand colour. */
  background: "none" | "wash" | "photo" | "brand";
  backgroundImage: Media | null;
  backgroundImageMobile: Media | null;
  /** Line art over `brand` backgrounds and brand cards. */
  ornament: "none" | "road" | "contour" | "grid";
};

export const DEFAULT_SECTION: SectionStyle = {
  tone: "canvas",
  spacing: "default",
  width: "page",
  anchor: null,
  background: "none",
  backgroundImage: null,
  backgroundImageMobile: null,
  ornament: "none",
};

/** `elements.section-header`; empty strings are `null`. The site picks the heading level. */
export type SectionHeading = {
  eyebrow: string | null;
  title: string | null;
  lead: string | null;
};

/** `faq-category` entry, for grouping questions. */
export type FaqCategory = {
  id: string;
  name: string;
  slug: string;
  /** Lucide icon name in kebab case. */
  icon: string | null;
  order: number;
};

export type FaqItem = {
  question: string;
  answer: RichBlocks;
  /** The answer as plain text, for the FAQPage JSON-LD. */
  answerText: string;
  /** `null`: the "other" group. */
  category: FaqCategory | null;
};

export type FaqBlock = SectionHeading & {
  type: "faq";
  id: string;
  /** Emit FAQPage JSON-LD. Only one per page counts for Google. */
  structuredData: boolean;
  /** Show the questions under their categories (`faqGroups`). */
  groupByCategory: boolean;
  /** "More questions" link under the list. */
  cta: NavLink | null;
  section: SectionStyle;
  /** Never empty: questions without an answer are dropped, and then a block with none. */
  items: FaqItem[];
};

/** Heading, rich text and buttons. */
export type ContentBlock = SectionHeading & {
  type: "content";
  id: string;
  body: RichBlocks;
  align: "start" | "center";
  ctas: Cta[];
  section: SectionStyle;
  /**
   * Long SEO text: the first `previewParagraphs` blocks of `body` stay open, the
   * rest folds into a `<details>` whose summary is `label` (`null`: the site's
   * "Read more"). `null`: the whole text is open.
   */
  collapsible: { previewParagraphs: number; label: string | null } | null;
};

/** An image beside a heading, rich text and buttons. */
export type MediaTextBlock = SectionHeading & {
  type: "mediaText";
  id: string;
  body: RichBlocks;
  image: Media;
  /** `start`: the image comes first (left on desktops, above on phones). */
  imagePosition: "start" | "end";
  /** `cutout`: a transparent PNG (a car) without a frame, reaching into the next section. */
  imageStyle: "rounded" | "cutout";
  ctas: Cta[];
  section: SectionStyle;
};

/** One entry of the Strapi `rating` collection. */
export type Review = {
  id: string;
  author: string;
  /** 1–5. */
  rating: number;
  text: string;
  /** ISO date (`2026-05-14`). */
  date: string;
  /** As stored (`Google`). */
  source: string;
};

export type ReviewsBlock = SectionHeading & {
  type: "reviews";
  id: string;
  /** Newest first, at most the block's limit. Never empty. */
  reviews: Review[];
  /** Over every published review of the block's source, not only the shown ones; `null` when hidden. */
  summary: RatingSummary | null;
  /** `spotlight`: one review at a time over a photo. */
  layout: "cards" | "spotlight";
  section: SectionStyle;
};

/**
 * Average (one decimal) and count of the published reviews. `source`: where
 * they all come from ("Google"); `null` when they mix sources.
 */
export type RatingSummary = {
  average: number;
  count: number;
  source: string | null;
};

/**
 * Pickup points (`blocks.locations`). Only the choice lives in the CMS: the
 * points, phones, fees and coordinates come from RentCarSoft, so the list
 * cannot drift from what can be booked.
 */
export type LocationsBlock = SectionHeading & {
  type: "locations";
  id: string;
  section: SectionStyle;
  /** `all` points, only `airports`, or one `city` (RentCarSoft's town, e.g. "Kraków"). */
  filter: "all" | "airports" | "city";
  /** Set only with `filter: "city"`; compared without letter case. `null`: the town of the page's pickup point. */
  city: string | null;
  /** A "Map" link per point to Google Maps (no embedded map, no script). */
  showMap: boolean;
  /** `full`: every town's card; `compact`: town pills and a fold per town (catalog C14); `map`: the folds beside a map of the towns (C24). */
  layout: "full" | "compact" | "map";
};

export type Scenario = {
  /** Short tab name. */
  label: string;
  title: string;
  /** Who it is for. */
  audience: string | null;
  text: string | null;
  benefits: string[];
  image: Media | null;
  /** A separate crop for phones (`panel`). */
  imageMobile: Media | null;
  cta: NavLink | null;
};

/** Use cases as tabs. Never empty. */
export type ScenariosBlock = SectionHeading & {
  type: "scenarios";
  id: string;
  /** `tabs`: tabs over cards; `panel`: one navy panel with a photo, the tabs under it on desktops. */
  layout: "tabs" | "panel";
  items: Scenario[];
  section: SectionStyle;
};

/** `text` with `null` text is an empty cell; `yes`/`no`/`partial` may carry a short note. */
export type ComparisonValue = {
  kind: "yes" | "no" | "partial" | "text";
  text: string | null;
};

export type ComparisonBlock = SectionHeading & {
  type: "comparison";
  id: string;
  columns: { label: string; highlighted: boolean }[];
  /** Every row has exactly one value per column: missing cells are empty, extra ones dropped. */
  rows: { criterion: string; values: ComparisonValue[] }[];
  footnote: string | null;
  section: SectionStyle;
};

export type CarsCategory = "electric" | "delivery" | "family" | "automatic";

/** A tab of `cars.layout = tabs`: RentCarSoft's categories, plus 7+ seats from the seat count. */
export type CarsTab = "all" | "small" | "compact" | "large" | "eco" | "delivery" | "seats7";

/** Car classes with prices from RentCarSoft; the component reads the fleet. */
export type CarsBlock = SectionHeading & {
  type: "cars";
  id: string;
  section: SectionStyle;
  source: "all" | "classes" | "category";
  /** RCS segment ids for `classes`; non-numbers are dropped. */
  segmentIds: readonly number[];
  category: CarsCategory | null;
  /** `null`: all. */
  limit: number | null;
  /**
   * `grid` / `row` of car cards; `categories`: one tile per car class with its
   * photo and "from" price; `catalog`: the whole fleet listing with filters (`/pl/flota`);
   * `tabs`: category tabs over a row of cars (catalog C18).
   */
  layout: "grid" | "row" | "categories" | "catalog" | "tabs";
  /** The tab open first with `tabs`: every car, a RentCarSoft category or 7+ seats. */
  defaultCategory: CarsTab;
  /** Only cars with an active RentCarSoft promotion (the promotions page); an empty list shows an empty state. */
  onlyPromotions: boolean;
  /** `null`: the component links to the fleet. */
  cta: NavLink | null;
};

export type LogosBlock = SectionHeading & {
  type: "logos";
  id: string;
  /** Never empty. */
  items: { name: string; image: Media }[];
  section: SectionStyle;
};

/** Enquiry form. Phone and e-mail come from `Chrome.contact`, not from the block. */
export type LeadFormBlock = SectionHeading & {
  type: "leadForm";
  id: string;
  variant: "business" | "contact";
  contactTitle: string | null;
  contactText: string | null;
  /** "What happens next", in order. */
  steps: string[];
  consent: RichBlocks;
  successTitle: string;
  successText: string | null;
  section: SectionStyle;
};

/** Closing call to action. Left out when its primary link has nowhere to go. */
export type CtaBandBlock = {
  type: "ctaBand";
  id: string;
  title: string;
  text: string | null;
  primary: NavLink;
  secondary: NavLink | null;
  /** Ignored by the `photo` variant. */
  tone: "dark" | "tint";
  /** `photo`: a rounded photo card; only with `image`, otherwise `band`. */
  variant: "band" | "photo";
  eyebrow: string | null;
  image: Media | null;
  imageMobile: Media | null;
  /** A cut-out mockup (phones) beside the text. */
  media: Media | null;
  /** App Store and Google Play badges (`Chrome.appStoreUrl`, `googlePlayUrl`). */
  showStoreBadges: boolean;
};

/** A figure the site counts from RentCarSoft. */
export type TrustStat = "points" | "cities" | "airports";

/**
 * Social proof: the rating of the published reviews, figures and short claims.
 * Also inside the hero (`HeroBlock.trust`). Left out when it has nothing to show.
 */
export type TrustBarBlock = {
  type: "trustBar";
  id: string;
  variant: "inline" | "strip";
  /** `null` when hidden or when there is no review. */
  rating: RatingSummary | null;
  /** Without repeats, at most 3. */
  stats: TrustStat[];
  /** At most 4. */
  claims: { icon: string | null; text: string }[];
};

/** A team or line on the contact page. */
export type Department = {
  name: string;
  text: string | null;
  phone: string | null;
  /** `tel:+48…`; `null` without a phone. */
  phoneHref: string | null;
  email: string | null;
  /** Free text ("24/7", "pn–pt 8–16"). */
  hours: string | null;
  /** Hours as rows, for `formatOpeningHours`; empty when only `hours` is filled. */
  schedule: OpeningHours[];
  /** One of the contact tiles above the footer (at most 4, in CMS order). */
  showInFooter: boolean;
  link: NavLink | null;
};

/** The contact page: company data (`Chrome.contact`), departments and the form's topics. */
export type ContactBlock = SectionHeading & {
  type: "contact";
  id: string;
  /** Show the registration data and address of `Chrome.contact`. */
  showCompany: boolean;
  image: Media | null;
  /** Choices of the form's "topic" field. */
  topics: string[];
  /** The block's own list; empty: show `Chrome.contact.departments` (the single source). */
  departments: Department[];
  section: SectionStyle;
};

/** One promotion card. Only cards valid today reach the page. */
export type PromoCard = {
  title: string;
  text: string | null;
  /** Discount code to show (and copy). */
  code: string | null;
  /** `YYYY-MM-DD`, inclusive, Polish time; `null`: open. */
  validFrom: string | null;
  validUntil: string | null;
  /** `photo` only with an image, otherwise `brand`. */
  tone: "photo" | "brand" | "go";
  image: Media | null;
  imageMobile: Media | null;
  link: NavLink | null;
  /** The promotion's terms. */
  terms: NavLink | null;
};

/** 1–3 promotion cards; left out when none is valid today. */
export type PromoCardsBlock = SectionHeading & {
  type: "promoCards";
  id: string;
  items: PromoCard[];
  section: SectionStyle;
};

/** Every block a page can hold. Add a type here and a case in `components/blocks`. */
export type Block =
  | HeroBlock
  | ContentBlock
  | MediaTextBlock
  | FeaturesBlock
  | ScenariosBlock
  | ComparisonBlock
  | CarsBlock
  | FaqBlock
  | ReviewsBlock
  | LocationsBlock
  | LogosBlock
  | BlogPostsBlock
  | LeadFormBlock
  | CtaBandBlock
  | TrustBarBlock
  | ContactBlock
  | PromoCardsBlock;

export type Page = {
  documentId: string;
  title: string;
  seo: {
    title: string | null;
    description: string | null;
    noIndex: boolean;
    noFollow: boolean;
    /** Open Graph image for link previews; `null` uses the hero photo or the site's default. */
    image: Media | null;
  };
  blocks: Block[];
  /** The new component set (`sections.ts`); when there are any, the page shows them instead of `blocks`. */
  sections: Section[];
  /**
   * The page's RentCarSoft pickup point (`pickupPoint` of city and local pages):
   * where the booking search starts and whose cars and town the page shows.
   * `null` for other pages and for places without a point.
   */
  pickupId: number | null;
  /**
   * When a promotion card appears or disappears next (ISO); `null`: never.
   * A cached page must not outlive it.
   */
  changesAt: string | null;
};

/** A CMS page, or a city / local page with its `pickupPoint` (those have no `sections` zone yet). */
type RawPage = Omit<NonNullable<PageQuery["page"]>, "sections"> &
  Partial<Pick<NonNullable<PageQuery["page"]>, "sections">> & { pickupPoint?: number | null };

/**
 * Maps the GraphQL page. `routes` are the page URLs of `lang`, for links to
 * other pages. `latestPosts` holds, per `blocks.blog-posts` block id with
 * `source: latest`, the posts read for it (`latestPostQueries`); `reviews` the
 * `rating` collection when the page shows reviews (`pageNeedsReviews`).
 */
export function parsePage(
  raw: RawPage,
  lang: Lang,
  routes: readonly PageRoute[],
  latestPosts: Readonly<Record<string, readonly (BlogCardFragment | null)[]>> = {},
  reviews: ReviewsQuery["ratings"] = [],
  now: Date = new Date(),
  latestReviews: Readonly<Record<string, readonly (SectionReviewFragment | null)[]>> = {},
): Page {
  return {
    documentId: raw.documentId,
    title: raw.title,
    seo: {
      title: raw.seo?.metaTitle || null,
      description: raw.seo?.metaDescription || null,
      noIndex: raw.seo?.noIndex ?? false,
      noFollow: raw.seo?.noFollow ?? false,
      image: raw.seo?.shareImage ? parseMedia(raw.seo.shareImage) : null,
    },
    blocks: parseBlocks(raw.blocks ?? [], lang, routes, latestPosts, reviews, now),
    sections: parseSections(raw.sections ?? [], lang, routes, latestPosts, latestReviews),
    pickupId: raw.pickupPoint && raw.pickupPoint > 0 ? raw.pickupPoint : null,
    changesAt: nextPromoChange(raw, now)?.toISOString() ?? null,
  };
}

function parseBlocks(
  raw: NonNullable<RawPage["blocks"]>,
  lang: Lang,
  routes: readonly PageRoute[],
  latestPosts: Readonly<Record<string, readonly (BlogCardFragment | null)[]>>,
  reviews: ReviewsQuery["ratings"],
  now: Date,
): Block[] {
  return raw.flatMap((block): Block[] => {
    // `Error` is Strapi's member for a component it could not resolve; a new
    // block type the site does not know yet is skipped the same way.
    let parsed: Block | null = null;
    switch (block?.__typename) {
      case "ComponentBlocksHero":
        parsed = parseHero(block, lang, routes, reviews);
        break;
      case "ComponentBlocksContent":
        parsed = parseContent(block, lang, routes);
        break;
      case "ComponentBlocksMediaText":
        parsed = parseMediaText(block, lang, routes);
        break;
      case "ComponentBlocksFeatures":
        parsed = parseFeatures(block, lang, routes);
        break;
      case "ComponentBlocksFaq":
        parsed = parseFaq(block, lang, routes);
        break;
      case "ComponentBlocksReviews":
        parsed = parseReviews(block, reviews);
        break;
      case "ComponentBlocksLocations":
        parsed = parseLocations(block);
        break;
      case "ComponentBlocksBlogPosts":
        parsed = parseBlogPosts(block, lang, routes, latestPosts[block.id] ?? []);
        break;
      case "ComponentBlocksScenarios":
        parsed = parseScenarios(block, lang, routes);
        break;
      case "ComponentBlocksComparison":
        parsed = parseComparison(block);
        break;
      case "ComponentBlocksCars":
        parsed = parseCars(block, lang, routes);
        break;
      case "ComponentBlocksLogos":
        parsed = parseLogos(block);
        break;
      case "ComponentBlocksLeadForm":
        parsed = parseLeadForm(block);
        break;
      case "ComponentBlocksCtaBand":
        parsed = parseCtaBand(block, lang, routes);
        break;
      case "ComponentBlocksTrustBar":
        parsed = parseTrustBar(block, reviews);
        break;
      case "ComponentBlocksContact":
        parsed = parseContact(block, lang, routes);
        break;
      case "ComponentBlocksPromoCards":
        parsed = parsePromoCards(block, lang, routes, now);
        break;
    }
    return parsed ? [parsed] : [];
  });
}

/** Whether `parsePage` needs the `rating` collection for this page. */
export function pageNeedsReviews(raw: RawPage): boolean {
  return (raw.blocks ?? []).some(
    (block) =>
      block?.__typename === "ComponentBlocksReviews" ||
      (block?.__typename === "ComponentBlocksTrustBar" && block.showRating !== false) ||
      (block?.__typename === "ComponentBlocksHero" && block.trust != null && block.trust.showRating !== false),
  );
}

/** The most posts one request reads: the CMS's GraphQL `maxLimit`. */
const ALL_POSTS = 1000;

/** The `latest` blocks of a page: what to read for each before `parsePage`. */
export function latestPostQueries(raw: RawPage): { blockId: string; limit: number; categoryId: string | null }[] {
  // The new Blog sections, under their own key (`sectionPostsKey`): the four newest, or every post (`all`, the CMS's GraphQL maximum).
  const sections = (raw.sections ?? []).flatMap((section) =>
    section?.__typename === "ComponentSectionsBlog" && (section.blogSource === "latest" || section.blogSource === "all")
      ? [{ blockId: sectionPostsKey(section.id), limit: section.blogSource === "all" ? ALL_POSTS : 4, categoryId: null }]
      : [],
  );
  return [...sections, ...latestBlockQueries(raw)];
}

/** The Reviews sections showing the newest reviews: what to read for each (in the page's language) before `parsePage`. */
export function latestReviewQueries(raw: RawPage): { sectionId: string; limit: number }[] {
  return (raw.sections ?? []).flatMap((section) =>
    section?.__typename === "ComponentSectionsReviews" && section.reviewsSource === "latest" ? [{ sectionId: section.id, limit: reviewsLimit(section) }] : [],
  );
}

/** The key of a Blog section's newest posts among `latestPosts` (block ids could repeat a section's). */
export function sectionPostsKey(id: string): string {
  return `section-${id}`;
}

function latestBlockQueries(raw: RawPage): { blockId: string; limit: number; categoryId: string | null }[] {
  return (raw.blocks ?? []).flatMap((block) =>
    block?.__typename === "ComponentBlocksBlogPosts" && block.source === "latest"
      ? [
          {
            blockId: block.id,
            limit: block.limit ?? 4,
            categoryId: block.category?.documentId ?? null,
          },
        ]
      : [],
  );
}

function parseBlogPosts(
  raw: BlogPostsBlockFragment,
  lang: Lang,
  routes: readonly PageRoute[],
  latest: readonly (BlogCardFragment | null)[],
): BlogPostsBlock | null {
  const source = raw.source === "picked" ? (raw.posts ?? []) : latest;
  const posts = source.flatMap((post) => (post ? [parseBlogCard(post, lang)] : []));
  if (posts.length === 0) {
    return null;
  }
  return {
    type: "blogPosts",
    id: raw.id,
    badge: raw.badge?.trim() || null,
    title: raw.title,
    subtitle: raw.subtitle?.trim() || null,
    cta: raw.cta ? parseCta(raw.cta, lang, routes) : null,
    posts,
  };
}

function parseFeatures(raw: FeaturesBlockFragment, lang: Lang, routes: readonly PageRoute[]): FeaturesBlock | null {
  const items = (raw.items ?? []).flatMap((item): FeatureItem[] =>
    item
      ? [
          {
            icon: item.icon || null,
            image: item.image ? parseMedia(item.image) : null,
            title: item.title,
            text: item.text?.trim() || null,
            link: item.link ? resolveLink(item.link, lang, routes, item.title) : null,
            tone: item.tone ?? "photo",
            imageMobile: item.imageMobile ? parseMedia(item.imageMobile) : null,
          },
        ]
      : [],
  );
  if (items.length === 0) {
    return null;
  }
  return {
    type: "features",
    id: raw.id,
    title: raw.heading?.trim() || null,
    variant: raw.variant,
    items,
  };
}

export function parseCtas(raw: readonly (CtaFragment | PartCtaFragment | null)[] | null, lang: Lang, routes: readonly PageRoute[]): Cta[] {
  return (raw ?? []).flatMap((cta) => {
    const parsed = cta ? parseCta(cta, lang, routes) : null;
    return parsed ? [parsed] : [];
  });
}

/** Left out when it has neither a heading, text nor a button. */
function parseContent(raw: ContentBlockFragment, lang: Lang, routes: readonly PageRoute[]): ContentBlock | null {
  const heading = parseSectionHeading(raw.header);
  const body = parseRichBlocks(raw.body);
  const ctas = parseCtas(raw.ctas, lang, routes);
  if (!heading.title && !heading.lead && body.length === 0 && ctas.length === 0) {
    return null;
  }
  return {
    type: "content",
    id: raw.id,
    ...heading,
    body,
    align: raw.align === "center" ? "center" : "start",
    ctas,
    section: parseSection(raw.section),
    collapsible: raw.collapsible
      ? {
          previewParagraphs: Math.max(1, raw.previewParagraphs ?? 2),
          label: raw.collapsedLabel?.trim() || null,
        }
      : null,
  };
}

/** Left out without an image (a deleted upload). */
function parseMediaText(raw: MediaTextBlockFragment, lang: Lang, routes: readonly PageRoute[]): MediaTextBlock | null {
  if (!raw.image) {
    return null;
  }
  return {
    type: "mediaText",
    id: raw.id,
    ...parseSectionHeading(raw.header),
    body: parseRichBlocks(raw.body),
    image: parseMedia(raw.image),
    imagePosition: raw.imagePosition === "end" ? "end" : "start",
    imageStyle: raw.imageStyle === "cutout" ? "cutout" : "rounded",
    ctas: parseCtas(raw.ctas, lang, routes),
    section: parseSection(raw.section),
  };
}

function parseReviews(raw: ReviewsBlockFragment, all: ReviewsQuery["ratings"]): ReviewsBlock | null {
  return buildReviews({
    id: raw.id,
    heading: parseSectionHeading(raw.header),
    source: raw.reviewSource ?? "all",
    limit: raw.limit ?? 9,
    showSummary: raw.showSummary ?? true,
    layout: raw.reviewsLayout === "spotlight" ? "spotlight" : "cards",
    section: parseSection(raw.section),
    all,
  });
}

/** Left out when no review matches. */
function buildReviews(options: {
  id: string;
  heading: SectionHeading;
  source: "all" | "google" | "facebook";
  limit: number;
  showSummary: boolean;
  layout: ReviewsBlock["layout"];
  section: SectionStyle;
  all: ReviewsQuery["ratings"];
}): ReviewsBlock | null {
  const matching = parseRatings(options.all, options.source);
  if (matching.length === 0) {
    return null;
  }
  return {
    type: "reviews",
    id: options.id,
    ...options.heading,
    // Newest first even if the query order changes.
    reviews: matching.toSorted((a, b) => b.date.localeCompare(a.date)).slice(0, options.limit),
    summary: options.showSummary ? ratingSummary(matching) : null,
    layout: options.layout,
    section: options.section,
  };
}

/** Reviews with text, of one source (`all`: every source). */
function parseRatings(all: ReviewsQuery["ratings"], source: "all" | "google" | "facebook"): Review[] {
  return all.flatMap((raw): Review[] => {
    const text = raw?.text.trim();
    if (!raw || !text || (source !== "all" && raw.source.trim().toLowerCase() !== source)) {
      return [];
    }
    return [
      {
        id: raw.documentId,
        author: raw.name.trim(),
        rating: Math.min(5, Math.max(1, Math.round(raw.rate))),
        text,
        date: String(raw.date),
        source: raw.source.trim(),
      },
    ];
  });
}

function ratingSummary(reviews: readonly Review[]): RatingSummary | null {
  if (reviews.length === 0) {
    return null;
  }
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const sources = new Set(reviews.map((review) => review.source.toLowerCase()));
  return {
    average: Math.round(average * 10) / 10,
    count: reviews.length,
    source: sources.size === 1 ? reviews[0].source : null,
  };
}

function texts(raw: readonly ({ text: string } | null)[] | null): string[] {
  return (raw ?? []).flatMap((item) => (item?.text.trim() ? [item.text.trim()] : []));
}

function parseScenarios(raw: ScenariosBlockFragment, lang: Lang, routes: readonly PageRoute[]): ScenariosBlock | null {
  const items = (raw.items ?? []).flatMap((item): Scenario[] =>
    item
      ? [
          {
            label: item.label.trim(),
            title: item.title.trim(),
            audience: item.audience?.trim() || null,
            text: item.text?.trim() || null,
            benefits: texts(item.benefits),
            image: item.image ? parseMedia(item.image) : null,
            imageMobile: item.imageMobile ? parseMedia(item.imageMobile) : null,
            cta: item.cta ? resolveLink(item.cta, lang, routes) : null,
          },
        ]
      : [],
  );
  if (items.length === 0) {
    return null;
  }
  return {
    type: "scenarios",
    id: raw.id,
    ...parseSectionHeading(raw.header),
    layout: raw.scenariosLayout === "panel" ? "panel" : "tabs",
    items,
    section: parseSection(raw.section),
  };
}

function parseComparison(raw: ComparisonBlockFragment): ComparisonBlock | null {
  const columns = (raw.columns ?? []).flatMap((column) =>
    column
      ? [
          {
            label: column.label.trim(),
            highlighted: column.highlighted ?? false,
          },
        ]
      : [],
  );
  const rows = (raw.rows ?? []).flatMap((row) => {
    if (!row) {
      return [];
    }
    const values = columns.map((_, index): ComparisonValue => {
      const value = row.values?.[index];
      return value ? { kind: value.kind, text: value.text?.trim() || null } : { kind: "text", text: null };
    });
    return [{ criterion: row.criterion.trim(), values }];
  });
  if (columns.length === 0 || rows.length === 0) {
    return null;
  }
  return {
    type: "comparison",
    id: raw.id,
    ...parseSectionHeading(raw.header),
    columns,
    rows,
    footnote: raw.footnote?.trim() || null,
    section: parseSection(raw.section),
  };
}

function parseCars(raw: CarsBlockFragment, lang: Lang, routes: readonly PageRoute[]): CarsBlock {
  const ids: unknown[] = Array.isArray(raw.segmentIds) ? raw.segmentIds : [];
  return {
    type: "cars",
    id: raw.id,
    ...parseSectionHeading(raw.header),
    section: parseSection(raw.section),
    source: raw.carsSource,
    segmentIds: ids.flatMap((id) => (typeof id === "number" && Number.isInteger(id) ? [id] : [])),
    category: raw.carsCategory ?? null,
    limit: raw.limit && raw.limit > 0 ? raw.limit : null,
    layout: raw.carsLayout,
    defaultCategory: raw.defaultCategory ?? "all",
    onlyPromotions: raw.onlyPromotions === true,
    cta: raw.carsCta ? resolveLink(raw.carsCta, lang, routes) : null,
  };
}

/**
 * A city filter without a city takes the town of the page's pickup point
 * (`Page.pickupId`, resolved by the component from RentCarSoft).
 */
function parseLocations(raw: LocationsBlockFragment): LocationsBlock {
  const city = raw.city?.trim() || null;
  return {
    type: "locations",
    id: raw.id,
    ...parseSectionHeading(raw.header),
    section: parseSection(raw.section),
    filter: raw.locationsFilter,
    city: raw.locationsFilter === "city" ? city : null,
    showMap: raw.showMap ?? true,
    layout: raw.locationsLayout === "compact" || raw.locationsLayout === "map" ? raw.locationsLayout : "full",
  };
}

function parseLogos(raw: LogosBlockFragment): LogosBlock | null {
  const items = (raw.logos ?? []).flatMap((item) => (item?.image ? [{ name: item.name.trim(), image: parseMedia(item.image) }] : []));
  if (items.length === 0) {
    return null;
  }
  return {
    type: "logos",
    id: raw.id,
    ...parseSectionHeading(raw.header),
    items,
    section: parseSection(raw.section),
  };
}

function parseLeadForm(raw: LeadFormBlockFragment): LeadFormBlock {
  return {
    type: "leadForm",
    id: raw.id,
    ...parseSectionHeading(raw.header),
    variant: raw.formVariant,
    contactTitle: raw.contactTitle?.trim() || null,
    contactText: raw.contactText?.trim() || null,
    steps: texts(raw.steps),
    consent: parseRichBlocks(raw.consent),
    successTitle: raw.successTitle.trim(),
    successText: raw.successText?.trim() || null,
    section: parseSection(raw.section),
  };
}

function parseCtaBand(raw: CtaBandBlockFragment, lang: Lang, routes: readonly PageRoute[]): CtaBandBlock | null {
  const primary = raw.primary ? resolveLink(raw.primary, lang, routes) : null;
  if (!primary) {
    return null;
  }
  return {
    type: "ctaBand",
    id: raw.id,
    title: raw.title.trim(),
    text: raw.text?.trim() || null,
    primary,
    secondary: raw.secondary ? resolveLink(raw.secondary, lang, routes) : null,
    tone: raw.tone,
    variant: raw.ctaVariant === "photo" && raw.ctaImage ? "photo" : "band",
    eyebrow: raw.eyebrow?.trim() || null,
    image: raw.ctaImage ? parseMedia(raw.ctaImage) : null,
    imageMobile: raw.ctaImageMobile ? parseMedia(raw.ctaImageMobile) : null,
    media: raw.media ? parseMedia(raw.media) : null,
    showStoreBadges: raw.showStoreBadges === true,
  };
}

const TRUST_STATS: readonly TrustStat[] = ["points", "cities", "airports"];

function parseTrustBar(raw: TrustBarBlockFragment, reviews: ReviewsQuery["ratings"]): TrustBarBlock | null {
  const rating = raw.showRating === false ? null : ratingSummary(parseRatings(reviews, "all"));
  const stats = [...new Set((raw.stats ?? []).flatMap((stat) => (stat && TRUST_STATS.includes(stat.kind) ? [stat.kind] : [])))].slice(0, 3);
  const claims = (raw.claims ?? [])
    .flatMap((item) => (item?.text.trim() ? [{ icon: item.icon || null, text: item.text.trim() }] : []))
    .slice(0, 4);
  if (!rating && stats.length === 0 && claims.length === 0) {
    return null;
  }
  return {
    type: "trustBar",
    id: raw.id,
    variant: raw.trustVariant === "inline" ? "inline" : "strip",
    rating,
    stats,
    claims,
  };
}

function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

function parseContact(raw: ContactBlockFragment, lang: Lang, routes: readonly PageRoute[]): ContactBlock {
  return {
    type: "contact",
    id: raw.id,
    ...parseSectionHeading(raw.header),
    showCompany: raw.showCompany ?? true,
    image: raw.contactImage ? parseMedia(raw.contactImage) : null,
    topics: texts(raw.formTopics),
    departments: parseDepartments(raw.departments, lang, routes),
    section: parseSection(raw.section),
  };
}

function parseDepartments(
  raw: readonly (DepartmentFragment | null)[] | null | undefined,
  lang: Lang,
  routes: readonly PageRoute[],
): Department[] {
  return (raw ?? []).flatMap((item): Department[] => {
    const name = item?.name.trim();
    if (!item || !name) {
      return [];
    }
    const phone = item.phone?.trim() || null;
    return [
      {
        name,
        text: item.text?.trim() || null,
        phone,
        phoneHref: phone ? phoneHref(phone) : null,
        email: item.email?.trim() || null,
        hours: item.hours?.trim() || null,
        schedule: parseOpeningHours(item.schedule),
        showInFooter: item.showInFooter === true,
        link: item.link ? resolveLink(item.link, lang, routes) : null,
      },
    ];
  });
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** The instant a Polish calendar day (`YYYY-MM-DD`) starts. */
function polishMidnight(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const guess = Date.UTC(year, month - 1, day);
  // Poland is UTC+1 or UTC+2: read the wall clock there at `guess` and shift by the difference.
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Warsaw",
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(new Date(guess))
      .map((part) => [part.type, part.value]),
  );
  const wall = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
  return new Date(guess - (wall - guess));
}

/** `[start, end)` of a card's dates; an open side is `null`. `validUntil` counts the whole day. */
function promoWindow(item: { validFrom?: unknown; validUntil?: unknown }): {
  start: Date | null;
  end: Date | null;
} {
  const from = typeof item.validFrom === "string" && DATE.test(item.validFrom) ? polishMidnight(item.validFrom) : null;
  let end: Date | null = null;
  if (typeof item.validUntil === "string" && DATE.test(item.validUntil)) {
    // The day after `validUntil`, as a calendar date.
    const [year, month, day] = item.validUntil.split("-").map(Number);
    end = polishMidnight(new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10));
  }
  return { start: from, end };
}

function isPromoActive(item: { validFrom?: unknown; validUntil?: unknown }, now: Date): boolean {
  const { start, end } = promoWindow(item);
  return (!start || start <= now) && (!end || now < end);
}

/** The next moment a promotion card of the page turns on or off after `now`, or `null`. */
export function nextPromoChange(raw: RawPage, now: Date): Date | null {
  const times = (raw.blocks ?? []).flatMap((block) =>
    block?.__typename === "ComponentBlocksPromoCards"
      ? (block.promos ?? []).flatMap((item) => {
          if (!item) return [];
          const { start, end } = promoWindow(item);
          return [start, end].filter((time): time is Date => time !== null && time > now);
        })
      : [],
  );
  return times.length > 0 ? new Date(Math.min(...times.map((time) => time.getTime()))) : null;
}

function parsePromoCards(raw: PromoCardsBlockFragment, lang: Lang, routes: readonly PageRoute[], now: Date): PromoCardsBlock | null {
  const items = (raw.promos ?? []).flatMap((item): PromoCard[] => {
    const title = item?.title.trim();
    if (!item || !title || !isPromoActive(item, now)) {
      return [];
    }
    const image = item.image ? parseMedia(item.image) : null;
    return [
      {
        title,
        text: item.text?.trim() || null,
        code: item.code?.trim() || null,
        validFrom: typeof item.validFrom === "string" ? item.validFrom : null,
        validUntil: typeof item.validUntil === "string" ? item.validUntil : null,
        tone: item.tone === "go" ? "go" : item.tone === "photo" && image ? "photo" : "brand",
        image,
        imageMobile: item.imageMobile ? parseMedia(item.imageMobile) : null,
        link: item.link ? resolveLink(item.link, lang, routes) : null,
        terms: item.termsLink ? resolveLink(item.termsLink, lang, routes) : null,
      },
    ];
  });
  if (items.length === 0) {
    return null;
  }
  return {
    type: "promoCards",
    id: raw.id,
    ...parseSectionHeading(raw.header),
    items: items.slice(0, 3),
    section: parseSection(raw.section),
  };
}

function parseFaq(raw: FaqBlockFragment, lang: Lang, routes: readonly PageRoute[]): FaqBlock | null {
  const items = parseFaqItems(raw.items);
  if (items.length === 0) {
    return null;
  }
  return {
    type: "faq",
    id: raw.id,
    ...parseSectionHeading(raw.header),
    structuredData: raw.structuredData ?? true,
    groupByCategory: raw.groupByCategory === true,
    cta: raw.faqCta ? resolveLink(raw.faqCta, lang, routes) : null,
    section: parseSection(raw.section),
    items,
  };
}

type RawFaqCategory = {
  documentId: string;
  name: string;
  slug: string | null;
  icon?: string | null;
  order?: number | null;
};

function parseFaqItems(
  raw:
    | readonly ({
        question: string;
        answer: unknown;
        category?: RawFaqCategory | null;
      } | null)[]
    | null,
): FaqItem[] {
  return (raw ?? []).flatMap((item): FaqItem[] => {
    const question = item?.question.trim();
    const answer = parseRichBlocks(item?.answer);
    const category = item?.category?.name.trim()
      ? {
          id: item.category.documentId,
          name: item.category.name.trim(),
          slug: item.category.slug ?? item.category.documentId,
          icon: item.category.icon || null,
          order: item.category.order ?? 0,
        }
      : null;
    return question && answer.length > 0 ? [{ question, answer, answerText: richBlocksText(answer), category }] : [];
  });
}

/**
 * Questions under their categories, by `order` then name; questions without a
 * category last (`category: null`, the "other" group). Order within a group is kept.
 */
export function faqGroups(items: readonly FaqItem[]): { category: FaqCategory | null; items: FaqItem[] }[] {
  const groups = new Map<string | null, { category: FaqCategory | null; items: FaqItem[] }>();
  for (const item of items) {
    const key = item.category?.id ?? null;
    const group = groups.get(key) ?? { category: item.category, items: [] };
    group.items.push(item);
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => {
    if (!a.category || !b.category) {
      return a.category ? -1 : b.category ? 1 : 0;
    }
    return a.category.order - b.category.order || a.category.name.localeCompare(b.category.name);
  });
}

function parseSectionHeading(raw: SectionHeaderFragment | null): SectionHeading {
  return {
    eyebrow: raw?.eyebrow?.trim() || null,
    title: raw?.title?.trim() || null,
    lead: raw?.lead?.trim() || null,
  };
}

/** `photo` without an image falls back to `none`. */
function parseSection(raw: SectionFragment | null): SectionStyle {
  const image = raw?.backgroundImage ? parseMedia(raw.backgroundImage) : null;
  const background = raw?.background ?? DEFAULT_SECTION.background;
  return {
    tone: raw?.tone ?? DEFAULT_SECTION.tone,
    spacing: raw?.spacing ?? DEFAULT_SECTION.spacing,
    width: raw?.width ?? DEFAULT_SECTION.width,
    anchor: raw?.anchor?.trim() || null,
    background: background === "photo" && !image ? "none" : background,
    backgroundImage: image,
    backgroundImageMobile: raw?.backgroundImageMobile ? parseMedia(raw.backgroundImageMobile) : null,
    ornament: raw?.ornament ?? DEFAULT_SECTION.ornament,
  };
}

export function parseBlogCard(raw: BlogCardFragment, lang: Lang): BlogPostCard {
  return {
    id: raw.documentId,
    title: raw.title,
    href: blogHref(lang, raw.slug),
    excerpt: raw.excerpt?.trim() || null,
    category: raw.category?.name?.trim() || null,
    // Until the BlogCard fragment asks for `color` (round 3 codegen), every category is blue.
    categoryColor: blogCategoryColor(raw.category?.color),
    publishedAt: raw.createdAt ?? raw.publishedAt ?? null,
    image: raw.coverImage ? parseMedia(raw.coverImage) : null,
  };
}

function parseHero(raw: HeroBlockFragment, lang: Lang, routes: readonly PageRoute[], reviews: ReviewsQuery["ratings"]): HeroBlock | null {
  const image = raw.backgroundImage ? parseMedia(raw.backgroundImage) : null;
  const layout = raw.heroLayout ?? "cover";
  const base: HeroBase = {
    type: "hero",
    id: raw.id,
    badge: raw.badge || null,
    title: raw.title,
    subtitle: raw.subtitle || null,
    ctas: parseCtas(raw.ctas, lang, routes),
    imageMobile: raw.backgroundImageMobile ? parseMedia(raw.backgroundImageMobile) : null,
    video: raw.backgroundVideo ? parseMedia(raw.backgroundVideo) : null,
    overlay: raw.overlay,
    height: raw.height,
    reservation:
      raw.reservationLayout === "none"
        ? null
        : {
            layout: raw.reservationLayout === "horizontal" ? "horizontal" : "vertical",
            defaultTerm: raw.reservationDefaultTerm === "longTerm" ? "long" : "short",
          },
    searchSide: raw.searchSide === "end" ? "end" : "start",
    focalPoint: raw.focalPoint ?? "center",
    trust: raw.trust ? parseTrustBar(raw.trust, reviews) : null,
    highlights: (raw.highlights ?? []).flatMap((item) => (item?.text.trim() ? [{ icon: item.icon || null, text: item.text.trim() }] : [])),
    breadcrumbLabel: raw.breadcrumbLabel?.trim() || null,
  };
  if (layout === "page") {
    return { ...base, layout, image };
  }
  return image ? { ...base, layout, image } : null;
}

function parseCta(raw: CtaFragment | PartCtaFragment, lang: Lang, routes: readonly PageRoute[]): Cta | null {
  const link = resolveLink(raw.link, lang, routes);
  return link ? { ...link, variant: raw.variant, icon: raw.icon || null } : null;
}

/**
 * Where an `elements.link` (or the new sections' `parts.link`) goes on this site, or `null` when it has nowhere
 * to go: an unpublished or unroutable page, an empty URL, no label, or a
 * target type (local page, sale) with no route here yet. The link is then
 * left out. `label` stands in for an empty link label (a menu entry's own).
 */
export function resolveLink(link: LinkFragment | PartLinkFragment, lang: Lang, routes: readonly PageRoute[], label?: string): NavLink | null {
  let href: string | null = null;
  let newTab = false;

  if (link.linkType === "page" && link.page) {
    const route = routes.find((each) => each.documentId === link.page?.documentId);
    href = route ? pageHref(lang, route.segments) : null;
  } else if (link.linkType === "blog" && link.blog) {
    href = blogHref(lang, link.blog.slug);
  } else if (link.linkType === "customUrl") {
    href = safeUrl(link.customUrl);
    newTab = link.newTab ?? false;
  }

  const text = link.label?.trim() || label?.trim();
  return href && text ? { label: text, href, newTab } : null;
}

export type Seo = {
  title: string | null;
  description: string | null;
  keywords: string | null;
  noIndex: boolean;
  noFollow: boolean;
  image: Media | null;
};

/**
 * A header entry: a plain link (`none`), links picked by hand (`links`), or a
 * submenu the site fills from data (`fleet`, `locations`, `blog`).
 */
export type MenuItem = { label: string } & (
  { submenu: "none"; link: NavLink } | { submenu: "links"; links: NavLink[] } | { submenu: "fleet" | "locations" | "blog" }
);

export type SocialPlatform = "facebook" | "instagram" | "youtube" | "tiktok" | "linkedin" | "x";

export type Contact = {
  phone: string;
  /** `tel:+48881328328` */
  phoneHref: string;
  email: string;
  address: string | null;
  /** Phone line hours, as the editor writes them ("pn–pt 7:00–20:00, …"). */
  openingHours: string | null;
  /** Second line under the hours ("Rezerwacje online i e-maile przyjmujemy całą dobę."). */
  availabilityNote: string | null;
  /** `https://wa.me/48…`; `null` while the channel is not set up. */
  whatsappHref: string | null;
  /** Chat page (https); `null` while the channel is not set up. */
  chatUrl: string | null;
  /**
   * Phone line hours, one row per day range in CMS order; empty while only the
   * old free-text `openingHours` is filled. `formatOpeningHours` and
   * `openingHoursSpecification` turn it into text and JSON-LD.
   */
  hours: OpeningHours[];
  /** Registration data for the footer, the contact page and JSON-LD; `null` without a legal name. */
  company: {
    legalName: string;
    nip: string | null;
    regon: string | null;
    krs: string | null;
  } | null;
  /** Google Maps link to the office (https). */
  mapUrl: string | null;
  /** Teams and lines, the single source for the contact page and the footer tiles (`showInFooter`). */
  departments: Department[];
};

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** One row of `site.contact.hours`. Times are `HH:MM`; a `closed` row has none. */
export type OpeningHours = {
  days: Weekday[];
  opens: string | null;
  closes: string | null;
  closed: boolean;
};

export type PaymentMethod = "blik" | "card" | "transfer" | "tpay" | "viva" | "applePay" | "googlePay";

export type Announcement = {
  /** Changes whenever the editor saves, so a dismissed bar comes back after an edit. */
  key: string;
  text: string;
  variant: "info" | "promo" | "urgent";
  link: NavLink | null;
  closable: boolean;
};

/** Header, footer and site settings of one language (Strapi `layout`, `site`, `announcement`). */
export type Chrome = {
  /** `null` when switched off or outside its dates at `now`. */
  announcement: Announcement | null;
  header: MenuItem[];
  /** The header's "Zarezerwuj" button; `null`: the site's default (the booking search). */
  headerCta: NavLink | null;
  /** The navy top bar's links after the social icons (FAQ, Blog, O firmie); in the phone menu too. */
  topLinks: NavLink[];
  footer: {
    groups: { title: string; links: NavLink[] }[];
    text: string | null;
    legal: NavLink[];
    /** In CMS order, without repeats. */
    paymentMethods: PaymentMethod[];
    /** For "© {year} {companyName}"; `null`: the site falls back to "MobiCars". */
    companyName: string | null;
    /** Registration details in small print (address, NIP, KRS). */
    legalText: string | null;
  };
  contact: Contact | null;
  social: { platform: SocialPlatform; url: string }[];
  /** Defaults for pages that leave their own SEO empty. */
  seo: Seo | null;
  /** The app's store pages (https); `null` while not set. */
  appStoreUrl: string | null;
  googlePlayUrl: string | null;
};

/** Chrome with nothing from the CMS: the site still has its logo, language and booking. */
export const EMPTY_CHROME: Chrome = {
  announcement: null,
  header: [],
  headerCta: null,
  topLinks: [],
  footer: {
    groups: [],
    text: null,
    legal: [],
    paymentMethods: [],
    companyName: null,
    legalText: null,
  },
  contact: null,
  social: [],
  seo: null,
  appStoreUrl: null,
  googlePlayUrl: null,
};

export type PostTeaser = {
  documentId: string;
  title: string;
  href: string;
  image: Media | null;
};

/**
 * Maps `layout`, `site` and `announcement` as they stand at `now`. Entries
 * that cannot link anywhere are left out: a plain entry without a target, a
 * `links` submenu with no link left.
 */
export function parseChrome(raw: ChromeQuery, lang: Lang, routes: readonly PageRoute[], now: Date): Chrome {
  const links = (list: readonly (LinkFragment | null)[] | null) =>
    (list ?? []).flatMap((link) => {
      const resolved = link ? resolveLink(link, lang, routes) : null;
      return resolved ? [resolved] : [];
    });

  const header = (raw.layout?.header ?? []).flatMap((item): MenuItem[] => {
    if (!item) {
      return [];
    }
    const label = item.label.trim();
    if (item.submenu === "none") {
      const link = item.link ? resolveLink(item.link, lang, routes, label) : null;
      return link ? [{ label, submenu: "none", link }] : [];
    }
    if (item.submenu === "links") {
      const resolved = links(item.links);
      return resolved.length > 0 ? [{ label, submenu: "links", links: resolved }] : [];
    }
    return [{ label, submenu: item.submenu }];
  });

  const contact = raw.site?.contact;
  const bar = raw.announcement;
  return {
    announcement:
      bar && bar.enabled && bar.text.trim() && isWithin(now, bar.startsAt, bar.endsAt)
        ? {
            key: `${bar.documentId}:${bar.updatedAt ?? ""}`,
            text: bar.text.trim(),
            variant: bar.variant,
            link: bar.link ? resolveLink(bar.link, lang, routes) : null,
            closable: bar.closable,
          }
        : null,
    header,
    headerCta: raw.layout?.headerCta ? resolveLink(raw.layout.headerCta, lang, routes) : null,
    topLinks: links(raw.layout?.topLinks ?? null),
    footer: {
      groups: (raw.layout?.footerGroups ?? []).flatMap((group) => {
        const resolved = group ? links(group.links) : [];
        return group && resolved.length > 0 ? [{ title: group.title, links: resolved }] : [];
      }),
      text: raw.layout?.footerText?.trim() || null,
      legal: links(raw.layout?.legalLinks ?? null),
      paymentMethods: [...new Set((raw.layout?.paymentMethods ?? []).flatMap((item) => (item ? [item.method] : [])))],
      companyName: raw.layout?.companyName?.trim() || null,
      legalText: raw.layout?.legalText?.trim() || null,
    },
    contact: contact
      ? {
          phone: contact.phone.trim(),
          phoneHref: phoneHref(contact.phone),
          email: contact.email.trim(),
          address: contact.address?.trim() || null,
          openingHours: contact.openingHours?.trim() || null,
          availabilityNote: contact.availabilityNote?.trim() || null,
          whatsappHref: contact.whatsapp?.trim() ? `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}` : null,
          chatUrl: httpsUrl(contact.chatUrl),
          hours: parseOpeningHours(contact.hours),
          company: contact.legalName?.trim()
            ? {
                legalName: contact.legalName.trim(),
                nip: contact.nip?.trim() || null,
                regon: contact.regon?.trim() || null,
                krs: contact.krs?.trim() || null,
              }
            : null,
          mapUrl: httpsUrl(contact.mapUrl),
          departments: parseDepartments(contact.departments, lang, routes),
        }
      : null,
    // One link per platform: the first wins.
    social: (raw.site?.social ?? []).flatMap((item, index, all) =>
      item &&
      /^https:\/\//.test(item.url) &&
      all.findIndex((other) => other?.platform === item.platform && /^https:\/\//.test(other.url)) === index
        ? [{ platform: item.platform, url: item.url }]
        : [],
    ),
    seo: raw.site?.seo ? parseSeo(raw.site.seo) : null,
    appStoreUrl: httpsUrl(raw.site?.appStoreUrl),
    googlePlayUrl: httpsUrl(raw.site?.googlePlayUrl),
  };
}

function httpsUrl(raw: string | null | undefined): string | null {
  const url = raw?.trim();
  return url && /^https:\/\//.test(url) ? url : null;
}

const WEEKDAYS: readonly Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** Rows without a day, or open without both times, are left out. Days in week order, without repeats. */
function parseOpeningHours(
  raw:
    | readonly ({
        days: unknown;
        from?: unknown;
        to?: unknown;
        closed?: boolean | null;
      } | null)[]
    | null
    | undefined,
): OpeningHours[] {
  const time = (value: unknown) => (typeof value === "string" ? (/^(\d{2}:\d{2})/.exec(value)?.[1] ?? null) : null);
  return (raw ?? []).flatMap((row): OpeningHours[] => {
    const picked: unknown[] = Array.isArray(row?.days) ? row.days : [];
    const days = WEEKDAYS.filter((day) => picked.includes(day));
    if (!row || days.length === 0) {
      return [];
    }
    if (row.closed) {
      return [{ days, opens: null, closes: null, closed: true }];
    }
    const opens = time(row.from);
    const closes = time(row.to);
    return opens && closes ? [{ days, opens, closes, closed: false }] : [];
  });
}

/** Inside `[startsAt, endsAt)`; a missing end of the range is open. */
function isWithin(now: Date, startsAt: string | null, endsAt: string | null): boolean {
  const time = now.getTime();
  return (!startsAt || Date.parse(startsAt) <= time) && (!endsAt || time < Date.parse(endsAt));
}

/**
 * The next moment the announcement turns on or off after `now`, or `null`.
 * A cached chrome must not outlive it.
 */
export function nextAnnouncementChange(raw: ChromeQuery, now: Date): Date | null {
  const bar = raw.announcement;
  if (!bar?.enabled) {
    return null;
  }
  const upcoming = [bar.startsAt, bar.endsAt].map((value) => (value ? Date.parse(value) : NaN)).filter((time) => time > now.getTime());
  return upcoming.length > 0 ? new Date(Math.min(...upcoming)) : null;
}

export function parseSeo(raw: SeoFragment): Seo {
  return {
    title: raw.metaTitle?.trim() || null,
    description: raw.metaDescription?.trim() || null,
    keywords: raw.keywords?.trim() || null,
    noIndex: raw.noIndex,
    noFollow: raw.noFollow,
    image: raw.shareImage ? parseMedia(raw.shareImage) : null,
  };
}

export function parsePosts(raw: LatestPostsQuery, lang: Lang): PostTeaser[] {
  return raw.blogs.flatMap((post) =>
    post
      ? [
          {
            documentId: post.documentId,
            title: post.title,
            href: blogHref(lang, post.slug),
            image: post.coverImage ? parseMedia(post.coverImage) : null,
          },
        ]
      : [],
  );
}

export function parseMedia(raw: MediaFragment): Media {
  return {
    url: /^https?:\/\//.test(raw.url) ? raw.url : `${strapiUrl()}${raw.url}`,
    mime: raw.mime,
    width: raw.width,
    height: raw.height,
    alt: raw.alternativeText?.trim() ?? "",
  };
}

const BLOG_CATEGORY_COLORS = ["blue", "green", "navy", "sand"] as const;

function blogCategoryColor(value: string | null | undefined): BlogPostCard["categoryColor"] {
  return (BLOG_CATEGORY_COLORS as readonly string[]).includes(value ?? "") ? (value as BlogPostCard["categoryColor"]) : null;
}
