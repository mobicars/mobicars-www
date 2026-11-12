import { useMemo } from "react";

import { fill } from "./fill";
import type { Messages } from "./messages";
import { useMessages } from "./messages-context";

type PasswordErrors = {
  too_short: string;
  too_long: string;
  mismatch: string;
};

export type AuthFormsCopy = {
  tabs: { login: string; register: string };
  phone: {
    country: (name: string, code: string) => string;
    chooseCountry: string;
    search: string;
    noResults: string;
    invalidFor: (country: string) => string;
  };
  forgotLink: string;
  backToLogin: string;
  password: PasswordErrors & {
    hint: string;
    newPassword: string;
    confirm: string;
  };
  common: {
    rate_limited: string;
    unavailable: string;
    saving: string;
  };
  security: {
    title: string;
    intro: string;
    changeTitle: string;
    current: string;
    submit: string;
    done: string;
    wrong_current: string;
    same: string;
  };
  forgot: {
    title: string;
    intro: string;
    email: string;
    submit: string;
    invalid_email: string;
  };
  code: {
    title: string;
    intro: (email: string) => string;
    label: string;
    next: string;
    checking: string;
    spam: string;
    notReceived: string;
    resend: string;
    resendIn: (seconds: number) => string;
    resent: string;
    invalid_code: string;
    no_pending: string;
    passwordTitle: string;
    passwordIntro: string;
    submit: string;
    close: string;
    pendingNotice: string;
    finish: string;
  };
  register: {
    title: string;
    intro: string;
    private: string;
    company: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyName: string;
    vatNumber: string;
    terms: string;
    submit: string;
    haveAccount: string;
    missing: string;
    invalid_email: string;
    invalid_phone: string;
    invalid_vat: string;
    exists: string;
  };
};

/** Sign-in, registration and password texts from `messages/{lang}.json` (`auth`). */
export function authFormsCopyOf({ auth }: Messages): AuthFormsCopy {
  return {
    ...auth,
    phone: {
      ...auth.phone,
      country: (name, code) => fill(auth.phone.country, { name, code }),
      invalidFor: (country) => fill(auth.phone.invalidFor, { country }),
    },
    code: {
      ...auth.code,
      intro: (email) => fill(auth.code.intro, { email }),
      resendIn: (seconds) => fill(auth.code.resendIn, { seconds }),
    },
  };
}

/** For client components: built from the page language's messages only. */
export function useAuthFormsCopy(): AuthFormsCopy {
  const messages = useMessages();
  return useMemo(() => authFormsCopyOf(messages), [messages]);
}
