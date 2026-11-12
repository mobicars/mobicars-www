import type { Lang } from "./config";

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

const authFormsByLang = {
  pl: {
    tabs: { login: "Zaloguj się", register: "Załóż konto" },
    phone: {
      country: (name, code) => `Kraj numeru: ${name} (+${code})`,
      chooseCountry: "Wybierz kraj",
      search: "Szukaj kraju",
      noResults: "Brak wyników",
      invalidFor: (country) => `To nie wygląda na poprawny numer (${country}).`,
    },
    forgotLink: "Nie pamiętasz hasła?",
    backToLogin: "Wróć do logowania",
    password: {
      hint: "Co najmniej 8 znaków.",
      newPassword: "Nowe hasło",
      confirm: "Powtórz hasło",
      too_short: "Hasło musi mieć co najmniej 8 znaków.",
      too_long: "Hasło jest za długie.",
      mismatch: "Hasła nie są takie same.",
    },
    common: {
      rate_limited: "Zbyt wiele prób. Spróbuj ponownie za 15 minut.",
      unavailable: "Usługa jest chwilowo niedostępna. Spróbuj ponownie za chwilę.",
      saving: "Zapisywanie…",
    },
    security: {
      title: "Bezpieczeństwo",
      intro: "Zarządzaj hasłem do panelu klienta.",
      changeTitle: "Zmień hasło",
      current: "Obecne hasło",
      submit: "Zapisz nowe hasło",
      done: "Hasło zostało zmienione.",
      wrong_current: "Obecne hasło jest nieprawidłowe.",
      same: "Nowe hasło musi się różnić od obecnego.",
    },
    forgot: {
      title: "Odzyskaj hasło",
      intro: "Podaj adres e-mail konta. Wyślemy na niego kod do ustawienia nowego hasła.",
      email: "E-mail",
      submit: "Wyślij kod",
      invalid_email: "Podaj poprawny adres e-mail.",
    },
    code: {
      title: "Wpisz kod z e-maila",
      intro: (email) => `Jeśli konto z adresem ${email} istnieje, wysłaliśmy na nie kod do zmiany hasła.`,
      label: "Kod",
      next: "Dalej",
      checking: "Sprawdzanie…",
      spam: "Nie widzisz wiadomości? Sprawdź folder spam.",
      notReceived: "Kod nie dotarł?",
      resend: "Wyślij ponownie",
      resendIn: (seconds) => `Wyślij ponownie za ${seconds} s`,
      resent: "Wysłaliśmy nowy kod. Poprzedni może już nie działać.",
      invalid_code: "Kod jest nieprawidłowy.",
      no_pending: "Ten kod wygasł albo został już użyty. Wyślij nowy.",
      passwordTitle: "Ustaw nowe hasło",
      passwordIntro: "Kod jest poprawny. Ustaw nowe hasło do konta.",
      submit: "Ustaw hasło i zaloguj się",
      close: "Zamknij",
      pendingNotice: "Dla tego konta rozpoczęto odzyskiwanie hasła. Dokończ je kodem z e-maila.",
      finish: "Wpisz kod",
    },
    register: {
      title: "Załóż konto",
      intro: "Szybsze rezerwacje i dostęp do historii wynajmów.",
      private: "Osoba prywatna",
      company: "Firma",
      firstName: "Imię",
      lastName: "Nazwisko",
      email: "E-mail",
      phone: "Telefon",
      companyName: "Nazwa firmy",
      vatNumber: "NIP",
      terms: "Akceptuję regulamin wypożyczalni i politykę prywatności MobiCars.",
      submit: "Załóż konto",
      haveAccount: "Masz już konto?",
      missing: "Uzupełnij zaznaczone pola.",
      invalid_email: "Podaj poprawny adres e-mail.",
      invalid_phone: "Podaj poprawny numer telefonu.",
      invalid_vat: "Podaj poprawny NIP.",
      exists: "Konto z tym adresem e-mail już istnieje. Zaloguj się albo odzyskaj hasło.",
    },
  },
  en: {
    tabs: { login: "Sign in", register: "Create account" },
    phone: {
      country: (name, code) => `Phone country: ${name} (+${code})`,
      chooseCountry: "Choose a country",
      search: "Search country",
      noResults: "No results",
      invalidFor: (country) => `This does not look like a valid number (${country}).`,
    },
    forgotLink: "Forgot your password?",
    backToLogin: "Back to sign-in",
    password: {
      hint: "At least 8 characters.",
      newPassword: "New password",
      confirm: "Repeat password",
      too_short: "The password must be at least 8 characters long.",
      too_long: "The password is too long.",
      mismatch: "The passwords do not match.",
    },
    common: {
      rate_limited: "Too many attempts. Try again in 15 minutes.",
      unavailable: "The service is temporarily unavailable. Please try again shortly.",
      saving: "Saving…",
    },
    security: {
      title: "Security",
      intro: "Manage the password of your customer panel.",
      changeTitle: "Change password",
      current: "Current password",
      submit: "Save new password",
      done: "Your password has been changed.",
      wrong_current: "The current password is incorrect.",
      same: "The new password must differ from the current one.",
    },
    forgot: {
      title: "Reset your password",
      intro: "Enter your account email. We will send you a code to set a new password.",
      email: "Email",
      submit: "Send code",
      invalid_email: "Enter a valid email address.",
    },
    code: {
      title: "Enter the code from the email",
      intro: (email) => `If an account with ${email} exists, we have sent it a code to reset the password.`,
      label: "Code",
      next: "Continue",
      checking: "Checking…",
      spam: "No message? Check your spam folder.",
      notReceived: "Didn’t get the code?",
      resend: "Send again",
      resendIn: (seconds) => `Send again in ${seconds} s`,
      resent: "We have sent a new code. The previous one may no longer work.",
      invalid_code: "The code is incorrect.",
      no_pending: "This code has expired or was already used. Send a new one.",
      passwordTitle: "Set a new password",
      passwordIntro: "The code is correct. Set a new password for your account.",
      submit: "Set password and sign in",
      close: "Close",
      pendingNotice: "A password reset was started for this account. Finish it with the code from the email.",
      finish: "Enter code",
    },
    register: {
      title: "Create an account",
      intro: "Faster bookings and your rental history in one place.",
      private: "Private person",
      company: "Company",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      phone: "Phone",
      companyName: "Company name",
      vatNumber: "VAT number (NIP)",
      terms: "I accept the MobiCars rental terms and privacy policy.",
      submit: "Create account",
      haveAccount: "Already have an account?",
      missing: "Fill in the marked fields.",
      invalid_email: "Enter a valid email address.",
      invalid_phone: "Enter a valid phone number.",
      invalid_vat: "Enter a valid VAT number.",
      exists: "An account with this email already exists. Sign in or reset your password.",
    },
  },
} satisfies Record<"pl" | "en", AuthFormsCopy>;

/** German and Ukrainian show the English text until they are translated. */
export const authFormsCopy: Record<Lang, AuthFormsCopy> = { ...authFormsByLang, de: authFormsByLang.en, uk: authFormsByLang.en };
