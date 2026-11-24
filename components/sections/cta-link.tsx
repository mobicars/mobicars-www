import * as lucide from "lucide-react";
import { icons, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { createElement } from "react";

import { buttonClass, type ButtonSize } from "@/components/ui/button";
import type { Cta } from "@/lib/strapi";

/**
 * A CMS button (`elements.cta`): a link in the button look of its variant,
 * with its Lucide icon after the label. External links open in a new tab;
 * `mailto:` / `tel:` and full URLs are plain links, site paths go through
 * Next's `Link`. A Server Component, so blocks can use it as is.
 */
export function CtaLink({
  cta,
  size = "md",
  className = "w-full sm:w-auto",
}: {
  cta: Cta;
  /** `lg` for the one call to action of a section (the hero). */
  size?: ButtonSize;
  className?: string;
}) {
  const classes = buttonClass(cta.variant, size, className);
  const content = (
    <>
      {cta.label}
      {cta.icon ? <CtaIcon name={cta.icon} /> : null}
    </>
  );
  if (cta.newTab) {
    return (
      <a href={cta.href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }
  if (/^(https?:|mailto:|tel:)/i.test(cta.href)) {
    return (
      <a href={cta.href} className={classes}>
        {content}
      </a>
    );
  }
  return (
    <Link href={cta.href} className={classes}>
      {content}
    </Link>
  );
}

/**
 * A Lucide icon by the name strapi-lucide-icons saves (`arrow-right` →
 * `ArrowRight`). Rendered on the server, so the icon set stays out of the
 * browser bundle. An unknown name shows no icon.
 */
export function CtaIcon({ name, className = "size-4" }: { name: string; className?: string }) {
  const key = name.replace(/(^|-)([a-z0-9])/g, (_, __, char: string) => char.toUpperCase());
  // `icons` holds the canonical names only; an older or alias name
  // (`circle-help` for `circle-question-mark`) is a named export of the module.
  const icon =
    (icons as Record<string, LucideIcon | undefined>)[key] ??
    (lucide as unknown as Record<string, LucideIcon | undefined>)[key];
  return icon ? createElement(icon, { className, "aria-hidden": true }) : null;
}
