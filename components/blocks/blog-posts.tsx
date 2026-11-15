import { ArrowRight, Newspaper } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { intlLocales, type Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import type { BlogPostCard, BlogPostsBlock } from "@/lib/strapi";

import { Container, Section, SectionHeader } from "@/components/ui/section";
import { IconBadge, Ornament, Pill, Rail, RailItem, type PillTone } from "@/components/ui/surface";

import { CtaLink } from "./cta-link";

/**
 * The CMS blog block: a badge and heading, then the newest (or picked) posts
 * as cards with a photo, category, date, title and excerpt (`PostCard`). A
 * swipe row on phones, three in a row from `lg` (`Rail`, server markup: no
 * client slider). The whole card is the link to the post. An optional button ("Zobacz wszystkie") closes it.
 */
export function BlogPosts({ block, lang, first }: { block: BlogPostsBlock; lang: Lang; first: boolean }) {
  if (block.posts.length === 0) {
    return null;
  }
  const headingId = `blog-posts-${block.id}`;
  return (
    <Section labelledBy={headingId}>
      <Container>
        <SectionHeader
          id={headingId}
          level={first ? 1 : 2}
          eyebrow={block.badge}
          eyebrowVariant="pill"
          eyebrowIcon={<Newspaper />}
          title={block.title}
          lead={block.subtitle}
          action={block.cta ? <CtaLink cta={block.cta} className="w-full sm:w-auto" /> : null}
        />
        <Rail label={block.title}>
          {block.posts.map((post) => (
            <RailItem key={post.id}>
              <PostCard post={post} lang={lang} readMore={getMessages(lang).blocks.readMore} />
            </RailItem>
          ))}
        </Rail>
      </Container>
    </Section>
  );
}

/** `blog-category.color` → label tone; on the photo every tone stays readable. */
export const CATEGORY_TONE: Record<NonNullable<BlogPostCard["categoryColor"]>, PillTone> = {
  blue: "neutral",
  green: "go",
  navy: "brand",
  sand: "glass",
};

/**
 * A post (catalog C9): the photo with the category as a label on it, the date,
 * the title (its link covers the card) and the excerpt.
 */
export function PostCard({ post, lang, readMore }: { post: BlogPostCard; lang: Lang; readMore: string }) {
  const date = post.publishedAt ? new Date(post.publishedAt) : null;
  return (
    <article className="group relative flex w-full flex-col gap-3">
      <span className={`relative isolate block aspect-[3/2] overflow-hidden rounded-card ${post.image ? "bg-surface" : "bg-blue-dark"}`}>
        {post.image ? (
          <Image
            src={post.image.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 26rem, (min-width: 640px) 45vw, 80vw"
            // Below the first screen: 60 is indistinguishable here and ~25% lighter (PageSpeed on phones).
            quality={60}
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          // No cover in the CMS: a brand card of the same size instead of an empty box.
          <span className="absolute inset-0 grid place-items-center">
            <Ornament kind="road" className="text-white/15" />
            <IconBadge tone="light">
              <Newspaper />
            </IconBadge>
          </span>
        )}
        {post.category ? (
          <Pill tone={CATEGORY_TONE[post.categoryColor ?? "sand"]} className="absolute top-3 left-3 shadow-card">
            {post.category}
          </Pill>
        ) : null}
      </span>
      {date ? (
        <time dateTime={post.publishedAt ?? undefined} className="text-sm text-muted-dark">
          {new Intl.DateTimeFormat(intlLocales[lang], { day: "numeric", month: "long", year: "numeric" }).format(date)}
        </time>
      ) : null}
      <h3 className="line-clamp-3 text-lg leading-snug font-semibold text-blue-dark transition-colors duration-200 ease-out group-hover:text-blue-medium motion-reduce:transition-none">
        {/* The link covers the card (its ::after), so the photo and excerpt open the post too. */}
        <Link
          href={post.href}
          className="outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:ring-2 focus-visible:after:ring-blue-medium focus-visible:after:ring-offset-4"
        >
          {post.title}
        </Link>
      </h3>
      {post.excerpt ? <p className="line-clamp-2 text-sm text-muted-dark">{post.excerpt}</p> : null}
      {/* Visual cue only: the title's link already covers the card. */}
      <span aria-hidden className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-blue-dark">
        {readMore}
        <ArrowRight className="size-4 transition-transform duration-150 ease-out-soft group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </span>
    </article>
  );
}
