"use client";

import type { Ref } from "react";
import { Search, type LucideIcon } from "lucide-react";

import { useMessages } from "@/i18n/messages-context";
import type { PickupPlace } from "@/lib/reservation/places";
import type { SearchDraft, SearchField } from "@/lib/reservation/search";

export const fieldHover =
  "transition-colors duration-200 ease-out hover:bg-[color-mix(in_srgb,var(--color-blue-dark)_4%,white)] motion-reduce:transition-none";

/** Ring and label color for a field the last search attempt rejected. */
export const invalidField = "data-invalid:bg-red-50 data-invalid:ring-2 data-invalid:ring-red-500 data-invalid:ring-inset";

/** One white cell of the search bar: icon, small label, bold value. */
export function BarField({
  icon: Icon,
  label,
  value,
  onClick,
  invalid = false,
  buttonRef,
  className = "",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onClick: () => void;
  invalid?: boolean;
  buttonRef?: Ref<HTMLButtonElement>;
  className?: string;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      data-invalid={invalid || undefined}
      className={`group flex min-h-16 w-full min-w-0 cursor-pointer items-center gap-3 border-blue-medium bg-white px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-medium focus-visible:ring-inset @5xl:px-5 ${fieldHover} ${invalidField} ${className}`}
    >
      <Icon
        className="size-5 shrink-0 text-blue-medium group-data-invalid:text-red-600"
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="min-w-0">
        <span className="block truncate text-xxs text-blue-dark/55 group-data-invalid:text-red-700">
          {label}
        </span>
        <span className="block truncate text-xs font-bold text-blue-dark">{value}</span>
      </span>
    </button>
  );
}

/** Props every term bar takes from `ReservationPicker`. */
export type TermBarProps = {
  places: PickupPlace[];
  draft: SearchDraft;
  onChange: (patch: Partial<SearchDraft>) => void;
  invalid: ReadonlySet<SearchField>;
  /** Ref for the button of a field, so the picker can focus the first invalid one. */
  fieldRef: (field: SearchField) => Ref<HTMLButtonElement>;
};

/** Submits the picker form. Sits in the last cell of each bar. */
export function SearchButton() {
  const texts = useMessages().search;
  return (
    <div className="bg-blue-medium @lg:col-span-2 @5xl:col-span-1">
      <button
        type="submit"
        className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 bg-blue-medium px-5 text-sm font-bold text-white outline-none transition-colors duration-200 ease-out hover:bg-blue-dark focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset motion-reduce:transition-none @5xl:h-full @5xl:px-6"
      >
        <Search className="size-5" strokeWidth={1.75} aria-hidden />
        {texts.submit}
      </button>
    </div>
  );
}
