import type { TypedDocumentString } from "../generated/graphql";
import { strapiKey, strapiUrl } from "./config";
import { StrapiError } from "./errors";

const TIMEOUT_MS = 10_000;

/**
 * The only place that talks to Strapi. The document carries its result and
 * variable types (`codegen.ts`). `fetch` is `no-store`: the cached functions in
 * `modules/` are the cache (`use cache`), as in the RentCarSoft bridge.
 */
export async function strapiRequest<R, V>(document: TypedDocumentString<R, V>, variables: V): Promise<R> {
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
