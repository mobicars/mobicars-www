import type { Lang } from "./config";

/**
 * Interface texts of the business blocks (`components/blocks/{comparison,lead-form}.tsx`):
 * field labels, hints, errors and states of the quote request form. Headings,
 * leads, consent and the success message come from the CMS.
 */
export type BusinessCopy = {
  comparison: { caption: string; yes: string; no: string; partial: string };
  form: {
    label: string;
    company: string;
    taxId: string;
    taxIdHint: string;
    name: string;
    email: string;
    phone: string;
    contactHint: string;
    fleetSize: string;
    fleetSizes: readonly [string, string, string, string];
    carTypes: string;
    carTypeOptions: { passenger: string; van: string; minibus: string; electric: string };
    term: string;
    terms: { days: string; weeks: string; months: string; unsure: string };
    start: string;
    starts: { asap: string; month: string; later: string };
    location: string;
    locationHint: string;
    message: string;
    messageHint: string;
    optional: string;
    submit: string;
    submitting: string;
    sendAnother: string;
    errors: {
      company: string;
      name: string;
      contact: string;
      email: string;
      phone: string;
      taxId: string;
      consent: string;
      summary: string;
      failed: string;
      notConfigured: string;
    };
  };
};

const pl: BusinessCopy = {
  comparison: { caption: "Porównanie", yes: "tak", no: "nie", partial: "częściowo" },
  form: {
    label: "Zapytanie ofertowe dla firmy",
    company: "Firma",
    taxId: "NIP",
    taxIdHint: "Przyspieszy przygotowanie oferty i faktury.",
    name: "Imię i nazwisko",
    email: "E-mail służbowy",
    phone: "Telefon",
    contactHint: "Podaj e-mail lub telefon – wystarczy jedno.",
    fleetSize: "Ile aut potrzebujesz?",
    fleetSizes: ["1", "2–5", "6–20", "ponad 20"],
    carTypes: "Jakie auta?",
    carTypeOptions: { passenger: "Osobowe", van: "Dostawcze", minibus: "7–9 osób", electric: "Elektryczne" },
    term: "Na jak długo?",
    terms: { days: "Na dni", weeks: "Na tygodnie", months: "Na miesiące", unsure: "Jeszcze nie wiem" },
    start: "Od kiedy?",
    starts: { asap: "Jak najszybciej", month: "W ciągu miesiąca", later: "Później" },
    location: "Miasto odbioru",
    locationHint: "Np. Warszawa, lotnisko Chopina albo adres firmy.",
    message: "Wiadomość",
    messageHint: "Napisz, do czego potrzebujesz aut – dopasujemy ofertę.",
    optional: "opcjonalnie",
    submit: "Wyślij zapytanie",
    submitting: "Wysyłamy…",
    sendAnother: "Wyślij kolejne zapytanie",
    errors: {
      company: "Wpisz nazwę firmy.",
      name: "Wpisz imię i nazwisko.",
      contact: "Podaj e-mail lub telefon, żebyśmy mogli odpowiedzieć.",
      email: "Sprawdź adres e-mail, np. jan@firma.pl.",
      phone: "Wpisz numer z kierunkowym, np. +48 600 100 200.",
      taxId: "NIP ma 10 cyfr. Sprawdź numer albo zostaw pole puste.",
      consent: "Zaznacz zgodę, żebyśmy mogli odpowiedzieć na zapytanie.",
      summary: "Popraw zaznaczone pola.",
      failed: "Nie udało się wysłać zapytania. Twoje dane są w formularzu – spróbuj ponownie albo zadzwoń.",
      notConfigured: "Formularz jest chwilowo niedostępny. Zadzwoń albo napisz do nas – odpowiemy tak samo szybko.",
    },
  },
};

const en: BusinessCopy = {
  comparison: { caption: "Comparison", yes: "yes", no: "no", partial: "partly" },
  form: {
    label: "Business quote request",
    company: "Company",
    taxId: "Tax ID (NIP)",
    taxIdHint: "Helps us prepare the offer and invoice faster.",
    name: "Full name",
    email: "Work email",
    phone: "Phone",
    contactHint: "Give us an email or a phone number – one is enough.",
    fleetSize: "How many cars?",
    fleetSizes: ["1", "2–5", "6–20", "over 20"],
    carTypes: "Which cars?",
    carTypeOptions: { passenger: "Passenger", van: "Vans", minibus: "7–9 seats", electric: "Electric" },
    term: "For how long?",
    terms: { days: "Days", weeks: "Weeks", months: "Months", unsure: "Not sure yet" },
    start: "From when?",
    starts: { asap: "As soon as possible", month: "Within a month", later: "Later" },
    location: "Pick-up city",
    locationHint: "E.g. Warsaw, Chopin Airport or your office address.",
    message: "Message",
    messageHint: "Tell us what you need the cars for – we will tailor the offer.",
    optional: "optional",
    submit: "Send request",
    submitting: "Sending…",
    sendAnother: "Send another request",
    errors: {
      company: "Enter the company name.",
      name: "Enter your full name.",
      contact: "Give us an email or a phone number so we can reply.",
      email: "Check the email address, e.g. john@company.com.",
      phone: "Enter the number with the country code, e.g. +48 600 100 200.",
      taxId: "A Polish tax ID has 10 digits. Check it or leave the field empty.",
      consent: "Tick the consent so we can reply to your request.",
      summary: "Please correct the marked fields.",
      failed: "We could not send the request. Your details are still in the form – try again or call us.",
      notConfigured: "The form is unavailable right now. Call or email us – we will reply just as fast.",
    },
  },
};

const de: BusinessCopy = {
  comparison: { caption: "Vergleich", yes: "ja", no: "nein", partial: "teilweise" },
  form: {
    label: "Angebotsanfrage für Unternehmen",
    company: "Firma",
    taxId: "NIP – polnische Steuernummer",
    taxIdHint: "Damit erstellen wir Angebot und Rechnung schneller.",
    name: "Vor- und Nachname",
    email: "Geschäftliche E-Mail",
    phone: "Telefon",
    contactHint: "E-Mail oder Telefon – eines genügt.",
    fleetSize: "Wie viele Fahrzeuge?",
    fleetSizes: ["1", "2–5", "6–20", "mehr als 20"],
    carTypes: "Welche Fahrzeuge?",
    carTypeOptions: { passenger: "Pkw", van: "Transporter", minibus: "7–9 Sitzplätze", electric: "Elektro" },
    term: "Für wie lange?",
    terms: { days: "Tageweise", weeks: "Wochenweise", months: "Monatsweise", unsure: "Weiß ich noch nicht" },
    start: "Ab wann?",
    starts: { asap: "So bald wie möglich", month: "Innerhalb eines Monats", later: "Später" },
    location: "Abholort",
    locationHint: "Z. B. Warschau, Flughafen Chopin oder Ihre Firmenadresse.",
    message: "Nachricht",
    messageHint: "Wofür brauchen Sie die Fahrzeuge? Wir passen das Angebot an.",
    optional: "optional",
    submit: "Anfrage senden",
    submitting: "Wird gesendet…",
    sendAnother: "Weitere Anfrage senden",
    errors: {
      company: "Geben Sie den Firmennamen ein.",
      name: "Geben Sie Ihren Namen ein.",
      contact: "Geben Sie E-Mail oder Telefon an, damit wir antworten können.",
      email: "Prüfen Sie die E-Mail-Adresse, z. B. max@firma.de.",
      phone: "Geben Sie die Nummer mit Ländervorwahl ein, z. B. +49 151 23456789.",
      taxId: "Eine polnische NIP hat 10 Ziffern. Prüfen Sie sie oder lassen Sie das Feld leer.",
      consent: "Setzen Sie das Häkchen bei der Einwilligung, damit wir auf Ihre Anfrage antworten können.",
      summary: "Bitte korrigieren Sie die markierten Felder.",
      failed: "Die Anfrage konnte nicht gesendet werden. Ihre Angaben sind noch im Formular – versuchen Sie es erneut oder rufen Sie an.",
      notConfigured: "Das Formular ist gerade nicht verfügbar. Rufen Sie an oder schreiben Sie uns – wir antworten genauso schnell.",
    },
  },
};

const uk: BusinessCopy = {
  comparison: { caption: "Порівняння", yes: "так", no: "ні", partial: "частково" },
  form: {
    label: "Запит комерційної пропозиції для компанії",
    company: "Компанія",
    taxId: "NIP — польський податковий номер",
    taxIdHint: "Допоможе швидше підготувати пропозицію та фактуру.",
    name: "Ім’я та прізвище",
    email: "Робоча електронна пошта",
    phone: "Телефон",
    contactHint: "Вкажіть електронну пошту або телефон — достатньо одного.",
    fleetSize: "Скільки авто потрібно?",
    fleetSizes: ["1", "2–5", "6–20", "понад 20"],
    carTypes: "Які авто?",
    carTypeOptions: { passenger: "Легкові", van: "Фургони", minibus: "7–9 місць", electric: "Електричні" },
    term: "На який термін?",
    terms: { days: "На дні", weeks: "На тижні", months: "На місяці", unsure: "Ще не знаю" },
    start: "З якої дати?",
    starts: { asap: "Якнайшвидше", month: "Протягом місяця", later: "Пізніше" },
    location: "Місто отримання авто",
    locationHint: "Напр. Варшава, аеропорт Шопена або адреса компанії.",
    message: "Повідомлення",
    messageHint: "Напишіть, для чого вам потрібні авто, і ми підберемо пропозицію.",
    optional: "необов’язково",
    submit: "Надіслати запит",
    submitting: "Надсилаємо…",
    sendAnother: "Надіслати ще один запит",
    errors: {
      company: "Вкажіть назву компанії.",
      name: "Вкажіть ім’я та прізвище.",
      contact: "Вкажіть електронну пошту або телефон, щоб ми могли відповісти.",
      email: "Перевірте адресу електронної пошти, напр. ivan@firma.pl.",
      phone: "Вкажіть номер з кодом країни, напр. +48 600 100 200.",
      taxId: "Польський NIP має 10 цифр. Перевірте його або залиште поле порожнім.",
      consent: "Позначте згоду, щоб ми могли відповісти на запит.",
      summary: "Виправте позначені поля.",
      failed: "Не вдалося надіслати запит. Ваші дані залишилися у формі — спробуйте ще раз або зателефонуйте.",
      notConfigured: "Форма тимчасово недоступна. Зателефонуйте або напишіть нам — ми відповімо так само швидко.",
    },
  },
};

const all: Record<Lang, BusinessCopy> = { pl, en, de, uk };

export function businessCopy(lang: Lang): BusinessCopy {
  return all[lang];
}
