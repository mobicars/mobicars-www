import { contactCopy } from "@/i18n/contact-form";
import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getChrome, type FormSection } from "@/lib/strapi";

import { ContactForm } from "./contact-form";
import { SectionHeading, SectionShell } from "./section-shell";

/**
 * Form (`sections.form`): the chosen form, for now the contact form (the old
 * site's fields, sent by email with a copy to the customer), under the
 * section's heading. `narrow`: one column as wide as a text; `wide`: the
 * fields in pairs on desktops. The company data and departments are built
 * beside it from Cards or Features, not here.
 */
export async function FormBlock({ section, lang }: { section: FormSection; lang: Lang }) {
  const headingId = `form-${section.id}`;
  return (
    <SectionShell background={section.background} spacing={section.spacing} width={section.width} labelledBy={section.title ? headingId : undefined}>
      <div className={section.formWidth === "narrow" ? "mx-auto max-w-2xl" : undefined}>
        <SectionHeading id={headingId} badge={section.badge} title={section.title} text={section.text} align={section.headerAlign} background={section.background} />
        <ContactFormView lang={lang} wide={section.formWidth === "wide"} framed={section.background.tone === "white"} />
      </div>
    </SectionShell>
  );
}

/** The contact form with its texts and the fallback contact (Site settings): also Two columns' content. */
export async function ContactFormView({ lang, wide, framed }: { lang: Lang; wide: boolean; framed: boolean }) {
  const { contact } = await getChrome(lang);
  const copy = contactCopy(lang);
  const fallback = contact ? (
    <p className="flex flex-wrap gap-x-4 gap-y-1 font-semibold">
      <a href={contact.phoneHref} className="underline">
        {contact.phone}
      </a>
      <a href={`mailto:${contact.email}`} className="underline">
        {contact.email}
      </a>
    </p>
  ) : null;
  return <ContactForm lang={lang} copy={copy.form} phoneTexts={getMessages(lang).auth.phone} wide={wide} framed={framed} fallbackContact={fallback} />;
}
