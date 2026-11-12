import "server-only";

import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";

import type { TripSummary } from "@/components/reservation/summary";
import type { MonthlyQuote, QuoteLineView } from "@/lib/reservation/quote";
import type { ReservationTerm } from "@/lib/reservation/search";

/**
 * What the thank-you page shows about the reservation just placed: what was
 * booked, where and when, and the price RentCarSoft quoted for it.
 *
 * The Server Action writes it into a short-lived encrypted cookie and
 * redirects; the page reads it back. Nothing about the booking travels in the
 * URL, and no reservation id from a URL is ever looked up (`getReservation`
 * would return any customer's booking).
 */
export type BookingReceipt = {
  /** RentCarSoft reservation id, when create returned one. */
  id: number | null;
  /** Where the confirmation goes: the account's email or the one typed. */
  email: string | null;
  signedIn: boolean;
  /** Picks the thank-you subtitle (short- or long-term rental). */
  term: ReservationTerm;
  car: { name: string; segment: string; image: string | null };
  trip: TripSummary;
  /** Pickup and return as `YYYY-MM-DDTHH:mm`, Warsaw wall time, for "Dodaj do kalendarza". */
  at?: { pickup: string; return: string };
  protection: string | null;
  extras: { name: string; quantity: number }[];
  /** Kinds, names and days, not labels: the thank-you page labels them in its own language. */
  lines: QuoteLineView[];
  total: number;
  /** Monthly rental: the per-month and one-time parts, shown like the summary. */
  monthly?: MonthlyQuote;
  deposit: number | null;
};

const COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-mc_booking" : "mc_booking";
const TTL_MS = 2 * 60 * 60 * 1000;
/** Browsers drop cookies over 4 KB; the price lines go first when it is tight. */
const MAX_TOKEN_LENGTH = 3800;

let cachedKey: Uint8Array | null = null;

/** Its own key from `SESSION_SECRET`, so a receipt can never pass as a session. */
async function receiptKey(): Promise<Uint8Array> {
  if (cachedKey) {
    return cachedKey;
  }
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  }
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`mobicars:booking-receipt\0${secret}`),
  );
  cachedKey = new Uint8Array(digest);
  return cachedKey;
}

async function seal(receipt: BookingReceipt, expiresAt: Date): Promise<string> {
  return new EncryptJWT({ receipt })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .encrypt(await receiptKey());
}

/** Call only from a Server Action. A receipt too large even without lines is skipped. */
export async function saveReceipt(receipt: BookingReceipt): Promise<void> {
  const expiresAt = new Date(Date.now() + TTL_MS);
  let token = await seal(receipt, expiresAt);
  if (token.length > MAX_TOKEN_LENGTH) {
    token = await seal({ ...receipt, lines: [], monthly: undefined }, expiresAt);
  }
  if (token.length > MAX_TOKEN_LENGTH) {
    token = await seal({ ...receipt, lines: [], monthly: undefined, extras: [] }, expiresAt);
  }
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** `null` when there is no receipt, it expired, or it was tampered with. */
export async function readReceipt(): Promise<BookingReceipt | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) {
    return null;
  }
  try {
    const { payload } = await jwtDecrypt(token, await receiptKey(), {
      keyManagementAlgorithms: ["dir"],
      contentEncryptionAlgorithms: ["A256GCM"],
      requiredClaims: ["exp"],
    });
    const receipt = payload.receipt as BookingReceipt | undefined;
    return receipt && typeof receipt.total === "number" && receipt.car ? receipt : null;
  } catch {
    return null;
  }
}
