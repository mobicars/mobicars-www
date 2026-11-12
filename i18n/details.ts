import type { ConsentName, TextFieldName } from "@/lib/account/fields";

import type { Lang } from "./config";

export type DetailsCopy = {
  title: string;
  intro: string;
  personal: string;
  address: string;
  company: string;
  preferences: string;
  email: string;
  emailNote: string;
  fields: Record<TextFieldName, string>;
  consents: Record<ConsentName, { label: string; hint: string }>;
  required: string;
  submit: string;
  saving: string;
  saved: string;
  nothingChanged: string;
  errors: {
    missing: string;
    invalid_phone: string;
    invalid_vat: string;
    not_saved: string;
    rate_limited: string;
    unavailable: string;
  };
};

const detailsByLang = {
  pl: {
    title: "Moje dane",
    intro: "Dane używane w rezerwacjach i na dokumentach.",
    personal: "Dane osobowe",
    address: "Adres",
    company: "Dane firmy",
    preferences: "Ustawienia",
    email: "E-mail",
    emailNote: "To adres logowania. Aby go zmienić, skontaktuj się z biurem MobiCars.",
    fields: {
      firstName: "Imię",
      lastName: "Nazwisko",
      phone: "Telefon",
      homeAddress: "Ulica i numer",
      postalCode: "Kod pocztowy",
      city: "Miejscowość",
      country: "Kraj",
      companyName: "Nazwa firmy",
      vatNumber: "NIP",
      companyAddress: "Adres firmy",
      companyPostalCode: "Kod pocztowy firmy",
      companyCity: "Miejscowość firmy",
    },
    consents: {
      reservationTransferConsent: {
        label: "Zgoda na przekazanie rezerwacji",
        hint: "Gdy w wybranym terminie zabraknie auta, rezerwację może zrealizować partner MobiCars.",
      },
      collectiveInvoices: {
        label: "Faktury zbiorcze",
        hint: "Jedna faktura za kilka wynajmów w okresie rozliczeniowym.",
      },
    },
    required: "Pole wymagane",
    submit: "Zapisz zmiany",
    saving: "Zapisywanie…",
    saved: "Zmiany zostały zapisane.",
    nothingChanged: "Nie wprowadzono zmian.",
    errors: {
      missing: "Uzupełnij wymagane pola.",
      invalid_phone: "Podaj poprawny numer telefonu.",
      invalid_vat: "Podaj poprawny NIP.",
      not_saved: "Nie udało się zapisać zmian. Spróbuj ponownie albo skontaktuj się z biurem.",
      rate_limited: "Zbyt wiele zmian w krótkim czasie. Spróbuj ponownie za 15 minut.",
      unavailable: "Usługa jest chwilowo niedostępna. Spróbuj ponownie za chwilę.",
    },
  },
  en: {
    title: "My details",
    intro: "Details used in your bookings and on documents.",
    personal: "Personal details",
    address: "Address",
    company: "Company details",
    preferences: "Preferences",
    email: "Email",
    emailNote: "This is your sign-in address. To change it, please contact the MobiCars office.",
    fields: {
      firstName: "First name",
      lastName: "Last name",
      phone: "Phone",
      homeAddress: "Street and number",
      postalCode: "Postal code",
      city: "City",
      country: "Country",
      companyName: "Company name",
      vatNumber: "VAT number (NIP)",
      companyAddress: "Company address",
      companyPostalCode: "Company postal code",
      companyCity: "Company city",
    },
    consents: {
      reservationTransferConsent: {
        label: "Consent to transfer the booking",
        hint: "If no car is available on your dates, a MobiCars partner may fulfil the booking.",
      },
      collectiveInvoices: {
        label: "Collective invoices",
        hint: "One invoice for several rentals in a billing period.",
      },
    },
    required: "Required",
    submit: "Save changes",
    saving: "Saving…",
    saved: "Your changes have been saved.",
    nothingChanged: "Nothing was changed.",
    errors: {
      missing: "Fill in the required fields.",
      invalid_phone: "Enter a valid phone number.",
      invalid_vat: "Enter a valid VAT number.",
      not_saved: "Your changes could not be saved. Try again or contact the office.",
      rate_limited: "Too many changes in a short time. Try again in 15 minutes.",
      unavailable: "The service is temporarily unavailable. Please try again shortly.",
    },
  },
} satisfies Record<"pl" | "en", DetailsCopy>;

/** German and Ukrainian show the English text until they are translated. */
export const detailsCopy: Record<Lang, DetailsCopy> = { ...detailsByLang, de: detailsByLang.en, uk: detailsByLang.en };
