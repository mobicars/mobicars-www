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

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const lang = formLang(formData);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (
    !email ||
    !password ||
    email.length > MAX_EMAIL_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return { error: "invalid", email };
  }

  const keys = await limitKeys(email);
  if (isRateLimited(keys)) {
    return { error: "rate_limited", email };
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
        return { error: "reset_pending", email };
      }
      // Same answer for an unknown email and a wrong password.
      return { error: "invalid", email };
    }
    console.error("Login failed", error instanceof RentCarSoftError ? error.code : error);
    return { error: "unavailable", email };
  }

  try {
    const client = await getClient(clientId, { keyIds: [CLIENT_BANNED_KEY_ID] });
    if (isClientBanned(client)) {
      return { error: "banned", email };
    }
  } catch (error) {
    console.error("Login client check failed", error instanceof RentCarSoftError ? error.code : error);
    return { error: "unavailable", email };
  }

  clearFailures(keys);
  await createSession(clientId, "password");
  redirect(safeReturnPath(lang, formData.get("next")));
}

export async function logout(formData: FormData): Promise<void> {
  await deleteSession();
  redirect(loginPath(formLang(formData)));
}
