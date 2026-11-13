"use client";

import type { ReactElement } from "react";
import { Tooltip, TooltipTrigger } from "react-aria-components";

/**
 * A short text shown on hover and on keyboard focus, for a button that is only
 * an icon. The button keeps its own `aria-label`: the tooltip is for sighted
 * users, who do not get the native `title` on focus or touch. The child must
 * be a React Aria `Button` (or another focusable React Aria control).
 */
export function IconTooltip({ label, children }: { label: string; children: ReactElement }) {
  return (
    <TooltipTrigger delay={400} closeDelay={100}>
      {children}
      <Tooltip
        offset={6}
        className="rounded-lg bg-blue-dark px-2.5 py-1 text-xs font-semibold text-white shadow-md"
      >
        {label}
      </Tooltip>
    </TooltipTrigger>
  );
}
