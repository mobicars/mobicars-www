"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useId, useState, useTransition } from "react";
import { Button, Dialog, Modal, ModalOverlay } from "react-aria-components";

import { useAccountCopy } from "@/i18n/account";
import { useAuthFormsCopy } from "@/i18n/auth-forms";
import type { Lang } from "@/i18n/config";
import { accountHref } from "@/i18n/routes";
import {
  changePassword,
  requestPasswordReset,
  resendPasswordResetCode,
  resetPassword,
  verifyResetCode,
  type ChangePasswordState,
  type RecoveryRequestResult,
  type ResetPasswordState,
  type VerifyCodeState,
} from "@/lib/auth/account-actions";

import { FormAlert, PasswordField, SubmitButton, TextField } from "./fields";

const RESEND_COOLDOWN_S = 60;

function useCopy() {
  const login = useAccountCopy().login;
  const forms = useAuthFormsCopy();
  const errorText = (code: string): string =>
    (forms.password as Record<string, string>)[code] ??
    (forms.code as unknown as Record<string, string>)[code] ??
    (forms.common as Record<string, string>)[code] ??
    code;
  return { login, forms, errorText };
}

/** New password + confirmation, shared by reset and change. */
function NewPasswordFields({ invalid }: { invalid: boolean }) {
  const { login, forms } = useCopy();
  return (
    <>
      <PasswordField
        label={forms.password.newPassword}
        name="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={256}
        invalid={invalid}
        hint={forms.password.hint}
        showLabel={login.showPassword}
        hideLabel={login.hidePassword}
      />
      <PasswordField
        label={forms.password.confirm}
        name="confirm"
        autoComplete="new-password"
        required
        maxLength={256}
        invalid={invalid}
        showLabel={login.showPassword}
        hideLabel={login.hidePassword}
      />
    </>
  );
}

/** Step 1 of recovery: ask for the email, then open the code dialog. */
export function ForgotPasswordForm({ lang }: { lang: Lang }) {
  const { forms, errorText } = useCopy();
  const t = forms.forgot;
  const [dialogEmail, setDialogEmail] = useState<string | null>(null);
  const [state, action, pending] = useActionState<RecoveryRequestResult | null, FormData>(
    async (previous, formData) => {
      const result = await requestPasswordReset(previous, formData);
      // Open the dialog each time a request succeeds.
      if ("ok" in result) {
        setDialogEmail(result.email);
      }
      return result;
    },
    null,
  );

  const error = state && "error" in state ? state.error : null;
  return (
    <>
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="lang" value={lang} />
        <TextField
          label={t.email}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          defaultValue={state?.email}
          invalid={error === "invalid_email"}
        />
        {error ? (
          <FormAlert tone="error">{error === "invalid_email" ? t.invalid_email : errorText(error)}</FormAlert>
        ) : null}
        <SubmitButton pending={pending} label={t.submit} pendingLabel={forms.common.saving} />
        <Link href={accountHref(lang, "login")} className="text-center text-sm font-medium text-blue-medium hover:underline">
          {forms.backToLogin}
        </Link>
      </form>
      {dialogEmail ? (
        <RecoveryCodeDialog
          lang={lang}
          email={dialogEmail}
          open
          justSent
          onOpenChange={(open) => !open && setDialogEmail(null)}
        />
      ) : null}
    </>
  );
}

/**
 * Code from the recovery email, then the new password.
 * Opened after “send code”, and from the sign-in form when recovery for that
 * email was started and not finished.
 */
export function RecoveryCodeDialog({
  lang,
  email,
  open,
  justSent,
  onOpenChange,
}: {
  lang: Lang;
  email: string;
  open: boolean;
  /** A code was sent a moment ago: start the resend countdown. */
  justSent: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { forms } = useCopy();
  const titleId = useId();
  const [code, setCode] = useState<string | null>(null);

  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={onOpenChange}
      className="pickup-overlay fixed inset-0 z-50 flex bg-blue-dark/40 backdrop-blur-[4px]"
    >
      <Modal className="pickup-modal m-auto flex max-h-[calc(100dvh-1.5rem)] w-[min(26rem,calc(100%-1.5rem))] flex-col overflow-y-auto rounded-2xl bg-white text-ink shadow-2xl outline-none">
        <Dialog aria-labelledby={titleId} className="relative flex flex-col gap-5 p-6 outline-none sm:p-8">
          <Button
            slot="close"
            aria-label={forms.code.close}
            className="absolute top-4 right-4 flex size-8 cursor-pointer items-center justify-center rounded-full bg-muted-light text-muted-dark transition-colors hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </Button>
          {code === null ? (
            <CodeStep email={email} titleId={titleId} justSent={justSent} onVerified={setCode} />
          ) : (
            <PasswordStep lang={lang} email={email} code={code} titleId={titleId} onRestart={() => setCode(null)} />
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

function CodeStep({
  email,
  titleId,
  justSent,
  onVerified,
}: {
  email: string;
  titleId: string;
  justSent: boolean;
  onVerified: (code: string) => void;
}) {
  const { forms, errorText } = useCopy();
  const t = forms.code;
  const [state, action, pending] = useActionState<VerifyCodeState, FormData>(
    async (previous, formData) => {
      const result = await verifyResetCode(previous, formData);
      if (result && "ok" in result) {
        onVerified(result.code);
      }
      return result;
    },
    null,
  );
  const [value, setValue] = useState("");
  const [cooldown, setCooldown] = useState(justSent ? RESEND_COOLDOWN_S : 0);
  const [resendState, setResendState] = useState<RecoveryRequestResult | null>(null);
  const [resending, startResend] = useTransition();

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const resend = () =>
    startResend(async () => {
      const result = await resendPasswordResetCode(email);
      setResendState(result);
      if ("ok" in result) {
        setCooldown(RESEND_COOLDOWN_S);
        setValue("");
      }
    });

  const error = state && "error" in state ? state.error : null;
  return (
    <>
      <div className="pr-8">
        <h2 id={titleId} className="text-xl font-semibold text-blue-dark">{t.title}</h2>
        <p className="mt-1 text-sm text-muted-dark">{t.intro(email)}</p>
      </div>
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />
        <label className="flex flex-col gap-1.5 text-sm font-medium text-blue-dark">
          {t.label}
          <input
            name="code"
            value={value}
            onChange={(event) => setValue(event.target.value.replace(/\D/g, "").slice(0, 8))}
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            autoFocus
            maxLength={8}
            aria-invalid={error === "invalid_code" || undefined}
            className="h-14 rounded-lg border border-muted bg-white text-center font-mono text-2xl tracking-[0.5em] text-ink outline-none focus:border-blue-medium focus:ring-2 focus:ring-blue-light aria-invalid:border-red-500"
          />
        </label>
        {error ? <FormAlert tone="error">{errorText(error)}</FormAlert> : null}
        {resendState && "ok" in resendState ? <FormAlert tone="success">{t.resent}</FormAlert> : null}
        {resendState && "error" in resendState ? <FormAlert tone="error">{errorText(resendState.error)}</FormAlert> : null}
        <SubmitButton pending={pending} label={t.next} pendingLabel={t.checking} />
      </form>
      <div className="flex flex-col items-center gap-1 text-sm text-muted-dark">
        <p>{t.spam}</p>
        <p>
          {t.notReceived}{" "}
          <button
            type="button"
            onClick={resend}
            disabled={cooldown > 0 || resending}
            className="font-semibold text-blue-medium hover:underline disabled:cursor-default disabled:text-muted-dark disabled:no-underline"
          >
            {cooldown > 0 ? t.resendIn(cooldown) : t.resend}
          </button>
        </p>
      </div>
    </>
  );
}

function PasswordStep({
  lang,
  email,
  code,
  titleId,
  onRestart,
}: {
  lang: Lang;
  email: string;
  code: string;
  titleId: string;
  onRestart: () => void;
}) {
  const { forms, errorText } = useCopy();
  const t = forms.code;
  const [state, action, pending] = useActionState<ResetPasswordState, FormData>(resetPassword, null);
  const error = state?.error ?? null;
  const codeProblem = error === "invalid_code" || error === "no_pending";

  return (
    <>
      <div className="pr-8">
        <h2 id={titleId} className="text-xl font-semibold text-blue-dark">{t.passwordTitle}</h2>
        <p className="mt-1 text-sm text-muted-dark">{t.passwordIntro}</p>
      </div>
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="code" value={code} />
        {/* Lets password managers save the new password under the right account. */}
        <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
        <NewPasswordFields invalid={error === "too_short" || error === "mismatch"} />
        {error ? (
          <FormAlert tone="error">
            {errorText(error)}
            {codeProblem ? (
              <>
                {" "}
                <button type="button" onClick={onRestart} className="font-semibold underline">
                  {t.finish}
                </button>
              </>
            ) : null}
          </FormAlert>
        ) : null}
        <SubmitButton pending={pending} label={t.submit} pendingLabel={forms.common.saving} />
      </form>
    </>
  );
}

export function ChangePasswordForm({ lang }: { lang: Lang }) {
  const { login, forms, errorText } = useCopy();
  const t = forms.security;
  const [state, action, pending] = useActionState<ChangePasswordState, FormData>(changePassword, null);
  const error = state && "error" in state ? state.error : null;

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="lang" value={lang} />
      <PasswordField
        label={t.current}
        name="current"
        autoComplete="current-password"
        required
        maxLength={256}
        invalid={error === "wrong_current"}
        showLabel={login.showPassword}
        hideLabel={login.hidePassword}
      />
      <NewPasswordFields
        invalid={error === "too_short" || error === "mismatch" || error === "same"}
      />
      {state && "done" in state ? <FormAlert tone="success">{t.done}</FormAlert> : null}
      {error ? (
        <FormAlert tone="error">
          {error === "wrong_current" ? t.wrong_current : error === "same" ? t.same : errorText(error)}
        </FormAlert>
      ) : null}
      <SubmitButton pending={pending} label={t.submit} pendingLabel={forms.common.saving} />
    </form>
  );
}
