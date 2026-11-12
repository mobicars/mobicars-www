import { NextResponse, type NextRequest } from "next/server";

import { langFromPath, preferredLang } from "@/i18n/config";
import { resolveAccountPath, resolveReservationPath } from "@/i18n/routes";
import { loginPath, safeReturnPath, SESSION_COOKIE } from "@/lib/auth/paths";
import { decryptSession } from "@/lib/auth/token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const found = langFromPath(pathname);

  if (found) {
    if (found.canonical !== pathname) {
      const url = request.nextUrl.clone();
      url.pathname = found.canonical;
      return NextResponse.redirect(url, 308);
    }
    const reservation = resolveReservationPath(found.lang, pathname);
    if (reservation) {
      const url = request.nextUrl.clone();
      if (reservation.canonical !== pathname) {
        url.pathname = reservation.canonical;
        return NextResponse.redirect(url, 308);
      }
      if (reservation.internal !== pathname) {
        url.pathname = reservation.internal;
        return NextResponse.rewrite(url);
      }
      return NextResponse.next();
    }
    const account = resolveAccountPath(found.lang, pathname);
    if (!account) {
      return NextResponse.next();
    }
    if (account.canonical !== pathname) {
      const url = request.nextUrl.clone();
      url.pathname = account.canonical;
      return NextResponse.redirect(url, 308);
    }
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    // A signed-in client has nothing to do on the sign-in pages. The token is
    // decrypted here so a stale cookie cannot bounce between login and panel.
    if (account.isGuestOnly && token && (await decryptSession(token))) {
      return NextResponse.redirect(
        new URL(
          safeReturnPath(found.lang, request.nextUrl.searchParams.get("next")),
          request.url,
        ),
        307,
      );
    }
    // Optimistic check only: the cookie is decrypted and verified in lib/auth/dal.ts.
    if (!account.isPublic && !token) {
      const returnTo = pathname + request.nextUrl.search;
      return NextResponse.redirect(
        new URL(loginPath(found.lang, returnTo), request.url),
        307,
      );
    }
    if (account.internal !== pathname) {
      const url = request.nextUrl.clone();
      url.pathname = account.internal;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  const lang = preferredLang(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${lang}` : `/${lang}${pathname}`;
  // 307: the target depends on Accept-Language, so it must not be cached as permanent.
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api|.*\\..*).*)"],
};
