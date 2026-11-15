import { CalendarCheck, Clock, Mail, MapPin, MessageCircle, MessagesSquare, Phone, UserRound } from "lucide-react";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import { buttonClass } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import type { Lang } from "@/i18n/config";
import { fill, getMessages } from "@/i18n/messages";
import { accountHref, reservationHref } from "@/i18n/routes";
import { formatOpeningHours, getChrome, listPlaceLinks, type Contact, type MenuItem, type NavLink } from "@/lib/strapi";

import { AnnouncementBar } from "./announcement-bar";
import { ContactTiles } from "./contact-tiles";
import { LinkGroups } from "./link-groups";
import { MainNav, type MainNavEntry } from "./main-nav";
import { BlogPanel, FleetPanel, LinksPanel, LocationsPanel } from "./menu-panels";
import { SOCIAL_NAMES, SocialIcon } from "./social-icon";

/**
 * Site header and footer from the CMS (`layout`, `site`, `announcement`; see
 * `lib/strapi/README.md`). The parts that read the CMS sit in `<Suspense>`:
 * with `CACHE_ENABLED` on they are prerendered and the fallback never shows;
 * with it off they stream in per request. The logo, the language dialog and the
 * customer panel do not wait for the CMS.
 *
 * Header: sticky, 64px on phones and 80px from `lg`. Left to right: logo, menu
 * (from `xl`: five entries and the right side need ~1100px), phone (icon only
 * below `2xl`), language and "Moje rezerwacje" (from `lg`, icon only), the green
 * "Zarezerwuj" button, the menu button (below `xl`).
 * Flex `order` keeps that sequence while the CMS parts stream in separately.
 */

const pillClass =
  "flex h-10 items-center gap-2 whitespace-nowrap rounded-full px-3 text-sm font-bold text-blue-dark outline-none transition-colors duration-quick ease-out-soft hover:bg-blue-dark/[0.05] focus-visible:ring-2 focus-visible:ring-blue-medium motion-reduce:transition-none";

// A hairline under the header once the page scrolls, without JavaScript: a
// scroll-driven animation where supported, an always-on line elsewhere.
const HEADER_CSS = `
@keyframes site-header-line { to { border-bottom-color: var(--color-line); } }
@supports (animation-timeline: scroll()) {
  .site-header { animation: site-header-line linear both; animation-timeline: scroll(root); animation-range: 0 24px; }
}
@supports not (animation-timeline: scroll()) {
  .site-header { border-bottom-color: var(--color-line); }
}`;

export function SiteHeader({ lang }: { lang: Lang }) {
  const t = getMessages(lang).layout;
  return (
    <>
      <Suspense fallback={null}>
        <Announcement lang={lang} />
      </Suspense>
      <header className="site-header sticky top-0 z-40 border-b border-transparent bg-white">
        <style href="site-header" precedence="default">
          {HEADER_CSS}
        </style>
        <Container className="flex h-16 items-center gap-1 sm:gap-2 lg:h-20">
          <Link href={`/${lang}`} aria-label={t.home} className="mr-auto shrink-0 rounded-control outline-none focus-visible:ring-2 focus-visible:ring-blue-medium xl:mr-1 2xl:mr-6">
            <Logo className="h-6 w-auto fill-blue-medium min-[360px]:h-7 sm:h-8 lg:h-10" label="MobiCars" />
          </Link>
          <Suspense
            fallback={
              <>
                <div className="hidden flex-1 xl:block" />
                <HeaderAccount lang={lang} />
              </>
            }
          >
            <HeaderMenu lang={lang} />
          </Suspense>
        </Container>
      </header>
    </>
  );
}

async function Announcement({ lang }: { lang: Lang }) {
  const { announcement } = await getChrome(lang);
  return announcement ? (
    <AnnouncementBar
      announcement={announcement}
      label={getMessages(lang).layout.announcement}
      closeLabel={getMessages(lang).layout.closeAnnouncement}
    />
  ) : null;
}

async function HeaderMenu({ lang }: { lang: Lang }) {
  const t = getMessages(lang).layout;
  const { header, headerCta, contact } = await getChrome(lang);
  const cta = headerCta ?? { label: t.book, href: reservationHref(lang), newTab: false };
  return (
    <MainNav
      entries={header.map((item) => toEntry(item, lang))}
      menuFooter={<MenuFooter lang={lang} contact={contact} />}
      actions={
        // In the order they are drawn: Tab follows the header from left to right.
        <>
          {/* Below `sm` the phone lives in the menu footer: logo, the longest CTA (uk) and the menu button fit at 320 px. */}
          {contact ? (
            <a href={contact.phoneHref} aria-label={fill(t.callHotline, { phone: contact.phone })} className={`${pillClass} hidden sm:flex`}>
              <Phone className="size-5 text-blue-medium" aria-hidden />
              <span className="hidden 2xl:inline">{contact.phone}</span>
            </a>
          ) : null}
          <HeaderAccount lang={lang} />
          <CtaLink link={cta} className={buttonClass("success", "sm", "whitespace-nowrap px-3 sm:ml-1 sm:px-4 lg:h-12")} />
        </>
      }
    />
  );
}

/** Language and the customer's bookings, from `lg`; below that they are in the menu footer. */
function HeaderAccount({ lang }: { lang: Lang }) {
  const t = getMessages(lang).layout;
  return (
    <>
      <div className="hidden lg:block">
        <LanguageSwitcher lang={lang} />
      </div>
      <Link href={accountHref(lang, "reservations")} className={`${pillClass} hidden lg:flex`}>
        <UserRound className="size-5 text-blue-medium" aria-hidden />
        <span className="sr-only">{t.myReservations}</span>
      </Link>
    </>
  );
}

/** Hotline hours, one line per day range from the CMS rows; the old free text while the rows are empty. */
function hoursLines(contact: Contact, lang: Lang): string[] {
  if (contact.hours.length > 0) {
    return formatOpeningHours(contact.hours, lang, getMessages(lang).layout.hoursClosed);
  }
  return contact.openingHours ? [contact.openingHours] : [];
}

/** Bottom of the phone menu: hotline with its hours, the customer's bookings, the language. */
function MenuFooter({ lang, contact }: { lang: Lang; contact: Contact | null }) {
  const t = getMessages(lang).layout;
  const rowClass =
    "flex min-h-12 items-center gap-3 rounded-control px-3 py-2 text-base font-bold text-blue-dark outline-none hover:bg-blue-dark/[0.04] focus-visible:ring-2 focus-visible:ring-blue-medium";
  return (
    <div className="flex flex-col gap-1">
      {contact ? (
        <a href={contact.phoneHref} className={rowClass}>
          <Phone className="size-5 shrink-0 text-blue-medium" aria-hidden />
          <span className="flex flex-col">
            <span>{contact.phone}</span>
            {hoursLines(contact, lang).map((line) => (
              <span key={line} className="text-sm font-normal text-blue-dark/70">
                {line}
              </span>
            ))}
          </span>
        </a>
      ) : null}
      <Link href={accountHref(lang, "reservations")} className={rowClass}>
        <CalendarCheck className="size-5 shrink-0 text-blue-medium" aria-hidden />
        {t.myReservations}
      </Link>
      <LanguageSwitcher lang={lang} variant="menu" />
    </div>
  );
}

function toEntry(item: MenuItem, lang: Lang): MainNavEntry {
  switch (item.submenu) {
    case "none":
      return { label: item.label, href: item.link.href, newTab: item.link.newTab };
    case "links":
      return { label: item.label, panel: <LinksPanel links={item.links} /> };
    case "fleet":
      return { label: item.label, panel: <FleetPanel lang={lang} /> };
    case "locations":
      return { label: item.label, panel: <LocationsPanel lang={lang} /> };
    case "blog":
      return { label: item.label, panel: <BlogPanel lang={lang} /> };
  }
}

export function SiteFooter({ lang }: { lang: Lang }) {
  return (
    <footer className="bg-blue-dark text-white">
      <Suspense
        fallback={
          <Container className="py-section-sm">
            <Logo className="h-auto w-40 fill-white" label="MobiCars" />
          </Container>
        }
      >
        <FooterContent lang={lang} />
      </Suspense>
    </footer>
  );
}

/** The year for the copyright line; cached, as a prerender may not read the clock. */
async function currentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

const footerLinkClass =
  "rounded-sm text-sm text-white/80 underline-offset-4 outline-none hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-white";
const footerHeadingClass = "text-sm font-bold text-white";

async function FooterContent({ lang }: { lang: Lang }) {
  const t = getMessages(lang).layout;
  const [{ footer, contact, social }, year, places] = await Promise.all([getChrome(lang), currentYear(), listPlaceLinks(lang)]);
  const tiles = contact?.departments.some((department) => department.showInFooter) ?? false;
  return (
    <>
      {tiles && contact ? (
        <div className="border-b border-white/10">
          <Container className="py-section-sm">
            <ContactTiles lang={lang} departments={contact.departments} />
          </Container>
        </div>
      ) : null}
      {/* Every city, airport and local page of this language, built from the CMS (none in a language without them). */}
      {places.cities.length + places.airports.length + places.locals.length > 0 ? (
        <div className="border-b border-white/10">
          <Container className="py-section-sm">
            <LinkGroups
              label={t.placeLinks}
              groups={[
                { title: t.placeCities, links: places.cities },
                { title: t.placeAirports, links: places.airports },
                { title: t.placeLocals, links: places.locals },
              ]}
            />
          </Container>
        </div>
      ) : null}
      <Container className="grid gap-12 py-section-sm lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-16">
        <div className="flex flex-col gap-5">
          <Logo className="h-auto w-40 fill-white" label="MobiCars" />
          {footer.text ? <p className="text-sm text-pretty text-white/80">{footer.text}</p> : null}
          {social.length > 0 ? (
            <div className="flex flex-col gap-2">
              <h2 className={footerHeadingClass}>{t.followUs}</h2>
              <ul className="flex flex-wrap gap-2">
                {social.map((item) => (
                  <li key={item.platform}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-full text-white/85 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <SocialIcon platform={item.platform} />
                      <span className="sr-only">{SOCIAL_NAMES[item.platform]}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <LanguageSwitcher lang={lang} variant="footer" />
        </div>

        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_15rem]">
          {footer.groups.length > 0 ? (
            <nav aria-label={t.footerNav} className="grid grid-cols-2 gap-x-6 gap-y-8 xl:grid-cols-4">
              {footer.groups.map((group) => (
                <section key={group.title} className="flex flex-col gap-3">
                  <h2 className={footerHeadingClass}>{group.title}</h2>
                  <FooterLinks links={group.links} />
                </section>
              ))}
            </nav>
          ) : null}
          {contact ? <FooterContact lang={lang} contact={contact} /> : null}
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-4 py-6 text-xs text-white/70 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            <p>
              © {year} {footer.companyName ?? "MobiCars"}
            </p>
            {footer.legalText ? <p className="text-white/60">{footer.legalText}</p> : null}
          </div>
          {footer.legal.length > 0 ? (
            <nav aria-label={t.legal}>
              <FooterLinks links={footer.legal} className="flex flex-wrap gap-x-5 gap-y-2" />
            </nav>
          ) : null}
          {footer.paymentMethods.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="mr-1">{t.payments}</h2>
              <ul className="flex flex-wrap gap-1.5">
                {footer.paymentMethods.map((method) => (
                  <li key={method} className="rounded-md bg-white/10 px-2 py-1 font-semibold text-white">
                    {t.paymentMethods[method]}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Container>
      </div>
    </>
  );
}

function FooterContact({ lang, contact }: { lang: Lang; contact: Contact }) {
  const t = getMessages(lang).layout;
  const hours = hoursLines(contact, lang);
  const iconClass = "mt-0.5 size-4 shrink-0 text-green-light";
  return (
    <address className="flex flex-col gap-3 text-sm not-italic">
      <h2 className={footerHeadingClass}>{t.contact}</h2>
      <a href={contact.phoneHref} className={`${footerLinkClass} flex items-start gap-2 text-base font-bold text-white`}>
        <Phone className={iconClass} aria-hidden />
        {contact.phone}
      </a>
      {hours.length > 0 || contact.availabilityNote ? (
        <p className="flex items-start gap-2 text-white/80">
          <Clock className={iconClass} aria-hidden />
          <span className="flex flex-col gap-1">
            {hours.length > 0 ? (
              <span className="flex flex-col">
                {hours.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </span>
            ) : null}
            {contact.availabilityNote ? <span className="text-white/65">{contact.availabilityNote}</span> : null}
          </span>
        </p>
      ) : null}
      <a href={`mailto:${contact.email}`} className={`${footerLinkClass} flex items-start gap-2`}>
        <Mail className={iconClass} aria-hidden />
        {contact.email}
      </a>
      {contact.whatsappHref ? (
        <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer" className={`${footerLinkClass} flex items-start gap-2`}>
          <MessageCircle className={iconClass} aria-hidden />
          {t.whatsapp}
        </a>
      ) : null}
      {contact.chatUrl ? (
        <a href={contact.chatUrl} target="_blank" rel="noopener noreferrer" className={`${footerLinkClass} flex items-start gap-2`}>
          <MessagesSquare className={iconClass} aria-hidden />
          {t.chat}
        </a>
      ) : null}
      {contact.address ? (
        <p className="flex items-start gap-2 whitespace-pre-line text-white/80">
          <MapPin className={iconClass} aria-hidden />
          {contact.address}
        </p>
      ) : null}
    </address>
  );
}

function CtaLink({ link, className }: { link: NavLink; className: string }) {
  return link.newTab ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
      {link.label}
    </a>
  ) : (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

function FooterLinks({ links, className = "flex flex-col gap-2.5" }: { links: NavLink[]; className?: string }) {
  return (
    <ul className={className}>
      {links.map((link) => (
        <li key={`${link.href}-${link.label}`}>
          {link.newTab ? (
            <a href={link.href} target="_blank" rel="noopener noreferrer" className={footerLinkClass}>
              {link.label}
            </a>
          ) : (
            <Link href={link.href} className={footerLinkClass}>
              {link.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
