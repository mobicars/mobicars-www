import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { FeatureItem, FeaturesBlock, NavLink } from "@/lib/strapi";

import { SmartLink } from "@/components/ui/smart-link";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { IconBadge, Ornament, Rail, RailItem, Scrim } from "@/components/ui/surface";

import { CtaIcon } from "./cta-link";

/** Columns from the item count: 3 and 6 in threes, otherwise fours (fewer when fewer). */
function gridClass(count: number): string {
  if (count <= 1) return "sm:grid-cols-1";
  if (count === 2) return "sm:grid-cols-2";
  if (count % 3 === 0 && count % 4 !== 0) return "sm:grid-cols-2 lg:grid-cols-3";
  return "sm:grid-cols-2 lg:grid-cols-4";
}

/**
 * The CMS features block: why MobiCars, the booking steps and the like. Each
 * item has an icon or an illustration, a title, an optional line of text and
 * an optional link. Three looks:
 *
 * - `plain`: a light strip, a small icon beside a small heading, the line
 *   under it (as on sixt.pl);
 * - `cards`: framed cards, the link at the bottom with an arrow (as on carnet.pl);
 * - `circles`: on a light blue band, the icon in a navy circle (the old site);
 * - `photo`: the item's image fills the top of the card (4:3), as the product
 *   cards on sixt.pl and carnet.pl; without an image the card falls back to `cards`;
 * - `steps`: numbered steps joined by a line (the booking steps);
 * - `overlay`: tall cards (carfree.pl, sixt.pl): a photo – or the brand
 *   colour with line art – with the white title at the top and an icon in a
 *   circle at the bottom; a swipe row on phones;
 * - `benefits`: three or four hard facts (sixt.pl): a small icon and label,
 *   the fact in large bold type under it.
 */
export function Features({ block, first }: { block: FeaturesBlock; first: boolean }) {
  const headingId = `features-${block.id}`;
  return (
    <Section
      tone={block.variant === "circles" ? "tint" : "canvas"}
      backdrop={block.variant === "steps" ? { kind: "wash" } : undefined}
      spacing={block.variant === "plain" || block.variant === "benefits" ? "compact" : "default"}
      labelledBy={block.title ? headingId : undefined}
    >
      <Container>
        {block.title ? <SectionHeader id={headingId} level={first ? 1 : 2} title={block.title} align="center" /> : null}
        {block.variant === "steps" ? (
          <Steps items={block.items} />
        ) : block.variant === "overlay" ? (
          <Rail label={block.title ?? ""} columns={block.items.length === 4 ? 4 : 3}>
            {block.items.map((item, index) => (
              <RailItem key={`${item.title}-${index}`}>
                <OverlayCard item={item} />
              </RailItem>
            ))}
          </Rail>
        ) : block.variant === "benefits" ? (
          <Benefits items={block.items} />
        ) : (
          <ul className={`grid grid-cols-1 gap-4 sm:gap-6 ${gridClass(block.items.length)}`}>
            {block.items.map((item, index) => (
              <li key={`${item.title}-${index}`} className="flex">
                <Item item={item} variant={block.variant} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}

function Item({ item, variant }: { item: FeatureItem; variant: FeaturesBlock["variant"] }) {
  if (variant === "circles") {
    return (
      <div className="flex items-start gap-4">
        <Visual
          item={item}
          className={`flex size-16 shrink-0 items-center justify-center rounded-full ${item.image ? "bg-white" : "bg-blue-dark text-white"}`}
          iconClass="size-8"
          imageSize={64}
        />
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-bold text-blue-dark">{item.title}</h3>
          {item.text ? <p className="text-sm text-blue-dark/80">{item.text}</p> : null}
          {item.link ? <ItemLink link={item.link} /> : null}
        </div>
      </div>
    );
  }
  if (variant === "plain") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Visual item={item} className="flex size-6 shrink-0 items-center justify-center text-blue-medium" iconClass="size-5" imageSize={32} />
          <h3 className="text-sm font-semibold text-blue-dark">{item.title}</h3>
        </div>
        {item.text ? <p className="text-base font-semibold text-blue-dark sm:text-lg">{item.text}</p> : null}
        {item.link ? <ItemLink link={item.link} /> : null}
      </div>
    );
  }
  if (variant === "photo" && item.image) {
    return (
      <article className="group flex w-full flex-col overflow-hidden rounded-card bg-white shadow-card transition-[box-shadow,transform] duration-250 ease-out-soft hover:-translate-y-1 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0">
        <div className="relative aspect-[4/3] overflow-hidden bg-tint">
          {/* Decorative: the card's title says what it shows, and the file's one alt text would be Polish on every language. */}
          <Image
            src={item.image.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 25rem, (min-width: 640px) 50vw, 100vw"
            // Below the first screen: 60 is indistinguishable here and ~25% lighter (PageSpeed on phones).
            quality={60}
            className="object-cover transition-transform duration-250 ease-out-soft group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
          <h3 className="text-subtitle text-blue-dark">{item.title}</h3>
          {item.text ? <p className="text-pretty text-blue-dark/75">{item.text}</p> : null}
          {item.link ? (
            <div className="mt-auto pt-2">
              <ItemLink link={item.link} />
            </div>
          ) : null}
        </div>
      </article>
    );
  }
  return (
    <div className="flex w-full flex-col gap-4 rounded-card bg-white p-5 shadow-card ring-1 ring-line transition-[box-shadow,transform] duration-250 ease-out-soft hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6">
      <Visual
        item={item}
        className={`flex size-12 shrink-0 items-center justify-center rounded-control ${item.image ? "bg-white" : "bg-green-light text-green-dark"}`}
        iconClass="size-6"
        imageSize={56}
      />
      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="text-lg leading-snug font-bold text-blue-dark">{item.title}</h3>
        {item.text ? <p className="text-pretty text-blue-dark/70">{item.text}</p> : null}
      </div>
      {item.link ? (
        <div className="mt-auto">
          <ItemLink link={item.link} />
        </div>
      ) : null}
    </div>
  );
}

/**
 * The booking steps: a number in a green circle, the steps joined by a line
 * (across on wide screens, down on phones). An ordered list, so the numbers are
 * also spoken.
 */
function Steps({ items }: { items: FeatureItem[] }) {
  return (
    <ol className={`relative grid grid-cols-1 gap-8 ${items.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"} ${items.length === 4 ? "lg:grid-cols-4" : ""}`}>
      {items.map((item, index) => (
        <li key={`${item.title}-${index}`} className="relative flex gap-4 md:flex-col md:gap-5">
          {/* The connector: to the next step, under the circles. */}
          {index < items.length - 1 ? (
            <span
              aria-hidden
              className="absolute top-14 bottom-[-2rem] left-7 w-0.5 bg-green-medium/30 md:top-7 md:right-[-2rem] md:bottom-auto md:left-14 md:h-0.5 md:w-auto"
            />
          ) : null}
          <span
            aria-hidden
            className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full bg-green-medium text-xl font-bold text-white shadow-card ring-4 ring-tint"
          >
            {index + 1}
          </span>
          <div className="flex flex-col gap-1.5 pt-2 md:pt-0">
            <h3 className="flex items-center gap-2 text-lg font-bold text-blue-dark">
              {item.icon ? <CtaIcon name={item.icon} className="size-5 text-green-dark" /> : null}
              {item.title}
            </h3>
            {item.text ? <p className="text-pretty text-blue-dark/75">{item.text}</p> : null}
            {item.link ? <ItemLink link={item.link} /> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

type OverlayTone = "photo" | "brand" | "go" | "studio";

/**
 * Catalog C2. `tone` comes from the CMS (`elements.feature.tone`); a photo card
 * without a photo falls back to the brand colour. The whole card is the link.
 * Capitals only for short titles (catalog §4: long Polish words in capitals
 * do not fit a phone).
 */
function OverlayCard({ item }: { item: FeatureItem }) {
  const fields = item as FeatureItem & { tone?: OverlayTone | null; imageMobile?: { url: string } | null };
  const tone: OverlayTone = fields.tone === "photo" && !item.image ? "brand" : (fields.tone ?? (item.image ? "photo" : "brand"));
  const photo = (tone === "photo" || tone === "studio") && item.image;
  const surface = tone === "go" ? "bg-go-strong" : "bg-blue-dark";
  const caps = item.title.length <= 28;
  return (
    <article
      className={`group relative isolate flex aspect-[4/5] w-full flex-col overflow-hidden rounded-card p-6 text-white shadow-card lg:aspect-[3/4] ${surface}`}
    >
      {photo ? (
        <>
          <Image
            src={item.image!.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 26rem, 78vw"
            quality={60}
            className={`-z-20 transition-transform duration-250 ease-out-soft group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
              tone === "studio" ? "object-contain object-bottom p-6" : "object-cover"
            }`}
          />
          {tone === "photo" ? <Scrim side="top" /> : null}
        </>
      ) : (
        <Ornament kind={tone === "go" ? "contour" : "road"} className="text-white/20" />
      )}
      <h3 className={`text-balance text-white ${caps ? "text-2xl leading-[1.15] font-bold tracking-[0.04em] uppercase" : "text-subtitle font-bold"}`}>
        {item.link ? (
          <SmartLink
            link={item.link}
            className="outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:ring-2 focus-visible:after:ring-white focus-visible:after:ring-inset"
          >
            {item.title}
          </SmartLink>
        ) : (
          item.title
        )}
      </h3>
      {item.text ? <p className="mt-3 line-clamp-3 text-pretty text-white/85">{item.text}</p> : null}
      <div className="mt-auto flex items-end justify-between pt-6">
        {item.icon ? (
          <IconBadge tone="light">
            <CtaIcon name={item.icon} />
          </IconBadge>
        ) : (
          <span />
        )}
        {item.link ? (
          <span aria-hidden className="grid size-12 place-items-center rounded-full bg-white/15 transition-colors duration-150 group-hover:bg-white group-hover:text-blue-dark">
            <ArrowRight className="size-5" />
          </span>
        ) : null}
      </div>
    </article>
  );
}

/** Catalog C3 – the item title is the small label, its text the large fact. */
function Benefits({ items }: { items: FeatureItem[] }) {
  return (
    <ul className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-line ${items.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
      {items.map((item, index) => (
        <li key={`${item.title}-${index}`} className="flex flex-col gap-3 lg:px-8 lg:first:pl-0 lg:last:pr-0">
          <p className="flex items-center gap-2.5 text-sm font-semibold text-muted-dark">
            {item.icon ? (
              <IconBadge tone="soft" size="sm">
                <CtaIcon name={item.icon} />
              </IconBadge>
            ) : null}
            {item.title}
          </p>
          {item.text ? <p className="text-lg leading-snug font-bold text-pretty text-blue-dark sm:text-xl">{item.text}</p> : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * The illustration when there is one, else the icon; nothing when neither is
 * set. An illustration gets more room than an icon (`imageSize`), since a logo
 * or drawing at icon size is hard to see.
 */
function Visual({
  item,
  className,
  iconClass,
  imageSize,
}: {
  item: FeatureItem;
  className: string;
  iconClass: string;
  imageSize: number;
}) {
  if (item.image) {
    return (
      <span className={`relative ${className} p-1`} style={{ width: imageSize, height: imageSize }}>
        <Image src={item.image.url} alt="" fill sizes={`${imageSize}px`} className="object-contain p-1" />
      </span>
    );
  }
  if (item.icon) {
    return (
      <span aria-hidden className={className}>
        <CtaIcon name={item.icon} className={iconClass} />
      </span>
    );
  }
  return null;
}

function ItemLink({ link }: { link: NavLink }) {
  const className =
    "inline-flex items-center gap-1.5 text-sm font-semibold text-blue-medium underline-offset-4 hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-blue-medium focus-visible:outline-none";
  const content = (
    <>
      {link.label}
      <ArrowRight className="size-4" aria-hidden />
    </>
  );
  if (link.newTab) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }
  if (/^(https?:|mailto:|tel:)/i.test(link.href)) {
    return (
      <a href={link.href} className={className}>
        {content}
      </a>
    );
  }
  return (
    <Link href={link.href} className={className}>
      {content}
    </Link>
  );
}
