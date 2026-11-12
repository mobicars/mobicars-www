"use client";

import { startTransition, useActionState, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Banknote, Car, LogIn, MapPin, Package, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";

import { PasswordField, TextField } from "@/components/auth/fields";
import { PhoneField } from "@/components/auth/phone-field";
import { customerCopy as t, fieldErrors, submitErrors } from "@/components/reservation/customer-copy";
import { formatMoney } from "@/components/reservation/offer-parts";
import {
  MobileSummaryBar,
  PriceLines,
  SummaryPanel,
  quotePrices,
  type SummaryAction,
  type TripSummary,
} from "@/components/reservation/summary";
import { currentHrefWith } from "@/components/reservation/url";
import { useQuote } from "@/components/reservation/use-quote";
import type { Lang } from "@/i18n/config";
import { loginPath } from "@/lib/auth/paths";
import { placeReservation, type PlaceReservationState } from "@/lib/reservation/actions";
import {
  CONSENTS,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  customerFromForm,
  validateCustomer,
  type ConsentName,
  type CustomerError,
  type CustomerField,
  type CustomerType,
} from "@/lib/reservation/customer";
import type { OfferCard } from "@/lib/reservation/offers";
import { quoteQuery, type QuoteAccessory, type QuoteView } from "@/lib/reservation/quote";
import { QUERY_KEYS } from "@/lib/reservation/search";

/** The signed-in client's data, read on the server from their account. */
export type AccountPrefill = {
  type: CustomerType;
  firstName: string;
  lastName: string;
  companyName: string;
  vatNumber: string;
  email: string;
  phone: string;
  transferConsent: boolean;
};

export type ChosenExtra = { id: number; name: string; quantity: number };

const FORM_ID = "customer-form";

/**
 * Last step: the whole reservation to check, then "Twoje dane" and "Rezerwuj".
 * A guest books as a new client and sets a password, as on the old site; a
 * signed-in client books as their account (type, name and email fixed, phone
 * editable). The form is checked here first and again by `placeReservation`,
 * which also re-quotes and refuses a total other than the one shown.
 */
export function CustomerStep({
  lang,
  searchQuery,
  car,
  protection,
  extras,
  addonIds,
  accessories,
  selectionQuery,
  initialQuote,
  trip,
  airport,
  account,
}: {
  lang: Lang;
  searchQuery: string;
  car: OfferCard;
  protection: { id: number; name: string } | null;
  extras: ChosenExtra[];
  /** Protection and extras, as quoted. */
  addonIds: number[];
  accessories: QuoteAccessory[];
  /** `zone`, `extras` and `acc` as they stand in the URL. */
  selectionQuery: { zone: string | null; extras: string | null; acc: string | null };
  initialQuote: { request: string; quote: QuoteView | null };
  trip: TripSummary;
  /** Pickup at an airport: asks for the flight number. */
  airport: boolean;
  account: AccountPrefill | null;
}) {
  const router = useRouter();
  const quote = useQuote(quoteQuery(lang, searchQuery, car.id, addonIds, accessories), initialQuote);
  const [errors, setErrors] = useState<Partial<Record<CustomerField, CustomerError>>>({});
  const [state, dispatch, pending] = useActionState<PlaceReservationState, FormData>(async (previous, data) => {
    const result = await placeReservation(previous, data);
    if (result) {
      toast.error(submitErrors[result.error]);
      setErrors(result.fields ?? {});
      if (result.error === "price") {
        // The panel asks for the new price; the customer confirms it with another click.
        quote.retry();
      }
    }
    return result;
  }, null);
  const [type, setType] = useState<CustomerType>(account?.type ?? "individual");
  const [invoice, setInvoice] = useState(false);
  const [consents, setConsents] = useState<Record<ConsentName, boolean>>({
    regulations: false,
    standardTerms: false,
    privacyPolicy: false,
    transfer: account?.transferConsent ?? false,
  });
  const signedIn = account !== null;


  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const found = validateCustomer(customerFromForm(data, account?.type ?? null), { signedIn, airport });
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error(submitErrors.invalid);
      // After the fields re-render with `aria-invalid`.
      window.setTimeout(() => form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus(), 0);
      return;
    }
    // Dispatched by hand, not through `action=`, so React does not reset the fields.
    startTransition(() => dispatch(data));
  }

  /** Typing in a flagged field clears its message. */
  function clearError(name: string) {
    const field = (name.startsWith("consent-") ? "consents" : name) as CustomerField;
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  }

  const ready = quote.quote !== null && !quote.loading && !quote.failed;
  const action: SummaryAction = {
    label: pending ? "Rezerwujemy…" : t.submit,
    form: ready ? FORM_ID : undefined,
    busy: pending,
    hint: ready ? undefined : "Czekamy na aktualną cenę.",
  };
  const prices = quotePrices(quote);
  const goTo = (step: string) => router.push(currentHrefWith({ [QUERY_KEYS.step]: step }), { scroll: false });
  const backToCars = () =>
    router.push(
      currentHrefWith({
        [QUERY_KEYS.step]: null,
        [QUERY_KEYS.protection]: null,
        [QUERY_KEYS.zone]: null,
        [QUERY_KEYS.extras]: null,
        [QUERY_KEYS.accessories]: null,
      }), { scroll: false }
    );
  const error = (field: CustomerField, hint?: ReactNode) =>
    errors[field] ? <span className="text-red-700">{fieldErrors[errors[field]]}</span> : hint;
  const required = CONSENTS.filter((consent) => consent.required);
  const allRequired = required.every(({ name }) => consents[name]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="@container flex min-w-0 flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-semibold text-blue-dark">Podsumowanie rezerwacji</h2>
          <button
            type="button"
            onClick={() => goTo("extras")}
            className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-blue-medium underline-offset-2 hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Wróć do dodatków
          </button>
        </div>

        <Review
          trip={trip}
          car={car}
          protection={protection}
          extras={extras}
          quote={quote.quote}
          onChangeTrip={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          onChangeCar={backToCars}
          onChangeProtection={() => goTo("protection")}
          onChangeExtras={() => goTo("extras")}
        >
          {/* Below `lg` the side panel is hidden: its prices go here. */}
          <div className="lg:hidden">
            <PriceLines prices={prices} />
          </div>
        </Review>

        <form
          id={FORM_ID}
          noValidate
          onSubmit={submit}
          onChange={(event) => clearError((event.target as unknown as HTMLInputElement).name ?? "")}
          aria-labelledby="customer-title"
          className="flex flex-col gap-6 rounded-2xl bg-white p-5 shadow-sm @xl:p-6"
        >
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="search" value={searchQuery} />
          <input type="hidden" name={QUERY_KEYS.offer} value={car.id} />
          {protection ? <input type="hidden" name={QUERY_KEYS.protection} value={protection.id} /> : null}
          {selectionQuery.zone ? <input type="hidden" name={QUERY_KEYS.zone} value={selectionQuery.zone} /> : null}
          {selectionQuery.extras ? <input type="hidden" name={QUERY_KEYS.extras} value={selectionQuery.extras} /> : null}
          {selectionQuery.acc ? <input type="hidden" name={QUERY_KEYS.accessories} value={selectionQuery.acc} /> : null}
          <input type="hidden" name="total" value={quote.quote?.total ?? ""} />

          <div>
            <h2 id="customer-title" className="text-2xl font-semibold text-blue-dark">
              {t.title}
            </h2>
            {signedIn ? null : <p className="mt-1 text-sm text-muted-dark">{t.description}</p>}
          </div>

          {signedIn ? (
            <p className="rounded-xl bg-blue-light px-4 py-3 text-sm text-blue-dark">
              Rezerwujesz jako <span className="font-semibold">{account.email}</span>. Rodzaj klienta, imię, nazwisko i
              e-mail pochodzą z Twojego konta; numer telefonu możesz zmienić dla tej rezerwacji.
            </p>
          ) : (
            <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-blue-medium/20 bg-blue-light/60 px-4 py-3 @xl:flex-row @xl:items-center">
              <p className="text-sm text-blue-dark">
                <span className="font-semibold">Mam już mobikonto.</span> Zaloguj się, a dane uzupełnimy za Ciebie;
                wybrane auto i dodatki zostaną.
              </p>
              <button
                type="button"
                onClick={() => router.push(loginPath(lang, window.location.pathname + window.location.search))}
                className="flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-blue-medium px-4 text-sm font-bold text-white transition-colors duration-200 ease-out hover:bg-blue-dark motion-reduce:transition-none"
              >
                <LogIn className="size-4" aria-hidden />
                Zaloguj się
              </button>
            </div>
          )}

          <fieldset className="grid grid-cols-2 gap-2" disabled={signedIn}>
            <legend className="sr-only">Rodzaj klienta</legend>
            {(["individual", "company"] as const).map((option) => (
              <label
                key={option}
                className={`flex h-11 items-center justify-center rounded-lg border text-sm font-semibold transition-colors has-focus-visible:ring-2 has-focus-visible:ring-blue-light ${
                  type === option
                    ? "border-blue-medium bg-blue-light text-blue-dark"
                    : signedIn
                      ? "border-muted text-muted-dark opacity-50"
                      : "cursor-pointer border-muted text-muted-dark hover:text-blue-dark"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={option}
                  checked={type === option}
                  onChange={() => setType(option)}
                  className="sr-only"
                />
                {t[option]}
              </label>
            ))}
          </fieldset>

          {type === "individual" ? (
            <div className="grid gap-4 @xl:grid-cols-2">
              <TextField
                label={`${t.firstName} *`}
                name="firstName"
                autoComplete="given-name"
                maxLength={100}
                defaultValue={account?.firstName}
                disabled={signedIn}
                invalid={!!errors.firstName}
                hint={error("firstName")}
              />
              <TextField
                label={`${t.lastName} *`}
                name="lastName"
                autoComplete="family-name"
                maxLength={100}
                defaultValue={account?.lastName}
                disabled={signedIn}
                invalid={!!errors.lastName}
                hint={error("lastName")}
              />
            </div>
          ) : (
            <div className="grid gap-4 @xl:grid-cols-2">
              <TextField
                label={`${t.companyName} *`}
                name="companyName"
                autoComplete="organization"
                maxLength={200}
                defaultValue={account?.companyName}
                disabled={signedIn}
                invalid={!!errors.companyName}
                hint={error("companyName")}
              />
              <TextField
                label={`${t.vatNumber} *`}
                name="vatNumber"
                inputMode="numeric"
                maxLength={32}
                defaultValue={account?.vatNumber}
                disabled={signedIn}
                invalid={!!errors.vatNumber}
                hint={error("vatNumber")}
              />
              <TextField
                label={`${t.contactPerson} *`}
                name="contactPerson"
                autoComplete="name"
                maxLength={200}
                className="@xl:col-span-2"
                invalid={!!errors.contactPerson}
                hint={error("contactPerson", t.contactPersonHint)}
              />
            </div>
          )}

          <div className="grid gap-4 @xl:grid-cols-2">
            <TextField
              label={`${t.email} *`}
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              defaultValue={account?.email}
              disabled={signedIn}
              invalid={!!errors.email}
              hint={error("email")}
            />
            <div className="flex flex-col gap-1.5">
              <PhoneField
                lang={lang}
                label={`${t.phone} *`}
                name="phone"
                defaultValue={account?.phone || undefined}
                required
                invalid={!!errors.phone}
              />
              {errors.phone ? <span className="text-xs text-red-700">{fieldErrors[errors.phone]}</span> : null}
            </div>
          </div>

          {signedIn ? null : (
            <div className="flex flex-col gap-2">
              <div className="grid gap-4 @xl:grid-cols-2">
                <PasswordField
                  label={`${t.password} *`}
                  name="password"
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                  maxLength={MAX_PASSWORD_LENGTH}
                  invalid={!!errors.password}
                  hint={error("password", `Co najmniej ${MIN_PASSWORD_LENGTH} znaków.`)}
                  showLabel="Pokaż hasło"
                  hideLabel="Ukryj hasło"
                />
                <PasswordField
                  label={`${t.confirm} *`}
                  name="confirm"
                  autoComplete="new-password"
                  maxLength={MAX_PASSWORD_LENGTH}
                  invalid={!!errors.confirm}
                  hint={error("confirm")}
                  showLabel="Pokaż hasło"
                  hideLabel="Ukryj hasło"
                />
              </div>
              <p className="text-xs text-muted-dark">{t.passwordHint}</p>
            </div>
          )}

          {type === "individual" ? (
            <div className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-blue-dark">
                <input
                  type="checkbox"
                  name="invoice"
                  checked={invoice}
                  onChange={(event) => setInvoice(event.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-green-medium"
                />
                <span>
                  <span className="font-semibold">{t.invoice}</span>
                  <span className="block text-xs text-muted-dark">{t.invoiceHint}</span>
                </span>
              </label>
              {invoice ? (
                <TextField
                  label={`${t.vatNumber} *`}
                  name="vatNumber"
                  inputMode="numeric"
                  maxLength={32}
                  defaultValue={account?.vatNumber}
                  className="@xl:max-w-[calc(50%-0.5rem)]"
                  invalid={!!errors.vatNumber}
                  hint={error("vatNumber")}
                />
              ) : null}
            </div>
          ) : null}

          {airport ? (
            <TextField
              label={t.flightNumber}
              name="flightNumber"
              maxLength={20}
              autoCapitalize="characters"
              placeholder="np. LO 3912"
              className="@xl:max-w-[calc(50%-0.5rem)]"
              invalid={!!errors.flightNumber}
              hint={error(
                "flightNumber",
                "Opcjonalnie. Odbierasz auto na lotnisku: numer lotu pomoże nam przygotować wydanie, gdyby samolot się spóźnił.",
              )}
            />
          ) : null}

          <label className="flex flex-col gap-1.5 text-sm font-medium text-blue-dark">
            {t.comment}
            <textarea
              name="comment"
              rows={3}
              maxLength={2000}
              aria-invalid={errors.comment ? true : undefined}
              className="w-full rounded-lg border border-muted bg-white px-4 py-3 font-normal text-ink outline-none transition-colors focus:border-blue-medium focus:ring-2 focus:ring-blue-light aria-invalid:border-red-500"
            />
            {errors.comment ? <span className="text-xs text-red-700">{fieldErrors[errors.comment]}</span> : null}
          </label>

          <fieldset className="flex flex-col gap-3 border-t border-muted-light pt-5">
            <legend className="sr-only">Zgody</legend>
            <p className="text-sm text-blue-dark/80">{t.documents}</p>
            <label className="flex cursor-pointer items-start gap-3 text-sm font-semibold text-blue-dark">
              <input
                type="checkbox"
                checked={allRequired}
                onChange={(event) => {
                  const on = event.target.checked;
                  setConsents((current) => ({
                    ...current,
                    ...Object.fromEntries(required.map(({ name }) => [name, on])),
                  }));
                  clearError("consents");
                }}
                className="mt-0.5 size-4 shrink-0 accent-green-medium"
              />
              {t.checkAll}
            </label>
            {CONSENTS.map(({ name, required: needed }) => (
              <label
                key={name}
                className={`flex cursor-pointer items-start gap-3 pl-7 text-sm ${
                  errors.consents && needed && !consents[name] ? "text-red-700" : "text-blue-dark/80"
                }`}
              >
                <input
                  type="checkbox"
                  name={`consent-${name}`}
                  checked={consents[name]}
                  onChange={(event) => setConsents((current) => ({ ...current, [name]: event.target.checked }))}
                  aria-invalid={errors.consents && needed && !consents[name] ? true : undefined}
                  className="mt-0.5 size-4 shrink-0 accent-green-medium"
                />
                <span>
                  {needed ? <span aria-hidden>* </span> : null}
                  {t.consents[name]}
                  {needed ? <span className="sr-only"> (wymagane)</span> : null}
                </span>
              </label>
            ))}
            {errors.consents ? <p className="text-sm text-red-700">{fieldErrors.consents}</p> : null}
          </fieldset>

          <div className="flex flex-col gap-3 border-t border-muted-light pt-5">
            <p className="flex items-start gap-2 text-xs text-muted-dark">
              <Wallet className="size-4 shrink-0 text-blue-medium" strokeWidth={1.75} aria-hidden />
              {t.success.text2} {t.success.text3}
            </p>
            {state ? (
              <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitErrors[state.error]}
                {state.error === "account_exists" ? (
                  <>
                    {" "}
                    <button
                      type="button"
                      onClick={() => router.push(loginPath(lang, window.location.pathname + window.location.search))}
                      className="cursor-pointer font-semibold underline"
                    >
                      Zaloguj się
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
            <button
              type="submit"
              disabled={!ready || pending}
              className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-medium px-5 text-base font-bold text-white transition-colors duration-200 ease-out hover:bg-green-dark disabled:cursor-default disabled:bg-muted disabled:text-muted-dark motion-reduce:transition-none @xl:ml-auto @xl:w-72"
            >
              {action.label}
              {ready && quote.quote ? <span className="font-semibold">· {formatMoney(quote.quote.total)}</span> : null}
            </button>
          </div>
        </form>
      </div>
      <SummaryPanel trip={trip} car={car} prices={prices} action={action} onChangeCar={backToCars} />
      <MobileSummaryBar car={car} prices={prices} action={action} />
    </div>
  );
}

/** Everything chosen so far, each part with "Zmień" back to its step. */
function Review({
  trip,
  car,
  protection,
  extras,
  quote,
  onChangeTrip,
  onChangeCar,
  onChangeProtection,
  onChangeExtras,
  children,
}: {
  trip: TripSummary;
  car: OfferCard;
  protection: { name: string } | null;
  extras: ChosenExtra[];
  quote: QuoteView | null;
  onChangeTrip: () => void;
  onChangeCar: () => void;
  onChangeProtection: () => void;
  onChangeExtras: () => void;
  children: ReactNode;
}) {
  return (
    <section aria-label="Twój wybór" className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm @xl:p-6">
      <ReviewRow icon={MapPin} title="Odbiór i zwrot" onChange={onChangeTrip}>
        <dl className="grid gap-3 @xl:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-dark">Odbiór</dt>
            <dd className="font-semibold text-blue-dark">{trip.start}</dd>
            <dd className="text-sm text-blue-dark/80">{trip.pickup}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-dark">Zwrot</dt>
            <dd className="font-semibold text-blue-dark">{trip.end}</dd>
            <dd className="text-sm text-blue-dark/80">{trip.dropoff ?? trip.pickup}</dd>
          </div>
        </dl>
      </ReviewRow>
      <ReviewRow icon={Car} title="Samochód" onChange={onChangeCar}>
        <div className="flex items-center gap-4">
          {car.image ? (
            <span className="relative block h-16 w-28 shrink-0">
              <Image src={car.image.src} alt="" fill sizes="112px" className="object-contain" />
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="font-semibold text-blue-dark">{car.name}</p>
            <p className="text-xs text-muted-dark">lub podobny · {car.segment}</p>
          </div>
        </div>
      </ReviewRow>
      <ReviewRow icon={ShieldCheck} title="Ochrona" onChange={onChangeProtection}>
        <p className="text-sm font-semibold text-blue-dark">{protection?.name ?? "Bez pakietu ochrony"}</p>
      </ReviewRow>
      <ReviewRow icon={Package} title="Dodatki" onChange={onChangeExtras}>
        {extras.length > 0 ? (
          <ul className="flex flex-col gap-1 text-sm text-blue-dark">
            {extras.map((extra) => (
              <li key={extra.id}>
                {extra.name}
                {extra.quantity > 1 ? <span className="text-muted-dark"> × {extra.quantity}</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-dark">Bez dodatków</p>
        )}
      </ReviewRow>
      {children}
      {quote?.deposit ? (
        <p className="flex items-center gap-2 text-xs text-muted-dark">
          <Banknote className="size-4 text-blue-medium" strokeWidth={1.75} aria-hidden />
          Kaucja: <span className="font-semibold text-blue-dark">{formatMoney(quote.deposit)}</span>
        </p>
      ) : null}
    </section>
  );
}

function ReviewRow({
  icon: Icon,
  title,
  onChange,
  children,
}: {
  icon: typeof MapPin;
  title: string;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3 border-b border-muted-light pb-4 last-of-type:border-0">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-light text-blue-medium">
        <Icon className="size-4.5" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <h3 className="text-xs font-bold tracking-wide text-muted-dark uppercase">{title}</h3>
          <button
            type="button"
            onClick={onChange}
            aria-label={`Zmień: ${title}`}
            className="shrink-0 cursor-pointer rounded-full border border-blue-dark/20 px-3 py-1 text-xs font-semibold text-blue-dark transition-colors duration-200 ease-out hover:border-blue-medium hover:text-blue-medium motion-reduce:transition-none"
          >
            Zmień
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
