import { EncryptJWT, jwtDecrypt } from "jose";

/**
 * Encryption of the session cookie value.
 * Used by `session.ts` and by `proxy.ts`, so this file must not import
 * `server-only` or `next/headers`. It reads `SESSION_SECRET`, which never
 * has a `NEXT_PUBLIC_` prefix and so never reaches a browser bundle.
 */

/** How the client proved who they are. Google sign-in will add `"google"`. */
export type SessionMethod = "password";

export type Session = {
  clientId: number;
  method: SessionMethod;
  expiresAt: Date;
};

const METHODS: readonly SessionMethod[] = ["password"];

let cachedKey: Uint8Array | null = null;

/**
 * 256-bit key derived from `SESSION_SECRET`.
 * The cookie is a JWE (`dir` + `A256GCM`): the browser cannot read or change it.
 */
async function sessionKey(): Promise<Uint8Array> {
  if (cachedKey) {
    return cachedKey;
  }
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  }
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(secret),
  );
  cachedKey = new Uint8Array(digest);
  return cachedKey;
}

export async function encryptSession(session: Session): Promise<string> {
  return new EncryptJWT({ method: session.method })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setSubject(String(session.clientId))
    .setIssuedAt()
    .setExpirationTime(session.expiresAt)
    .encrypt(await sessionKey());
}

/** `null` when the token is expired, tampered with, or from another secret. */
export async function decryptSession(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtDecrypt(token, await sessionKey(), {
      keyManagementAlgorithms: ["dir"],
      contentEncryptionAlgorithms: ["A256GCM"],
      requiredClaims: ["sub", "exp", "iat"],
    });
    const clientId = Number(payload.sub);
    const method = payload.method as SessionMethod;
    if (!Number.isSafeInteger(clientId) || clientId <= 0) {
      return null;
    }
    if (!METHODS.includes(method)) {
      return null;
    }
    return { clientId, method, expiresAt: new Date(payload.exp! * 1000) };
  } catch {
    return null;
  }
}
