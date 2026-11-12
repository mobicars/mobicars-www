"use server";

import { redirect } from "next/navigation";

import {
  CLIENT_BANNED_KEY_ID,
  getClient,
  isClientBanned,
  loginClient,
  RentCarSoftError,
} from "@/lib/rentcarsoft";

import { formLang, MAX_EMAIL_LENGTH, MAX_PASSWORD_LENGTH } from "./form";
import { loginPath, safeReturnPath } from "./paths";
import { hasPendingReset } from "./recovery";
import {
  clearFailures,
  isRateLimited,
  recordFailure,
  requestIp,
  type LimitKey,
} from "./rate-limit";
import { createSession, deleteSession } from "./session";

export type LoginState = {
  /** `reset_pending`: wrong password while a recovery code is outstanding. */
  error: "invalid" | "reset_pending" | "banned" | "rate_limited" | "unavailable";
  email: string;
} | null;

async function limitKeys(email: string): Promise<LimitKey[]> {
  const ip = await requestIp();
  return [
    { key: `email:${email.toLowerCase()}`, max: 5 },
    { key: `ip:${ip}`, max: 20 },
  ];
}

/**
 * Checks the credentials and opens a session. Shared by the sign-in page
 * (`login`, which then redirects) and the booking form (`loginInPlace`,
 * which stays on the page). Returns the error, or null when signed in.
 */
async function signIn(email: string, password: string): Promise<NonNullable<LoginState>["error"] | null> {
  if (
    !email ||
    !password ||
    email.length > MAX_EMAIL_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return "invalid";
  }

  const keys = await limitKeys(email);
  if (isRateLimited(keys)) {
    return "rate_limited";
  }

  let clientId: number;
  try {
    ({ clientId } = await loginClient({ email, password }));
  } catch (error) {
    if (
      error instanceof RentCarSoftError &&
      (error.code === "unauthorized" ||
        error.code === "not_found" ||
        error.code === "invalid_request")
    ) {
      recordFailure(keys);
      // Recovery started and not finished: send the client back to the code.
      if (await hasPendingReset(email)) {
        return "reset_pending";
      }
      // Same answer for an unknown email and a wrong password.
      return "invalid";
    }
    console.error("Login failed", error instanceof RentCarSoftError ? error.code : error);
    return "unavailable";
  }

  try {
    const client = await getClient(clientId, { keyIds: [CLIENT_BANNED_KEY_ID] });
    if (isClientBanned(client)) {
      return "banned";
    }
  } catch (error) {
    console.error("Login client check failed", error instanceof RentCarSoftError ? error.code : error);
    return "unavailable";
  }

  clearFailures(keys);
  await createSession(clientId, "password");
  return null;
}

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const lang = formLang(formData);
  const email = String(formData.get("email") ?? "").trim();
  const error = await signIn(email, String(formData.get("password") ?? ""));
  if (error) {
    return { error, email };
  }
  redirect(safeReturnPath(lang, formData.get("next")));
}

/**
 * Sign-in inside the booking form ("Mam już mobikonto"), like the old site:
 * no redirect, so the chosen car and extras stay on screen. The page
 * refreshes itself afterwards to fill in the account's data.
 */
export async function loginInPlace(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const error = await signIn(email, String(formData.get("password") ?? ""));
  return error ? { error, email } : null;
}

/** Sign-out from the booking form; the page refreshes itself afterwards. */
export async function logoutInPlace(): Promise<void> {
  await deleteSession();
}

export async function logout(formData: FormData): Promise<void> {
  await deleteSession();
  redirect(loginPath(formLang(formData)));
}
