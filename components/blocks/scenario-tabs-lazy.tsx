"use client";

import { lazy, Suspense, type ComponentProps } from "react";

import type { ScenarioTabs as ScenarioTabsType } from "./scenario-tabs";

const ScenarioTabs = lazy(() => import("./scenario-tabs").then((module) => ({ default: module.ScenarioTabs })));

/**
 * The scenario tabs as their own chunk, loaded only on pages with them (see
 * `lead-form-fields-lazy.tsx`). The server renders the tabs as before.
 */
export function LazyScenarioTabs(props: ComponentProps<typeof ScenarioTabsType>) {
  return (
    <Suspense fallback={null}>
      <ScenarioTabs {...props} />
    </Suspense>
  );
}
