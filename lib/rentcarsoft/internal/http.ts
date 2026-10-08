import { getRentCarSoftConfig, type RentCarSoftConfig } from "./config";
import { RentCarSoftError } from "./errors";
import { serializeQuery, type QueryValue } from "./query";

const DEFAULT_TIMEOUT_MS = 15_000;

export type RentCarSoftMethod = "GET" | "POST" | "PUT" | "DELETE";

export type RentCarSoftRequest = {
  method?: RentCarSoftMethod;
  path: string;
  query?: Record<string, QueryValue>;
  body?: unknown;
  timeoutMs?: number;
  config?: RentCarSoftConfig;
  fetchImpl?: typeof fetch;
};

export async function rentCarSoftRequest(
  request: RentCarSoftRequest,
): Promise<unknown> {
  const config = request.config ?? getRentCarSoftConfig();
  const fetchImpl = request.fetchImpl ?? fetch;
  const method = request.method ?? "GET";
  const path = request.path.startsWith("/") ? request.path : `/${request.path}`;
  const query = serializeQuery(request.query);
  const url = `${config.baseUrl}${path}?${query}`;
  const headers = new Headers({
    Accept: "application/json",
    Authorization: `Bearer ${config.apiKey}`,
  });

  let body: string | undefined;
  if (request.body !== undefined) {
    body = JSON.stringify(request.body);
    headers.set("Content-Type", "application/json");
  }

  const timeoutMs = request.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  let response: Response;
  try {
    response = await fetchImpl(url, {
      method,
      headers,
      body,
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
  } catch (error) {
    if (isTimeout(error)) {
      throw new RentCarSoftError("timeout");
    }
    throw new RentCarSoftError("network");
  }

  const text = await response.text();
  if (response.status === 401) {
    throw new RentCarSoftError("unauthorized", response.status);
  }
  if (response.status === 400) {
    throw new RentCarSoftError("invalid_request", response.status);
  }
  if (response.status === 404) {
    throw new RentCarSoftError("not_found", response.status);
  }
  if (response.status >= 500) {
    throw new RentCarSoftError("api", response.status);
  }
  if (response.status === 204 || response.status === 205) {
    return undefined;
  }
  if (!response.ok) {
    throw new RentCarSoftError("api", response.status);
  }

  return parseJsonBody(text);
}

function parseJsonBody(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed || looksLikeJwt(trimmed)) {
    throw new RentCarSoftError("malformed_response");
  }
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    throw new RentCarSoftError("malformed_response");
  }
}

function looksLikeJwt(value: string): boolean {
  const parts = value.split(".");
  return parts.length === 3 && value.startsWith("eyJ") && parts.every(Boolean);
}

function isTimeout(error: unknown): boolean {
  return (
    (error instanceof Error && error.name === "TimeoutError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}
