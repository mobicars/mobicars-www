import { listClientKeys } from "./catalog";
import { rentCarSoftRequest } from "../internal/http";
import { CLIENT_BANNED_VALUE_ID, CLIENT_KEY_LABELS } from "../internal/labels";
import {
  buildClientQuery,
  buildLoginBody,
  buildPasswordRecoveryBody,
} from "../internal/params";
import { asId, expectRecord, normalizeClient, type ClientRecord } from "../internal/parse";
import { RentCarSoftError } from "../internal/errors";

const ACCOUNT_TIMEOUT_MS = 20_000;

export async function loginClient(input: {
  email: string;
  password: string;
}): Promise<{ clientId: number }> {
  const payload = await rentCarSoftRequest({
    method: "POST",
    path: "/client/login.json",
    body: buildLoginBody(input),
    timeoutMs: ACCOUNT_TIMEOUT_MS,
  });
  const record = expectRecord(payload);
  const clientId = asId(record.clientId);
  if (clientId === null) {
    throw new RentCarSoftError("malformed_response");
  }
  return { clientId };
}

export async function getClient(
  id: number,
  input: { lang?: string; keyIds?: number[] } = {},
): Promise<ClientRecord> {
  const lang = input.lang ?? "pl";
  const [payload, definitions] = await Promise.all([
    rentCarSoftRequest({
      path: `/client/${id}.json`,
      query: buildClientQuery(input),
      timeoutMs: ACCOUNT_TIMEOUT_MS,
    }),
    listClientKeys(lang),
  ]);
  return normalizeClient(payload, CLIENT_KEY_LABELS, definitions);
}

/** True when the client has “Zakaz wynajmu” set. Read `CLIENT_BANNED_KEY_ID` in `keyIds`. */
export function isClientBanned(client: ClientRecord): boolean {
  return client.attributes.banned?.valueId === CLIENT_BANNED_VALUE_ID;
}

export async function startPasswordRecovery(email: string): Promise<void> {
  await rentCarSoftRequest({
    method: "POST",
    path: "/client/password/recovery.json",
    body: buildPasswordRecoveryBody({ email }),
    timeoutMs: ACCOUNT_TIMEOUT_MS,
  });
}

export async function getPasswordRecoveryToken(
  email: string,
): Promise<{ token: string | null }> {
  const payload = await rentCarSoftRequest({
    path: "/client/password/recovery.json",
    query: { email },
    timeoutMs: ACCOUNT_TIMEOUT_MS,
  });
  const record = expectRecord(payload);
  const token = record.token;
  if (token !== null && token !== undefined && typeof token !== "string") {
    throw new RentCarSoftError("malformed_response");
  }
  return { token: typeof token === "string" ? token : null };
}

export async function completePasswordRecovery(input: {
  email: string;
  password: string;
}): Promise<void> {
  await rentCarSoftRequest({
    method: "PUT",
    path: "/client/password/recovery.json",
    body: buildPasswordRecoveryBody(input),
    timeoutMs: ACCOUNT_TIMEOUT_MS,
  });
}

/**
 * Sets a new password for a signed-in client.
 * The spec puts `password` in the query string; the bridge sends a JSON body
 * like the other password writes, so the password never lands in a URL log.
 * UNVERIFIED on the live API.
 */
export async function changeClientPassword(
  clientId: number,
  password: string,
): Promise<void> {
  await rentCarSoftRequest({
    method: "PUT",
    path: `/client/password/${clientId}.json`,
    body: { password },
    timeoutMs: ACCOUNT_TIMEOUT_MS,
  });
}

/**
 * True when a client with this email exists.
 * Uses the recovery-token read, which answers 404 for an unknown email and
 * changes nothing. Do not return its token from here.
 */
export async function clientEmailExists(email: string): Promise<boolean> {
  try {
    await getPasswordRecoveryToken(email);
    return true;
  } catch (error) {
    if (error instanceof RentCarSoftError && error.code === "not_found") {
      return false;
    }
    throw error;
  }
}

export type CreateClientInput = {
  isCompany: boolean;
  password: string;
  /** Client key id → value, e.g. `{ 1: "Anna", 5: "anna@example.com" }`. */
  keys: Record<number, string>;
};

/** Creates a client account. UNVERIFIED on the live API: no client was created during review. */
export async function createClient(input: CreateClientInput): Promise<{ clientId: number }> {
  const payload = await rentCarSoftRequest({
    method: "POST",
    path: "/clients.json",
    body: {
      isCompany: input.isCompany,
      password: input.password,
      keys: Object.entries(input.keys).map(([id, value]) => ({ id: Number(id), value })),
    },
    timeoutMs: ACCOUNT_TIMEOUT_MS,
  });
  const clientId = asId(expectRecord(payload).clientId);
  if (clientId === null) {
    throw new RentCarSoftError("malformed_response");
  }
  return { clientId };
}

/**
 * Updates client custom fields. Values are strings; a select field takes the
 * option id (for example `"18"` for “Tak” on key 47).
 * The spec puts `keys` in the query string; the bridge sends a JSON body like
 * the other client writes. UNVERIFIED on the live API: callers should read the
 * client back and compare.
 */
export async function updateClient(
  clientId: number,
  keys: Record<number, string>,
): Promise<void> {
  await rentCarSoftRequest({
    method: "PUT",
    path: `/client/${clientId}.json`,
    body: {
      keys: Object.entries(keys).map(([id, value]) => ({ id: Number(id), value })),
    },
    timeoutMs: ACCOUNT_TIMEOUT_MS,
  });
}
