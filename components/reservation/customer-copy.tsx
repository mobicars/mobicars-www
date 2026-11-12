import type { ReactNode } from "react";

import type { ConsentName, CustomerError } from "@/lib/reservation/customer";
import type { PlaceReservationError } from "@/lib/reservation/actions";

/**
 * Texts of the "Twoje dane" step, word for word from the old site's Strapi
 * dictionary (`registerForm`, `reservation`, `reservationSuccess`), typos
 * included, until the new CMS takes them over. The transfer consent is cut off
 * in the CMS itself ("…dla mnie sa"); it is kept as it is there.
 */

function DocLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener" className="font-semibold text-blue-medium underline underline-offset-2">
      {children}
    </a>
  );
}

export const customerCopy = {
  title: "Twoje dane",
  description: "Uzupełnij formularz lub zaloguj się, aby uzupełnić dane.",
  individual: "Klient indywidualny",
  company: "Klient firmowy",
  companyName: "Nazwa firmy",
  vatNumber: "NIP",
  contactPerson: "Osoba kontaktowa (imię i nazwisko)",
  contactPersonHint:
    "Jeśli pojazd miałby być odbierany przez osobę niewskazaną w KRS lub CEIDG jako upoważniona do reprezentacji, w mailu wyślemy link do uzupełnienia upoważnienia.",
  firstName: "Imię",
  lastName: "Nazwisko",
  email: "Adres e-mail",
  phone: "Numer telefonu",
  password: "Hasło",
  confirm: "Powtórz hasło",
  passwordHint:
    "Hasło, które pozwoli Ci zalogować się do panelu klienta i zarządzać rezerwacjami oraz przyspieszy rezerwacje w przyszłości.",
  comment: "Informacje dodatkowe / uwagi",
  invoice: "Chcę otrzymać fakturę VAT",
  invoiceHint: "W przeciwnym razie zostanie automatycznie wystawiony paragon.",
  flightNumber: "Numer lotu",
  submit: "Rezerwuj",
  documents: (
    <>
      Aby złożyć zamówienie zapoznaj się z poniższymi dokumentami, dostępnymi zawsze na naszej stronie pod adresem{" "}
      <DocLink href="/pl/dokumenty">https://mobicars.pl/pl/dokumenty</DocLink> i oznacz obowiązkowe pola oznaczone
      gwiazdką (*).
    </>
  ),
  checkAll: "Zaznacz wszystkie wymagane zgody.",
  consents: {
    regulations: (
      <>
        Oświadczam, że zapoznałem się i akceptację <DocLink href="/pl/dokumenty/regulamin">Regulamin Rezerwacji</DocLink>.
      </>
    ),
    standardTerms: (
      <>
        Oświadczam, że zapoznałem się i akceptację{" "}
        <DocLink href="/pl/dokumenty/standardowe-warunki-umowy">Standardowe Warunki Umowy (SWU)</DocLink> zawierające
        zasady najmu i korzystania z pojazdu.
      </>
    ),
    privacyPolicy: (
      <>
        Oświadczam, że zapoznałem się i akceptuję{" "}
        <DocLink href="/pl/dokumenty/polityka-prywatnosci">Politykę Prywatności</DocLink> i zawartymi w niej zasadami
        przetwarzania danych osobowych.
      </>
    ),
    transfer: (
      <>
        W razie braku możliwości realizacji rezerwacji przez MobiCars Sp.z o.o. Sp.k., wyrażam zgodę na jej przekazanie
        oraz udostępnianie moich danych osobowych innym wypożyczalniom współpracującym z MobiCars Sp. z o.o. Sp. k., w
        celu zarezerwowania dla mnie sa
      </>
    ),
  } satisfies Record<ConsentName, ReactNode>,
  success: {
    title: "Zamówienie zostało złożone!",
    subtitle: "Dziękujemy za złożenie zamówienia na wynajem krótkoterminowy samochodu w mobicars.",
    text: "Realizacja zamówienia musi zostać jeszcze przez nas potwierdzona, co nastąpi mailem w możliwie krótkim czasie. W przypadku godzin nocnych lub świąt informację wyślemy nie później niż w ciągu 12 godzin.",
    text2: "Po zaakceptowaniu przez nas rezerwacji dostaniesz e-mail z linkiem do wpłaty zaliczki w celu potwierdzenia rezerwacji.",
    text3: "Jeśli wpłacisz zaliczkę, pozostałą część dopłacisz w momencie odbioru pojazdu swoją kartą płatniczą.",
  },
} as const;

/** Field messages. `phone`, `passwordMatch` and `consents` are the old site's. */
export const fieldErrors: Record<CustomerError, string> = {
  required: "To pole jest wymagane.",
  email: "Podaj poprawny adres e-mail.",
  phone: "Podany numer telefonu wygląda na błędny.",
  passwordLength: "Hasło musi mieć co najmniej 8 znaków.",
  passwordMatch: "Podane hasła nie są jednakowe.",
  consents: "Zaznacz wymagane zgody.",
  tooLong: "Ten tekst jest za długi.",
};

/** Messages after "Rezerwuj". `account_exists`, `timeout` and `server` are the old site's. */
export const submitErrors: Record<PlaceReservationError, string> = {
  invalid: "Popraw zaznaczone pola formularza.",
  search: "Ten termin odbioru jest już niedostępny. Zmień godzinę odbioru u góry strony.",
  choices:
    "Wybrane auto, ochrona lub dodatek nie są już dostępne w tym terminie. Wróć do wcześniejszych kroków i sprawdź wybór.",
  price: "Cena zmieniła się od chwili wyceny. Sprawdź nową kwotę i kliknij „Rezerwuj” ponownie.",
  account_exists: "Konto z podanymi danymi istnieje. Zaloguj się, aby kontynuować.",
  timeout: "Brak odpowiedzi serwera. Sprawdź swoją skrzynkę e-mail lub spróbuj ponownie.",
  rate_limited: "Zbyt wiele prób rezerwacji. Spróbuj ponownie za kilkanaście minut.",
  server: "Wystąpił błąd serwera. Spróbuj ponownie.",
};
