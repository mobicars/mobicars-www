import type { Lang } from "./config";

/**
 * Interface texts of the contact form (`components/sections/contact-form.tsx`): the
 * company card, the departments and the form. Headings, topics and
 * departments come from the CMS, company data from `site.contact`.
 */
export type ContactCopy = {
  company: {
    call: string;
    write: string;
    hotline: string;
    /** A day range with no phone line in `formatOpeningHours`. */
    closed: string;
    email: string;
    address: string;
    showMap: string;
    taxId: string;
    regon: string;
    krs: string;
  };
  departments: { title: string; call: (name: string) => string; write: (name: string) => string; hours: string };
  form: {
    label: string;
    topic: string;
    topicPlaceholder: string;
    name: string;
    email: string;
    phone: string;
    contactHint: string;
    /** The contact form (`sections.form`): the old site's city field and the note that a copy goes to the email. */
    city: string;
    copyHint: string;
    message: string;
    optional: string;
    /** Text before and after the privacy policy link. */
    consent: { before: string; link: string; after: string; href: string };
    submit: string;
    submitting: string;
    sendAnother: string;
    successTitle: string;
    successText: string;
    errors: {
      name: string;
      contact: string;
      email: string;
      emailRequired: string;
      phone: string;
      message: string;
      consent: string;
      failed: string;
      notConfigured: string;
    };
  };
};

const pl: ContactCopy = {
  company: {
    call: "Zadzwoń",
    write: "Napisz",
    hotline: "Infolinia",
    closed: "nieczynne",
    email: "E-mail",
    address: "Adres",
    showMap: "Pokaż na mapie",
    taxId: "NIP",
    regon: "REGON",
    krs: "KRS",
  },
  departments: {
    title: "Działy",
    call: (name) => `Zadzwoń: ${name}`,
    write: (name) => `Napisz: ${name}`,
    hours: "Godziny",
  },
  form: {
    label: "Formularz kontaktowy",
    topic: "Temat",
    topicPlaceholder: "Wybierz temat",
    name: "Imię i nazwisko",
    email: "E-mail",
    phone: "Telefon",
    contactHint: "Podaj e-mail lub telefon – wystarczy jedno.",
    city: "Miasto",
    copyHint: "Na ten adres wyślemy kopię wiadomości.",
    message: "Wiadomość",
    optional: "opcjonalnie",
    consent: {
      before: "Wyrażam zgodę na przetwarzanie moich danych w celu odpowiedzi na wiadomość, zgodnie z ",
      link: "Polityką prywatności",
      after: ".",
      href: "/pl/dokumenty/polityka-prywatnosci",
    },
    submit: "Wyślij wiadomość",
    submitting: "Wysyłanie…",
    sendAnother: "Wyślij kolejną wiadomość",
    successTitle: "Dziękujemy, wiadomość wysłana",
    successText: "Odpowiemy najszybciej, jak to możliwe – zwykle w ciągu jednego dnia roboczego.",
    errors: {
      name: "Podaj imię i nazwisko.",
      contact: "Podaj e-mail lub telefon, żebyśmy mogli odpowiedzieć.",
      email: "Sprawdź adres e-mail.",
      emailRequired: "Podaj adres e-mail, żebyśmy mogli odpowiedzieć.",
      phone: "Sprawdź numer telefonu.",
      message: "Napisz, w czym możemy pomóc.",
      consent: "Zaznacz zgodę, żebyśmy mogli odpowiedzieć.",
      failed: "Nie udało się wysłać wiadomości. Spróbuj za chwilę albo zadzwoń lub napisz do nas:",
      notConfigured: "Formularz jest chwilowo niedostępny. Zadzwoń lub napisz do nas:",
    },
  },
};

const en: ContactCopy = {
  company: {
    call: "Call",
    write: "Email",
    hotline: "Hotline",
    closed: "closed",
    email: "Email",
    address: "Address",
    showMap: "Show on map",
    taxId: "Tax ID (NIP)",
    regon: "REGON",
    krs: "KRS",
  },
  departments: {
    title: "Departments",
    call: (name) => `Call: ${name}`,
    write: (name) => `Email: ${name}`,
    hours: "Hours",
  },
  form: {
    label: "Contact form",
    topic: "Topic",
    topicPlaceholder: "Choose a topic",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    contactHint: "Give an email or a phone number – one is enough.",
    city: "City",
    copyHint: "We'll send a copy of your message to this address.",
    message: "Message",
    optional: "optional",
    consent: {
      before: "I agree to the processing of my data to answer this message, in line with the ",
      link: "Privacy Policy",
      after: ".",
      href: "/en/documents/privacy-policy",
    },
    submit: "Send message",
    submitting: "Sending…",
    sendAnother: "Send another message",
    successTitle: "Thank you, your message has been sent",
    successText: "We'll reply as soon as we can – usually within one working day.",
    errors: {
      name: "Enter your full name.",
      contact: "Give an email or a phone number so we can reply.",
      email: "Check the email address.",
      emailRequired: "Enter your email address so we can reply.",
      phone: "Check the phone number.",
      message: "Tell us how we can help.",
      consent: "Tick the consent so we can reply.",
      failed: "We couldn't send your message. Try again in a moment, or call or email us:",
      notConfigured: "The form is unavailable right now. Call or email us:",
    },
  },
};

/** German and Ukrainian: English until the translators have them (`redesign/translations/new-keys.md`). */
const COPY: Record<Lang, ContactCopy> = { pl, en, de: en, uk: en };

export function contactCopy(lang: Lang): ContactCopy {
  return COPY[lang];
}
