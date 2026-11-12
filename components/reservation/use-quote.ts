"use client";

import { useEffect, useState } from "react";

import type { QuoteView } from "@/lib/reservation/quote";

export type QuoteState = {
  /** The quote for `request`, or the last one while a newer one loads. */
  quote: QuoteView | null;
  loading: boolean;
  failed: boolean;
  /** The endpoint's error code, e.g. `invalid_search` when the pickup time has passed. */
  error: string | null;
  /** Asks again for the same request. */
  retry: () => void;
};

type Loaded = { key: string; quote: QuoteView | null; error: string | null };

/** Pause before the one automatic retry after a network or server error. */
const RETRY_DELAY_MS = 800;

/**
 * Fetches `GET /api/reservation/quote?{request}` whenever `request` changes.
 * `initial` is the quote the server rendered for its request, so the first
 * paint needs no fetch; if that one failed, the browser asks again itself.
 * A newer request aborts an older one. A network or 5xx error is retried
 * once (a quote is a read); `retry` asks again on demand.
 */
export function useQuote(
  request: string | null,
  initial: { request: string; quote: QuoteView | null } | null,
): QuoteState {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [shown, setShown] = useState<QuoteView | null>(initial?.quote ?? null);

  const key = request === null ? null : `${request}#${attempt}`;
  const fromServer =
    request !== null && attempt === 0 && request === initial?.request && initial.quote !== null;
  const current = fromServer
    ? { key, quote: initial.quote, error: null }
    : loaded?.key === key
      ? loaded
      : null;

  useEffect(() => {
    if (key === null || request === null || fromServer) {
      return;
    }
    const controller = new AbortController();
    load(request, controller.signal).then((result) => {
      if (!result) {
        return;
      }
      setLoaded({ key, ...result });
      if (result.quote) {
        setShown(result.quote);
      }
    });
    return () => controller.abort();
  }, [key, request, fromServer]);

  const retry = () => setAttempt((value) => value + 1);
  if (request === null) {
    return { quote: null, loading: false, failed: false, error: null, retry };
  }
  if (current) {
    return {
      quote: current.quote,
      loading: false,
      failed: current.error !== null,
      error: current.error,
      retry,
    };
  }
  // Still loading: keep the last quote for the panel's placeholders.
  return { quote: shown, loading: true, failed: false, error: null, retry };
}

/** One request with one retry on network or server errors. `null` when aborted. */
async function load(
  request: string,
  signal: AbortSignal,
): Promise<{ quote: QuoteView | null; error: string | null } | null> {
  for (let tries = 0; tries < 2; tries += 1) {
    try {
      const response = await fetch(`/api/reservation/quote?${request}`, { signal, cache: "no-store" });
      if (response.ok) {
        return { quote: (await response.json()) as QuoteView, error: null };
      }
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (response.status < 500) {
        // A bad request does not get better by asking again.
        return { quote: null, error: body?.error ?? "invalid_request" };
      }
    } catch {
      if (signal.aborted) {
        return null;
      }
    }
    if (tries === 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      if (signal.aborted) {
        return null;
      }
    }
  }
  return { quote: null, error: "api" };
}
