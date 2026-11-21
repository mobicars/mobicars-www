"use client";

import { useEffect } from "react";

/** The page first moves this far with the bar in place: nothing hides while the hero is being read. */
const START = 160;
/** Hidden after this much steady scrolling down, so a short nudge or a finger slowing down does not hide it. */
const HIDE_AFTER = 40;
/** Back after this much steady scrolling up: sooner than it hides, for whoever goes looking for it. */
const SHOW_AFTER = 20;

/**
 * Hides the header's top bar (and the announcement over it) while the page scrolls down and brings it back on
 * the way up, by setting `data-topbar` on `<html>`. The header stays `sticky`:
 * the CSS in `SiteHeader` slides it up by the bar's height (`transform`), so
 * the bar goes out over the top edge and no layout below it moves. Without
 * JavaScript the bar simply stays.
 */
export function TopBarScroll() {
  useEffect(() => {
    const root = document.documentElement;
    // How far the header slides up: the announcement and the bar, as tall as they are now.
    const hide = document.querySelector<HTMLElement>(".site-header-hide");
    const size = new ResizeObserver(() => {
      root.style.setProperty("--site-topbar", `${hide?.offsetHeight ?? 0}px`);
    });
    if (hide) {
      size.observe(hide);
    }
    let last = window.scrollY;
    // Distance travelled in the current direction (down positive, up negative).
    let run = 0;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      // Counted from `START` on: the first stretch of the page never adds to a run.
      const step = y - Math.max(last, START);
      last = y;
      run = y < START ? 0 : Math.sign(step) === Math.sign(run) ? run + step : step;
      if (y < START || run <= -SHOW_AFTER) {
        root.dataset.topbar = "shown";
      } else if (run >= HIDE_AFTER) {
        root.dataset.topbar = "hidden";
      }
    };
    const onScroll = () => {
      frame ||= window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
      size.disconnect();
      root.style.removeProperty("--site-topbar");
      delete root.dataset.topbar;
    };
  }, []);
  return null;
}
