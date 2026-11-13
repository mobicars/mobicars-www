"use client";

import { startTransition, useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LoaderCircle, LogIn, LogOut, UserRound } from "lucide-react";
import { Button, Disclosure, DisclosurePanel } from "react-aria-components";

import { FormAlert, PasswordField, TextField } from "@/components/auth/fields";
import { buttonClass } from "@/components/ui/button";
import { useAccountCopy } from "@/i18n/account";
import type { Lang } from "@/i18n/config";
import { useMessages } from "@/i18n/messages-context";
import { accountHref } from "@/i18n/routes";
import { loginInPlace, logoutInPlace, type LoginState } from "@/lib/auth/actions";

/**
 * "I already have a mobiaccount" on the booking form, as on the old site: sign in (or
 * out) without leaving the page. The page then refreshes on the server, so
 * the form fills in, or clears, the account's data; the car, protection and
 * extras stay in the URL.
 */
export function AccountBox({
  lang,
  account,
  open,
  onOpenChange,
}: {
  lang: Lang;
  /** Signed in: the email shown with the logout button. */
  account: { email: string } | null;
  /** Controlled, so the "account exists" error after booking can open it. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useAccountCopy().login;
  const messages = useMessages();
  const d = messages.details;
  const router = useRouter();
  const [leaving, startLeaving] = useTransition();
  const [email, setEmail] = useState("");
  const [state, action, pending] = useActionState<LoginState, FormData>(async (previous, data) => {
    const result = await loginInPlace(previous, data);
    if (!result) {
      router.refresh();
    }
    return result;
  }, null);

  if (account) {
    const [before, after = ""] = d.signedInAs.split("{email}");
    return (
      <div className="flex flex-col items-start justify-between gap-3 rounded-xl bg-blue-light px-4 py-3 text-sm text-blue-dark @xl:flex-row @xl:items-center">
        <p className="flex items-center gap-2">
          <UserRound className="size-4 shrink-0 text-blue-medium" aria-hidden />
          <span>
            {before}
            <span className="font-semibold">{account.email}</span>
            {after}
          </span>
        </p>
        <button
          type="button"
          disabled={leaving}
          onClick={() =>
            startLeaving(async () => {
              await logoutInPlace();
              router.refresh();
            })
          }
          className={buttonClass("secondary", "sm")}
        >
          {leaving ? (
            <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          ) : (
            <LogOut className="size-4" aria-hidden />
          )}
          {d.logout}
        </button>
      </div>
    );
  }

  const [haveBefore, haveAfter = ""] = d.haveAccount.split("{mobi}");
  return (
    // React Aria's disclosure: the button says it is expanded and which panel it controls.
    <Disclosure isExpanded={open} onExpandedChange={onOpenChange} className="rounded-xl border border-blue-medium/20 bg-blue-light/60">
      <Button
        slot="trigger"
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm text-blue-dark outline-none data-focus-visible:ring-2 data-focus-visible:ring-blue-medium"
      >
        <span className="flex items-center gap-2">
          <LogIn className="size-4 shrink-0 text-blue-medium" aria-hidden />
          <span>
            <span className="font-semibold">
              {haveBefore}
              <span className="text-blue-medium">mobi</span>
              {haveAfter}
            </span>{" "}
            {d.loginPrompt}
          </span>
        </span>
        <ChevronDown
          className={`size-5 shrink-0 text-blue-medium transition-transform duration-200 ease-out motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </Button>
      <DisclosurePanel>
      {/* Only while open, so password managers do not fill a hidden form. */}
      {open ? (
        // A separate form: it must not submit the booking form around it.
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            startTransition(() => action(data));
          }}
          className="flex flex-col gap-3 border-t border-blue-medium/15 px-4 pt-3 pb-4"
        >
          <div className="grid gap-3 @xl:grid-cols-2">
            <TextField
              label={t.email}
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              invalid={state !== null}
            />
            <PasswordField
              label={t.password}
              name="password"
              autoComplete="current-password"
              required
              maxLength={256}
              invalid={state !== null}
              showLabel={t.showPassword}
              hideLabel={t.hidePassword}
            />
          </div>
          {state ? <FormAlert tone="error">{t.errors[state.error]}</FormAlert> : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={accountHref(lang, "forgotPassword")}
              target="_blank"
              className="text-sm font-medium text-blue-medium underline-offset-4 hover:underline"
            >
              {messages.auth.forgotLink}
            </Link>
            <button
              type="submit"
              disabled={pending}
              className={buttonClass("primary")}
            >
              {pending ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : null}
              {pending ? t.submitting : t.submit}
            </button>
          </div>
        </form>
      ) : null}
      </DisclosurePanel>
    </Disclosure>
  );
}
