import { NextResponse, type NextRequest } from "next/server";

import { langFromPath, preferredLang } from "@/i18n/config";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const found = langFromPath(pathname);

  if (found) {
    if (found.canonical === pathname) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = found.canonical;
    return NextResponse.redirect(url, 308);
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
