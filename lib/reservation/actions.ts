"use server";

import { now } from "@internationalized/date";
import { redirect } from "next/navigation";

import { tripSummary } from "@/components/reservation/trip";
import { reservationDoneHref } from "@/i18n/routes";
import { getAccountDetails, getSession } from "@/lib/auth/dal";
import { formLang } from "@/lib/auth/form";
import { isRateLimited, recordFailure, requestIp, type LimitKey } from "@/lib/auth/rate-limit";
import {
  calculateReservation,
  createReservation,
  listAccessories,
  listAddons,
  listAllOffers,
  listServicePoints,
  RentCarSoftError,
} from "@/lib/rentcarsoft";
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
  toExtrasView,
} from "@/lib/reservation/extras";
import { toOfferCards } from "@/lib/reservation/offers";
import { toPickupPlace } from "@/lib/reservation/places";
import { toProtectionOptions } from "@/lib/reservation/protection";
import { toQuoteView, type QuoteView } from "@/lib/reservation/quote";
import { saveReceipt } from "@/lib/reservation/receipt";
import {
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

  const session = await getSession();
  const details = session ? await getAccountDetails(lang) : null;
  const signedIn = details !== null;

  let receipt: Parameters<typeof saveReceipt>[0];
  // Only a create that got no answer may still have gone through.
  let creating = false;
  try {
    const places = (await listServicePoints({ lang })).map(toPickupPlace);
    const query = Object.fromEntries(new URLSearchParams(text("search") ?? ""));
    // Strict here: the pickup must still be at least the lead time away.
    const earliestStart = now(reservationConfig.timeZone).add({ minutes: reservationConfig.pickupLeadMinutes });
    const result = validateSearch(draftFromQuery(query, "short"), { places, earliestStart });
    if (!result.ok || result.search.term !== "short") {
      return { error: "search" };
    }
    const search = result.search;
    const { start, end } = rentalPeriod(search);
    const pickUpDate = toRentCarSoftDateTime(start);
    const returnDate = toRentCarSoftDateTime(end);
    const dropoff = search.dropoff ?? search.pickup;

    const offers = toOfferCards(
      await listAllOffers({ lang, term: "short", servicePointIds: [search.pickup.id], pickUpDate, returnDate }),
    );
    const car = offers.find((offer) => offer.id === Number(text(QUERY_KEYS.offer)));
    if (!car) {
      return { error: "choices" };
    }

    const extrasInput = {
      lang,
      priceSegmentIds: car.segmentId ? [Number(car.segmentId)] : undefined,
      pickUpDate,
      returnDate,
    };
    const addons = await listAddons(extrasInput);
    const options = toProtectionOptions(addons);
    const protection = options.find((option) => option.id === Number(text(QUERY_KEYS.protection))) ?? null;
    if (options.length > 0 && !protection) {
      return { error: "choices" };
    }
    const extrasView = toExtrasView(addons, await listAccessories(extrasInput));
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
    const quote = toQuoteView(
      await calculateReservation({
        offerId: car.id,
        pickUpPointId: search.pickup.id,
        returnPointId: dropoff.id,
        pickUpDate,
        returnDate,
        lang,
        addonIds,
        accessories,
      }),
    );
    if (Math.abs(quote.total - Number(text("total"))) >= 0.01) {
      return { error: "price", quote };
    }

    recordFailure(limit);
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
      clientId: details && session ? session.clientId : undefined,
      // Legacy mapping: 0 person, 1 company. Only a new client sends it.
      clientType: signedIn ? undefined : customer.type === "company" ? 1 : 0,
      clientPassword: signedIn ? undefined : customer.password,
      addonIds,
      accessories,
      flightNumber: airport && flightNumber ? flightNumber : undefined,
      // As the old site: 1, the deposit link is sent after the team accepts.
      paymentMethodId: 1,
      comment: comment || undefined,
      language: lang,
    });
    if (created.unique === false) {
      return { error: "account_exists" };
    }
    if (!created.success) {
      console.error("[reservation create] failed: rejected");
      return { error: "server" };
    }

    const names = new Map(
      [...extrasView.zones, ...extrasView.groups.flatMap((group) => group.items)].map((item) => [item.id, item.name]),
    );
    receipt = {
      id: created.id,
      email: details ? details.email : customer.email.trim(),
      signedIn,
      car: { name: car.name, segment: car.segment, image: car.image?.src ?? null },
      trip: tripSummary(search, places),
      protection: protection?.name ?? null,
      extras: [
        ...selectedAddonIds(selection).map((id) => ({ name: names.get(id) ?? "Dodatek", quantity: 1 })),
        ...accessories.map(({ id, quantity }) => ({ name: names.get(id) ?? "Dodatek", quantity })),
      ],
      lines: quote.lines,
      total: quote.total,
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
