import { Mail, Phone } from "lucide-react";
import { Suspense } from "react";

import { Container, Section, SectionHeader } from "@/components/ui/section";
import type { Lang } from "@/i18n/config";
import { businessCopy } from "@/i18n/business-form";
import { HOTLINE } from "@/i18n/system-copy";
import { getChrome, type LeadFormBlock } from "@/lib/strapi";

import { LazyLeadFormFields } from "./lead-form-fields-lazy";
import { RichBlocksView } from "./rich-blocks";

/**
 * The business quote request: on desktops the form beside a panel with who
 * answers, how to reach us directly and what happens next; on phones the
 * panel comes first, short, then the form. The section is the page's
 * `#zapytanie` target. Phone and email come from the site contact in the CMS.
 * Only the form itself is client code.
 */
export function LeadForm({ block, lang, first }: { block: LeadFormBlock; lang: Lang; first: boolean }) {
  const headingId = `lead-form-${block.id}`;
  const copy = businessCopy(lang).form;
  const dark = block.section.tone === "dark";
  // The contact is read in its own boundary: a slow CMS must not hold the whole page's prerender.
  const direct = (
    <Suspense fallback={<DirectContact contact={null} />}>
      <SiteContact lang={lang} />
    </Suspense>
  );

  return (
    <Section tone={block.section.tone} spacing={block.section.spacing} anchor={block.section.anchor} labelledBy={headingId}>
      <Container width={block.section.width}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="flex flex-col gap-8">
            <SectionHeader
              id={headingId}
              level={first ? 1 : 2}
              eyebrow={block.eyebrow}
              title={block.title ?? copy.label}
              lead={block.lead}
              dark={dark}
            />
            {block.steps.length > 0 ? (
              <ol className="-mt-4 flex flex-col gap-4 sm:-mt-8">
                {block.steps.map((step, index) => (
                  <li key={step} className="flex items-start gap-4">
                    <span
                      aria-hidden
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${dark ? "bg-white text-blue-dark" : "bg-blue-dark text-white"}`}
                    >
                      {index + 1}
                    </span>
                    <span className={`pt-1 text-pretty ${dark ? "text-white/85" : "text-blue-dark/80"}`}>{step}</span>
                  </li>
                ))}
              </ol>
            ) : null}
            {/* Always shown: phone and e-mail are the alternative to the form. */}
            <div className={`flex flex-col gap-3 rounded-card p-6 ${dark ? "bg-white/[0.06] text-white" : "bg-tint text-blue-dark"}`}>
              {block.contactTitle ? <h3 className="font-bold">{block.contactTitle}</h3> : null}
              {block.contactText ? (
                <p className={`text-sm text-pretty ${dark ? "text-white/80" : "text-blue-dark/75"}`}>{block.contactText}</p>
              ) : null}
              {direct}
            </div>
          </div>
          <LazyLeadFormFields
            lang={lang}
            copy={copy}
            consent={<RichBlocksView blocks={block.consent} />}
            successTitle={block.successTitle}
            successText={block.successText}
            fallbackContact={direct}
          />
        </div>
      </Container>
    </Section>
  );
}

async function SiteContact({ lang }: { lang: Lang }) {
  const { contact } = await getChrome(lang);
  return <DirectContact contact={contact} />;
}

/** Phone and e-mail from the CMS; until they arrive (or without them), the hotline. */
function DirectContact({ contact }: { contact: { phone: string; phoneHref: string; email: string } | null }) {
  return (
    <ul className="flex flex-col gap-2">
      <li>
        <a href={contact?.phoneHref ?? HOTLINE.href} className="inline-flex items-center gap-2 font-bold underline-offset-4 hover:underline">
          <Phone className="size-4" aria-hidden />
          {contact?.phone ?? HOTLINE.label}
        </a>
      </li>
      {contact ? (
        <li>
          <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 font-semibold underline-offset-4 hover:underline">
            <Mail className="size-4" aria-hidden />
            {contact.email}
          </a>
        </li>
      ) : null}
    </ul>
  );
}
