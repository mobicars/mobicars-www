import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { absoluteUrl, jsonLd } from "@/lib/fleet/seo";

/** Visible breadcrumbs plus their `BreadcrumbList` JSON-LD. The last item is the current page. */
export function Breadcrumbs({ items }: { items: { href: string; label: string }[] }) {
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
    <nav aria-label="Breadcrumb" className="text-xs text-muted-dark">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className="font-semibold text-blue-dark">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link href={item.href} className="underline-offset-4 hover:text-blue-medium hover:underline">
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
