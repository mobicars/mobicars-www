import "server-only";

import { cookies } from "next/headers";

import { SESSION_COOKIE } from "./paths";
import {
  decryptSession,
  encryptSession,
  type Session,
  type SessionMethod,
} from "./token";

export type { Session, SessionMethod } from "./token";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Set and deleted with the same attributes. In production the cookie is `__Host-`, which a browser takes only with
 * `Secure`: a bare `delete(name)` sends no `Secure`, so the browser dropped the deletion and the client stayed signed in.
 */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

/** Call only from a Server Action or Route Handler. */
export async function createSession(
  clientId: number,
  method: SessionMethod,
): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const token = await encryptSession({ clientId, method, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, { ...COOKIE_OPTIONS, expires: expiresAt });
}

export async function readSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? decryptSession(token) : null;
}

/** Call only from a Server Action or Route Handler. */
export async function deleteSession(): Promise<void> {
  (await cookies()).delete({ name: SESSION_COOKIE, ...COOKIE_OPTIONS });
}
