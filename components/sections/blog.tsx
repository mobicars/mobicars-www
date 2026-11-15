import { ArrowRight } from "lucide-react";
import { getImageProps } from "next/image";

import { CtaLink } from "@/components/blocks/cta-link";
import { buttonClass } from "@/components/ui/button";
import { intlLocales, type Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { isDarkBackground, type BlogSection } from "@/lib/strapi";

import { SECTION_CTA_SIZE, SectionHeading, SectionShell } from "./section-shell";

type Post = BlogSection["posts"][number];
type Heading = "h2" | "h3";

/**
 * Blog (`sections.blog`): four posts, the newest or picked, under the shared
 * heading and over up to two buttons. Open, light entries (no coloured
 * cards, unlike Cards): the photo, the date, the title, the opening lines and
 * "Read article".
 *
 * Every photo is cropped to the same frame (`object-cover` in a fixed aspect
 * ratio), whatever its own size, so the rows line up and nothing shifts while
 * they load. Phones get a compact list (a square thumbnail beside the date and
 * title), all four titles on one screen; tablets two by two. On desktops
 * `grid` is four in a row, `featured` the first post large, its title on the
 * photo, beside the other three in a list. Server markup only.
 */
export function Blog({ section, lang }: { section: BlogSection; lang: Lang }) {
  const t = getMessages(lang).blocks;
  const headingId = `blog-${section.id}`;
  const dark = isDarkBackground(section.background);
  const heading: Heading = section.title ? "h3" : "h2";
  const label = section.title ?? undefined;
  const date = new Intl.DateTimeFormat(intlLocales[lang], { day: "2-digit", month: "2-digit", year: "numeric" });
  const common = { heading, dark, date, more: t.readArticle };
  const [first, ...rest] = section.posts;
  const featured = section.layout === "featured" && rest.length > 0;

  return (
    <SectionShell background={section.background} spacing={section.spacing} width={section.width} labelledBy={section.title ? headingId : undefined}>
      <SectionHeading id={headingId} badge={section.badge} title={section.title} text={section.text} align={section.headerAlign} background={section.background} />
      {featured ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10">
          <FeaturedPost post={first} {...common} />
          <ul aria-label={label} className="flex flex-col gap-5 lg:justify-between">
            {rest.map((post) => (
              <li key={post.id}>
                <ListPost post={post} {...common} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul aria-label={label} className="grid gap-5 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
          {section.posts.map((post) => (
            <li key={post.id} className="flex">
              <GridPost post={post} {...common} />
            </li>
          ))}
        </ul>
      )}
      {section.ctas.length > 0 ? (
        <div className={`mt-10 flex flex-col gap-3 sm:flex-row ${section.headerAlign === "center" ? "sm:justify-center" : ""}`}>
          {section.ctas.map((cta) => (
            <CtaLink key={`${cta.href}-${cta.label}`} cta={cta} size={SECTION_CTA_SIZE} />
          ))}
        </div>
      ) : null}
    </SectionShell>
  );
}

type PostProps = { post: Post; heading: Heading; dark: boolean; date: Intl.DateTimeFormat; more: string };

/** The link on the title, stretched over the whole entry: one link per post, named by its title. */
function TitleLink({ post }: { post: Post }) {
  return (
    <a href={post.href} className="outline-none after:absolute after:inset-0 after:content-['']">
      {post.title}
    </a>
  );
}

function PostDate({ post, date, className }: { post: Post; date: Intl.DateTimeFormat; className: string }) {
  return post.publishedAt ? (
    <time dateTime={post.publishedAt} className={`text-sm ${className}`}>
      {date.format(new Date(post.publishedAt))}
    </time>
  ) : null;
}

/** Focus ring and hover for an entry whose stretched link sits inside it. */
const ENTRY = "group relative isolate rounded-card has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-blue-medium has-[a:focus-visible]:ring-offset-4";

/**
 * Grid entry: on phones a row (square thumbnail, date, title); from `sm` a
 * column with the 4:3 photo, the opening lines and "Read article" at the
 * foot, so entries of one row end level.
 */
function GridPost({ post, heading: Title, dark, date, more }: PostProps) {
  return (
    <article className={`${ENTRY} flex w-full items-center gap-4 sm:flex-col sm:items-stretch sm:gap-0`}>
      <Thumb post={post} className="aspect-square w-24 shrink-0 sm:aspect-[4/3] sm:w-full" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 96px" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:mt-5 sm:gap-2">
        <PostDate post={post} date={date} className={dark ? "text-white" : "text-blue-dark/70"} />
        <Title className={`line-clamp-3 text-base leading-snug font-bold text-balance sm:text-lg ${dark ? "text-white" : "text-blue-dark"} group-hover:underline`}>
          <TitleLink post={post} />
        </Title>
        {post.excerpt ? <p className={`hidden text-pretty sm:line-clamp-3 ${dark ? "text-white" : "text-blue-dark/75"}`}>{post.excerpt}</p> : null}
        <More text={more} dark={dark} className="hidden sm:mt-auto sm:inline-flex sm:pt-2" />
      </div>
    </article>
  );
}

/** The `featured` layout's list entry: a thumbnail beside the date, title and "Read article". */
function ListPost({ post, heading: Title, dark, date, more }: PostProps) {
  return (
    <article className={`${ENTRY} flex items-center gap-4 sm:gap-6`}>
      <Thumb post={post} className="aspect-square w-24 shrink-0 sm:aspect-[4/3] sm:w-44 lg:w-48" sizes="(min-width: 640px) 192px, 96px" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:gap-2">
        <PostDate post={post} date={date} className={dark ? "text-white" : "text-blue-dark/70"} />
        <Title className={`line-clamp-3 text-base leading-snug font-bold text-balance sm:text-lg ${dark ? "text-white" : "text-blue-dark"} group-hover:underline`}>
          <TitleLink post={post} />
        </Title>
        <More text={more} dark={dark} className="hidden sm:inline-flex" />
      </div>
    </article>
  );
}

/** The `featured` layout's first post: the photo fills it (taller on desktops), the date and title on it under a navy fade, and the arrow. */
function FeaturedPost({ post, heading: Title, date }: PostProps) {
  return (
    <article className={`${ENTRY} flex aspect-[4/3] flex-col justify-end overflow-clip p-6 text-white sm:aspect-[16/9] sm:p-8 lg:aspect-auto lg:min-h-[28rem]`}>
      {post.image ? (
        <img
          {...getImageProps({ src: post.image.url, alt: "", width: post.image.width ?? 1200, height: post.image.height ?? 800, sizes: "(min-width: 1024px) 55vw, 100vw", quality: 70 }).props}
          alt=""
          className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      ) : null}
      <div aria-hidden className={`absolute inset-0 bg-linear-to-t from-blue-dark/90 via-blue-dark/45 to-blue-dark/5 ${post.image ? "" : "bg-blue-dark"}`} />
      {/* Above the photo and its fade by markup order (no negative z-index, which accessibility checkers misread). */}
      <div className="relative flex flex-col gap-3">
        <PostDate post={post} date={date} className="text-white" />
        <Title className="text-2xl leading-tight font-bold text-balance sm:text-3xl">
          <TitleLink post={post} />
        </Title>
        <span aria-hidden className={buttonClass("primary", "icon", "mt-3 group-hover:before:scale-[20] group-hover:before:duration-600 group-hover:before:ease-in-out")}>
          <ArrowRight className="size-5" />
        </span>
      </div>
    </article>
  );
}

/** The photo in a fixed frame (cropped to it), lazily loaded; a tinted frame when the post has none. */
function Thumb({ post, className, sizes }: { post: Post; className: string; sizes: string }) {
  return (
    <div className={`relative overflow-clip rounded-2xl bg-tint ${className}`}>
      {post.image ? (
        <img
          {...getImageProps({ src: post.image.url, alt: "", width: post.image.width ?? 800, height: post.image.height ?? 600, sizes, quality: 65 }).props}
          alt=""
          className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out-soft group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      ) : null}
    </div>
  );
}

function More({ text, dark, className }: { text: string; dark: boolean; className: string }) {
  return (
    <span aria-hidden className={`items-center gap-2 text-sm font-semibold ${dark ? "text-white" : "text-blue-medium"} ${className}`}>
      {text}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
    </span>
  );
}
