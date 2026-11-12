"use client";

import { Mail } from "lucide-react";
import { useActionState, type ReactNode } from "react";

import { FormAlert, SubmitButton, TextField } from "@/components/auth/fields";
import { PhoneField } from "@/components/auth/phone-field";
import type { Lang } from "@/i18n/config";
import { detailsCopy } from "@/i18n/details";
import {
  CONSENT_FIELDS,
  TEXT_FIELDS,
  type AccountDetails,
  type TextFieldName,
} from "@/lib/account/fields";
import { updateDetails, type UpdateDetailsState } from "@/lib/auth/account-actions";

const GROUPS: { title: "personal" | "address" | "company"; fields: TextFieldName[] }[] = [
  { title: "personal", fields: ["firstName", "lastName", "phone"] },
  { title: "address", fields: ["homeAddress", "postalCode", "city", "country"] },
  { title: "company", fields: ["companyName", "vatNumber", "companyAddress", "companyPostalCode", "companyCity"] },
];

export function DetailsForm({ lang, details }: { lang: Lang; details: AccountDetails }) {
  const t = detailsCopy[lang];
  const [state, action, pending] = useActionState<UpdateDetailsState, FormData>(updateDetails, null);
  const bad = (name: string) => (state && "error" in state ? state.fields.includes(name) : false);
  // React resets the form after each submit: show what was sent, not the old data.
  const textValue = (name: TextFieldName) => state?.values[name] ?? details.text[name];
  const fieldProps = { lang, t, bad, textValue };

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="lang" value={lang} />

      <Section title={t.personal}>
        <div className="flex items-start gap-3 rounded-lg bg-surface p-4 sm:col-span-2">
          <Mail className="mt-0.5 size-5 shrink-0 text-blue-medium" aria-hidden />
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-dark">{t.email}</p>
            <p className="font-medium break-all">{details.email ?? "—"}</p>
            <p className="mt-1 text-xs text-muted-dark">{t.emailNote}</p>
          </div>
        </div>
        {GROUPS[0].fields.map((name) => (
          <Field key={name} name={name} {...fieldProps} />
        ))}
      </Section>

      <Section title={t.address}>
        {GROUPS[1].fields.map((name) => (
          <Field key={name} name={name} wide={name === "homeAddress"} {...fieldProps} />
        ))}
      </Section>

      {details.isCompany ? (
        <Section title={t.company}>
          {GROUPS[2].fields.map((name) => (
            <Field key={name} name={name} wide={name === "companyAddress"} {...fieldProps} />
          ))}
        </Section>
      ) : null}

      <Section title={t.preferences}>
        {CONSENT_FIELDS.filter((field) => !field.companyOnly || details.isCompany).map((field) => (
          <label key={field.name} className="flex items-start gap-3 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name={field.name}
              defaultChecked={state?.checked[field.name] ?? details.consents[field.name]}
              className="mt-0.5 size-4 shrink-0 accent-green-medium"
            />
            <span>
              <span className="block font-medium text-blue-dark">{t.consents[field.name].label}</span>
              <span className="text-muted-dark">{t.consents[field.name].hint}</span>
            </span>
          </label>
        ))}
      </Section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton pending={pending} label={t.submit} pendingLabel={t.saving} />
        {state && "done" in state ? (
          <FormAlert tone="success">{state.changed > 0 ? t.saved : t.nothingChanged}</FormAlert>
        ) : null}
        {state && "error" in state ? <FormAlert tone="error">{t.errors[state.error]}</FormAlert> : null}
      </div>
    </form>
  );
}

const SPECS = new Map(TEXT_FIELDS.map((field) => [field.name, field]));

function Field({
  name,
  wide,
  lang,
  t,
  bad,
  textValue,
}: {
  name: TextFieldName;
  wide?: boolean;
  lang: Lang;
  t: (typeof detailsCopy)[Lang];
  bad: (name: string) => boolean;
  textValue: (name: TextFieldName) => string;
}) {
  const spec = SPECS.get(name)!;
  if (name === "phone") {
    return (
      <PhoneField
        // Remount after a save so the field shows the stored format.
        key={textValue(name)}
        lang={lang}
        label={`${t.fields.phone} *`}
        name="phone"
        defaultValue={textValue(name)}
        required
        invalid={bad(name)}
      />
    );
  }
  return (
    <TextField
      label={spec.required ? `${t.fields[name]} *` : t.fields[name]}
      name={name}
      type={spec.type ?? "text"}
      autoComplete={spec.autoComplete}
      required={spec.required}
      maxLength={spec.maxLength}
      defaultValue={textValue(name)}
      invalid={bad(name)}
      className={wide ? "sm:col-span-2" : undefined}
    />
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-muted bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-blue-dark">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
