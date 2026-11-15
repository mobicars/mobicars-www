import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Ornament } from "@/components/ui/surface";
import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import type { HeroBlock } from "@/lib/strapi";

import { CtaLink } from "./cta-link";

export type Crumb = { href: string; label: string };

/**
 * The hero of an inner page (`hero.layout = page`, catalog C6): low and dark,
 * breadcrumbs first, then the `<h1>` and the lead. No photo (the CMS still
 * requires one on every hero), so the page's LCP is the heading text.
 * Server-rendered, no client JavaScript.
 */
export function PageHero({
  block,
  lang,
  first,
  breadcrumbs,
}: {
  block: HeroBlock;
  lang: Lang;
  first: boolean;
  /** From the route (`pageBreadcrumbs`); the last one is this page. */
  breadcrumbs: Crumb[];
}) {
  const Heading = first ? "h1" : "h2";
  const crumbs =
    block.breadcrumbLabel && breadcrumbs.length > 0
      ? [...breadcrumbs.slice(0, -1), { ...breadcrumbs[breadcrumbs.length - 1], label: block.breadcrumbLabel }]
      : breadcrumbs;

  return (
    <section className="relative isolate overflow-hidden bg-blue-dark text-white">
      <Ornament kind="contour" className="text-white/10" />
      <div className="mx-auto flex w-full max-w-page flex-col gap-4 px-gutter py-8 sm:py-14">
        {crumbs.length > 1 ? <Breadcrumbs items={crumbs} label={getMessages(lang).fleet.breadcrumbLabel} dark /> : null}
        <div className="flex max-w-3xl flex-col gap-3">
          {block.badge ? (
            <p className="w-fit rounded-full bg-white/95 px-3 py-1 text-eyebrow text-blue-dark uppercase">{block.badge}</p>
          ) : null}
          <Heading className="text-title text-balance break-words hyphens-auto sm:text-display">{block.title}</Heading>
          {block.subtitle ? <p className="text-lead text-pretty text-white/80">{block.subtitle}</p> : null}
        </div>
        {block.ctas.length > 0 ? (
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            {block.ctas.map((cta) => (
              <CtaLink key={`${cta.href}-${cta.label}`} cta={cta} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
