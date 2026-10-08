import { parseReservationQuote, type ReservationQuote } from "../internal/entities";
import { rentCarSoftRequest } from "../internal/http";
import { buildCalculateQuery, type CalculateReservationInput } from "../internal/params";
import { normalizePromoCode, type PromoCodeCheck } from "../internal/parse";

const PRICING_TIMEOUT_MS = 20_000;

export async function calculateReservation(
  input: CalculateReservationInput,
): Promise<ReservationQuote> {
  return parseReservationQuote(
    await rentCarSoftRequest({
      path: "/reservation_calculate.json",
      query: buildCalculateQuery(input),
      timeoutMs: PRICING_TIMEOUT_MS,
    }),
  );
}

export async function verifyPromoCode(input: {
  code: string;
  startDate: string;
}): Promise<PromoCodeCheck> {
  return normalizePromoCode(
    await rentCarSoftRequest({
      path: "/verification_promocode.json",
      query: {
        kodProm: input.code,
        dataStart: input.startDate,
      },
      timeoutMs: PRICING_TIMEOUT_MS,
    }),
  );
}
