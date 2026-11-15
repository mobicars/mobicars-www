import Link from "next/link";
import type { ReactNode } from "react";

import type { NavLink } from "@/lib/strapi";

/**
 * A CMS link with the right element: a new tab for external links the editor
 * marked so, a plain `<a>` for full URLs, `mailto:` and `tel:`, Next's `Link`
 * for site paths. Server Component.
 */
export function SmartLink({ link, className, children }: { link: NavLink; className?: string; children?: ReactNode }) {
  const content = children ?? link.label;
  if (link.newTab) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }
  if (/^(https?:|mailto:|tel:|#)/i.test(link.href)) {
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
