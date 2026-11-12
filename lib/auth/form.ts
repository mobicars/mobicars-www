import "server-only";

import { defaultLang, isLang, type Lang } from "@/i18n/config";

export const MAX_EMAIL_LENGTH = 254;
export const MAX_PASSWORD_LENGTH = 256;
export const MIN_PASSWORD_LENGTH = 8;
const MAX_FIELD_LENGTH = 200;

export function formLang(formData: FormData): Lang {
  const value = formData.get("lang");
  return typeof value === "string" && isLang(value) ? value : defaultLang;
}

/** Trimmed text field, cut to a sane length. */
export function formText(formData: FormData, name: string, max = MAX_FIELD_LENGTH): string {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}

/** Password field as typed: never trimmed, never echoed back to the form. */
export function formPassword(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "");
}

export function isEmail(value: string): boolean {
  return value.length <= MAX_EMAIL_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export type PasswordProblem = "too_short" | "too_long" | "mismatch";

export function checkNewPassword(password: string, confirm: string): PasswordProblem | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return "too_short";
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return "too_long";
  }
  if (password !== confirm) {
    return "mismatch";
  }
  return null;
}
