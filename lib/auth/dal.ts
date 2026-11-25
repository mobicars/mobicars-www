import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import type { Lang } from "@/i18n/config";
import { accountHref } from "@/i18n/routes";
import {
  CLIENT_BANNED_KEY_ID,
  getClient,
  isClientBanned,
  RentCarSoftError,
} from "@/lib/rentcarsoft";

import { toAccountDetails } from "@/lib/account/details";
import { DETAIL_KEY_IDS, type AccountDetails } from "@/lib/account/fields";

import { loginPath } from "./paths";
import { readSession, type Session } from "./session";

/**
 * Data Access Layer for the client account.
 * Every read of client data goes through here, and the client id always comes
 * from the session, never from the URL or a form field.
 */

export const getSession = cache(readSession);

export async function requireSession(lang: Lang): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect(loginPath(lang));
  }
  return session;
}

/** Editable fields of the signed-in client, for the details form. */
export const getAccountDetails = cache(async (lang: Lang): Promise<AccountDetails> => {
  const session = await requireSession(lang);
  let client;
  try {
    client = await getClient(session.clientId, {
      lang,
      keyIds: [...DETAIL_KEY_IDS, CLIENT_BANNED_KEY_ID],
    });
  } catch (error) {
    if (error instanceof RentCarSoftError && error.code === "not_found") {
      redirect(accountHref(lang, "session"));
    }
    throw error;
  }
  if (isClientBanned(client)) {
    redirect(accountHref(lang, "session"));
  }
  return toAccountDetails(client);
});
