import { ArrowRight, BadgePercent, Info, TriangleAlert } from "lucide-react";
import Link from "next/link";

import type { Announcement } from "@/lib/strapi";

import { AnnouncementClose } from "./announcement-close";

const VARIANTS: Record<Announcement["variant"], string> = {
  info: "bg-blue-dark text-white",
  // `go-strong`: white text on `green-medium` is 3.7:1, below AA for this size.
  promo: "bg-go-strong text-white",
  urgent: "bg-red-600 text-white",
};

/**
 * A small white pill: reads as a button without competing with the header.
 * Navy on white keeps its contrast on every variant (white on a tinted pill
 * did not: 2.98:1 on the promo green).
 */
const LINK_CLASS =
  "ml-2 inline-flex items-center gap-1 rounded-full bg-white px-3 py-0.5 align-middle text-xs font-bold whitespace-nowrap text-blue-dark outline-none transition-colors duration-200 ease-out hover:bg-blue-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none";

const BAR_ID = "announcement-bar";
/** Holds the version of the last announcement the visitor closed. */
const DISMISSED_KEY = "mobicars:announcement-dismissed";

/**
 * The CMS announcement above the header. Whether it shows at all (switch and
 * dates) is decided with the cached data (`getChrome`). A closed bar stays
 * closed until the editor saves a new version: the inline script hides it
 * before the first paint, so it does not flash or shift the page.
 */
export function AnnouncementBar({
  announcement,
  label,
  closeLabel,
}: {
  announcement: Announcement;
  /** Name of the bar's region landmark ("Komunikat"). */
  label: string;
  closeLabel: string;
}) {
  const { link } = announcement;
  return (
    <>
      <section id={BAR_ID} aria-label={label} className={`relative ${VARIANTS[announcement.variant]}`}>
        <p className="mx-auto w-full max-w-7xl px-10 py-2 text-center text-sm font-semibold text-balance sm:px-12">
          <VariantIcon variant={announcement.variant} />
          {announcement.text}
          {link ? (
            <>
              {" "}
              {link.newTab ? (
                <a href={link.href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                  {link.label}
                  <ArrowRight className="size-3.5" aria-hidden />
                </a>
              ) : (
                <Link href={link.href} className={LINK_CLASS}>
                  {link.label}
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              )}
            </>
          ) : null}
        </p>
        {announcement.closable ? (
          <AnnouncementClose barId={BAR_ID} storageKey={DISMISSED_KEY} version={announcement.key} label={closeLabel} />
        ) : null}
      </section>
      {announcement.closable ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem(${JSON.stringify(DISMISSED_KEY)})===${JSON.stringify(announcement.key)})document.getElementById(${JSON.stringify(BAR_ID)}).hidden=true}catch(e){}`.replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
    </>
  );
}

/** The variant's icon, inline before the text so it wraps with it. */
function VariantIcon({ variant }: { variant: Announcement["variant"] }) {
  const className = "mr-2 inline size-4 -translate-y-px align-middle";
  switch (variant) {
    case "info":
      return <Info className={className} aria-hidden />;
    case "promo":
      return <BadgePercent className={className} aria-hidden />;
    case "urgent":
      return <TriangleAlert className={className} aria-hidden />;
  }
}
