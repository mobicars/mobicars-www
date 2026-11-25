import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

import { langFromPath, preferredLang, type Lang } from "@/i18n/config";
import { resolveAccountPath, resolveExtrasPath, resolveFleetPath, resolveReservationPath, resolveSalesPath } from "@/i18n/routes";
import { loginPath, safeReturnPath, SESSION_COOKIE } from "@/lib/auth/paths";
import { decryptSession } from "@/lib/auth/token";
import { contentPreview } from "@/lib/cache";
import { offerIdFromSlug } from "@/lib/fleet/slug";
import { legacyRedirect } from "@/lib/seo/legacy-redirects";
import { checkBlog, checkPage, checkSale, routeLookup, type RouteLookup, type Verdict } from "@/lib/seo/route-index";

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // Old site addresses (redesign/redirects-map.md) go first, in one 308 hop,
  // before the language redirect would add a second one.
  const legacy = legacyRedirect(pathname, request.nextUrl.search);
  if (legacy) {
    return NextResponse.redirect(new URL(legacy.destination, request.url), legacy.status);
  }

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
    const fleet = resolveFleetPath(found.lang, pathname);
    if (fleet) {
      const url = request.nextUrl.clone();
      if (fleet.canonical !== pathname) {
        url.pathname = fleet.canonical;
        return NextResponse.redirect(url, 308);
      }
      // The page finds a car by the offer id at the end of the slug; without one there is nothing to find.
      if (fleet.slug && offerIdFromSlug(fleet.slug) === null) {
        return notFound(request, found.lang);
      }
      if (fleet.internal !== pathname) {
        url.pathname = fleet.internal;
        return NextResponse.rewrite(url);
      }
      return NextResponse.next();
    }
    const extras = resolveExtrasPath(found.lang, pathname);
    if (extras) {
      const url = request.nextUrl.clone();
      if (extras.canonical !== pathname || !extras.internal) {
        url.pathname = extras.canonical;
        return NextResponse.redirect(url, 308);
      }
      if (extras.slug && offerIdFromSlug(extras.slug) === null) {
        return notFound(request, found.lang);
      }
      url.pathname = extras.internal;
      return NextResponse.rewrite(url);
    }
    const sales = resolveSalesPath(found.lang, pathname);
    if (sales) {
      const url = request.nextUrl.clone();
      if (sales.canonical !== pathname || !sales.internal) {
        url.pathname = sales.canonical;
        return NextResponse.redirect(url, 308);
      }
      const { slug } = sales;
      const settled = slug ? await settle(request, event, found.lang, (lookup) => checkSale(lookup, slug), () => sales.canonical) : null;
      if (settled) {
        return settled;
      }
      url.pathname = sales.internal;
      return NextResponse.rewrite(url);
    }
    const account = resolveAccountPath(found.lang, pathname);
    if (!account) {
      return (await settleContentPath(request, event, found.lang, pathname)) ?? NextResponse.next();
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

/**
 * A real 404 or 308 for a path below the language that no resolver above
 * took: a blog post, or a CMS page, city or local page (`app/[lang]/[...slug]`).
 * The home page and the legal documents (route handlers, their own 404) pass.
 */
function settleContentPath(request: NextRequest, event: NextFetchEvent, lang: Lang, pathname: string): Promise<NextResponse | null> | null {
  const segments = pathname.split("/").slice(2);
  if (segments.length === 0 || segments[0] === NOT_FOUND_PAGE) {
    return null;
  }
  if (segments.length === 2 && (segments[0] === "dokumenty" || segments[0] === "documents")) {
    return null;
  }
  if (segments.length === 2 && segments[0] === "blog") {
    return settle(request, event, lang, (lookup) => checkBlog(lookup, segments[1]), ([slug]) => path(lang, ["blog", slug]));
  }
  return settle(request, event, lang, (lookup) => checkPage(lookup, segments), (canonical) => path(lang, canonical));
}

/** `app/[lang]/not-found-page`: prerendered as a 404, so a rewrite there answers 404. */
const NOT_FOUND_PAGE = "not-found-page";

/**
 * Asks the route index (`lib/seo/route-index.ts`) before the page renders,
 * where a 404 or a redirect can still set the status: `null` lets the
 * request go on, as it does when the index cannot be read. Not in a content
 * preview: it shows drafts the moment they are saved, and crawlers are kept
 * out of it anyway (`app/robots.ts`).
 */
async function settle(
  request: NextRequest,
  event: NextFetchEvent,
  lang: Lang,
  check: (lookup: RouteLookup) => Verdict,
  href: (segments: string[]) => string,
): Promise<NextResponse | null> {
  if (contentPreview()) {
    return null;
  }
  const verdict = await routeLookup(request.nextUrl.origin, lang, check, (promise) => event.waitUntil(promise));
  if (verdict.kind === "ok") {
    return null;
  }
  if (verdict.kind === "redirect") {
    const url = request.nextUrl.clone();
    url.pathname = href(verdict.segments);
    return NextResponse.redirect(url, 308);
  }
  return notFound(request, lang);
}

function notFound(request: NextRequest, lang: Lang): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = `/${lang}/${NOT_FOUND_PAGE}`;
  return NextResponse.rewrite(url);
}

function path(lang: Lang, segments: readonly string[]): string {
  return `/${[lang, ...segments.map(encodeURIComponent)].join("/")}`;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api|.*\\..*).*)",
    // Old car URLs kept the dots of the name (`/pl/flota/nissan-x-trail-7-os.-4431`),
    // which the first pattern skips as files. They redirect to the current slug.
    "/:lang/(flota|fleet|flotte|avtopark)/:slug*",
    // Old monthly-rental and add-on pages also kept dots; `lib/seo/legacy-redirects.ts` sends them on.
    "/:lang/(wynajem-na-miesiace|rent-for-months|dodatki-i-akcesoria|addons-and-accessories)/:slug*",
    "/Standardowe-Warunki-Umowy.pdf",
    "/standardowe-warunki-umowy.pdf",
  ],
};
