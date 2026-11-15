"use client";

import type { ReactNode } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";

/**
 * React Aria tabs for the scenarios block: arrow keys move between tabs, the
 * panel follows. On phones the tab row scrolls sideways inside itself; the
 * panels arrive already rendered from the server.
 */
export function ScenarioTabs({
  label,
  panels,
  dark,
  layout = "tabs",
  defaultIndex = 0,
}: {
  label: string;
  panels: { label: string; content: ReactNode }[];
  dark: boolean;
  /** `panel` (carnet.pl): one navy card, the tabs under it on desktops and above it on phones. */
  layout?: "tabs" | "panel";
  /** The tab open first (the cars block's `defaultCategory`). */
  defaultIndex?: number;
}) {
  const isPanel = layout === "panel";
  return (
    <Tabs defaultSelectedKey={`scenario-${defaultIndex}`} className={isPanel ? "flex flex-col overflow-hidden rounded-[2rem] bg-blue-dark text-white shadow-lift" : "flex flex-col gap-6"}>
      <TabList
        aria-label={label}
        className={
          isPanel
            ? "flex snap-x gap-2 overflow-x-auto border-b border-white/10 px-4 py-3 [scrollbar-width:none] lg:order-last lg:border-t lg:border-b-0 lg:px-8 lg:py-4"
            : "-mx-gutter flex snap-x gap-2 overflow-x-auto px-gutter pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
        }
      >
        {panels.map((panel, index) => (
          <Tab
            key={index}
            id={`scenario-${index}`}
            className={`h-11 shrink-0 cursor-pointer snap-start rounded-full border px-5 text-sm font-semibold whitespace-nowrap outline-none transition-colors duration-150 ease-out-soft data-focus-visible:ring-2 data-focus-visible:ring-offset-2 motion-reduce:transition-none ${
              dark || isPanel
                ? "border-white/25 text-white hover:border-white/60 data-focus-visible:ring-white data-focus-visible:ring-offset-blue-dark data-selected:border-white data-selected:bg-white data-selected:text-blue-dark"
                : "border-line-strong bg-white text-blue-dark hover:border-blue-medium/50 data-focus-visible:ring-blue-medium data-selected:border-blue-dark data-selected:bg-blue-dark data-selected:text-white"
            }`}
          >
            {panel.label}
          </Tab>
        ))}
      </TabList>
      {panels.map((panel, index) => (
        // Every panel stays in the HTML (search engines and "find in page" see all scenarios); React Aria marks the hidden ones `inert`.
        <TabPanel
          key={index}
          id={`scenario-${index}`}
          shouldForceMount
          className={`outline-none data-focus-visible:ring-2 [&[inert]]:hidden ${isPanel ? "data-focus-visible:ring-inset data-focus-visible:ring-white" : "rounded-card data-focus-visible:ring-blue-medium"}`}
        >
          {panel.content}
        </TabPanel>
      ))}
    </Tabs>
  );
}
