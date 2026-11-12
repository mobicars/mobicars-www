import {
  parseClientReservation,
  parseClientReservations,
  parseCreatedReservation,
  type ClientReservation,
  type CreatedReservation,
} from "../internal/entities";
import { rentCarSoftRequest } from "../internal/http";
import {
  buildReservationBody,
  type CreateReservationInput,
} from "../internal/params";

const MUTATION_TIMEOUT_MS = 20_000;

export async function createReservation(
  input: CreateReservationInput,
): Promise<CreatedReservation> {
  return parseCreatedReservation(
    await rentCarSoftRequest({
      method: "POST",
      path: "/reservation.json",
      body: buildReservationBody(input),
      timeoutMs: MUTATION_TIMEOUT_MS,
    }),
  );
}

const READ_TIMEOUT_MS = 20_000;
/** Offer name and body type. Without `offerKeys` the live API returns `offer: null`. */
const RESERVATION_OFFER_KEY_IDS = [1, 2];

/** All reservations of one client, newest data from the API, never cached. */
export async function listClientReservations(
  clientId: number,
  input: { lang?: string } = {},
): Promise<ClientReservation[]> {
  return parseClientReservations(
    await rentCarSoftRequest({
      path: `/reservations/${clientId}.json`,
      query: { offerKeys: RESERVATION_OFFER_KEY_IDS, lang: input.lang ?? "pl" },
      timeoutMs: READ_TIMEOUT_MS,
    }),
  );
}

/**
 * One reservation by id. The response does not say which client owns it,
 * so a customer-facing caller must check ownership against
 * `listClientReservations` first.
 */
export async function getReservation(
  id: number,
  input: { lang?: string } = {},
): Promise<ClientReservation> {
  return parseClientReservation(
    await rentCarSoftRequest({
      path: `/reservation/${id}.json`,
      query: { offerKeys: RESERVATION_OFFER_KEY_IDS, lang: input.lang ?? "pl" },
      timeoutMs: READ_TIMEOUT_MS,
    }),
  );
}
