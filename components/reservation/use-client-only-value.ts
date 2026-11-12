"use client";

import { useRef, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Runs `compute` once on the client after hydration. On the server, and during
 * hydration, the value is null, so time- or storage-based values cannot mismatch.
 */
export function useClientOnlyValue<T>(compute: () => T | null): T | null {
  const cache = useRef<{ ready: boolean; value: T | null }>({ ready: false, value: null });
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      if (!cache.current.ready) {
        cache.current = { ready: true, value: compute() };
      }
      return cache.current.value;
    },
    () => null,
  );
}
