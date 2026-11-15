"use client";

import { lazy, Suspense, type ComponentProps, type ComponentType } from "react";

import type { FleetBrowser as FleetBrowserType } from "@/components/fleet/fleet-browser";
import type { Carousel as CarouselType } from "@/components/ui/carousel";

import type { ContactForm as ContactFormType } from "./contact-form";
import type { FaqGroups as FaqGroupsType } from "./faq-groups";
import type { PointsExplorer as PointsExplorerType } from "./points-explorer";

/**
 * The sections' heavier client parts, each its own chunk, loaded only on pages
 * that show them (as `contact-form-fields-lazy.tsx` does for the old contact
 * block). Next ships every client component a page *could* render with it: a
 * CMS page would otherwise download the contact form's phone data (~40 KB), the
 * map, the FAQ search, the fleet filters and the carousel even without them.
 * The server renders them as before, so the HTML, SEO and layout do not change.
 */
function lazyPart<P extends object>(load: () => Promise<ComponentType<P>>) {
  const Part = lazy(() => load().then((component) => ({ default: component })));
  return function LazyPart(props: P) {
    return (
      <Suspense fallback={null}>
        <Part {...props} />
      </Suspense>
    );
  };
}

export const LazyContactForm = lazyPart<ComponentProps<typeof ContactFormType>>(() => import("./contact-form").then((module) => module.ContactForm));
export const LazyPointsExplorer = lazyPart<ComponentProps<typeof PointsExplorerType>>(() => import("./points-explorer").then((module) => module.PointsExplorer));
export const LazyFaqGroups = lazyPart<ComponentProps<typeof FaqGroupsType>>(() => import("./faq-groups").then((module) => module.FaqGroups));
export const LazyFleetBrowser = lazyPart<ComponentProps<typeof FleetBrowserType>>(() => import("@/components/fleet/fleet-browser").then((module) => module.FleetBrowser));
export const LazyCarousel = lazyPart<ComponentProps<typeof CarouselType>>(() => import("@/components/ui/carousel").then((module) => module.Carousel));
