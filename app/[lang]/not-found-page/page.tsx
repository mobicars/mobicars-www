import { notFound } from "next/navigation";

/**
 * Where `proxy.ts` rewrites a path that does not exist (`lib/seo/route-index.ts`).
 * `notFound()` runs while the route is prerendered, before any response, so
 * the build stores it as a 404 and every rewrite here answers with that
 * status and `not-found.tsx` (the CMS `404` page). A lookup inside a page
 * runs after the static shell went out with a 200, which is why the proxy
 * decides instead.
 */
export default function NotFoundPage(): never {
  notFound();
}
