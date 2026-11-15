"use client";

import { Search, X } from "lucide-react";
import { useDeferredValue, useState, type ReactNode } from "react";
import { Button, Input, Label, SearchField } from "react-aria-components";

import { FaqList } from "@/components/blocks/faq-list";

type Group = {
  anchor: string;
  title: string | null;
  /** The heading level of the group's questions. */
  level: 2 | 3 | 4;
  items: { id: string; question: string; text: string; answer: ReactNode }[];
};

/**
 * The FAQ section's groups (answers rendered on the server) and, when the CMS
 * turns it on, the search over them: it hides the questions that do not hold
 * every word typed (in the question or the answer, case and Polish letters
 * ignored) and the groups left empty. The full list is in the server HTML.
 */
export function FaqGroups({
  groups,
  groupLevel,
  dark,
  surface,
  search,
}: {
  groups: Group[];
  groupLevel: 2 | 3;
  dark: boolean;
  /** The cards' and the search field's colour (the Features cards' rule: grey on white, white on any other background). */
  surface: string;
  search: { label: string; placeholder: string; empty: string } | null;
}) {
  const [query, setQuery] = useState("");
  const words = fold(useDeferredValue(query)).split(/\s+/).filter(Boolean);
  const shown = groups
    .map((group) => ({ ...group, items: words.length ? group.items.filter((item) => matches(item.text, words)) : group.items }))
    .filter((group) => group.items.length > 0);
  const Heading = groupLevel === 2 ? "h2" : "h3";

  return (
    <div className="flex min-w-0 flex-col gap-10">
      {search ? (
        <SearchField value={query} onChange={setQuery} className="group/search relative">
          <Label className="sr-only">{search.label}</Label>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-blue-dark/60" />
          <Input
            placeholder={search.placeholder}
            className={`min-h-14 w-full rounded-full pr-14 pl-13 text-base text-blue-dark outline-none ${surface} placeholder:text-blue-dark/60 focus-visible:ring-2 focus-visible:ring-blue-medium [&::-webkit-search-cancel-button]:hidden`}
          />
          <Button className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-blue-dark outline-none group-data-empty/search:hidden hover:bg-tint data-focus-visible:ring-2 data-focus-visible:ring-blue-medium">
            <X aria-hidden className="size-4" />
          </Button>
        </SearchField>
      ) : null}
      {search ? (
        <p role="status" className={shown.length === 0 ? `text-center text-lg ${dark ? "text-white" : "text-blue-dark/80"}` : "sr-only"}>
          {shown.length === 0 ? search.empty : ""}
        </p>
      ) : null}
      {shown.map((group) => (
        <section key={group.anchor} id={group.anchor} aria-labelledby={group.title ? `${group.anchor}-title` : undefined} className="flex scroll-mt-28 flex-col gap-4">
          {group.title ? (
            <Heading id={`${group.anchor}-title`} className={`text-subtitle ${dark ? "text-white" : "text-blue-dark"}`}>
              {group.title}
            </Heading>
          ) : null}
          <FaqList items={group.items} level={group.level} flat={{ surface }} />
        </section>
      ))}
    </div>
  );
}

/** Lower case without Polish (or other) diacritics, so "zwrot" finds "Zwrót". */
function fold(text: string): string {
  return text.toLowerCase().replace(/ł/g, "l").normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

function matches(text: string, words: string[]): boolean {
  const folded = fold(text);
  return words.every((word) => folded.includes(word));
}
