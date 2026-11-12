import { NextResponse, type NextRequest } from "next/server";

import { isLang } from "@/i18n/config";
import { accountHref } from "@/i18n/routes";
import { loginPath } from "@/lib/auth/paths";
import { deleteSession, readSession } from "@/lib/auth/session";
import {
  CLIENT_BANNED_KEY_ID,
  getClient,
  isClientBanned,
  RentCarSoftError,
} from "@/lib/rentcarsoft";

/**
 * Ends a session the panel cannot serve: no valid cookie, a client that no
 * longer exists, or a client with “Zakaz wynajmu”. The Data Access Layer
 * redirects here because a Server Component cannot delete cookies.
 *
 * It checks RentCarSoft itself before deleting anything, so a link from
 * another site cannot sign a valid client out.
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/[lang]/account/session">,
) {
  const { lang } = await params;
  if (!isLang(lang)) {
    return new NextResponse(null, { status: 404 });
  }
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url), 303);

  const session = await readSession();
  if (session) {
    try {
      const client = await getClient(session.clientId, { keyIds: [CLIENT_BANNED_KEY_ID] });
      if (!isClientBanned(client)) {
        return to(accountHref(lang));
      }
    } catch (error) {
      if (!(error instanceof RentCarSoftError && error.code === "not_found")) {
        throw error;
      }
    }
  }

  await deleteSession();
  return to(loginPath(lang));
}
