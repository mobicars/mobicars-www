"use client";

import type { ReactNode } from "react";
import { Button, Disclosure, DisclosureGroup, DisclosurePanel, Heading } from "react-aria-components";
import { ChevronDown } from "lucide-react";

import { roundIconClass } from "@/components/ui/surface";

/**
 * The questions of an FAQ block, on React Aria's disclosure (WAI-ARIA
 * accordion): each question is a button in a heading that says whether its
 * answer is open. Several can be open at once. A closed answer stays in the
 * HTML (`hidden="until-found"`), so search engines read it and find-in-page
 * opens it. The answers arrive rendered on the server.
 */
export function FaqList({
  items,
  level = 3,
  flat,
}: {
  items: { id?: string; question: string; answer: ReactNode }[];
  level?: 2 | 3 | 4;
  /** The new sections' flat look: cards in this colour (no shadow, no outline); the round icon is the cards' one (`roundIconClass`). */
  flat?: { surface: string };
}) {
  return (
    <DisclosureGroup allowsMultipleExpanded className="flex flex-col gap-3">
      {items.map((item, index) => (
        <Disclosure
          key={item.id ?? index}
          id={item.id ?? `q${index}`}
          className={
            flat
              ? `rounded-card ${flat.surface}`
              : "rounded-card bg-white shadow-card ring-1 ring-line transition-shadow duration-150 ease-out-soft data-expanded:shadow-lift motion-reduce:transition-none"
          }
        >
          {({ isExpanded }) => (
            <>
              <Heading level={level} className="m-0">
                <Button
                  slot="trigger"
                  className="group flex min-h-16 w-full cursor-pointer items-center justify-between gap-4 rounded-card px-5 py-4 text-left text-base font-semibold text-blue-dark outline-none data-focus-visible:ring-2 data-focus-visible:ring-blue-medium sm:px-6 sm:text-lg"
                >
                  {item.question}
                  <span
                    aria-hidden
                    className={roundIconClass(isExpanded)}
                  >
                    <ChevronDown
                      className={`size-4 transition-transform duration-150 ease-out-soft motion-reduce:transition-none ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </span>
                </Button>
              </Heading>
              {/* Padding on the inner box: a closed panel stays in the HTML (`until-found`) and would keep its own padding. */}
              <DisclosurePanel className="text-sm leading-relaxed text-blue-dark/85 sm:text-base">
                <div className="px-5 pb-5 sm:px-6">{item.answer}</div>
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      ))}
    </DisclosureGroup>
  );
}
