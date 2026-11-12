"use server";

import { timingSafeEqual } from "node:crypto";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { accountHref } from "@/i18n/routes";
import {
  changeClientPassword,
  CLIENT_BANNED_KEY_ID,
  clientEmailExists,
  completePasswordRecovery,
  createClient,
  getClient,
  getPasswordRecoveryToken,
  isClientBanned,
  loginClient,
  RentCarSoftError,
  startPasswordRecovery,
  updateClient,
} from "@/lib/rentcarsoft";
import { rawKeys } from "@/lib/account/details";
import { toRentCarSoftPhone } from "@/lib/account/phone";
import { CONSENT_FIELDS, DETAIL_KEY_IDS, TEXT_FIELDS } from "@/lib/account/fields";

import {
  checkNewPassword,
  formLang,
  formPassword,
  formText,
  isEmail,
  MAX_PASSWORD_LENGTH,
  type PasswordProblem,
} from "./form";
import { loginPath } from "./paths";
import {
  clearFailures,
  isRateLimited,
  recordFailure,
  requestIp,
  type LimitKey,
} from "./rate-limit";
import { createSession, readSession } from "./session";

/** Client key ids used by the account forms. */
const KEY = { firstName: 1, lastName: 2, phone: 4, email: 5, vatNumber: 7, companyName: 9 } as const;

function logFailure(label: string, error: unknown) {
  console.error(label, error instanceof RentCarSoftError ? error.code : error);
}

// --- Password change inside the panel -------------------------------------

export type ChangePasswordState =
  | { done: true }
  | { error: PasswordProblem | "wrong_current" | "same" | "rate_limited" | "unavailable" }
  | null;

export async function changePassword(
  _previous: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const lang = formLang(formData);
  const session = await readSession();
  if (!session) {
    redirect(loginPath(lang, accountHref(lang, "security")));
  }

  const current = formPassword(formData, "current");
  const password = formPassword(formData, "password");
  const problem = checkNewPassword(password, formPassword(formData, "confirm"));
  if (problem) {
    return { error: problem };
  }
  if (password === current) {
    return { error: "same" };
  }

  const keys: LimitKey[] = [{ key: `change:${session.clientId}`, max: 5 }];
  if (isRateLimited(keys)) {
    return { error: "rate_limited" };
  }

  try {
    const client = await getClient(session.clientId, { keyIds: [KEY.email] });
    const email = client.attributes.email?.value?.trim();
    if (!email) {
      return { error: "unavailable" };
    }
    // The current password is checked by RentCarSoft itself.
    try {
      await loginClient({ email, password: current.slice(0, MAX_PASSWORD_LENGTH) });
    } catch (error) {
      if (error instanceof RentCarSoftError && error.code !== "timeout" && error.code !== "network" && error.code !== "api") {
        recordFailure(keys);
        return { error: "wrong_current" };
      }
      throw error;
    }
    await changeClientPassword(session.clientId, password);
  } catch (error) {
    logFailure("Password change failed", error);
    return { error: "unavailable" };
  }

  clearFailures(keys);
  // A fresh cookie: the session now dates from the password change.
  await createSession(session.clientId, session.method);
  return { done: true };
}

// --- Password recovery -----------------------------------------------------
//
// RentCarSoft emails the customer a short numeric code (5 digits so far) when
// recovery starts. `GET /client/password/recovery.json` returns that code as
// `token`, and `PUT` sets the new password from the email alone, so the code
// is checked here before the password changes.

export type RecoveryRequestResult =
  | { ok: true; email: string }
  | { error: "invalid_email" | "rate_limited" | "unavailable"; email: string };

function recoveryLimit(email: string, ip: string): LimitKey[] {
  return [
    { key: `forgot:${email.toLowerCase()}`, max: 3 },
    { key: `forgot-ip:${ip}`, max: 10 },
  ];
}

/**
 * Asks RentCarSoft to email a recovery code. Used for the first request and
 * for “send again”. The answer is the same whether or not the email has an
 * account, so it cannot be used to look up customers.
 */
async function sendRecoveryCode(rawEmail: string): Promise<RecoveryRequestResult> {
  const email = rawEmail.trim().slice(0, 254);
  if (!isEmail(email)) {
    return { error: "invalid_email", email };
  }
  const keys = recoveryLimit(email, await requestIp());
  if (isRateLimited(keys)) {
    return { error: "rate_limited", email };
  }
  recordFailure(keys);

  try {
    await startPasswordRecovery(email);
  } catch (error) {
    if (!(error instanceof RentCarSoftError && error.code === "not_found")) {
      logFailure("Password recovery start failed", error);
      return { error: "unavailable", email };
    }
  }
  return { ok: true, email };
}

export async function requestPasswordReset(
  _previous: RecoveryRequestResult | null,
  formData: FormData,
): Promise<RecoveryRequestResult> {
  return sendRecoveryCode(formText(formData, "email"));
}

export async function resendPasswordResetCode(email: string): Promise<RecoveryRequestResult> {
  return sendRecoveryCode(typeof email === "string" ? email : "");
}

type CodeCheck = "ok" | "invalid_code" | "no_pending" | "rate_limited" | "unavailable";

function sameCode(expected: string, given: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Digits only, so “20 598” and “20598” are the same code. */
function normalizeCode(value: string): string {
  return value.replace(/\D/g, "").slice(0, 12);
}

async function checkRecoveryCode(email: string, code: string): Promise<CodeCheck> {
  if (!isEmail(email) || !code) {
    return "invalid_code";
  }
  const keys: LimitKey[] = [
    { key: `code:${email.toLowerCase()}`, max: 5 },
    { key: `code-ip:${await requestIp()}`, max: 20 },
  ];
  if (isRateLimited(keys)) {
    return "rate_limited";
  }
  try {
    const { token } = await getPasswordRecoveryToken(email);
    if (!token) {
      return "no_pending";
    }
    if (!sameCode(normalizeCode(token), code)) {
      recordFailure(keys);
      return "invalid_code";
    }
  } catch (error) {
    if (error instanceof RentCarSoftError && error.code === "not_found") {
      // Unknown email: answer like a wrong code.
      recordFailure(keys);
      return "invalid_code";
    }
    logFailure("Recovery code check failed", error);
    return "unavailable";
  }
  clearFailures(keys);
  return "ok";
}

export type VerifyCodeState =
  | { ok: true; code: string }
  | { error: Exclude<CodeCheck, "ok"> }
  | null;

/** Step 1 of the code dialog: is the code right? Nothing changes yet. */
export async function verifyResetCode(
  _previous: VerifyCodeState,
  formData: FormData,
): Promise<VerifyCodeState> {
  const email = formText(formData, "email");
  const code = normalizeCode(formText(formData, "code", 32));
  const result = await checkRecoveryCode(email, code);
  return result === "ok" ? { ok: true, code } : { error: result };
}

export type ResetPasswordState =
  | { error: PasswordProblem | Exclude<CodeCheck, "ok"> }
  | null;

/** Step 2 of the code dialog: checks the code again, sets the password, signs in. */
export async function resetPassword(
  _previous: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const lang = formLang(formData);
  const email = formText(formData, "email");
  const code = normalizeCode(formText(formData, "code", 32));
  const password = formPassword(formData, "password");
  const problem = checkNewPassword(password, formPassword(formData, "confirm"));
  if (problem) {
    return { error: problem };
  }

  const check = await checkRecoveryCode(email, code);
  if (check !== "ok") {
    return { error: check };
  }

  let clientId: number | null = null;
  try {
    await completePasswordRecovery({ email, password });
    ({ clientId } = await loginClient({ email, password }));
    const client = await getClient(clientId, { keyIds: [CLIENT_BANNED_KEY_ID] });
    if (isClientBanned(client)) {
      clientId = null;
    }
  } catch (error) {
    logFailure("Password reset failed", error);
    return { error: "unavailable" };
  }

  if (clientId === null) {
    redirect(loginPath(lang));
  }
  await createSession(clientId, "password");
  redirect(accountHref(lang));
}

// --- Registration ------------------------------------------------------------

export type RegisterField =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "companyName"
  | "vatNumber"
  | "password"
  | "terms";

export type RegisterState = {
  error: PasswordProblem | "missing" | "invalid_email" | "invalid_phone" | "invalid_vat" | "exists" | "rate_limited" | "unavailable";
  fields: RegisterField[];
  /** Typed values to put back in the form. Never the password. */
  values: Record<string, string>;
} | null;

export async function register(
  _previous: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const lang = formLang(formData);
  const isCompany = formData.get("accountType") === "company";
  const values = {
    accountType: isCompany ? "company" : "private",
    firstName: formText(formData, "firstName"),
    lastName: formText(formData, "lastName"),
    email: formText(formData, "email"),
    phone: formText(formData, "phone", 32),
    companyName: isCompany ? formText(formData, "companyName") : "",
    vatNumber: isCompany ? formText(formData, "vatNumber", 32) : "",
  };
  const fail = (error: NonNullable<RegisterState>["error"], fields: RegisterField[] = []) => ({
    error,
    fields,
    values,
  });

  const required: RegisterField[] = ["firstName", "lastName", "email", "phone"];
  if (isCompany) {
    required.push("companyName", "vatNumber");
  }
  const missing = required.filter((field) => !values[field as keyof typeof values]);
  if (formData.get("terms") !== "on") {
    missing.push("terms");
  }
  if (missing.length > 0) {
    return fail("missing", missing);
  }
  if (!isEmail(values.email)) {
    return fail("invalid_email", ["email"]);
  }
  const phone = toRentCarSoftPhone(values.phone);
  if (!phone) {
    return fail("invalid_phone", ["phone"]);
  }
  if (isCompany && values.vatNumber.replace(/[\s-]/g, "").length < 8) {
    return fail("invalid_vat", ["vatNumber"]);
  }
  const password = formPassword(formData, "password");
  const problem = checkNewPassword(password, formPassword(formData, "confirm"));
  if (problem) {
    return fail(problem, ["password"]);
  }

  // Every attempt counts: this limits mass account creation, not only typos.
  const keys: LimitKey[] = [{ key: `register-ip:${await requestIp()}`, max: 5 }];
  if (isRateLimited(keys)) {
    return fail("rate_limited");
  }
  recordFailure(keys);

  let clientId: number;
  try {
    if (await clientEmailExists(values.email)) {
      return fail("exists", ["email"]);
    }
    const keyValues: Record<number, string> = {
      [KEY.firstName]: values.firstName,
      [KEY.lastName]: values.lastName,
      [KEY.email]: values.email,
      [KEY.phone]: phone,
    };
    if (isCompany) {
      keyValues[KEY.companyName] = values.companyName;
      keyValues[KEY.vatNumber] = values.vatNumber;
    }
    ({ clientId } = await createClient({ isCompany, password, keys: keyValues }));
  } catch (error) {
    logFailure("Registration failed", error);
    return fail("unavailable");
  }

  await createSession(clientId, "password");
  redirect(accountHref(lang));
}

// --- Account details ---------------------------------------------------------

/** What the form sent, so it can show it again after React resets the form. */
type SubmittedDetails = { values: Record<string, string>; checked: Record<string, boolean> };

export type UpdateDetailsState =
  | ({ done: true; changed: number } & SubmittedDetails)
  | ({
      error: "missing" | "invalid_phone" | "invalid_vat" | "not_saved" | "rate_limited" | "unavailable";
      fields: string[];
    } & SubmittedDetails)
  | null;

/**
 * Saves the whitelisted fields from `lib/account/fields.ts` that changed.
 * The client is read back afterwards: the write format is not verified on the
 * live API, so a request RentCarSoft accepts but ignores is reported, not
 * shown as saved.
 */
export async function updateDetails(
  _previous: UpdateDetailsState,
  formData: FormData,
): Promise<UpdateDetailsState> {
  const lang = formLang(formData);
  const session = await readSession();
  if (!session) {
    redirect(loginPath(lang, accountHref(lang, "details")));
  }

  const submitted: SubmittedDetails = {
    values: Object.fromEntries(
      TEXT_FIELDS.map((field) => [field.name, formText(formData, field.name, field.maxLength)]),
    ),
    checked: Object.fromEntries(
      CONSENT_FIELDS.map((field) => [field.name, formData.get(field.name) === "on"]),
    ),
  };
  const fail = (
    error: Extract<UpdateDetailsState, { error: string }>["error"],
    fields: string[] = [],
  ): UpdateDetailsState => ({ error, fields, ...submitted });

  const keys: LimitKey[] = [{ key: `details:${session.clientId}`, max: 10 }];
  if (isRateLimited(keys)) {
    return fail("rate_limited");
  }

  let current: Map<number, string>;
  let isCompany: boolean;
  try {
    const client = await getClient(session.clientId, { keyIds: DETAIL_KEY_IDS });
    current = rawKeys(client);
    isCompany = client.company === true;
  } catch (error) {
    logFailure("Details read failed", error);
    return fail("unavailable");
  }

  const changes: Record<number, string> = {};
  const missing: string[] = [];
  for (const field of TEXT_FIELDS) {
    if (field.companyOnly && !isCompany) {
      continue;
    }
    let value = submitted.values[field.name];
    if (field.required && !value) {
      missing.push(field.name);
    }
    if (field.name === "phone" && value) {
      const phone = toRentCarSoftPhone(value);
      if (!phone) {
        return fail("invalid_phone", ["phone"]);
      }
      value = phone;
    }
    if (value !== (current.get(field.keyId) ?? "")) {
      changes[field.keyId] = value;
    }
  }
  for (const field of CONSENT_FIELDS) {
    if (field.companyOnly && !isCompany) {
      continue;
    }
    const value = submitted.checked[field.name] ? field.yes : field.no;
    const was = current.get(field.keyId);
    // An unset select counts as “no”: do not write “no” over nothing.
    if (value !== was && !(value === field.no && !was)) {
      changes[field.keyId] = value;
    }
  }

  if (missing.length > 0) {
    return fail("missing", missing);
  }
  const vat = changes[7];
  if (vat !== undefined && vat.replace(/[\s-]/g, "").length < 8) {
    return fail("invalid_vat", ["vatNumber"]);
  }
  if (Object.keys(changes).length === 0) {
    return { done: true, changed: 0, ...submitted };
  }

  recordFailure(keys);
  try {
    await updateClient(session.clientId, changes);
    const saved = rawKeys(await getClient(session.clientId, { keyIds: DETAIL_KEY_IDS }));
    const notSaved = Object.entries(changes).filter(
      ([id, value]) => (saved.get(Number(id)) ?? "") !== value,
    );
    if (notSaved.length > 0) {
      console.error("Details not saved for key ids", notSaved.map(([id]) => id));
      return fail("not_saved");
    }
  } catch (error) {
    logFailure("Details update failed", error);
    return fail("unavailable");
  }

  // The overview and the greeting read the same client: show the new data.
  refresh();
  return { done: true, changed: Object.keys(changes).length, ...submitted };
}
