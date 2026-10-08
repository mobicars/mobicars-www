import { listClientKeys } from "./catalog";
import { rentCarSoftRequest } from "../internal/http";
import { CLIENT_KEY_LABELS } from "../internal/labels";
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
