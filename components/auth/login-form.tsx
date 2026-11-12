"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { accountCopy } from "@/i18n/account";
import { authFormsCopy } from "@/i18n/auth-forms";
import type { Lang } from "@/i18n/config";
import { accountHref } from "@/i18n/routes";
import { login, type LoginState } from "@/lib/auth/actions";

import { FormAlert, PasswordField, SubmitButton, TextField } from "./fields";
import { RecoveryCodeDialog } from "./password-forms";

export function LoginForm({ lang, next }: { lang: Lang; next: string | null }) {
  const t = accountCopy[lang].login;
  const forms = authFormsCopy[lang];
  const [codeOpen, setCodeOpen] = useState(false);
  const [state, action, pending] = useActionState<LoginState, FormData>(
    async (previous, formData) => {
      const result = await login(previous, formData);
      // Recovery was started and not finished: go straight to the code.
      if (result?.error === "reset_pending") {
        setCodeOpen(true);
      }
      return result;
    },
    null,
  );
  const pendingReset = state?.error === "reset_pending";

  return (
    <>
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="lang" value={lang} />
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <TextField
          label={t.email}
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
          defaultValue={state?.email}
        />
        <PasswordField
          label={t.password}
          name="password"
          autoComplete="current-password"
          required
          maxLength={256}
          showLabel={t.showPassword}
          hideLabel={t.hidePassword}
        />
        <Link
          href={accountHref(lang, "forgotPassword")}
          className="-mt-1 self-end text-sm font-medium text-blue-medium underline-offset-4 hover:underline"
        >
          {forms.forgotLink}
        </Link>
        {pendingReset ? (
          <div role="alert" className="flex flex-col gap-3 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            <p>{t.errors.reset_pending}</p>
            <button
              type="button"
              onClick={() => setCodeOpen(true)}
              className="h-10 w-fit rounded-lg bg-blue-medium px-4 font-semibold text-white hover:bg-blue-dark"
            >
              {forms.code.finish}
            </button>
          </div>
        ) : state?.error ? (
          <FormAlert tone="error">{t.errors[state.error]}</FormAlert>
        ) : null}
        <SubmitButton pending={pending} label={t.submit} pendingLabel={t.submitting} />
      </form>
      {/* Outside the form: React events bubble through portals. */}
      {pendingReset && state ? (
        <RecoveryCodeDialog
          key={state.email}
          lang={lang}
          email={state.email}
          open={codeOpen}
          justSent={false}
          onOpenChange={setCodeOpen}
        />
      ) : null}
    </>
  );
}
