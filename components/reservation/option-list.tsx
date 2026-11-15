"use client";

import { useEffect, useRef } from "react";
import { ListBox, ListBoxItem } from "react-aria-components";

/**
 * Its own module, out of `dialog-parts.tsx`: `ListBox` and its collections
 * are needed only inside dialogs, which load lazily, so the page's first
 * JavaScript does not carry them (PageSpeed on phones).
 */

/**
 * Vertical list of choices with the selected one scrolled into view: a React
 * Aria list box, so it is one tab stop, arrow keys move through the choices,
 * typing jumps to one ("1" then "4" for 14:00) and the choice is read out as
 * selected. Picking an option, the chosen one too, calls `onSelect`; the
 * caller closes the dialog.
 */
export function OptionList<T>({
  options,
  isSelected,
  getKey,
  format,
  onSelect,
  empty,
  labelledBy,
}: {
  options: readonly T[];
  isSelected: (option: T) => boolean;
  getKey: (option: T) => string | number;
  format: (option: T) => string;
  onSelect: (option: T) => void;
  empty?: string;
  /** Id of the dialog title, which names the list. */
  labelledBy: string;
}) {
  const list = useRef<HTMLDivElement>(null);
  const selected = options.find(isSelected);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      list.current?.querySelector("[aria-selected='true']")?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4">
      {options.length === 0 ? (
        <p className="py-6 text-center text-sm text-blue-dark/60">{empty}</p>
      ) : (
        <ListBox
          ref={list}
          aria-labelledby={labelledBy}
          selectionMode="single"
          selectedKeys={selected === undefined ? [] : [getKey(selected)]}
          onSelectionChange={(keys) => {
            const [key] = keys === "all" ? [] : keys;
            // An empty selection is the chosen option pressed again: it is picked once more.
            const option = key === undefined ? selected : options.find((item) => getKey(item) === key);
            if (option !== undefined) {
              onSelect(option);
            }
          }}
          className="flex flex-col gap-2 outline-none"
        >
          {options.map((option) => (
            <ListBoxItem
              key={getKey(option)}
              id={getKey(option)}
              textValue={format(option)}
              className={({ isSelected: chosen }) =>
                `flex h-12 w-full cursor-pointer items-center justify-center rounded-xl border text-base outline-none transition-colors duration-200 ease-out data-focus-visible:ring-2 data-focus-visible:ring-blue-medium data-focus-visible:ring-offset-2 motion-reduce:transition-none ${
                  chosen
                    ? "border-blue-medium bg-blue-medium font-bold text-white hover:bg-blue-dark"
                    : "border-blue-dark/15 hover:border-blue-dark/25 hover:bg-blue-dark/[0.03]"
                }`
              }
            >
              {format(option)}
            </ListBoxItem>
          ))}
        </ListBox>
      )}
    </div>
  );
}
