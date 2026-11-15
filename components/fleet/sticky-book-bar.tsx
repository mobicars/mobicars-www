"use client";

import { useEffect, useState, type ReactNode } from "react";

import { buttonClass } from "@/components/ui/button";

/**
 * The car page's bar at the bottom of phones and tablets: the "from" price
 * and a link down to the booking box (`#<targetId>`). It steps aside while
 * the booking box is on screen, so it never covers the form it points to.
 *
 * `data-mobile-summary-bar` is the booking flow's bar marker: `globals.css`
 * then keeps room for it at the end of the page and lifts it above the
 * preview banner.
 */
export function StickyBookBar({ targetId, label, children }: { targetId: string; label: string; children: ReactNode }) {
  const [targetVisible, setTargetVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setTargetVisible(entry.isIntersecting), {
      rootMargin: "0px 0px -20% 0px",
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  return (
    <div
      data-mobile-summary-bar
      inert={targetVisible}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-gutter py-3 shadow-float backdrop-blur transition-[transform,opacity] duration-250 ease-out-soft motion-reduce:transition-none lg:hidden ${
        targetVisible ? "pointer-events-none translate-y-full opacity-0" : ""
      }`}
    >
      <div className="mx-auto flex max-w-page items-center justify-between gap-4">
        <div className="min-w-0">{children}</div>
        <a href={`#${targetId}`} className={buttonClass("success", "md", "px-4")}>
          {label}
        </a>
      </div>
    </div>
  );
}
