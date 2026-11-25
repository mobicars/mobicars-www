import type { Lang } from "@/i18n/config";

import type {
  BlogCardFragment,
  ChromeQuery,
  LatestPostsQuery,
  MediaFragment,
  PageQuery,
  PartCtaFragment,
  PartLinkFragment,
  SectionReviewFragment,
  SeoFragment,
} from "../generated/graphql";
import { strapiUrl } from "./config";
import { parseSections, reviewsLimit, type Section } from "./sections";
import { blogHref, documentHref, pageHref, type PageRoute } from "./routes";
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

export type BlogPostCard = {
  id: string;
  title: string;
  /** `/pl/blog/{slug}` (`blogHref`). */
  href: string;
  excerpt: string | null;
  /**
   * ISO date the post was first created (`createdAt`). Strapi resets
   * `publishedAt` on every publish, so an edit or a migration would make every
   * post look published today; `publishedAt` is used only when `createdAt` is missing.
   */
  publishedAt: string | null;
  image: Media | null;
};

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
  sections: Section[];
  /**
   * The page's RentCarSoft pickup point (`pickupPoint` of city and local pages):
   * where the booking search starts and whose cars and town the page shows.
   * `null` for other pages and for places without a point.
   */
  pickupId: number | null;
};

/** A CMS page, a blog post, or a city / local page with its `pickupPoint`: the same `sections` zone. */
export type RawPage = NonNullable<PageQuery["page"]> & { pickupPoint?: number | null };

/**
 * Maps the GraphQL page. `routes` are the page URLs of `lang`, for links to
 * other pages. `latestPosts` holds, per Blog section with `source: latest` or
 * `all`, the posts read for it (`latestPostQueries`); `latestReviews`, per
 * Reviews section with `source: latest`, its reviews (`latestReviewQueries`).
 */
export function parsePage(
  raw: RawPage,
  lang: Lang,
  routes: readonly PageRoute[],
  latestPosts: Readonly<Record<string, readonly (BlogCardFragment | null)[]>> = {},
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
    sections: parseSections(raw.sections ?? [], lang, routes, latestPosts, latestReviews),
    pickupId: raw.pickupPoint && raw.pickupPoint > 0 ? raw.pickupPoint : null,
  };
}

/** The most posts one request reads: the CMS's GraphQL `maxLimit`. */
const ALL_POSTS = 1000;

/** The Blog sections of a page that show the newest posts: what to read for each before `parsePage`. */
export function latestPostQueries(raw: RawPage): { blockId: string; limit: number }[] {
  // Under their own key (`sectionPostsKey`): the four newest, or every post (`all`, the CMS's GraphQL maximum).
  return (raw.sections ?? []).flatMap((section) =>
    section?.__typename === "ComponentSectionsBlog" && (section.blogSource === "latest" || section.blogSource === "all")
      ? [{ blockId: sectionPostsKey(section.id), limit: section.blogSource === "all" ? ALL_POSTS : 4 }]
      : [],
  );
}

/** The Reviews sections showing the newest reviews: what to read for each (in the page's language) before `parsePage`. */
export function latestReviewQueries(raw: RawPage): { sectionId: string; limit: number }[] {
  return (raw.sections ?? []).flatMap((section) =>
    section?.__typename === "ComponentSectionsReviews" && section.reviewsSource === "latest" ? [{ sectionId: section.id, limit: reviewsLimit(section) }] : [],
  );
}

/** The key of a Blog section's newest posts among `latestPosts`. */
export function sectionPostsKey(id: string): string {
  return `section-${id}`;
}

export function parseCtas(raw: readonly (PartCtaFragment | null)[] | null, lang: Lang, routes: readonly PageRoute[]): Cta[] {
  return (raw ?? []).flatMap((cta) => {
    const parsed = cta ? parseCta(cta, lang, routes) : null;
    return parsed ? [parsed] : [];
  });
}

function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

export function parseBlogCard(raw: BlogCardFragment, lang: Lang): BlogPostCard {
  return {
    id: raw.documentId,
    title: raw.title,
    href: blogHref(lang, raw.slug),
    excerpt: raw.excerpt?.trim() || null,
    publishedAt: raw.createdAt ?? raw.publishedAt ?? null,
    image: raw.coverImage ? parseMedia(raw.coverImage) : null,
  };
}

function parseCta(raw: PartCtaFragment, lang: Lang, routes: readonly PageRoute[]): Cta | null {
  const link = resolveLink(raw.link, lang, routes);
  return link ? { ...link, variant: raw.variant, icon: raw.icon || null } : null;
}

/**
 * Where a `parts.link` (sections, menus, layout, announcement) goes on this site, or `null` when it has
 * nowhere to go: an unpublished or unroutable page, an empty URL, no label, or a
 * target type (local page, sale) with no route here yet. The link is then
 * left out. `label` stands in for an empty link label (a menu entry's own).
 */
export function resolveLink(link: PartLinkFragment, lang: Lang, routes: readonly PageRoute[], label?: string): NavLink | null {
  let href: string | null = null;
  let newTab = false;

  if (link.linkType === "page" && link.page) {
    const route = routes.find((each) => each.documentId === link.page?.documentId);
    href = route ? pageHref(lang, route.segments) : null;
  } else if (link.linkType === "blog" && link.blog) {
    href = blogHref(lang, link.blog.slug);
  } else if (link.linkType === "document" && link.document?.slug) {
    href = documentHref(lang, link.document.slug);
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
  /** The car-sales line and mailbox (the Car sales section and each ad's page, its `Offer` seller). */
  salesPhone: string;
  salesPhoneHref: string;
  salesEmail: string;
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
  /** The external client panel (https); `null` hides the links to it. */
  clientPanelUrl: string | null;
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
  clientPanelUrl: null,
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
  const links = (list: readonly (PartLinkFragment | null)[] | null) =>
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
          salesPhone: contact.salesPhone.trim(),
          salesPhoneHref: phoneHref(contact.salesPhone),
          salesEmail: contact.salesEmail.trim(),
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
    clientPanelUrl: httpsUrl(raw.site?.clientPanelUrl),
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
    keywords: raw.metaKeywords?.trim() || null,
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
