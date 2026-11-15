import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { absoluteUrl, jsonLd } from "@/lib/fleet/seo";

/**
 * Visible breadcrumbs plus their `BreadcrumbList` JSON-LD. The last item is
 * the current page. Plain HTML on purpose: React Aria's `Breadcrumbs` adds
 * nothing to links in a list and would cost client JavaScript.
 */
export function Breadcrumbs({
  items,
  label,
  dark = false,
}: {
  items: { href: string; label: string }[];
  /** The landmark's name (`fleet.breadcrumbLabel`, `layout.breadcrumbLabel`). */
  label: string;
  dark?: boolean;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
  return (
    <nav aria-label={label} className={`text-sm ${dark ? "text-white/70" : "text-muted-dark"}`}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className={`font-semibold ${dark ? "text-white" : "text-blue-dark"}`}>
                  {item.label}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className={`inline-flex min-h-6 items-center rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 ${dark ? "hover:text-white focus-visible:ring-white" : "hover:text-blue-medium focus-visible:ring-blue-medium"}`}
                  >
                    {item.label}
                  </Link>
                  <ChevronRight className="size-3" aria-hidden />
                </>
              )}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />
    </nav>
  );
}
