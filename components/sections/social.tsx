import { Mail, Phone } from "lucide-react";

import { SOCIAL_NAMES, SocialIcon } from "@/components/layout/social-icon";
import { buttonClass } from "@/components/ui/button";
import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getChrome, isDarkBackground, type SocialSection } from "@/lib/strapi";

import { SectionHeading, SectionShell } from "./section-shell";

/**
 * Social (`sections.social`): the site's social profiles (Site settings,
 * `site.social`) as large icons, and with `showContact` the phone and e-mail
 * (`site.contact`) as buttons that call or write. The section holds only its
 * heading and looks: a profile added in Site settings shows up here by itself.
 *
 * `centered`: heading, a row of icons, then the buttons. `split`: heading and
 * buttons on the left half, the icons in one row across the right half.
 * In our colours, not the platforms'; on hover an icon grows a little and
 * darkens. Server markup only.
 */
export async function Social({ section, lang }: { section: SocialSection; lang: Lang }) {
  const { social, contact } = await getChrome(lang);
  const t = getMessages(lang).blocks;
  const showContact = section.showContact && contact !== null;
  // Nothing to show without profiles or contact details.
  if (social.length === 0 && !showContact) {
    return null;
  }
  const headingId = `social-${section.id}`;
  const dark = isDarkBackground(section.background);
  const split = section.layout === "split" && social.length > 0;

  const buttons =
    showContact && contact ? (
      <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap ${split ? "" : "sm:justify-center"}`}>
        <a href={contact.phoneHref} className={buttonClass(dark ? "inverse" : "primary", "lg")}>
          <Phone aria-hidden className="size-5" />
          {contact.phone}
        </a>
        <a href={`mailto:${contact.email}`} className={buttonClass(dark ? "outline-inverse" : "secondary", "lg")}>
          <Mail aria-hidden className="size-5" />
          {contact.email}
        </a>
      </div>
    ) : null;

  const icons =
    social.length > 0 ? (
      // Always one row on desktops (wrapping on phones); in `split` larger and spread evenly across its half.
      <ul className={`flex flex-wrap gap-4 sm:gap-6 ${split ? "lg:flex-nowrap lg:justify-evenly" : "justify-center"}`}>
        {social.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-4 ${
                dark ? "focus-visible:ring-white focus-visible:ring-offset-blue-dark" : "focus-visible:ring-blue-medium"
              }`}
            >
              <SocialIcon
                platform={link.platform}
                className={`size-16 transition-[color,scale] duration-300 ease-out-soft group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:size-20 ${split ? "lg:size-24" : ""} ${
                  dark ? "text-white group-hover:text-white/85" : "text-blue-medium group-hover:text-blue-dark"
                }`}
              />
              <span className="sr-only">
                {SOCIAL_NAMES[link.platform]} ({t.opensInNewTab})
              </span>
            </a>
          </li>
        ))}
      </ul>
    ) : null;

  return (
    <SectionShell background={section.background} spacing={section.spacing} width={section.width} labelledBy={section.title ? headingId : undefined}>
      {split ? (
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex flex-col [&>div:first-child]:mb-8">
            <SectionHeading id={headingId} badge={section.badge} title={section.title} text={section.text} align="start" background={section.background} />
            {buttons}
          </div>
          {icons}
        </div>
      ) : (
        <div className="mx-auto max-w-4xl">
          <SectionHeading id={headingId} badge={section.badge} title={section.title} text={section.text} align="center" background={section.background} />
          {icons}
          {buttons ? <div className={icons ? "mt-10" : undefined}>{buttons}</div> : null}
        </div>
      )}
    </SectionShell>
  );
}
