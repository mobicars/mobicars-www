import Link from "next/link";
import { ChevronDown } from "lucide-react";

import type { PlaceLink } from "@/lib/strapi";

/**
 * Large groups of links (cities, airports, local pages) on the dark footer.
 * Rendered on the server, no script: each group is a `<details>`. On phones the
 * groups start closed and open on a tap (44 px header). From `md` the list is
 * always shown (`::details-content`) and the summary is a plain heading;
 * browsers without `::details-content` keep the tap-to-open header there too.
 */
export function LinkGroups({ label, groups }: { label: string; groups: { title: string; links: PlaceLink[] }[] }) {
  const shown = groups.filter((group) => group.links.length > 0);
  if (shown.length === 0) {
    return null;
  }
  return (
    <nav aria-label={label} className="grid gap-x-10 gap-y-2 md:grid-cols-2 md:gap-y-8 xl:grid-cols-3">
      {shown.map((group) => (
        <details
          key={group.title}
          className="group/links border-b border-white/10 md:border-0 md:[&::details-content]:h-auto md:[&::details-content]:[content-visibility:visible]"
        >
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-sm text-sm font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-white md:pointer-events-none md:min-h-0 [&::-webkit-details-marker]:hidden">
            <h2>{group.title}</h2>
            <ChevronDown className="size-4 shrink-0 text-white/70 transition-transform duration-200 group-open/links:rotate-180 motion-reduce:transition-none md:hidden" aria-hidden />
          </summary>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 pt-2 pb-4 md:pt-3 md:pb-0">
            {group.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-sm text-sm text-white/80 underline-offset-4 outline-none hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </nav>
  );
}
