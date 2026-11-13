import type { Lang } from "@/i18n/config";
import type { ReservationTerm } from "@/lib/reservation/search";

import type {
  ChromeQuery,
  CtaFragment,
  HeroBlockFragment,
  LatestPostsQuery,
  LinkFragment,
  MediaFragment,
  PageQuery,
  SeoFragment,
} from "../generated/graphql";
import { strapiUrl } from "./config";
import { blogHref, pageHref, type PageRoute } from "./routes";

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

export type HeroBlock = {
  type: "hero";
  id: string;
  badge: string | null;
  title: string;
  subtitle: string | null;
  ctas: Cta[];
  image: Media;
  imageMobile: Media | null;
  video: Media | null;
  overlay: "none" | "light" | "medium" | "strong";
  height: "compact" | "default" | "fullscreen";
  /** `null` when the hero has no booking form. */
  reservation: { layout: "vertical" | "horizontal"; defaultTerm: ReservationTerm } | null;
};

/** Every block a page can hold. Add a type here and a case in `components/blocks`. */
export type Block = HeroBlock;

export type Page = {
  documentId: string;
  title: string;
  seo: {
    title: string | null;
    description: string | null;
    noIndex: boolean;
    noFollow: boolean;
  };
  blocks: Block[];
};

type RawPage = NonNullable<PageQuery["page"]>;

/** Maps the GraphQL page. `routes` are the page URLs of `lang`, for links to other pages. */
export function parsePage(raw: RawPage, lang: Lang, routes: readonly PageRoute[]): Page {
  return {
    documentId: raw.documentId,
    title: raw.title,
    seo: {
      title: raw.seo?.metaTitle || null,
      description: raw.seo?.metaDescription || null,
      noIndex: raw.seo?.noIndex ?? false,
      noFollow: raw.seo?.noFollow ?? false,
    },
    blocks: (raw.blocks ?? []).flatMap((block): Block[] => {
      // `Error` is Strapi's member for a component it could not resolve; a new
      // block type the site does not know yet is skipped the same way.
      if (block?.__typename === "ComponentBlocksHero") {
        return [parseHero(block, lang, routes)];
      }
      return [];
    }),
  };
}

function parseHero(raw: HeroBlockFragment, lang: Lang, routes: readonly PageRoute[]): HeroBlock {
  return {
    type: "hero",
    id: raw.id,
    badge: raw.badge || null,
    title: raw.title,
    subtitle: raw.subtitle || null,
    ctas: (raw.ctas ?? []).flatMap((cta) => {
      const parsed = cta ? parseCta(cta, lang, routes) : null;
      return parsed ? [parsed] : [];
    }),
    image: parseMedia(raw.backgroundImage),
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
  };
}

function parseCta(raw: CtaFragment, lang: Lang, routes: readonly PageRoute[]): Cta | null {
  const link = resolveLink(raw.link, lang, routes);
  return link ? { ...link, variant: raw.variant, icon: raw.icon || null } : null;
}

/**
 * Where an `elements.link` goes on this site, or `null` when it has nowhere
 * to go: an unpublished or unroutable page, an empty URL, no label, or a
 * target type (local page, sale) with no route here yet. The link is then
 * left out. `label` stands in for an empty link label (a menu entry's own).
 */
export function resolveLink(
  link: LinkFragment,
  lang: Lang,
  routes: readonly PageRoute[],
  label?: string,
): NavLink | null {
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

/** Site paths, http(s), `mailto:` and `tel:`. Anything else (`javascript:`) is dropped. */
function safeUrl(raw: string | null): string | null {
  const value = raw?.trim();
  if (!value) {
    return null;
  }
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return /^(https?:\/\/|mailto:|tel:)/i.test(value) ? value : null;
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
  | { submenu: "none"; link: NavLink }
  | { submenu: "links"; links: NavLink[] }
  | { submenu: "fleet" | "locations" | "blog" }
);

export type SocialPlatform = "facebook" | "instagram" | "youtube" | "tiktok" | "linkedin" | "x";

export type Contact = {
  phone: string;
  /** `tel:+48881328328` */
  phoneHref: string;
  email: string;
  address: string | null;
  openingHours: string | null;
};

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
  footer: {
    groups: { title: string; links: NavLink[] }[];
    text: string | null;
    legal: NavLink[];
  };
  contact: Contact | null;
  social: { platform: SocialPlatform; url: string }[];
  /** Defaults for pages that leave their own SEO empty. */
  seo: Seo | null;
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
    footer: {
      groups: (raw.layout?.footerGroups ?? []).flatMap((group) => {
        const resolved = group ? links(group.links) : [];
        return group && resolved.length > 0 ? [{ title: group.title, links: resolved }] : [];
      }),
      text: raw.layout?.footerText?.trim() || null,
      legal: links(raw.layout?.legalLinks ?? null),
    },
    contact: contact
      ? {
          phone: contact.phone.trim(),
          phoneHref: `tel:${contact.phone.replace(/[^+\d]/g, "")}`,
          email: contact.email.trim(),
          address: contact.address?.trim() || null,
          openingHours: contact.openingHours?.trim() || null,
        }
      : null,
    social: (raw.site?.social ?? []).flatMap((item) =>
      item && /^https:\/\//.test(item.url) ? [{ platform: item.platform, url: item.url }] : [],
    ),
    seo: raw.site?.seo ? parseSeo(raw.site.seo) : null,
  };
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
  const upcoming = [bar.startsAt, bar.endsAt]
    .map((value) => (value ? Date.parse(value) : NaN))
    .filter((time) => time > now.getTime());
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

function parseMedia(raw: MediaFragment): Media {
  return {
    url: /^https?:\/\//.test(raw.url) ? raw.url : `${strapiUrl()}${raw.url}`,
    mime: raw.mime,
    width: raw.width,
    height: raw.height,
    alt: raw.alternativeText?.trim() ?? "",
  };
}
