import Image from "next/image";

import { Container, Section } from "@/components/ui/section";
import type { LogosBlock } from "@/lib/strapi";

/**
 * Client logos, greyed until hovered. Only real clients the business
 * confirmed; an empty block does not render. Server only, lazy images.
 */
export function Logos({ block }: { block: LogosBlock }) {
  if (block.items.length === 0) return null;
  const headingId = `logos-${block.id}`;
  return (
    <Section tone={block.section.tone} spacing={block.section.spacing === "default" ? "compact" : block.section.spacing} anchor={block.section.anchor} labelledBy={block.title ? headingId : undefined}>
      <Container width={block.section.width}>
        {block.title ? (
          <h2 id={headingId} className="mb-8 text-center text-eyebrow text-blue-dark/75 uppercase">
            {block.title}
          </h2>
        ) : null}
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
          {block.items.map((item) => (
            <li key={item.name} className="relative h-10 w-28 sm:h-12 sm:w-36">
              <Image
                src={item.image.url}
                alt={item.name}
                fill
                sizes="144px"
                className="object-contain opacity-60 grayscale transition duration-250 ease-out-soft hover:opacity-100 hover:grayscale-0 motion-reduce:transition-none"
              />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
