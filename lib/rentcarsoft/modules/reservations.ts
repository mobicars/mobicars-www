import { parseCreatedReservation, type CreatedReservation } from "../internal/entities";
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
