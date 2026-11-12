import "server-only";

import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import type { Lang } from "@/i18n/config";
import { accountHref } from "@/i18n/routes";
import {
  CLIENT_BANNED_KEY_ID,
  getClient,
  isClientBanned,
  listClientReservations,
  RentCarSoftError,
  type ClientReservation,
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

/** Fields the account pages may show. Keep it narrow: no PESEL, no documents. */
export type Account = {
  clientId: number;
  isCompany: boolean | null;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  lastLogin: string | null;
};

/** firstName, lastName, phone, email, companyName, banned. */
const ACCOUNT_KEY_IDS = [1, 2, 4, 5, 9, CLIENT_BANNED_KEY_ID];

export const getAccount = cache(async (lang: Lang): Promise<Account> => {
  const session = await requireSession(lang);

  let client;
  try {
    client = await getClient(session.clientId, { lang, keyIds: ACCOUNT_KEY_IDS });
  } catch (error) {
    if (error instanceof RentCarSoftError && error.code === "not_found") {
      // The cookie is valid but the client no longer exists in RentCarSoft.
      redirect(accountHref(lang, "session"));
    }
    throw error;
  }
  if (isClientBanned(client)) {
    redirect(accountHref(lang, "session"));
  }

  const field = (name: string) => client.attributes[name]?.value?.trim() || null;

  return {
    clientId: client.id,
    isCompany: client.company,
    firstName: field("firstName"),
    lastName: field("lastName"),
    companyName: field("companyName"),
    email: field("email"),
    phone: field("phone"),
    lastLogin: client.lastLogin,
  };
});

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

/** Reservations of the signed-in client, newest pick-up first. */
export const getMyReservations = cache(
  async (lang: Lang): Promise<ClientReservation[]> => {
    const session = await requireSession(lang);
    let reservations: ClientReservation[];
    try {
      reservations = await listClientReservations(session.clientId, { lang });
    } catch (error) {
      // UNVERIFIED: a client with no reservations may come back as 404.
      if (error instanceof RentCarSoftError && error.code === "not_found") {
        return [];
      }
      throw error;
    }
    return reservations.toSorted((a, b) =>
      (b.pickUp.date ?? "").localeCompare(a.pickUp.date ?? ""),
    );
  },
);

/**
 * One reservation of the signed-in client.
 * Ownership comes from the client's own list: `GET /reservation/{id}` would
 * return any customer's booking, and its response has no client id.
 */
export async function getMyReservation(
  lang: Lang,
  id: number,
): Promise<ClientReservation> {
  const reservation = (await getMyReservations(lang)).find((item) => item.id === id);
  if (!reservation) {
    notFound();
  }
  return reservation;
}
