import { ChevronRight, BadgePercent, Info, TriangleAlert } from "lucide-react";
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
  // Phones: the whole bar is the link (`after:`), as wide as a thumb needs, so the arrow at the end of the text is a
  // plain white chevron, no pill. From `sm`: the white pill with the label.
  "ml-0.5 inline-flex shrink-0 items-center justify-center align-middle text-white after:absolute after:inset-0 sm:ml-0 sm:h-7 sm:gap-1 sm:rounded-full sm:bg-white sm:pr-2.5 sm:pl-3.5 sm:text-blue-dark sm:after:hidden sm:hover:bg-white/90 text-xs leading-none font-bold whitespace-nowrap outline-none transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none";

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
        {/* Phones: the arrow ends the text's last line. From `sm`: text and button side by side, centred on one line. */}
        <p className="mx-auto w-full max-w-7xl px-12 py-2 text-center text-[0.8125rem] leading-snug font-semibold text-balance sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-3 sm:gap-y-1.5 sm:px-12">
          <span>
            <VariantIcon variant={announcement.variant} />
            {announcement.text}
          </span>
          {link ? (
            <>
              {link.newTab ? (
                <a href={link.href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                  <span className="max-sm:sr-only">{link.label}</span>
                  <ChevronRight className="size-5 -translate-y-px sm:size-3.5 sm:translate-y-0" aria-hidden />
                </a>
              ) : (
                <Link href={link.href} className={LINK_CLASS}>
                  <span className="max-sm:sr-only">{link.label}</span>
                  <ChevronRight className="size-5 -translate-y-px sm:size-3.5 sm:translate-y-0" aria-hidden />
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
  const className = "mr-1.5 inline size-4 -translate-y-px align-middle";
  switch (variant) {
    case "info":
      return <Info className={className} aria-hidden />;
    case "promo":
      return <BadgePercent className={className} aria-hidden />;
    case "urgent":
      return <TriangleAlert className={className} aria-hidden />;
  }
}
