import "server-only";

export { CACHE_TAGS, tagsForWebhook } from "./internal/tags";
export { StrapiError } from "./internal/errors";
export type { StrapiErrorCode } from "./internal/errors";

export { blogHref, HOME_SLUG, pageHref } from "./internal/routes";
export type { PageRoute } from "./internal/routes";
export { findPageRoute, listPageRoutes } from "./modules/routes";

export { getPage } from "./modules/pages";
export { findPlaceRoute, getPlacePage, listPlaceRoutes, LOCAL_ROOT, placeSegments, type PlaceKind } from "./modules/places";
export { findBlogRoute, getBlogPost, listBlogRoutes, type BlogPost } from "./modules/blog";
export { listPlaceLinks, type PlaceLink, type PlaceLinks } from "./modules/place-links";
export type {
  Announcement,
  Block,
  BlogPostCard,
  BlogPostsBlock,
  CarsBlock,
  CarsCategory,
  CarsTab,
  Chrome,
  ComparisonBlock,
  ComparisonValue,
  Contact,
  ContactBlock,
  ContentBlock,
  Department,
  Cta,
  CtaBandBlock,
  CtaVariant,
  FaqBlock,
  FaqCategory,
  FaqItem,
  FeatureItem,
  FeaturesBlock,
  HeroBlock,
  LeadFormBlock,
  LogosBlock,
  Media,
  MediaTextBlock,
  MenuItem,
  NavLink,
  OpeningHours,
  Page,
  PaymentMethod,
  PostTeaser,
  PromoCard,
  PromoCardsBlock,
  RatingSummary,
  Review,
  ReviewsBlock,
  LocationsBlock,
  Scenario,
  ScenariosBlock,
  SectionHeading,
  SectionStyle,
  Seo,
  SocialPlatform,
  TrustBarBlock,
  TrustStat,
  Weekday,
} from "./internal/entities";
export { faqGroups } from "./internal/entities";
export type { BlogSection, Card, CardsSection, CarClassesSection, CarCollection, CarsSection, ExtrasSection, DividerSection, DividerTone, ImageSection, MapSection, ReviewsSection, SectionReview, SplitSection, FormSection, SocialSection, FaqSection, FeaturesSection, HeroSection, Section, SectionBackground, TextSection, VariantLabelSection } from "./internal/sections";
export { isDarkBackground, sectionEdgeTone } from "./internal/sections";
export { formatDays, formatOpeningHours, openingHoursSpecification } from "./internal/opening-hours";

export type {
  RichBlock,
  RichBlocks,
  RichInline,
  RichLink,
  RichList,
  RichTable,
  RichListItem,
  RichText,
} from "./internal/rich-blocks";

export { getChrome, getSiteSeo, listLatestPosts } from "./modules/chrome";
export { findDocumentFile } from "./modules/documents";
