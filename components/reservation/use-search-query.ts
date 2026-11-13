"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { QUERY_KEYS } from "@/lib/reservation/search";

/**
 * The step's search query with the discount code as the URL has it now. The
 * code changes with `replaceParam`, not a navigation, so only the quotes that
 * depend on it run again (as on the old site), not the whole page.
 */
export function useLiveSearchQuery(serverQuery: string): string {
  const promo = useSearchParams().get(QUERY_KEYS.promo);
  return useMemo(() => {
    const query = new URLSearchParams(serverQuery);
    if (promo) {
      query.set(QUERY_KEYS.promo, promo);
    } else {
      query.delete(QUERY_KEYS.promo);
    }
    return query.toString();
  }, [serverQuery, promo]);
}
