import { defaultLang, isLang, type Lang } from "./config";

/**
 * Texts of the site's own screens: the skip link, the error page and the
 * "page not found" page. Kept apart from `messages/*.json` because the root
 * error page renders without the layout and its providers.
 */
export type SystemCopy = {
  skipToContent: string;
  error: { title: string; text: string; retry: string; home: string; call: string };
  notFound: {
    title: string;
    /** The browser tab and search result title. */
    metaTitle: string;
    text: string;
    home: string;
    fleet: string;
    shortcuts: string;
    reservation: string;
    contact: string;
    /** The contact page's path below the language (CMS slug). */
    contactPath: string;
    call: string;
  };
};

const all: Record<Lang, SystemCopy> = {
  pl: {
    skipToContent: "Przejdź do treści",
    error: {
      title: "Coś poszło nie tak",
      text: "Strona chwilowo się nie wczytała. Spróbuj ponownie za moment albo zadzwoń – zarezerwujemy auto przez telefon.",
      retry: "Spróbuj ponownie",
      home: "Strona główna",
      call: "Zadzwoń",
    },
    notFound: {
      title: "Nie ma takiej strony",
      text: "Adres mógł się zmienić albo strona została usunięta. Wróć na stronę główną albo zobacz naszą flotę.",
      home: "Strona główna",
      fleet: "Zobacz flotę",
      metaTitle: "Nie znaleziono strony | MobiCars",
      shortcuts: "Może szukasz",
      reservation: "Rezerwacja",
      contact: "Kontakt",
      contactPath: "kontakt",
      call: "Zadzwoń",
    },
  },
  en: {
    skipToContent: "Skip to content",
    error: {
      title: "Something went wrong",
      text: "The page did not load this time. Try again in a moment or call us – we can book a car by phone.",
      retry: "Try again",
      home: "Home page",
      call: "Call us",
    },
    notFound: {
      title: "Page not found",
      text: "The address may have changed or the page was removed. Go to the home page or see our fleet.",
      home: "Home page",
      fleet: "See the fleet",
      metaTitle: "Page not found | MobiCars",
      shortcuts: "You may be looking for",
      reservation: "Booking",
      contact: "Contact",
      contactPath: "contact",
      call: "Call",
    },
  },
  de: {
    skipToContent: "Zum Inhalt springen",
    error: {
      title: "Etwas ist schiefgelaufen",
      text: "Die Seite konnte gerade nicht geladen werden. Versuchen Sie es gleich noch einmal oder rufen Sie uns an – wir buchen Ihr Auto auch telefonisch.",
      retry: "Erneut versuchen",
      home: "Startseite",
      call: "Anrufen",
    },
    notFound: {
      title: "Seite nicht gefunden",
      text: "Die Adresse hat sich vielleicht geändert oder die Seite wurde entfernt. Zur Startseite oder zu unserer Flotte.",
      home: "Startseite",
      fleet: "Zur Flotte",
      metaTitle: "Seite nicht gefunden | MobiCars",
      shortcuts: "Vielleicht suchen Sie",
      reservation: "Buchung",
      contact: "Kontakt",
      contactPath: "kontakt",
      call: "Anrufen",
    },
  },
  uk: {
    skipToContent: "Перейти до основного вмісту",
    error: {
      title: "Щось пішло не так",
      text: "Сторінка зараз не завантажилася. Спробуйте ще раз за мить або зателефонуйте – ми забронюємо авто телефоном.",
      retry: "Спробувати ще раз",
      home: "Головна сторінка",
      call: "Зателефонувати",
    },
    notFound: {
      title: "Сторінку не знайдено",
      text: "Адреса могла змінитися або сторінку видалено. Поверніться на головну або перегляньте наш автопарк.",
      home: "Головна сторінка",
      fleet: "Переглянути автопарк",
      metaTitle: "Сторінку не знайдено | MobiCars",
      shortcuts: "Можливо, ви шукаєте",
      reservation: "Бронювання",
      contact: "Контакти",
      contactPath: "kontakty",
      call: "Зателефонувати",
    },
  },
};

export function systemCopy(lang: Lang): SystemCopy {
  return all[lang];
}

/** The language of a path like `/de/flota`, for screens rendered outside the layout. */
export function langOfPath(pathname: string | null): Lang {
  const head = pathname?.split("/")[1]?.toLowerCase() ?? "";
  return isLang(head) ? head : defaultLang;
}

/** The hotline, for the error screens that cannot read the CMS. Same number as the old site's header. */
export const HOTLINE = { label: "+48 881 328 328", href: "tel:+48881328328" } as const;
