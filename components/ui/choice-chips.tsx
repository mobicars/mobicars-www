"use client";

import type { ReactNode } from "react";
import { ToggleButton, ToggleButtonGroup } from "react-aria-components";

export type ChoiceOption<T> = { value: T; label: ReactNode };

const CHIP = {
  /** The booking list's filters: small, uppercase. */
  sm: "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase",
  /** The fleet page: taller, for a finger. */
  md: "h-9 rounded-full border px-3.5 text-sm font-semibold",
};

/**
 * A row of chips with one choice at most: a React Aria toggle button group,
 * read out as a group of options with the chosen one checked. It is one tab
 * stop, arrow keys move between the chips, Space or Enter picks one. Pressing
 * the chosen chip clears it, unless `required` (a sort, a view).
 *
 * Keys are the option's position, so a value of `0` or a number works too
 * (React Aria reads `0` as "no id").
 */
export function ChoiceChips<T>({
  label,
  labelledBy,
  options,
  value,
  onChange,
  required = false,
  size = "md",
  className = "flex flex-wrap gap-2",
}: {
  /** The group's name, when no visible label names it (`labelledBy`). */
  label?: string;
  labelledBy?: string;
  options: readonly ChoiceOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  required?: boolean;
  size?: keyof typeof CHIP;
  className?: string;
}) {
  const index = options.findIndex((option) => option.value === value);
  return (
    <ToggleButtonGroup
      aria-label={label}
      aria-labelledby={labelledBy}
      selectionMode="single"
      disallowEmptySelection={required}
      selectedKeys={index < 0 ? [] : [`choice-${index}`]}
      onSelectionChange={(keys) => {
        const [key] = keys;
        const picked = key === undefined ? -1 : Number(String(key).slice("choice-".length));
        onChange(picked < 0 ? null : options[picked].value);
      }}
      className={className}
    >
      {options.map((option, position) => (
        <ToggleButton
          key={position}
          id={`choice-${position}`}
          className={`${CHIP[size]} cursor-pointer border-blue-dark/15 bg-white text-blue-dark outline-none transition-colors duration-200 ease-out hover:border-blue-medium/50 data-focus-visible:ring-2 data-focus-visible:ring-blue-medium data-focus-visible:ring-offset-1 data-selected:border-blue-medium data-selected:bg-blue-medium data-selected:text-white data-selected:hover:bg-blue-dark motion-reduce:transition-none`}
        >
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
