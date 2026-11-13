import { Mail, MapPin, Clock, Phone, UserRound } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { accountHref } from "@/i18n/routes";
import { getChrome, type MenuItem, type NavLink } from "@/lib/strapi";

import { AnnouncementBar } from "./announcement-bar";
import { MainNav, type MainNavEntry } from "./main-nav";
import { BlogPanel, FleetPanel, LinksPanel, LocationsPanel } from "./menu-panels";
import { SOCIAL_NAMES, SocialIcon } from "./social-icon";

/**
 * Site header and footer from the CMS (`layout`, `site`, `announcement`; see
 * `lib/strapi/README.md`). The parts that read the CMS sit in `<Suspense>`:
 * with `CACHE_ENABLED` on they are prerendered and the fallback never shows;
 * with it off they stream in per request. The logo, the language dialog and the
 * customer panel do not wait for the CMS.
 */

const pillClass =
  "flex h-10 items-center gap-2 rounded-full px-3 text-sm font-bold text-blue-dark transition-colors duration-200 ease-out hover:bg-blue-dark/[0.05] motion-reduce:transition-none";

export function SiteHeader({ lang }: { lang: Lang }) {
  const t = getMessages(lang).layout;
  return (
    <>
      <Suspense fallback={null}>
        <Announcement lang={lang} />
      </Suspense>
      <header className="relative z-40 border-b border-muted bg-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-1 px-3 sm:gap-2 sm:px-6 lg:h-20">
          <Link href={`/${lang}`} aria-label={t.home} className="mr-auto shrink-0 lg:mr-4">
            <Logo className="h-8 w-auto fill-blue-medium lg:h-10" label="MobiCars" />
          </Link>
          <Suspense fallback={<div className="hidden flex-1 lg:block" />}>
            <HeaderMenu lang={lang} />
          </Suspense>
          <LanguageSwitcher lang={lang} />
          <Link href={accountHref(lang)} className={pillClass}>
            <UserRound className="size-5 text-blue-medium" aria-hidden />
            <span className="sr-only md:not-sr-only">{t.account}</span>
          </Link>
        </div>
      </header>
    </>
  );
}

async function Announcement({ lang }: { lang: Lang }) {
  const { announcement } = await getChrome(lang);
  return announcement ? (
    <AnnouncementBar announcement={announcement} closeLabel={getMessages(lang).layout.closeAnnouncement} />
  ) : null;
}

async function HeaderMenu({ lang }: { lang: Lang }) {
  const t = getMessages(lang).layout;
  const { header, contact } = await getChrome(lang);
  return (
    <>
      <MainNav entries={header.map((item) => toEntry(item, lang))} />
      {contact ? (
        <a
          href={contact.phoneHref}
          className="flex h-10 items-center gap-2 rounded-full bg-green-medium px-3 text-sm font-bold text-white transition-colors duration-200 ease-out hover:bg-green-dark motion-reduce:transition-none"
        >
          <Phone className="size-4" aria-hidden />
          <span className="sr-only xl:not-sr-only">{contact.phone}</span>
          <span className="sr-only">{t.hotline}</span>
        </a>
      ) : null}
    </>
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
    <footer className="bg-blue-medium text-white">
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-7xl px-3 py-10 sm:px-6">
            <Logo className="h-auto w-40 fill-white" label="MobiCars" />
          </div>
        }
      >
        <FooterContent lang={lang} />
      </Suspense>
    </footer>
  );
}

async function FooterContent({ lang }: { lang: Lang }) {
  const t = getMessages(lang).layout;
  const { footer, contact, social } = await getChrome(lang);
  return (
    <>
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-3 py-10 sm:px-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Logo className="h-auto w-40 fill-white" label="MobiCars" />
          {footer.text ? <p className="text-sm text-white/85">{footer.text}</p> : null}
          {contact ? (
            <address className="flex flex-col gap-2 text-sm not-italic">
              <h2 className="sr-only">{t.contact}</h2>
              <a href={contact.phoneHref} className="flex items-center gap-2 font-bold underline-offset-4 hover:underline">
                <Phone className="size-4 text-green-light" aria-hidden />
                {contact.phone}
              </a>
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2 underline-offset-4 hover:underline">
                <Mail className="size-4 text-green-light" aria-hidden />
                {contact.email}
              </a>
              {contact.address ? (
                <p className="flex items-start gap-2 whitespace-pre-line text-white/85">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-green-light" aria-hidden />
                  {contact.address}
                </p>
              ) : null}
              {contact.openingHours ? (
                <p className="flex items-center gap-2 text-white/85">
                  <Clock className="size-4 text-green-light" aria-hidden />
                  {contact.openingHours}
                </p>
              ) : null}
            </address>
          ) : null}
          {social.length > 0 ? (
            <div className="flex flex-col gap-2">
              <h2 className="text-xs font-bold tracking-wide text-white/70 uppercase">{t.followUs}</h2>
              <ul className="flex flex-wrap gap-2">
                {social.map((item, index) => (
                  <li key={`${index}-${item.url}`}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-full text-white/90 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white"
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
        {footer.groups.length > 0 ? (
          <nav aria-label="MobiCars" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footer.groups.map((group) => (
              <section key={group.title} className="flex flex-col gap-3">
                <h2 className="text-sm font-bold">{group.title}</h2>
                <FooterLinks links={group.links} />
              </section>
            ))}
          </nav>
        ) : null}
      </div>
      <div className="bg-black/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-3 py-4 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© MobiCars</p>
          {footer.legal.length > 0 ? (
            <nav aria-label={t.legal}>
              <FooterLinks links={footer.legal} className="flex flex-wrap gap-x-5 gap-y-2" />
            </nav>
          ) : null}
        </div>
      </div>
    </>
  );
}

function FooterLinks({ links, className = "flex flex-col gap-2" }: { links: NavLink[]; className?: string }) {
  const linkClass = "text-sm text-white/85 underline-offset-4 hover:text-white hover:underline";
  return (
    <ul className={className}>
      {links.map((link) => (
        <li key={`${link.href}-${link.label}`}>
          {link.newTab ? (
            <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {link.label}
            </a>
          ) : (
            <Link href={link.href} className={linkClass}>
              {link.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
