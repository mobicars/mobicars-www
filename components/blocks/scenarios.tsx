import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";

import { Container, Section, SectionHeader } from "@/components/ui/section";
import { buttonClass } from "@/components/ui/button";
import { SmartLink } from "@/components/ui/smart-link";
import { Ornament, Pill } from "@/components/ui/surface";

import type { Scenario, ScenariosBlock } from "@/lib/strapi";

import { LazyScenarioTabs } from "./scenario-tabs-lazy";

/**
 * Ways to work with us ("na projekt", "zamiast leasingu", "auto zastępcze"):
 * tabs, each with who it is for, how it works and what the client gets. The
 * panels are rendered here on the server; only the tab switching is client
 * code (`ScenarioTabs`). A single scenario shows without tabs.
 */
export function Scenarios({ block, first }: { block: ScenariosBlock; first: boolean }) {
  const headingId = `scenarios-${block.id}`;
  const dark = block.section.tone === "dark";
  const layout = (block as ScenariosBlock & { layout?: "tabs" | "panel" | null }).layout === "panel" ? "panel" : "tabs";
  const panels = block.items.map((item, index) => ({
    label: item.label,
    content: layout === "panel" ? <BigPanel item={item} first={index === 0} /> : <Panel item={item} dark={dark} />,
  }));
  return (
    <Section tone={block.section.tone} spacing={block.section.spacing} anchor={block.section.anchor} labelledBy={headingId}>
      <Container width={block.section.width}>
        {block.title ? (
          <SectionHeader id={headingId} level={first ? 1 : 2} eyebrow={block.eyebrow} title={block.title} lead={block.lead} dark={dark} />
        ) : null}
        {panels.length === 1 && layout === "tabs" ? (
          panels[0].content
        ) : (
          <LazyScenarioTabs label={block.title ?? panels[0].label} panels={panels} dark={dark} layout={layout} />
        )}
      </Container>
    </Section>
  );
}

/**
 * Catalog C20 (carnet.pl): copy on navy on the left, the photo filling the
 * right; on phones the photo (16:9) above the copy. Only the first tab's photo
 * loads at once – the others are lazy and arrive when their tab opens.
 */
function BigPanel({ item, first }: { item: Scenario; first: boolean }) {
  return (
    <div className="grid lg:min-h-[28rem] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="order-last flex flex-col gap-4 p-6 sm:p-8 lg:order-first lg:p-12">
        {item.audience ? (
          <Pill tone="glass" className="text-blue-dark">
            {item.audience}
          </Pill>
        ) : null}
        <h3 className="text-title text-balance text-white">{item.title}</h3>
        {item.text ? <p className="text-lead text-pretty text-white/80">{item.text}</p> : null}
        {item.benefits.length > 0 ? (
          <ul className="flex flex-col gap-2.5">
            {item.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <span aria-hidden className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-green-medium text-white">
                  <Check className="size-4" strokeWidth={2.5} />
                </span>
                <span className="text-pretty text-white/90">{benefit}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {item.cta ? (
          <SmartLink link={item.cta} className={buttonClass("inverse", "md", "mt-auto w-full sm:w-fit")}>
            {item.cta.label}
            <ArrowRight className="size-4" aria-hidden />
          </SmartLink>
        ) : null}
      </div>
      {item.image ? (
        <div className="relative aspect-video lg:aspect-auto">
          <Image
            src={item.image.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 42rem, 100vw"
            quality={60}
            loading={first ? undefined : "lazy"}
            className="object-cover"
          />
        </div>
      ) : (
        <div className="relative hidden lg:block">
          <Ornament kind="road" className="text-white/15" />
        </div>
      )}
    </div>
  );
}

function Panel({ item, dark }: { item: Scenario; dark: boolean }) {
  return (
    <div
      className={`grid gap-8 rounded-card p-6 sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12 lg:p-12 ${dark ? "bg-white/[0.06] text-white" : "border border-line bg-white text-blue-dark shadow-card"}`}
    >
      <div className="flex flex-col gap-4">
        {item.audience ? (
          <p className={`text-eyebrow uppercase ${dark ? "text-green-light" : "text-green-dark"}`}>{item.audience}</p>
        ) : null}
        <h3 className="text-subtitle text-balance">{item.title}</h3>
        {item.text ? <p className={`text-pretty ${dark ? "text-white/80" : "text-blue-dark/75"}`}>{item.text}</p> : null}
        {item.cta ? (
          <SmartLink
            link={item.cta}
            className={`mt-2 inline-flex w-fit items-center gap-2 font-semibold underline-offset-4 hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:outline-none ${dark ? "text-white focus-visible:ring-white" : "text-blue-medium focus-visible:ring-blue-medium"}`}
          >
            {item.cta.label}
            <ArrowRight className="size-4" aria-hidden />
          </SmartLink>
        ) : null}
      </div>
      {item.benefits.length > 0 || item.image ? (
        <div className="flex flex-col gap-6">
          {item.image ? (
            <span className="relative block aspect-[16/10] overflow-hidden rounded-control bg-surface">
              <Image src={item.image.url} alt={item.image.alt} fill sizes="(min-width: 1024px) 36rem, 100vw" className="object-cover" />
            </span>
          ) : null}
          {item.benefits.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {item.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-green-light text-green-dark`}
                  >
                    <Check className="size-4" strokeWidth={2.5} />
                  </span>
                  <span className="text-pretty">{benefit}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
