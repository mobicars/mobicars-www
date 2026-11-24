import "server-only";

export { CACHE_TAGS, tagsForWebhook } from "./internal/tags";
export { StrapiError } from "./internal/errors";
export type { StrapiErrorCode } from "./internal/errors";

export { blogHref, HOME_SLUG, pageHref } from "./internal/routes";
export type { PageRoute } from "./internal/routes";
export { findPageRoute, listPageRoutes } from "./modules/routes";

export { getNotFoundPage, getPage } from "./modules/pages";
export { findPlaceRoute, getPlacePage, listPlaceRoutes, LOCAL_ROOT, placeSegments, type PlaceKind } from "./modules/places";
export { findBlogRoute, getBlogPost, listBlogRoutes, type BlogPost } from "./modules/blog";
export { listSitemapUrls, type SitemapUrl } from "./modules/sitemap";
export { findSale, listSales } from "./modules/sales";
export { saleSpecs, type SaleAd, type SaleCard, type SaleSpecs } from "./internal/sales";
export { listPlaceLinks, type PlaceLink, type PlaceLinks } from "./modules/place-links";
export { fleetCollectionHref, listFleetCollections, parseFleetCollections, type FleetCollection } from "./modules/fleet-collections";
export type {
  Announcement,
  BlogPostCard,
  Chrome,
  Contact,
  Cta,
  CtaVariant,
  Media,
  MenuItem,
  NavLink,
  OpeningHours,
  Page,
  PaymentMethod,
  PostTeaser,
  Seo,
  SocialPlatform,
  Weekday,
} from "./internal/entities";
export type { BlogSection, SalesSection, Card, CardsSection, CarClassesSection, CarCollection, CarsSection, ExtrasSection, PromotionsSection, DividerSection, DividerTone, ImageSection, MapSection, ReviewsSection, SectionReview, SplitSection, FormSection, SocialSection, FaqSection, FeaturesSection, HeroSection, Section, SectionBackground, TextSection, VariantLabelSection } from "./internal/sections";
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
