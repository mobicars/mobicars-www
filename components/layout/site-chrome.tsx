import { CalendarCheck, Clock, Mail, MapPin, MessageCircle, MessagesSquare, Phone, UserRound } from "lucide-react";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import { Container } from "@/components/ui/section";
import type { Lang } from "@/i18n/config";
import { fill, getMessages } from "@/i18n/messages";
import { accountHref } from "@/i18n/routes";
import { formatOpeningHours, getChrome, listPlaceLinks, type Contact, type MenuItem, type NavLink } from "@/lib/strapi";

import { AnnouncementBar } from "./announcement-bar";
import { ContactTiles } from "./contact-tiles";
import { LinkGroups } from "./link-groups";
import { MainNav, type MainNavEntry } from "./main-nav";
import { BlogPanel, FleetPanel, LinksPanel, LocationsPanel } from "./menu-panels";
import { SOCIAL_NAMES, SocialIcon } from "./social-icon";
import { TopBarScroll } from "./top-bar-scroll";

/**
 * Site header and footer from the CMS (`layout`, `site`, `announcement`; see
 * `lib/strapi/README.md`). The parts that read the CMS sit in `<Suspense>`:
 * with `CACHE_ENABLED` on they are prerendered and the fallback never shows;
 * with it off they stream in per request. The logo, the language dialog and the
 * customer panel do not wait for the CMS.
 *
 * Header: sticky, a 48px navy top bar over the main row (64px on phones, 80px
 * from `lg`), as on the old site, carfree.pl and carnet.pl. The bar holds the
 * social links and the CMS top links (`topLinks`, from `md`; in the phone menu
 * too) on the left, "Zaloguj się" and the language as white-framed pills on the
 * right. The main row: the logo, the menu (from `xl`), the hotline button
 * (green, "Infolinia | phone"; the phone icon alone on phones, the number from
 * `sm`, the word from `md`) and the menu
 * button (below `xl`); no "Zarezerwuj". Once the bar has hidden, the main row turns blue (`blue-medium`)
 * with a white logo and white links (the `scrolled` variant, `globals.css`).
 * The bar hides while the page scrolls down and comes back on the way up
 * (`TopBarScroll`). The header stays `sticky`, never `fixed`: it slides up by
 * the bar's height with a `transform`, as carnet.pl's header does (the compositor
 * moves it, no layout on each frame), so nothing below it moves (no layout shift).
 * The menu sheet and the language dialog are portals, outside the moved header.
 * The CMS announcement sits in the header above the bar and hides with it, as
 * carnet.pl's offer bar does; `TopBarScroll` measures the two (the announcement
 * wraps on phones, and a visitor may close it) into `--site-topbar`.
 * `--site-header` is the header's height on screen, for anything sticky under it.
 * Flex `order` keeps the main row's sequence while the CMS parts stream in separately.
 */

// A hairline under the header once the page scrolls, without JavaScript: a
// scroll-driven animation where supported, an always-on line elsewhere.
const HEADER_CSS = `
@keyframes site-header-line { to { border-bottom-color: var(--color-line); } }
@supports (animation-timeline: scroll()) {
  .site-header { animation: site-header-line linear both; animation-timeline: scroll(root); animation-range: 0 24px; }
}
@supports not (animation-timeline: scroll()) {
  .site-header { border-bottom-color: var(--color-line); }
}
:root { --site-topbar: 3rem; --site-header-row: 4rem; --site-header: calc(var(--site-header-row) + var(--site-topbar)); }
@media (min-width: 64rem) { :root { --site-header-row: 5rem; } }
html[data-topbar="hidden"] { --site-header: var(--site-header-row); }
.site-header { transition: transform 300ms ease-in-out, background-color 300ms ease-in-out; }
html[data-topbar="hidden"] .site-header { transform: translateY(calc(var(--site-topbar) * -1)); background-color: var(--color-blue-medium); animation: none; border-bottom-color: transparent; }
@media (prefers-reduced-motion: reduce) { .site-header { transition: none; } }`;

export function SiteHeader({ lang }: { lang: Lang }) {
  const t = getMessages(lang).layout;
  return (
    <header className="site-header sticky top-0 z-40 border-b border-transparent bg-white">
      <style href="site-header" precedence="default">
        {HEADER_CSS}
      </style>
      <TopBarScroll />
      {/* What hides on the way down, as on carnet.pl: the CMS announcement, then the navy bar. */}
      <div className="site-header-hide">
        <Suspense fallback={null}>
          <Announcement lang={lang} />
        </Suspense>
        <div className="bg-blue-dark text-white">
          <Container className="flex h-12 items-center gap-x-6 text-xs">
            <Suspense fallback={null}>
              <TopBarLinks lang={lang} />
            </Suspense>
            <div className="ml-auto flex items-center gap-2">
              <Link href={accountHref(lang, "reservations")} className={TOP_BAR_PILL}>
                <UserRound className="size-3.5 shrink-0" aria-hidden />
                {t.login}
              </Link>
              <LanguageSwitcher lang={lang} />
            </div>
          </Container>
        </div>
      </div>
      <Container className="flex h-16 items-center gap-1 sm:gap-2 lg:h-20">
        <Link href={`/${lang}`} aria-label={t.home} className="mr-auto shrink-0 rounded-control outline-none focus-visible:ring-2 focus-visible:ring-blue-medium xl:mr-1 2xl:mr-6">
          <Logo className="h-6 w-auto fill-blue-medium transition-[fill] duration-300 min-[360px]:h-7 sm:h-8 lg:h-10 scrolled:fill-white" taglineClassName="scrolled:fill-white" label="MobiCars" />
        </Link>
        <Suspense fallback={<div className="hidden flex-1 xl:block" />}>
          <HeaderMenu lang={lang} />
        </Suspense>
      </Container>
    </header>
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
  // No "Zarezerwuj" in the header (decided 21 November 2026): the hotline is its one button; the booking starts from the
  // pages' search. `layout.headerCta` stays in the CMS, unused.
  const { header, contact, topLinks } = await getChrome(lang);
  return (
    <MainNav
      entries={header.map((item) => toEntry(item, lang))}
      menuFooter={<MenuFooter lang={lang} contact={contact} links={topLinks} />}
      actions={contact ? <HotlineButton lang={lang} contact={contact} /> : null}
    />
  );
}

/** The top bar's right side: "Zaloguj się" and (`LanguageSwitcher`) the language, white-framed pills on the navy. */
const TOP_BAR_PILL =
  "flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/60 px-3 text-xs font-semibold text-white outline-none transition-colors duration-200 ease-out hover:border-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-dark motion-reduce:transition-none";

/** The top bar's left side: the social links (green circles, CMS `site`), then the CMS top links from `md` (`layout.topLinks`). */
async function TopBarLinks({ lang }: { lang: Lang }) {
  const t = getMessages(lang).layout;
  const { social, topLinks } = await getChrome(lang);
  return (
    <>
      {social.length > 0 ? (
        <ul aria-label={t.followUs} className="flex items-center gap-2">
          {social.map((item) => (
            <li key={item.platform}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative grid size-6 place-items-center rounded-full text-green-medium outline-none transition-colors duration-200 ease-out hover:text-go-strong focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
              >
                {/* The icon is a circle with the mark cut out: a white disc under it makes the mark white, as on the old site. */}
                <span aria-hidden className="absolute inset-[3px] rounded-full bg-white" />
                <SocialIcon platform={item.platform} className="relative size-6" />
                <span className="sr-only">{SOCIAL_NAMES[item.platform]}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {topLinks.length > 0 ? (
        <nav aria-label={t.topNav} className="hidden md:block">
          <ul className="flex items-center gap-x-5">
            {topLinks.map((link) => (
              <li key={`${link.href}-${link.label}`}>
                <CtaLink
                  link={link}
                  className="rounded-sm text-xs font-medium whitespace-nowrap text-white/80 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                />
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </>
  );
}

/**
 * "Infolinia | phone" in the main row, green as on the old site: the phone icon alone on phones (a 40px circle), the
 * number from `sm`, "Infolinia |" before them from `md`. Stays green on the blue row too.
 */
function HotlineButton({ lang, contact }: { lang: Lang; contact: Contact }) {
  const t = getMessages(lang).layout;
  return (
    <a
      href={contact.phoneHref}
      aria-label={fill(t.callHotline, { phone: contact.phone })}
      className="ml-1 flex size-10 shrink-0 items-center justify-center gap-3 rounded-full bg-green-medium text-sm whitespace-nowrap text-white outline-none transition-colors duration-200 ease-out hover:bg-go-strong focus-visible:ring-2 focus-visible:ring-blue-medium focus-visible:ring-offset-2 motion-reduce:transition-none sm:w-auto sm:px-5 lg:h-12 scrolled:focus-visible:ring-white scrolled:focus-visible:ring-offset-blue-medium"
    >
      <span className="hidden text-xxs font-semibold md:inline">{t.hotline}</span>
      <span aria-hidden className="hidden h-5 w-px bg-white/40 md:block" />
      <Phone className="size-4 shrink-0 md:size-5 md:text-white/80" strokeWidth={1.75} aria-hidden />
      <span className="hidden font-bold sm:inline">{contact.phone}</span>
    </a>
  );
}

/** Hotline hours, one line per day range from the CMS rows; the old free text while the rows are empty. */
function hoursLines(contact: Contact, lang: Lang): string[] {
  if (contact.hours.length > 0) {
    return formatOpeningHours(contact.hours, lang, getMessages(lang).layout.hoursClosed);
  }
  return contact.openingHours ? [contact.openingHours] : [];
}

/** Bottom of the phone menu: the top bar's links (hidden there below `md`), hotline with its hours, the customer's bookings, the language. */
function MenuFooter({ lang, contact, links }: { lang: Lang; contact: Contact | null; links: NavLink[] }) {
  const t = getMessages(lang).layout;
  const rowClass =
    "flex min-h-12 items-center gap-3 rounded-control px-3 py-2 text-base font-bold text-blue-dark outline-none hover:bg-blue-dark/[0.04] focus-visible:ring-2 focus-visible:ring-blue-medium";
  return (
    <div className="flex flex-col gap-1">
      {links.length > 0 ? (
        <ul className="mb-2 flex flex-wrap gap-x-5 gap-y-1 border-b border-line px-3 pb-3">
          {links.map((link) => (
            <li key={`${link.href}-${link.label}`}>
              <CtaLink link={link} className="flex min-h-11 items-center rounded-sm text-sm font-semibold text-blue-dark/80 outline-none hover:text-blue-dark focus-visible:ring-2 focus-visible:ring-blue-medium" />
            </li>
          ))}
        </ul>
      ) : null}
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
            <Logo className="h-auto w-40 fill-white" tone="white" label="MobiCars" />
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
          <Logo className="h-auto w-40 fill-white" tone="white" label="MobiCars" />
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

/**
 * `/pl/dokumenty/…` and `/en/documents/…` redirect to a PDF in the CMS (`app/[lang]/dokumenty/[slug]/route.ts`),
 * so they are plain links: `<Link>` prefetched them, the prefetch followed the redirect to Strapi and the browser
 * logged a CORS error on every page.
 */
function isDocumentHref(href: string): boolean {
  return /^\/[a-z]{2}\/(dokumenty|documents)\//.test(href);
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
          ) : isDocumentHref(link.href) ? (
            <a href={link.href} className={footerLinkClass}>
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
