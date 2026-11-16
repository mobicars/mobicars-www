"use client";

import { useRef, useState, type ReactNode } from "react";
import { Button } from "react-aria-components";

import { buttonClass } from "@/components/ui/button";

/**
 * A long list shown `step` items at a time. Every item is in the server HTML
 * (search engines read the whole list); the rest wait in `hidden` list items,
 * so their lazy photos do not load until shown. "Show more" reveals the next
 * `step` and moves focus to the first new item, for keyboard and screen
 * reader users; "Showing 12 of 36" says where the list stands, until all are shown.
 */
export function ShowMore({
  items,
  step,
  initial = step,
  before = 0,
  listClassName,
  itemClassName,
  listLabel,
  labels,
}: {
  items: { key: string; node: ReactNode }[];
  step: number;
  /** How many show before the first "Show more" (the blog listing's 8 under its 4 featured posts). */
  initial?: number;
  /** Items shown above this list that the count includes (those 4 featured posts). */
  before?: number;
  listClassName: string;
  /** For each item; a `display` here must leave `[hidden]` alone (`[&:not([hidden])]:flex`). */
  itemClassName?: string;
  listLabel?: string;
  /** `shownOf` holds `{shown}` and `{total}`. */
  labels: { more: string; shownOf: string };
}) {
  const [shown, setShown] = useState(initial);
  const list = useRef<HTMLUListElement>(null);
  const total = items.length;
  const more = () => {
    const first = shown;
    setShown((count) => Math.min(total, count + step));
    // After the render that unhides them: the first new card's link takes focus.
    requestAnimationFrame(() => list.current?.children[first]?.querySelector<HTMLElement>("a, button")?.focus());
  };
  return (
    <>
      <ul ref={list} aria-label={listLabel} className={listClassName}>
        {items.map((item, index) => (
          <li key={item.key} hidden={index >= shown} className={itemClassName}>
            {item.node}
          </li>
        ))}
      </ul>
      {/* Gone with the last step: nothing left to show, nothing to count. */}
      {shown < total ? (
        <div className="mt-10 flex flex-col items-center gap-4">
          <p role="status" className="text-sm text-blue-dark/70">
            {labels.shownOf.replace("{shown}", String(before + shown)).replace("{total}", String(before + total))}
          </p>
          <Button onPress={more} className={buttonClass("secondary", "lg")}>
            {labels.more}
          </Button>
        </div>
      ) : null}
    </>
  );
}
