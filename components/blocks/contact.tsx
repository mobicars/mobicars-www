import { Building2, Clock, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";

import { buttonClass } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section";
import { cardClass, IconBadge } from "@/components/ui/surface";
import type { Lang } from "@/i18n/config";
import { contactCopy, type ContactCopy } from "@/i18n/contact-form";
import { HOTLINE } from "@/i18n/system-copy";
import { formatOpeningHours, getChrome, type ContactBlock, type Department } from "@/lib/strapi";

import { LazyContactFormFields } from "./contact-form-fields-lazy";
import { SectionFrame } from "./section-frame";

type SiteContact = Awaited<ReturnType<typeof getChrome>>["contact"];

/**
 * The contact page (catalog C12): the company card (phone, email, address,
 * registration data from `site.contact`, the one source the footer and the
 * JSON-LD share), the departments, the contact form and an optional photo.
 * Phones: card, departments, form, photo. Desktops: card and photo on the
 * left, the form on the right, the departments in a row below. Only the form
 * is client code, in its own chunk.
 */
export function Contact({ block, lang, first }: { block: ContactBlock; lang: Lang; first: boolean }) {
  const headingId = `contact-${block.id}`;
  const copy = contactCopy(lang);
  return (
    <SectionFrame style={block.section} labelledBy={headingId}>
      <SectionHeader
        id={headingId}
        level={first ? 1 : 2}
        eyebrow={block.eyebrow}
        title={block.title ?? copy.form.label}
        lead={block.lead}
        dark={block.section.tone === "dark"}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-10">
        <div className="lg:col-start-1 lg:row-start-1">
          <Suspense fallback={<CompanyCard contact={null} showCompany={false} copy={copy} lang={lang} />}>
            <SiteCompanyCard lang={lang} showCompany={block.showCompany} copy={copy} />
          </Suspense>
        </div>
        {block.departments.length > 0 ? (
          <Departments departments={block.departments} headingId={headingId} copy={copy} lang={lang} />
        ) : (
          // No list of its own: the site's departments (`site.contact`), the one source the footer tiles share.
          <Suspense fallback={null}>
            <SiteDepartments headingId={headingId} copy={copy} lang={lang} />
          </Suspense>
        )}
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <LazyContactFormFields
            lang={lang}
            copy={copy.form}
            topics={block.topics}
            fallbackContact={
              <Suspense fallback={<DirectLinks contact={null} />}>
                <SiteDirectLinks lang={lang} />
              </Suspense>
            }
          />
        </div>
        {block.image ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-card lg:col-start-1 lg:row-start-2">
            <Image
              src={block.image.url}
              alt={block.image.alt}
              fill
              quality={60}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}
      </div>
    </SectionFrame>
  );
}

async function SiteCompanyCard({ lang, showCompany, copy }: { lang: Lang; showCompany: boolean; copy: ContactCopy }) {
  const contact = await getChrome(lang).then(
    (chrome) => chrome.contact,
    () => null,
  );
  return <CompanyCard contact={contact} showCompany={showCompany} copy={copy} lang={lang} />;
}

/** Call and email first (one tap), then the rows; the hotline stands in until the CMS answers. */
function CompanyCard({ contact, showCompany, copy, lang }: { contact: SiteContact | null; showCompany: boolean; copy: ContactCopy; lang: Lang }) {
  const t = copy.company;
  const phone = contact?.phone ?? HOTLINE.label;
  const phoneHref = contact?.phoneHref ?? HOTLINE.href;
  const company = showCompany ? (contact?.company ?? null) : null;
  // One line per day range from the CMS rows; the old free text while the rows are empty.
  const hours = contact
    ? contact.hours.length > 0
      ? formatOpeningHours(contact.hours, lang, t.closed)
      : contact.openingHours
        ? [contact.openingHours]
        : []
    : [];
  return (
    <div className={cardClass("light", false, "flex flex-col gap-5 p-5 sm:p-6")}>
      <div className="grid grid-cols-2 gap-3">
        <a href={phoneHref} className={buttonClass("success", "md", "px-3")}>
          <Phone className="size-4" aria-hidden />
          {t.call}
        </a>
        {contact ? (
          <a href={`mailto:${contact.email}`} className={buttonClass("secondary", "md", "px-3")}>
            <Mail className="size-4" aria-hidden />
            {t.write}
          </a>
        ) : null}
      </div>
      <dl className="flex flex-col divide-y divide-line">
        <Row icon={<Phone />} term={t.hotline}>
          <a href={phoneHref} className="font-semibold underline-offset-4 hover:underline">
            {phone}
          </a>
          {hours.map((line) => (
            <span key={line} className="block text-sm text-muted-dark">
              {line}
            </span>
          ))}
          {contact?.availabilityNote ? <span className="block text-sm text-muted-dark">{contact.availabilityNote}</span> : null}
        </Row>
        {contact ? (
          <Row icon={<Mail />} term={t.email}>
            <a href={`mailto:${contact.email}`} className="font-semibold break-all underline-offset-4 hover:underline">
              {contact.email}
            </a>
          </Row>
        ) : null}
        {showCompany && contact?.address ? (
          <Row icon={<MapPin />} term={t.address}>
            <span className="block">{contact.address}</span>
            {contact.mapUrl ? (
              <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-medium underline-offset-4 hover:underline">
                {t.showMap}
              </a>
            ) : null}
          </Row>
        ) : null}
        {company ? (
          <Row icon={<Building2 />} term={company.legalName}>
            <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-dark">
              {company.nip ? <span>{t.taxId} {company.nip}</span> : null}
              {company.regon ? <span>{t.regon} {company.regon}</span> : null}
              {company.krs ? <span>{t.krs} {company.krs}</span> : null}
            </span>
          </Row>
        ) : null}
      </dl>
    </div>
  );
}

function Row({ icon, term, children }: { icon: ReactNode; term: string; children: ReactNode }) {
  // `dt` and `dd` sit right in the group (a `dl` allows nothing else there); the icon rides in the `dt`.
  return (
    <div className="relative py-3 pl-11 first:pt-0 last:pb-0">
      <dt className="text-sm text-muted-dark">
        <span className="absolute left-0 [&>span]:size-8">
          <IconBadge tone="soft" size="sm">
            {icon}
          </IconBadge>
        </span>
        {term}
      </dt>
      <dd className="text-blue-dark">{children}</dd>
    </div>
  );
}

async function SiteDepartments({ headingId, copy, lang }: { headingId: string; copy: ContactCopy; lang: Lang }) {
  const departments = await getChrome(lang).then(
    (chrome) => chrome.contact?.departments ?? [],
    () => [],
  );
  return departments.length > 0 ? <Departments departments={departments} headingId={headingId} copy={copy} lang={lang} /> : null;
}

function Departments({ departments, headingId, copy, lang }: { departments: Department[]; headingId: string; copy: ContactCopy; lang: Lang }) {
  return (
    <section aria-labelledby={`${headingId}-departments`} className="flex flex-col gap-4 lg:col-span-2 lg:row-start-3">
      <h3 id={`${headingId}-departments`} className="text-subtitle text-blue-dark">
        {copy.departments.title}
      </h3>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {departments.map((department) => (
          <li key={department.name} className="flex">
            <DepartmentCard department={department} copy={copy} lang={lang} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function DepartmentCard({ department, copy, lang }: { department: Department; copy: ContactCopy; lang: Lang }) {
  const t = copy.departments;
  // Rows from the CMS first ("pon.–pt. 07:00–20:00"), else the free text.
  const hours = department.schedule.length > 0 ? formatOpeningHours(department.schedule, lang, copy.company.closed) : department.hours ? [department.hours] : [];
  return (
    <article className={cardClass("light", false, "flex w-full flex-col gap-2 p-5")}>
      <h4 className="font-bold text-blue-dark">{department.name}</h4>
      {department.text ? <p className="text-sm text-muted-dark">{department.text}</p> : null}
      <ul className="mt-auto flex flex-col pt-1 text-sm font-semibold">
        {department.phone && department.phoneHref ? (
          <li>
            <a href={department.phoneHref} aria-label={`${t.call(department.name)} ${department.phone}`} className="inline-flex min-h-11 items-center gap-2 text-blue-dark underline-offset-4 hover:underline">
              <Phone className="size-4 text-blue-medium" aria-hidden />
              {department.phone}
            </a>
          </li>
        ) : null}
        {department.email ? (
          <li>
            <a href={`mailto:${department.email}`} aria-label={`${t.write(department.name)} ${department.email}`} className="inline-flex min-h-11 items-center gap-2 break-all text-blue-dark underline-offset-4 hover:underline">
              <Mail className="size-4 shrink-0 text-blue-medium" aria-hidden />
              {department.email}
            </a>
          </li>
        ) : null}
        {hours.length > 0 ? (
          <li className="flex items-start gap-2 py-1 font-normal text-muted-dark">
            <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span className="sr-only">{t.hours}:</span>
            <span>
              {hours.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </span>
          </li>
        ) : null}
      </ul>
      {department.link ? (
        <Link
          href={department.link.href}
          target={department.link.newTab ? "_blank" : undefined}
          rel={department.link.newTab ? "noopener noreferrer" : undefined}
          className="text-sm font-semibold text-blue-medium underline-offset-4 hover:underline"
        >
          {department.link.label}
        </Link>
      ) : null}
    </article>
  );
}

async function SiteDirectLinks({ lang }: { lang: Lang }) {
  const contact = await getChrome(lang).then(
    (chrome) => chrome.contact,
    () => null,
  );
  return <DirectLinks contact={contact} />;
}

function DirectLinks({ contact }: { contact: SiteContact | null }) {
  return (
    <ul className="flex flex-col gap-1 font-semibold">
      <li>
        <a href={contact?.phoneHref ?? HOTLINE.href} className="underline">
          {contact?.phone ?? HOTLINE.label}
        </a>
      </li>
      {contact ? (
        <li>
          <a href={`mailto:${contact.email}`} className="underline">
            {contact.email}
          </a>
        </li>
      ) : null}
    </ul>
  );
}
