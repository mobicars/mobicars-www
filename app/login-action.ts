"use server";

import { loginClient, RentCarSoftError } from "@/lib/rentcarsoft";

export type LoginProbe =
  | { ok: true; clientId: number }
  | { ok: false; code: string; status: number | null };

export async function probeLogin(
  _previous: LoginProbe | null,
  formData: FormData,
): Promise<LoginProbe> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { ok: false, code: "invalid_request", status: null };
  }

  try {
    const result = await loginClient({ email, password });
    return { ok: true, clientId: result.clientId };
  } catch (error) {
    if (error instanceof RentCarSoftError) {
      return { ok: false, code: error.code, status: error.status ?? null };
    }
    throw error;
  }
}
