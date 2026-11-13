import "server-only";

export { CACHE_TAGS, tagsForWebhook } from "./internal/tags";
export { StrapiError } from "./internal/errors";
export type { StrapiErrorCode } from "./internal/errors";

export { blogHref, HOME_SLUG, pageHref } from "./internal/routes";
export type { PageRoute } from "./internal/routes";
export { findPageRoute, listPageRoutes } from "./modules/routes";

export { getPage } from "./modules/pages";
export type {
  Announcement,
  Block,
  Chrome,
  Contact,
  Cta,
  CtaVariant,
  HeroBlock,
  Media,
  MenuItem,
  NavLink,
  Page,
  PostTeaser,
  Seo,
  SocialPlatform,
} from "./internal/entities";

export { getChrome, listLatestPosts } from "./modules/chrome";
