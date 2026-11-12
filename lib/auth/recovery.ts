import "server-only";

import { getPasswordRecoveryToken } from "@/lib/rentcarsoft";

/**
 * True when recovery has started for this email and is not finished:
 * RentCarSoft still holds a code for it.
 *
 * Not a Server Action on purpose. Exported from a `"use server"` file it would
 * be a public endpoint that tells anyone whether an email has an account.
 */
export async function hasPendingReset(email: string): Promise<boolean> {
  try {
    const { token } = await getPasswordRecoveryToken(email);
    return Boolean(token);
  } catch {
    return false;
  }
}
