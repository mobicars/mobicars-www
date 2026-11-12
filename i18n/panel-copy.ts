import "server-only";

import { accountCopyOf, type AccountCopy } from "./account";
import { authFormsCopyOf, type AuthFormsCopy } from "./auth-forms";
import { langs, type Lang } from "./config";
import { detailsCopyOf, type DetailsCopy } from "./details";
import { getMessages } from "./messages";

/**
 * Panel texts for server components, every language. Client components use
 * `useAccountCopy`, `useAuthFormsCopy` and `useDetailsCopy` instead, so the
 * browser gets only the page language.
 */
function byLang<T>(build: (lang: Lang) => T): Record<Lang, T> {
  return Object.fromEntries(langs.map((lang) => [lang, build(lang)])) as Record<Lang, T>;
}

export const accountCopy: Record<Lang, AccountCopy> = byLang((lang) => accountCopyOf(lang, getMessages(lang)));
export const authFormsCopy: Record<Lang, AuthFormsCopy> = byLang((lang) => authFormsCopyOf(getMessages(lang)));
export const detailsCopy: Record<Lang, DetailsCopy> = byLang((lang) => detailsCopyOf(getMessages(lang)));
