"use client";

import { CheckCircle2, Send } from "lucide-react";
import { useActionState, useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  FieldError,
  Form,
  Input,
  Label,
  Text,
  TextArea,
  TextField,
} from "react-aria-components";

import { buttonClass } from "@/components/ui/button";
import { ChoiceChips } from "@/components/ui/choice-chips";
import type { Lang } from "@/i18n/config";
import type { BusinessCopy } from "@/i18n/business-form";
import { sendLead, type LeadState } from "@/lib/business/actions";
import { CAR_TYPES, FLEET_SIZES, STARTS, TERMS, type LeadField } from "@/lib/business/lead";

const FIELD = "flex flex-col gap-1.5";
const LABEL = "text-sm font-semibold text-blue-dark";
const CONTROL =
  "w-full rounded-control border border-line-strong bg-white px-4 text-base text-blue-dark outline-none transition-colors duration-150 placeholder:text-muted-dark hover:border-blue-medium/50 focus:border-blue-medium focus:ring-2 focus:ring-blue-light data-invalid:border-red-600 motion-reduce:transition-none";
const ERROR = "text-sm text-red-700";
const HINT = "text-sm text-blue-dark/75";

/** Field order for moving focus to the first error after sending. */
const ORDER: LeadField[] = ["company", "taxId", "name", "contact", "email", "phone", "consent"];
const FOCUS_NAME: Record<LeadField, string> = {
  company: "company",
  taxId: "taxId",
  name: "name",
  contact: "email",
  email: "email",
  phone: "phone",
  consent: "consent",
};

/**
 * The business quote request form. React Aria fields, checked on the server
 * (`lib/business/lead.ts`), errors under their fields with focus on the first
 * one. Choice chips keep the form short on phones; only company, name, one
 * contact and the consent are required. After sending, the form gives way to
 * the CMS success message in the same place.
 */
export function LeadFormFields({
  lang,
  copy,
  consent,
  successTitle,
  successText,
  fallbackContact,
}: {
  lang: Lang;
  copy: BusinessCopy["form"];
  /** The CMS consent text, rendered on the server. */
  consent: ReactNode;
  successTitle: string;
  successText: string | null;
  /** Shown when sending fails: the phone and email, so nobody is stuck. */
  fallbackContact: ReactNode;
}) {
  const [state, action, pending] = useActionState<LeadState, FormData>(sendLead, { status: "idle" });
  // When the form appeared, for the minimum fill time (bots send at once). Set after mount:
  // the clock cannot be read during the prerender.
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const [fleetSize, setFleetSize] = useState<string | null>(null);
  const [term, setTerm] = useState<string | null>(null);
  const [start, setStart] = useState<string | null>(null);
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
        className="flex flex-col items-start gap-4 rounded-card bg-white p-6 text-blue-dark shadow-card outline-none sm:p-8"
      >
        <CheckCircle2 className="size-10 text-green-medium" aria-hidden />
        <h3 className="text-subtitle">{successTitle}</h3>
        {successText ? <p className="text-pretty text-blue-dark/75">{successText}</p> : null}
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
        // Read at submit, not with `usePathname`: that hook would make the whole CMS page request-time.
        data.set("page", window.location.pathname);
        data.set("startedAt", String(startedAt.current));
        action(data);
      }}
      validationBehavior="aria"
      aria-label={copy.label}
      className="flex flex-col gap-5 rounded-card bg-white p-5 text-blue-dark shadow-card sm:p-8"
    >
      <input type="hidden" name="lang" value={lang} />
      {/* Hidden from people and screen readers; bots fill it in. */}
      <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="company" isRequired isInvalid={errors.has("company")} autoComplete="organization" className={FIELD}>
          <Label className={LABEL}>{copy.company}</Label>
          <Input className={`${CONTROL} h-12`} />
          <FieldError className={ERROR}>{copy.errors.company}</FieldError>
        </TextField>
        <TextField name="taxId" isInvalid={errors.has("taxId")} inputMode="numeric" className={FIELD}>
          <Label className={LABEL}>
            {copy.taxId}
            {optional}
          </Label>
          <Input className={`${CONTROL} h-12`} />
          {errors.has("taxId") ? (
            <FieldError className={ERROR}>{copy.errors.taxId}</FieldError>
          ) : (
            <Text slot="description" className={HINT}>
              {copy.taxIdHint}
            </Text>
          )}
        </TextField>
      </div>

      <TextField name="name" isRequired isInvalid={errors.has("name")} autoComplete="name" className={FIELD}>
        <Label className={LABEL}>{copy.name}</Label>
        <Input className={`${CONTROL} h-12`} />
        <FieldError className={ERROR}>{copy.errors.name}</FieldError>
      </TextField>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="email"
          type="email"
          isInvalid={contactError !== null}
          autoComplete="email"
          inputMode="email"
          className={FIELD}
        >
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

      <ChipField label={copy.fleetSize} optional={optional}>
        {(labelId) => (
          <>
            <ChoiceChips
              labelledBy={labelId}
              options={FLEET_SIZES.map((value, index) => ({ value, label: copy.fleetSizes[index] }))}
              value={fleetSize}
              onChange={setFleetSize}
            />
            <input type="hidden" name="fleetSize" value={fleetSize ?? ""} />
          </>
        )}
      </ChipField>

      <CheckboxGroup name="carTypes" className="flex flex-col gap-2">
        <Label className={LABEL}>
          {copy.carTypes}
          {optional}
        </Label>
        <div className="flex flex-wrap gap-2">
          {CAR_TYPES.map((value) => (
            <Checkbox
              key={value}
              value={value}
              className="flex h-9 cursor-pointer items-center rounded-full border border-blue-dark/15 bg-white px-3.5 text-sm font-semibold text-blue-dark outline-none transition-colors duration-150 hover:border-blue-medium/50 data-focus-visible:ring-2 data-focus-visible:ring-blue-medium data-focus-visible:ring-offset-1 data-selected:border-blue-medium data-selected:bg-blue-medium data-selected:text-white motion-reduce:transition-none"
            >
              {copy.carTypeOptions[value]}
            </Checkbox>
          ))}
        </div>
      </CheckboxGroup>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChipField label={copy.term} optional={optional}>
          {(labelId) => (
            <>
              <ChoiceChips
                labelledBy={labelId}
                options={TERMS.map((value) => ({ value, label: copy.terms[value] }))}
                value={term}
                onChange={setTerm}
              />
              <input type="hidden" name="term" value={term ?? ""} />
            </>
          )}
        </ChipField>
        <ChipField label={copy.start} optional={optional}>
          {(labelId) => (
            <>
              <ChoiceChips
                labelledBy={labelId}
                options={STARTS.map((value) => ({ value, label: copy.starts[value] }))}
                value={start}
                onChange={setStart}
              />
              <input type="hidden" name="start" value={start ?? ""} />
            </>
          )}
        </ChipField>
      </div>

      <TextField name="location" autoComplete="address-level2" className={FIELD}>
        <Label className={LABEL}>
          {copy.location}
          {optional}
        </Label>
        <Input className={`${CONTROL} h-12`} />
        <Text slot="description" className={HINT}>
          {copy.locationHint}
        </Text>
      </TextField>

      <TextField name="message" className={FIELD}>
        <Label className={LABEL}>
          {copy.message}
          {optional}
        </Label>
        <TextArea rows={4} className={`${CONTROL} min-h-28 py-3`} />
        <Text slot="description" className={HINT}>
          {copy.messageHint}
        </Text>
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
        <span className="[&_a]:font-semibold [&_a]:text-blue-medium [&_a]:underline">{consent}</span>
      </Checkbox>
      {errors.has("consent") ? (
        <p className={`${ERROR} -mt-3 pl-8`}>{copy.errors.consent}</p>
      ) : null}

      {state.status === "failed" || state.status === "unavailable" ? (
        <div role="alert" className="flex flex-col gap-2 rounded-control bg-red-50 px-4 py-3 text-sm text-red-800">
          <p>{state.status === "failed" ? copy.errors.failed : copy.errors.notConfigured}</p>
          {fallbackContact}
        </div>
      ) : state.status === "invalid" ? (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {copy.errors.summary}
        </p>
      ) : null}

      <Button type="submit" isPending={pending} className={buttonClass("success", "lg", "w-full sm:w-auto sm:self-start")}>
        {pending ? copy.submitting : copy.submit}
        {pending ? null : <Send className="size-5" aria-hidden />}
      </Button>
    </Form>
  );
}

function ChipField({
  label,
  optional,
  children,
}: {
  label: string;
  optional: ReactNode;
  children: (labelId: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-2">
      <span id={id} className={LABEL}>
        {label}
        {optional}
      </span>
      {children(id)}
    </div>
  );
}
