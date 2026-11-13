"use client";

import type { ReactNode } from "react";
import { Sheet, SheetBackdrop, SheetContent, SheetOverlay } from "react-aria-components";

/**
 * A sheet from the bottom of the screen, React Aria's `Sheet`: a modal dialog
 * (focus kept inside, Escape and a tap outside close it) that also follows the
 * finger, so a swipe down closes it, as in phone apps. The handle on top shows
 * that it can be dragged. Opened and closed by the caller (`open`).
 *
 * The backdrop's fade is `sheet-backdrop` in `globals.css`; React Aria plays
 * it in step with the swipe and the slide in and out.
 */
export function BottomSheet({
  open,
  onOpenChange,
  labelledBy,
  className = "",
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Id of the sheet's title. */
  labelledBy: string;
  /** Extra classes for the sheet, e.g. `lg:hidden`. */
  className?: string;
  children: ReactNode;
}) {
  return (
    <SheetOverlay isOpen={open} onOpenChange={onOpenChange} className={`group/sheet z-50 ${className}`}>
      <SheetBackdrop swipeAnimation="sheet-backdrop" className="bg-blue-dark/40 backdrop-blur-[4px]" />
      <Sheet
        overscrollPadding
        // Not a flex box: the sheet takes its content's height (up to the max), as React Aria's starter.
        // `box-content`: React Aria pads the sheet by 100vh to slide it, and Tailwind's border-box would eat its height.
        className="z-[1] box-content max-h-[calc(100%-2rem)] w-full overflow-clip rounded-t-3xl bg-white text-blue-dark shadow-2xl outline-none will-change-transform"
      >
        <div aria-hidden className="absolute top-2 left-1/2 z-10 h-1.5 w-12 -translate-x-1/2 rounded-full bg-muted" />
        <SheetContent
          aria-labelledby={labelledBy}
          // Scrolls only once the sheet is fully open; before that a swipe on the content moves the sheet.
          className="box-border h-full overflow-hidden overscroll-auto pb-[var(--sheet-scroll-padding-y)] outline-none group-data-expanded/sheet:overflow-auto"
        >
          {children}
        </SheetContent>
      </Sheet>
    </SheetOverlay>
  );
}
