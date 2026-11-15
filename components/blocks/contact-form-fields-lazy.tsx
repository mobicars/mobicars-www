"use client";

import { lazy, Suspense, type ComponentProps } from "react";

import type { ContactFormFields as ContactFormFieldsType } from "./contact-form-fields";

const ContactFormFields = lazy(() => import("./contact-form-fields").then((module) => ({ default: module.ContactFormFields })));

/**
 * The contact form as its own chunk, loaded only on pages with a contact block
 * (see `lead-form-fields-lazy.tsx`). The server renders the form as before.
 */
export function LazyContactFormFields(props: ComponentProps<typeof ContactFormFieldsType>) {
  return (
    <Suspense fallback={null}>
      <ContactFormFields {...props} />
    </Suspense>
  );
}
