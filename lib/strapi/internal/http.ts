import type { TypedDocumentString } from "../generated/graphql";
import { strapiKey, strapiUrl } from "./config";
import { StrapiError } from "./errors";

const TIMEOUT_MS = 10_000;

/** Waits before the 2nd and 3rd attempt. */
export const RETRY_DELAYS_MS: readonly number[] = [500, 1500];

/**
 * A failure worth one more try: the connection dropped, Strapi answered 5xx or
 * 429 (a restart, a deploy, a busy moment). A timeout only while building:
 * at request time it would hold the page for another 10 s. A rejected token, a
 * bad query or an unreadable answer would fail the same way again.
 */
export function isTransient(error: unknown, building: boolean): boolean {
  if (!(error instanceof StrapiError)) {
    return false;
  }
  if (error.code === "network") {
    return true;
  }
  if (error.code === "timeout") {
    return building;
  }
  return error.code === "api" && error.status !== undefined && (error.status >= 500 || error.status === 429);
}

/** Runs `attempt`, again after each delay while the error is `retryable`; the last error is thrown. */
export async function withRetry<T>(
  attempt: () => Promise<T>,
  retryable: (error: unknown) => boolean,
  delays: readonly number[] = RETRY_DELAYS_MS,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
): Promise<T> {
  for (let tries = 0; ; tries++) {
    try {
      return await attempt();
    } catch (error) {
      if (tries >= delays.length || !retryable(error)) {
        throw error;
      }
      console.warn(`[strapi] ${(error as StrapiError).code}, retry ${tries + 1}/${delays.length} in ${delays[tries]} ms`);
      await sleep(delays[tries]);
    }
  }
}

/**
 * The only place that talks to Strapi. The document carries its result and
 * variable types (`codegen.ts`). `fetch` is `no-store`: the cached functions in
 * `modules/` are the cache (`use cache`), as in the RentCarSoft bridge.
 *
 * A transient failure is retried twice (`RETRY_DELAYS_MS`), then thrown: a
 * build (the sitemap, the route lists) fails rather than publish a partial list.
 */
export function strapiRequest<R, V>(document: TypedDocumentString<R, V>, variables: V): Promise<R> {
  const building = process.env.NEXT_PHASE === "phase-production-build";
  return withRetry(() => requestOnce(document, variables), (error) => isTransient(error, building));
}

async function requestOnce<R, V>(document: TypedDocumentString<R, V>, variables: V): Promise<R> {
  const key = strapiKey();
  let response: Response;
  try {
    response = await fetch(`${strapiUrl()}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
      },
      body: JSON.stringify({ query: document.toString(), variables }),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw new StrapiError(error instanceof DOMException && error.name === "TimeoutError" ? "timeout" : "network");
  }

  if (response.status === 401 || response.status === 403) {
    throw new StrapiError("unauthorized", response.status);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new StrapiError("malformed_response", response.status);
  }
  if (!body || typeof body !== "object") {
    throw new StrapiError("malformed_response", response.status);
  }
  const { data, errors } = body as { data?: unknown; errors?: unknown };
  if (Array.isArray(errors) && errors.length > 0) {
    if (process.env.NODE_ENV !== "production") {
      // Which field failed (`page.blocks.0.heroLayout`): a schema and query mismatch shows here.
      // Messages and paths only; no variables, token or data.
      for (const error of errors as { message?: unknown; path?: unknown }[]) {
        console.error(`[strapi] GraphQL: ${String(error?.message)} at ${Array.isArray(error?.path) ? error.path.join(".") : "?"}`);
      }
    }
    throw new StrapiError("graphql", response.status);
  }
  if (!response.ok) {
    throw new StrapiError("api", response.status);
  }
  if (!data || typeof data !== "object") {
    throw new StrapiError("malformed_response", response.status);
  }
  return data as R;
}
