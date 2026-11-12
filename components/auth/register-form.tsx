"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { useAccountCopy } from "@/i18n/account";
import { useAuthFormsCopy } from "@/i18n/auth-forms";
import type { Lang } from "@/i18n/config";
import { accountHref } from "@/i18n/routes";
import { register, type RegisterField, type RegisterState } from "@/lib/auth/account-actions";

import { FormAlert, PasswordField, SubmitButton, TextField } from "./fields";
import { PhoneField } from "./phone-field";

export function RegisterForm({ lang }: { lang: Lang }) {
  const login = useAccountCopy().login;
  const forms = useAuthFormsCopy();
  const t = forms.register;
  const [state, action, pending] = useActionState<RegisterState, FormData>(register, null);
  const [type, setType] = useState<"private" | "company">("private");
  const isCompany = type === "company";
  const bad = (field: RegisterField) => state?.fields.includes(field) ?? false;
  const value = (name: string) => state?.values[name];

  const message = state
    ? ({
        missing: t.missing,
        invalid_email: t.invalid_email,
        invalid_phone: t.invalid_phone,
        invalid_vat: t.invalid_vat,
        exists: t.exists,
        too_short: forms.password.too_short,
        too_long: forms.password.too_long,
        mismatch: forms.password.mismatch,
        rate_limited: forms.common.rate_limited,
        unavailable: forms.common.unavailable,
      } as const)[state.error]
    : null;

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="lang" value={lang} />
      <fieldset className="grid grid-cols-2 gap-2">
        <legend className="sr-only">{t.title}</legend>
        {(["private", "company"] as const).map((option) => (
          <label
            key={option}
            className={`flex h-11 cursor-pointer items-center justify-center rounded-lg border text-sm font-semibold transition-colors has-focus-visible:ring-2 has-focus-visible:ring-blue-light ${
              type === option
                ? "border-blue-medium bg-blue-light text-blue-dark"
                : "border-muted text-muted-dark hover:text-blue-dark"
            }`}
          >
            <input
              type="radio"
              name="accountType"
              value={option}
              checked={type === option}
              onChange={() => setType(option)}
              className="sr-only"
            />
            {t[option]}
          </label>
        ))}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label={t.firstName} name="firstName" autoComplete="given-name" required maxLength={200} defaultValue={value("firstName")} invalid={bad("firstName")} />
        <TextField label={t.lastName} name="lastName" autoComplete="family-name" required maxLength={200} defaultValue={value("lastName")} invalid={bad("lastName")} />
      </div>
      {isCompany ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label={t.companyName} name="companyName" autoComplete="organization" required maxLength={200} defaultValue={value("companyName")} invalid={bad("companyName")} />
          <TextField label={t.vatNumber} name="vatNumber" inputMode="numeric" required maxLength={32} defaultValue={value("vatNumber")} invalid={bad("vatNumber")} />
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label={t.email} name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={value("email")} invalid={bad("email")} />
        <PhoneField key={value("phone")} lang={lang} label={t.phone} name="phone" required defaultValue={value("phone")} invalid={bad("phone")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordField
          label={login.password}
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={256}
          hint={forms.password.hint}
          invalid={bad("password")}
          showLabel={login.showPassword}
          hideLabel={login.hidePassword}
        />
        <PasswordField
          label={forms.password.confirm}
          name="confirm"
          autoComplete="new-password"
          required
          maxLength={256}
          invalid={bad("password")}
          showLabel={login.showPassword}
          hideLabel={login.hidePassword}
        />
      </div>
      <label className={`flex items-start gap-3 text-sm ${bad("terms") ? "text-red-700" : "text-ink"}`}>
        <input type="checkbox" name="terms" required className="mt-0.5 size-4 shrink-0 accent-green-medium" />
        {t.terms}
      </label>

      {message ? (
        <FormAlert tone="error">
          {message}
          {state?.error === "exists" ? (
            <>
              {" "}
              <Link href={accountHref(lang, "forgotPassword")} className="font-semibold underline">
                {forms.forgotLink}
              </Link>
            </>
          ) : null}
        </FormAlert>
      ) : null}
      <SubmitButton pending={pending} label={t.submit} pendingLabel={forms.common.saving} />
      <p className="text-center text-sm text-muted-dark">
        {t.haveAccount}{" "}
        <Link href={accountHref(lang, "login")} className="font-medium text-blue-medium hover:underline">
          {forms.tabs.login}
        </Link>
      </p>
    </form>
  );
}
