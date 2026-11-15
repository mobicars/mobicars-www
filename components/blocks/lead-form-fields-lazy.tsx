"use client";

import { lazy, Suspense, type ComponentProps } from "react";

import type { LeadFormFields as LeadFormFieldsType } from "./lead-form-fields";

const LeadFormFields = lazy(() => import("./lead-form-fields").then((module) => ({ default: module.LeadFormFields })));

/**
 * The business form fields as their own chunk: Next puts the client code of
 * every CMS block into each page's first JavaScript, so without this every
 * page would carry the form. The server renders the whole form as before;
 * the browser loads this code only on pages with the form. Measured: no
 * layout shift (the form is not inside a streamed boundary of its own).
 */
export function LazyLeadFormFields(props: ComponentProps<typeof LeadFormFieldsType>) {
  return (
    <Suspense fallback={null}>
      <LeadFormFields {...props} />
    </Suspense>
  );
}
