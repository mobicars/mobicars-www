"use client";

import { CheckCircle2, ChevronDown, Send } from "lucide-react";
import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Button,
  Checkbox,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  Text,
  TextArea,
  TextField,
} from "react-aria-components";

import { buttonClass } from "@/components/ui/button";
import type { Lang } from "@/i18n/config";
import type { ContactCopy } from "@/i18n/contact-form";
import { sendContact, type ContactState } from "@/lib/business/actions";
import type { ContactField } from "@/lib/business/contact";

const FIELD = "flex flex-col gap-1.5";
const LABEL = "text-sm font-semibold text-blue-dark";
const CONTROL =
  "w-full rounded-control border border-line-strong bg-white px-4 text-base text-blue-dark outline-none transition-colors duration-150 hover:border-blue-medium/50 focus:border-blue-medium focus:ring-2 focus:ring-blue-light data-invalid:border-red-600 motion-reduce:transition-none";
const ERROR = "text-sm text-red-700";
const HINT = "text-sm text-blue-dark/75";

const ORDER: ContactField[] = ["name", "contact", "email", "phone", "message", "consent"];
const FOCUS_NAME: Record<ContactField, string> = {
  name: "name",
  contact: "email",
  email: "email",
  phone: "phone",
  message: "message",
  consent: "consent",
};

/**
 * The contact page form (`blocks.contact`): topic (the CMS choices), name,
 * email or phone, message and consent, checked on the server
 * (`lib/business/contact.ts`) and sent to the same webhook as the business
 * requests. Same look and behaviour as `LeadFormFields`: errors under their
 * fields, focus on the first one, the success message in the form's place.
 */
export function ContactFormFields({
  lang,
  copy,
  topics,
  fallbackContact,
}: {
  lang: Lang;
  copy: ContactCopy["form"];
  topics: string[];
  /** Shown when sending fails: the phone and email, so nobody is stuck. */
  fallbackContact: ReactNode;
}) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, { status: "idle" });
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const [sentAgain, setSentAgain] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const errors = new Set(state.status === "invalid" ? state.errors : []);

  useEffect(() => {
    if (state.status === "invalid") {
      const first = ORDER.find((field) => errors.has(field));
      const target = first ? formRef.current?.querySelector<HTMLElement>(`[name="${FOCUS_NAME[first]}"]`) : null;
      target?.focus();
    }
    if (state.status === "sent") {
      successRef.current?.focus();
    }
    // `errors` is derived from `state`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state.status === "sent" && sentAgain === 0) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="flex flex-col items-start gap-4 rounded-card bg-white p-6 text-blue-dark shadow-card ring-1 ring-line outline-none sm:p-8"
      >
        <CheckCircle2 className="size-10 text-green-medium" aria-hidden />
        <h3 className="text-subtitle">{copy.successTitle}</h3>
        <p className="text-pretty text-blue-dark/75">{copy.successText}</p>
        <Button onPress={() => setSentAgain(1)} className={buttonClass("secondary")}>
          {copy.sendAnother}
        </Button>
      </div>
    );
  }

  const optional = <span className="font-normal text-blue-dark/70"> ({copy.optional})</span>;
  const contactError = errors.has("contact") ? copy.errors.contact : errors.has("email") ? copy.errors.email : null;

  return (
    <Form
      ref={formRef}
      action={(data) => {
        setSentAgain(0);
        data.set("page", window.location.pathname);
        data.set("startedAt", String(startedAt.current));
        data.set("topics", topics.join("\n"));
        action(data);
      }}
      validationBehavior="aria"
      aria-label={copy.label}
      className="flex flex-col gap-5 rounded-card bg-white p-5 text-blue-dark shadow-card ring-1 ring-line sm:p-8"
    >
      <input type="hidden" name="lang" value={lang} />
      {/* Hidden from people and screen readers; bots fill it in. */}
      <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {topics.length > 0 ? (
        <Select name="topic" placeholder={copy.topicPlaceholder} className={FIELD}>
          <Label className={LABEL}>
            {copy.topic}
            {optional}
          </Label>
          <Button className={`${CONTROL} flex h-12 cursor-pointer items-center justify-between gap-2 text-left data-focus-visible:ring-2 data-focus-visible:ring-blue-medium`}>
            <SelectValue className="truncate data-placeholder:text-muted-dark" />
            <ChevronDown className="size-4 shrink-0 text-blue-medium" aria-hidden />
          </Button>
          <Popover className="w-(--trigger-width) rounded-control bg-white p-1 shadow-float ring-1 ring-line">
            <ListBox className="max-h-72 overflow-auto outline-none">
              {topics.map((topic) => (
                <ListBoxItem
                  key={topic}
                  id={topic}
                  className="cursor-pointer rounded-md px-3 py-2.5 text-base text-blue-dark outline-none data-focused:bg-blue-light data-selected:font-semibold"
                >
                  {topic}
                </ListBoxItem>
              ))}
            </ListBox>
          </Popover>
        </Select>
      ) : null}

      <TextField name="name" isRequired isInvalid={errors.has("name")} autoComplete="name" className={FIELD}>
        <Label className={LABEL}>{copy.name}</Label>
        <Input className={`${CONTROL} h-12`} />
        <FieldError className={ERROR}>{copy.errors.name}</FieldError>
      </TextField>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="email" type="email" isInvalid={contactError !== null} autoComplete="email" inputMode="email" className={FIELD}>
          <Label className={LABEL}>{copy.email}</Label>
          <Input className={`${CONTROL} h-12`} />
          {contactError ? (
            <FieldError className={ERROR}>{contactError}</FieldError>
          ) : (
            <Text slot="description" className={HINT}>
              {copy.contactHint}
            </Text>
          )}
        </TextField>
        <TextField
          name="phone"
          type="tel"
          isInvalid={errors.has("phone") || errors.has("contact")}
          autoComplete="tel"
          inputMode="tel"
          className={FIELD}
        >
          <Label className={LABEL}>{copy.phone}</Label>
          <Input className={`${CONTROL} h-12`} />
          {errors.has("phone") ? <FieldError className={ERROR}>{copy.errors.phone}</FieldError> : null}
        </TextField>
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
          <a href={copy.consent.href} className="font-semibold text-blue-medium underline">
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

      <Button type="submit" isPending={pending} className={buttonClass("success", "lg", "w-full sm:w-auto sm:self-start")}>
        {pending ? copy.submitting : copy.submit}
        {pending ? null : <Send className="size-5" aria-hidden />}
      </Button>
    </Form>
  );
}
