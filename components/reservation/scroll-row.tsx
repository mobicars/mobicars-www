"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useMessages } from "@/i18n/messages-context";

/**
 * A horizontal row that says it scrolls: at an edge with more content behind
 * it, the row fades out and shows an arrow button. Nothing shows when
 * everything fits. Used for the other cars of a class on a phone.
 */
export function ScrollRow({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const { steps } = useMessages();
  const row = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState({ left: false, right: false });

  function measure() {
    const element = row.current;
    if (element) {
      const left = element.scrollLeft > 1;
      const right = element.scrollLeft + element.clientWidth < element.scrollWidth - 1;
      setMore((current) => (current.left === left && current.right === right ? current : { left, right }));
    }
  }

  // The observer reports once on start and again when the width changes.
  useEffect(() => {
    const element = row.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function scroll(direction: 1 | -1) {
    const element = row.current;
    if (element) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      element.scrollBy({ left: direction * element.clientWidth * 0.7, behavior: reduce ? "auto" : "smooth" });
    }
  }

  const arrow =
    "absolute inset-y-0 z-10 flex w-12 cursor-pointer items-center from-white from-40% to-transparent text-blue-medium";
  const circle = "flex size-7 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-blue-dark/10";

  return (
    <div className="relative">
      <div
        ref={row}
        role="group"
        aria-label={label}
        onScroll={measure}
        className={`flex gap-2 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      >
        {children}
      </div>
      {more.left ? (
        <button type="button" aria-label={steps.scrollLeft} onClick={() => scroll(-1)} className={`${arrow} left-0 justify-start bg-linear-to-r`}>
          <span className={circle}>
            <ChevronLeft className="size-4" aria-hidden />
          </span>
        </button>
      ) : null}
      {more.right ? (
        <button type="button" aria-label={steps.scrollRight} onClick={() => scroll(1)} className={`${arrow} right-0 justify-end bg-linear-to-l`}>
          <span className={circle}>
            <ChevronRight className="size-4" aria-hidden />
          </span>
        </button>
      ) : null}
    </div>
  );
}
