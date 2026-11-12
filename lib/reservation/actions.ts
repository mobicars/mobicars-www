"use server";

import { now } from "@internationalized/date";
import { redirect } from "next/navigation";

import { tripSummary } from "@/components/reservation/trip";
import { reservationDoneHref } from "@/i18n/routes";
import { getAccountDetails, getSession } from "@/lib/auth/dal";
import { formLang } from "@/lib/auth/form";
import { isRateLimited, recordFailure, requestIp, type LimitKey } from "@/lib/auth/rate-limit";
import type { Lang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import {
  createReservation,
  listServicePoints,
  RentCarSoftError,
  verifyPromoCode,
} from "@/lib/rentcarsoft";
import {
  chosenExtras,
  listOfferCards,
  loadBookingChoices,
  normalizePromo,
  quoteFor,
  termOfQuery,
} from "@/lib/reservation/booking";
import { reservationConfig } from "@/lib/reservation/config";
import {
  customerClientKeys,
  customerFromForm,
  validateCustomer,
  type CustomerError,
  type CustomerField,
} from "@/lib/reservation/customer";
import {
  droppedChoices,
  sanitizeSelection,
  selectedAccessories,
  selectedAddonIds,
  selectionFromQuery,
} from "@/lib/reservation/extras";
import { toPickupPlace } from "@/lib/reservation/places";
import type { QuoteView } from "@/lib/reservation/quote";
import { saveReceipt } from "@/lib/reservation/receipt";
import {
  formatQueryDateTime,
  QUERY_KEYS,
  draftFromQuery,
  rentalPeriod,
  toRentCarSoftDateTime,
  validateSearch,
} from "@/lib/reservation/search";

export type PlaceReservationError =
  /** Customer fields: see `fields`. */
  | "invalid"
  /** Pickup now closer than the lead time, or the search no longer valid. */
  | "search"
  /** The car, protection or an extra is no longer offered for this search. */
  | "choices"
  /** The quote differs from the total the customer saw: see `quote`. */
  | "price"
  /** The discount code in the search is not valid (any more) for this pickup. */
  | "promo"
  /** Guest data matches an existing account (`unique: false`). */
  | "account_exists"
  /** No answer in time: the reservation may still have been created. */
  | "timeout"
  | "rate_limited"
  | "server";

export type PlaceReservationState = {
  error: PlaceReservationError;
  fields?: Partial<Record<CustomerField, CustomerError>>;
  /** The new quote after `price`, so the page can show it before the next try. */
  quote?: QuoteView;
} | null;

/** Attempts per address in the limiter's 15-minute window, successful ones included. */
const MAX_ATTEMPTS_PER_IP = 10;

/**
 * "Rezerwuj". Nothing from the browser is taken on trust: the search, the car,
 * the protection and the extras are checked again against RentCarSoft, the
 * price is quoted again and must equal the total the customer saw, and the
 * client comes from the session cookie, never from a form field. Only then is
 * the reservation created, once, without a retry: create is not idempotent.
 *
 * Form fields: `lang`, `search` (the canonical search query), `offer`,
 * `protection`, `extras`, `acc`, `zone`, `total`, and the customer fields of
 * `customerFromForm`. Logs carry error codes only, never form values.
 */
export async function placeReservation(
  _previous: PlaceReservationState,
  form: FormData,
): Promise<PlaceReservationState> {
  const lang = formLang(form);
  const text = (name: string) => {
    const value = form.get(name);
    return typeof value === "string" ? value : null;
  };

  const limit: LimitKey[] = [{ key: `reservation-ip:${await requestIp()}`, max: MAX_ATTEMPTS_PER_IP }];
  if (isRateLimited(limit)) {
    return { error: "rate_limited" };
  }
  // Every attempt counts, also one that fails before create: each one calls RentCarSoft.
  recordFailure(limit);

  let receipt: Parameters<typeof saveReceipt>[0];
  // Only a create that got no answer may still have gone through.
  let creating = false;
  try {
    const [places, account] = await Promise.all([
      listServicePoints({ lang }).then((points) => points.map(toPickupPlace)),
      signedInAccount(lang),
    ]);
    const details = account?.details ?? null;
    const signedIn = details !== null;
    const query = Object.fromEntries(new URLSearchParams(text("search") ?? ""));
    // Strict here: the pickup must still be at least the lead time away.
    const earliestStart = now(reservationConfig.timeZone).add({ minutes: reservationConfig.pickupLeadMinutes });
    const result = validateSearch(draftFromQuery(query, termOfQuery(query)), { places, earliestStart });
    if (!result.ok) {
      return { error: "search" };
    }
    const search = result.search;
    const { start, end } = rentalPeriod(search);
    const pickUpDate = toRentCarSoftDateTime(start);
    const returnDate = toRentCarSoftDateTime(end);
    const dropoff = search.dropoff ?? search.pickup;

    const offers = await listOfferCards(lang, search);
    const car = offers.find((offer) => offer.id === Number(text(QUERY_KEYS.offer)));
    if (!car) {
      return { error: "choices" };
    }

    const { options, extrasView } = await loadBookingChoices(lang, search, car);
    const protection = options.find((option) => option.id === Number(text(QUERY_KEYS.protection))) ?? null;
    if (options.length > 0 && !protection) {
      return { error: "choices" };
    }
    const requested = selectionFromQuery(
      text(QUERY_KEYS.extras),
      text(QUERY_KEYS.accessories),
      text(QUERY_KEYS.zone),
    );
    const selection = sanitizeSelection(requested, extrasView);
    if (droppedChoices(requested, selection) > 0) {
      return { error: "choices" };
    }

    const customer = customerFromForm(form, details ? (details.isCompany ? "company" : "individual") : null);
    const airport = places.find((place) => place.id === search.pickup.id)?.airport ?? false;
    const fields = validateCustomer(customer, { signedIn, airport });
    if (Object.keys(fields).length > 0) {
      return { error: "invalid", fields };
    }

    const addonIds = [...(protection ? [protection.id] : []), ...selectedAddonIds(selection)];
    const accessories = selectedAccessories(selection);
    // The code is checked again here: the browser's word for it is not enough.
    const promo = normalizePromo(query[QUERY_KEYS.promo]);
    if (promo && !(await verifyPromoCode({ code: promo, startDate: pickUpDate })).valid) {
      return { error: "promo" };
    }
    const quote = await quoteFor(lang, search, car.id, addonIds, accessories, promo);
    // Written so that a missing or non-numeric total (NaN) fails too.
    if (!(Math.abs(quote.total - Number(text("total"))) < 0.01)) {
      return { error: "price", quote };
    }

    creating = true;
    const flightNumber = customer.flightNumber.trim();
    const comment = customer.comment.trim();
    const created = await createReservation({
      offerId: car.id,
      pickUpPointId: search.pickup.id,
      pickUpDate,
      pickUpAddress: search.pickup.address ?? undefined,
      returnPointId: dropoff.id,
      returnDate,
      returnAddress: dropoff.address ?? undefined,
      clientKeys: customerClientKeys(customer, signedIn),
      clientId: account ? account.clientId : undefined,
      // Legacy mapping: 0 person, 1 company. Only a new client sends it.
      clientType: signedIn ? undefined : customer.type === "company" ? 1 : 0,
      clientPassword: signedIn ? undefined : customer.password,
      addonIds,
      accessories,
      flightNumber: airport && flightNumber ? flightNumber : undefined,
      // As the old site: 1, the deposit link is sent after the team accepts.
      paymentMethodId: 1,
      comment: comment || undefined,
      promoCode: promo ?? undefined,
      language: lang,
      // Monthly rental: the same months and kilometre limit as the quote.
      longTerm: search.term === "long" ? { months: search.months, monthlyKmLimit: search.km } : undefined,
    });
    if (created.unique === false) {
      return { error: "account_exists" };
    }
    if (!created.success) {
      console.error("[reservation create] failed: rejected");
      return { error: "server" };
    }

    receipt = {
      id: created.id,
      email: details ? details.email : customer.email.trim(),
      signedIn,
      term: search.term,
      car: { name: car.name, segment: car.segment, image: car.image?.src ?? null },
      trip: tripSummary(lang, search, places),
      at: { pickup: formatQueryDateTime(start), return: formatQueryDateTime(end) },
      protection: protection?.name ?? null,
      extras: chosenExtras(selection, extrasView, getMessages(lang).quoteLines.item).map(({ name, quantity }) => ({
        name,
        quantity,
      })),
      lines: quote.lines,
      total: quote.total,
      monthly: quote.monthly,
      deposit: quote.deposit,
    };
  } catch (error) {
    const code = error instanceof RentCarSoftError ? error.code : "unexpected";
    console.error(`[reservation create] failed: ${code}`);
    return { error: creating && (code === "timeout" || code === "network") ? "timeout" : "server" };
  }

  await saveReceipt(receipt);
  redirect(reservationDoneHref(lang));
}

/** The signed-in client's session id and account details; `null` for a guest. */
async function signedInAccount(lang: Lang) {
  const session = await getSession();
  return session ? { clientId: session.clientId, details: await getAccountDetails(lang) } : null;
}
