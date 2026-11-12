import type { Lang } from "./config";

export type AccountCopy = {
  login: {
    title: string;
    intro: string;
    email: string;
    password: string;
    showPassword: string;
    hidePassword: string;
    submit: string;
    submitting: string;
    errors: {
      invalid: string;
      reset_pending: string;
      banned: string;
      rate_limited: string;
      unavailable: string;
    };
  };
  nav: {
    label: string;
    overview: string;
    reservations: string;
    details: string;
    security: string;
    newReservation: string;
    backHome: string;
    logout: string;
  };
  overview: {
    title: string;
    intro: string;
    greeting: (name: string | null) => string;
    details: string;
    editDetails: string;
    clientNumber: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    lastLogin: string;
    nextReservation: string;
    currentReservation: string;
    noUpcoming: string;
    bookCar: string;
    toPay: string;
    nothingToPay: string;
    toPayCount: (count: number) => string;
    allReservations: string;
  };
  reservations: {
    title: string;
    intro: string;
    upcoming: string;
    history: string;
    emptyUpcoming: string;
    emptyHistory: string;
    details: string;
    back: string;
    number: string;
    createdAt: string;
    pickUp: string;
    return: string;
    pickupCode: string;
    car: string;
    carFallback: string;
    longTerm: string;
    payment: string;
    amountDue: string;
    totalPaid: string;
    remainingToPay: string;
    deposit: string;
    paid: string;
    unpaid: string;
    mileage: string;
    mileageUnlimited: string;
    mileageLimit: (daily: string | null, total: string | null) => string;
    extraKm: string;
    extras: string;
    comment: string;
    manager: string;
    notFoundTitle: string;
    notFoundText: string;
  };
  loading: string;
};

const accountByLang = {
  pl: {
    login: {
      title: "Zaloguj się",
      intro: "Panel klienta MobiCars: rezerwacje, płatności i dane konta.",
      email: "E-mail",
      password: "Hasło",
      showPassword: "Pokaż hasło",
      hidePassword: "Ukryj hasło",
      submit: "Zaloguj się",
      submitting: "Logowanie…",
      errors: {
        invalid: "Nieprawidłowy e-mail lub hasło.",
        reset_pending: "Dla tego konta rozpoczęto odzyskiwanie hasła. Dokończ je kodem z e-maila.",
        banned: "Logowanie do tego konta jest zablokowane. Skontaktuj się z biurem MobiCars.",
        rate_limited: "Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut.",
        unavailable: "Logowanie jest chwilowo niedostępne. Spróbuj ponownie za chwilę.",
      },
    },
    nav: {
      label: "Panel klienta",
      overview: "Przegląd",
      reservations: "Rezerwacje",
      details: "Moje dane",
      security: "Bezpieczeństwo",
      newReservation: "Nowa rezerwacja",
      backHome: "Powrót na stronę główną",
      logout: "Wyloguj się",
    },
    overview: {
      title: "Moje konto",
      intro: "Twoje rezerwacje, płatności i dane w jednym miejscu.",
      greeting: (name) => (name ? `Witaj, ${name}` : "Witaj"),
      details: "Twoje dane",
      editDetails: "Zmień dane",
      clientNumber: "Numer klienta",
      name: "Imię i nazwisko",
      company: "Firma",
      email: "E-mail",
      phone: "Telefon",
      lastLogin: "Ostatnie logowanie",
      nextReservation: "Najbliższa rezerwacja",
      currentReservation: "Trwający wynajem",
      noUpcoming: "Nie masz zaplanowanych rezerwacji.",
      bookCar: "Zarezerwuj auto",
      toPay: "Do zapłaty",
      nothingToPay: "Wszystko opłacone.",
      toPayCount: (count) =>
        count === 1 ? "1 rezerwacja czeka na płatność" : `Rezerwacje czekające na płatność: ${count}`,
      allReservations: "Wszystkie rezerwacje",
    },
    reservations: {
      title: "Rezerwacje",
      intro: "Nadchodzące wynajmy i historia Twoich rezerwacji.",
      upcoming: "Nadchodzące i trwające",
      history: "Historia",
      emptyUpcoming: "Brak nadchodzących rezerwacji.",
      emptyHistory: "Brak wcześniejszych rezerwacji.",
      details: "Szczegóły",
      back: "Wszystkie rezerwacje",
      number: "Numer rezerwacji",
      createdAt: "Utworzona",
      pickUp: "Odbiór",
      return: "Zwrot",
      pickupCode: "Kod odbioru",
      car: "Samochód",
      carFallback: "Samochód z floty MobiCars",
      longTerm: "Wynajem długoterminowy",
      payment: "Płatność",
      amountDue: "Należność",
      totalPaid: "Wpłacono",
      remainingToPay: "Pozostało do zapłaty",
      deposit: "Kaucja",
      paid: "Opłacona",
      unpaid: "Do zapłaty",
      mileage: "Limit kilometrów",
      mileageUnlimited: "Bez limitu kilometrów",
      mileageLimit: (daily, total) =>
        [daily ? `${daily} km / dobę` : null, total ? `łącznie ${total} km` : null]
          .filter(Boolean)
          .join(", "),
      extraKm: "Każdy dodatkowy kilometr",
      extras: "Dodatki i akcesoria",
      comment: "Twój komentarz",
      manager: "Twój opiekun",
      notFoundTitle: "Nie znaleziono rezerwacji",
      notFoundText: "Ta rezerwacja nie istnieje albo nie należy do Twojego konta.",
    },
    loading: "Wczytywanie…",
  },
  en: {
    login: {
      title: "Sign in",
      intro: "MobiCars customer panel: bookings, payments and account details.",
      email: "Email",
      password: "Password",
      showPassword: "Show password",
      hidePassword: "Hide password",
      submit: "Sign in",
      submitting: "Signing in…",
      errors: {
        invalid: "Incorrect email or password.",
        reset_pending: "A password reset was started for this account. Finish it with the code from the email.",
        banned: "Sign-in to this account is blocked. Please contact the MobiCars office.",
        rate_limited: "Too many sign-in attempts. Try again in 15 minutes.",
        unavailable: "Sign-in is temporarily unavailable. Please try again shortly.",
      },
    },
    nav: {
      label: "Customer panel",
      overview: "Overview",
      reservations: "Bookings",
      details: "My details",
      security: "Security",
      newReservation: "New booking",
      backHome: "Back to the home page",
      logout: "Sign out",
    },
    overview: {
      title: "My account",
      intro: "Your bookings, payments and details in one place.",
      greeting: (name) => (name ? `Hello, ${name}` : "Hello"),
      details: "Your details",
      editDetails: "Edit details",
      clientNumber: "Customer number",
      name: "Name",
      company: "Company",
      email: "Email",
      phone: "Phone",
      lastLogin: "Last sign-in",
      nextReservation: "Next booking",
      currentReservation: "Current rental",
      noUpcoming: "You have no upcoming bookings.",
      bookCar: "Book a car",
      toPay: "To pay",
      nothingToPay: "Everything is paid.",
      toPayCount: (count) =>
        count === 1 ? "1 booking awaits payment" : `${count} bookings await payment`,
      allReservations: "All bookings",
    },
    reservations: {
      title: "Bookings",
      intro: "Upcoming rentals and your booking history.",
      upcoming: "Upcoming and current",
      history: "History",
      emptyUpcoming: "No upcoming bookings.",
      emptyHistory: "No past bookings.",
      details: "Details",
      back: "All bookings",
      number: "Booking number",
      createdAt: "Created",
      pickUp: "Pick-up",
      return: "Return",
      pickupCode: "Pick-up code",
      car: "Car",
      carFallback: "A car from the MobiCars fleet",
      longTerm: "Long-term rental",
      payment: "Payment",
      amountDue: "Amount due",
      totalPaid: "Paid",
      remainingToPay: "Left to pay",
      deposit: "Deposit",
      paid: "Paid",
      unpaid: "To pay",
      mileage: "Mileage limit",
      mileageUnlimited: "Unlimited mileage",
      mileageLimit: (daily, total) =>
        [daily ? `${daily} km / day` : null, total ? `${total} km in total` : null]
          .filter(Boolean)
          .join(", "),
      extraKm: "Each extra kilometre",
      extras: "Extras and accessories",
      comment: "Your comment",
      manager: "Your account manager",
      notFoundTitle: "Booking not found",
      notFoundText: "This booking does not exist or does not belong to your account.",
    },
    loading: "Loading…",
  },
} satisfies Record<"pl" | "en", AccountCopy>;

/** German and Ukrainian show the English text until they are translated. */
export const accountCopy: Record<Lang, AccountCopy> = { ...accountByLang, de: accountByLang.en, uk: accountByLang.en };
