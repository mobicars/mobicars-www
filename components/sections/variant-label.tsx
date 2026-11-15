import type { VariantLabelSection } from "@/lib/strapi";

import { Container } from "@/components/ui/section";

/**
 * Component base page only: the variant's name over the component shown
 * under it, set apart with a dashed rule so it never reads as site content.
 */
export function VariantLabel({ section }: { section: VariantLabelSection }) {
  return (
    <div className="border-t-2 border-dashed border-line-strong bg-surface py-4">
      <Container>
        <p className="font-mono text-xs font-semibold tracking-wide text-muted-dark uppercase">Wariant</p>
        <h2 className="text-lg font-bold text-blue-dark">{section.title}</h2>
        {section.note ? <p className="max-w-3xl text-sm text-pretty text-muted-dark">{section.note}</p> : null}
      </Container>
    </div>
  );
}
