"use client";

import { useEffect, useState, type ReactNode } from "react";

import { BOTTOM_BAR, BOTTOM_BAR_ROW } from "@/components/ui/bottom-bar";
import { buttonClass } from "@/components/ui/button";

/**
 * The car page's bar at the bottom of phones and tablets: the "from" price
 * and a link down to the booking box (`#<targetId>`). It steps aside while
 * the booking box is on screen, so it never covers the form it points to.
 *
 * The site's bottom bar (`BOTTOM_BAR`), as the booking's: `data-mobile-summary-bar`
 * makes `globals.css` keep room for it at the end of the page and lift it above
 * the preview banner.
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
      className={`${BOTTOM_BAR} transition-[transform,opacity] duration-250 ease-out-soft motion-reduce:transition-none lg:hidden ${
        targetVisible ? "pointer-events-none translate-y-full opacity-0" : ""
      }`}
    >
      <div className={BOTTOM_BAR_ROW}>
        <div className="min-w-0">{children}</div>
        <a href={`#${targetId}`} className={buttonClass("success", "md", "px-4")}>
          {label}
        </a>
      </div>
    </div>
  );
}
