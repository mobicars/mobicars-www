"use client";

import { CheckCircle2, Send } from "lucide-react";
import { startTransition, useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { Button, Checkbox, FieldError, Form, Input, Label, Text, TextArea, TextField } from "react-aria-components";

import { PhoneFieldWithTexts, type PhoneTexts } from "@/components/ui/phone-input";
import { buttonClass } from "@/components/ui/button";
import type { Lang } from "@/i18n/config";
import type { ContactCopy } from "@/i18n/contact-form";
import { sendContactForm, type ContactFormState } from "@/lib/contact/actions";
import type { ContactFormField } from "@/lib/contact/form";

const FIELD = "flex flex-col gap-1.5";
const LABEL = "text-sm font-semibold text-blue-dark";
const CONTROL =
  "w-full rounded-control border border-line-strong bg-white px-4 text-base text-blue-dark outline-none transition-colors duration-150 hover:border-blue-medium/50 focus:border-blue-medium focus:ring-2 focus:ring-blue-light data-invalid:border-red-600 motion-reduce:transition-none";
const ERROR = "text-sm text-red-700";
const HINT = "text-sm text-blue-dark/75";

const ORDER: ContactFormField[] = ["name", "city", "email", "phone", "message", "consent"];

/**
 * The contact form (`sections.form`, form `contact`): the old site's fields
 * (name, city, email, phone with its country, message, consent), checked on
 * the server (`lib/contact/form.ts`) and sent by email with a copy to the
 * customer (`lib/contact/actions.ts`). The contact page form's look and
 * behaviour: errors under their fields, focus on the first one, the thanks in
 * the form's place. `wide`: the fields in pairs on desktops; else one column.
 */
export function ContactForm({
  lang,
  copy,
  phoneTexts,
  wide,
  framed,
  fallbackContact,
}: {
  lang: Lang;
  copy: ContactCopy["form"];
  phoneTexts: PhoneTexts;
  wide: boolean;
  /** A line around the card, on a white section (on a coloured one the white card stands out by itself). */
  framed: boolean;
  /** Shown when sending fails: the phone and email, so nobody is stuck. */
  fallbackContact: ReactNode;
}) {
  const [state, action, pending] = useActionState<ContactFormState, FormData>(sendContactForm, { status: "idle" });
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const [another, setAnother] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const errors = new Set(state.status === "invalid" ? state.errors : []);
  const card = `rounded-card bg-white p-5 text-blue-dark sm:p-8 ${framed ? "ring-1 ring-line" : ""}`;

  useEffect(() => {
    if (state.status === "invalid") {
      const first = ORDER.find((field) => errors.has(field));
      const target = first ? formRef.current?.querySelector<HTMLElement>(first === "phone" ? 'input[type="tel"]' : `[name="${first}"]`) : null;
      target?.focus();
    }
    if (state.status === "sent") {
      successRef.current?.focus();
    }
    // `errors` is derived from `state`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state.status === "sent" && !another) {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className={`flex flex-col items-start gap-4 outline-none ${card}`}>
        <CheckCircle2 className="size-10 text-green-medium" aria-hidden />
        <h3 className="text-subtitle">{copy.successTitle}</h3>
        <p className="text-pretty text-blue-dark/75">{copy.successText}</p>
        <Button onPress={() => setAnother(true)} className={buttonClass("secondary")}>
          {copy.sendAnother}
        </Button>
      </div>
    );
  }

  const optional = <span className="font-normal text-blue-dark/70"> ({copy.optional})</span>;
  const pair = wide ? "grid gap-5 sm:grid-cols-2" : "flex flex-col gap-5";

  return (
    <Form
      ref={formRef}
      // Not `action`: React resets a form after its action, and a message sent back with an error would lose what was typed.
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setAnother(false);
        data.set("page", window.location.pathname);
        data.set("startedAt", String(startedAt.current));
        startTransition(() => action(data));
      }}
      validationBehavior="aria"
      aria-label={copy.label}
      className={`flex flex-col gap-5 ${card}`}
    >
      <input type="hidden" name="lang" value={lang} />
      {/* Hidden from people and screen readers; bots fill it in. */}
      <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className={pair}>
        <TextField name="name" isRequired isInvalid={errors.has("name")} autoComplete="name" className={FIELD}>
          <Label className={LABEL}>{copy.name}</Label>
          <Input className={`${CONTROL} h-12`} />
          <FieldError className={ERROR}>{copy.errors.name}</FieldError>
        </TextField>
        <TextField name="city" autoComplete="address-level2" className={FIELD}>
          <Label className={LABEL}>
            {copy.city}
            {optional}
          </Label>
          <Input className={`${CONTROL} h-12`} />
        </TextField>
        <TextField name="email" type="email" isRequired isInvalid={errors.has("email")} autoComplete="email" inputMode="email" className={FIELD}>
          <Label className={LABEL}>{copy.email}</Label>
          <Input className={`${CONTROL} h-12`} />
          {errors.has("email") ? (
            <FieldError className={ERROR}>{copy.errors.emailRequired}</FieldError>
          ) : (
            <Text slot="description" className={HINT}>
              {copy.copyHint}
            </Text>
          )}
        </TextField>
        <div className={FIELD}>
          <PhoneFieldWithTexts
            lang={lang}
            label={
              <>
                {copy.phone}
                {optional}
              </>
            }
            labelClassName="font-semibold"
            name="phone"
            texts={phoneTexts}
            invalid={errors.has("phone")}
            errorId={errors.has("phone") ? "contact-phone-error" : undefined}
          />
          {errors.has("phone") ? (
            <p id="contact-phone-error" className={ERROR}>
              {copy.errors.phone}
            </p>
          ) : null}
        </div>
      </div>

      <TextField name="message" isRequired isInvalid={errors.has("message")} className={FIELD}>
        <Label className={LABEL}>{copy.message}</Label>
        <TextArea rows={5} className={`${CONTROL} min-h-32 py-3`} />
        <FieldError className={ERROR}>{copy.errors.message}</FieldError>
      </TextField>

      <Checkbox
        name="consent"
        value="on"
        isRequired
        isInvalid={errors.has("consent")}
        className="group flex cursor-pointer items-start gap-3 text-sm text-blue-dark/80 outline-none"
      >
        <span
          aria-hidden
          className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2 border-blue-dark/30 bg-white transition-colors group-data-focus-visible:ring-2 group-data-focus-visible:ring-blue-medium group-data-focus-visible:ring-offset-2 group-data-invalid:border-red-600 group-data-selected:border-blue-medium group-data-selected:bg-blue-medium"
        >
          <svg viewBox="0 0 16 16" className="hidden size-3.5 fill-none stroke-white stroke-[2.5] group-data-selected:block">
            <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
          </svg>
        </span>
        <span>
          {copy.consent.before}
          <a href={copy.consent.href} target="_blank" rel="noopener" className="font-semibold text-blue-medium underline">
            {copy.consent.link}
          </a>
          {copy.consent.after}
        </span>
      </Checkbox>
      {errors.has("consent") ? <p className={`${ERROR} -mt-3 pl-8`}>{copy.errors.consent}</p> : null}

      {state.status === "failed" || state.status === "unavailable" ? (
        <div role="alert" className="flex flex-col gap-2 rounded-control bg-red-50 px-4 py-3 text-sm text-red-800">
          <p>{state.status === "failed" ? copy.errors.failed : copy.errors.notConfigured}</p>
          {fallbackContact}
        </div>
      ) : null}

      <Button type="submit" isPending={pending} className={buttonClass("success", "lg", "w-full sm:w-auto sm:self-end")}>
        {pending ? copy.submitting : copy.submit}
        {pending ? null : <Send className="size-5" aria-hidden />}
      </Button>
    </Form>
  );
}
