import { Mail, Phone } from "lucide-react";

import { IconBadge } from "@/components/ui/surface";
import type { Lang } from "@/i18n/config";
import { fill, getMessages } from "@/i18n/messages";
import { formatOpeningHours, type Department } from "@/lib/strapi";

/**
 * Contact tiles above the footer (catalog C25): the departments of
 * `site.contact` marked `showInFooter`, at most four, in CMS order. Nothing is
 * rendered when none is marked. Hours come from the rows (`schedule`); the
 * free text (`hours`) stands in, so "24/7" shows only when the editor wrote it.
 */
export function ContactTiles({ lang, departments }: { lang: Lang; departments: readonly Department[] }) {
  const tiles = departments.filter((department) => department.showInFooter).slice(0, 4);
  if (tiles.length === 0) {
    return null;
  }
  const t = getMessages(lang).layout;
  return (
    <section aria-labelledby="footer-contact-tiles">
      <h2 id="footer-contact-tiles" className="sr-only">
        {t.contact}
      </h2>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((department) => {
          const hours = department.schedule.length > 0 ? formatOpeningHours(department.schedule, lang, t.hoursClosed) : department.hours ? [department.hours] : [];
          return (
            <li key={department.name} className="flex flex-col gap-2 rounded-card bg-white/5 p-5 ring-1 ring-white/10">
              <IconBadge tone="go" size="sm">
                <Phone />
              </IconBadge>
              <h3 className="text-base font-semibold text-white">{department.name}</h3>
              {department.phone && department.phoneHref ? (
                <a
                  href={department.phoneHref}
                  aria-label={fill(t.callDepartment, { name: department.name, phone: department.phone })}
                  className="w-fit rounded-sm text-lg font-bold whitespace-nowrap text-white tabular-nums outline-none hover:underline focus-visible:ring-2 focus-visible:ring-white"
                >
                  {department.phone}
                </a>
              ) : null}
              {hours.length > 0 ? (
                <p className="flex flex-col text-sm text-white/70">
                  {hours.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
              ) : null}
              {department.email ? (
                <a
                  href={`mailto:${department.email}`}
                  className="flex w-fit items-center gap-2 rounded-sm text-sm break-all text-white/80 underline-offset-4 outline-none hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Mail className="size-4 shrink-0 text-green-light" aria-hidden />
                  {department.email}
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
