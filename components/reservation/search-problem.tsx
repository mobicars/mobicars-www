"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, Search, SearchX } from "lucide-react";

import { EmptyState } from "@/components/reservation/empty-state";
import { issueMessage } from "@/components/reservation/messages";
import { prepareDraft } from "@/components/reservation/picker";
import { compactTrip } from "@/components/reservation/trip";
import { useClientOnlyValue } from "@/components/reservation/use-client-only-value";
import type { Lang } from "@/i18n/config";
import { reservationHref } from "@/i18n/routes";
import type { PickupPlace } from "@/lib/reservation/places";
import {
  bookingInProgressStart,
  searchToQuery,
  validateSearch,
  type SearchDraft,
  type SearchIssue,
} from "@/lib/reservation/search";
import { saveSearchQuery } from "@/lib/reservation/storage";

/**
 * The URL's search cannot be shown, e.g. a pickup that has passed. The widget
 * above already replaces such dates with the next default ones (`prepareDraft`);
 * this offers exactly those, one tap away, so page and widget agree. A search
 * that only lacks a place or date asks to complete it instead.
 */
export function SearchProblem({
  lang,
  draft,
  places,
  issues,
}: {
  lang: Lang;
  draft: SearchDraft;
  places: PickupPlace[];
  issues: SearchIssue[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // The fix depends on the clock, so it is worked out in the browser only.
  const prepared = useClientOnlyValue(() =>
    validateSearch(prepareDraft(draft, places, bookingInProgressStart()), {
      places,
      earliestStart: bookingInProgressStart(),
    }),
  );
  const fixed = prepared?.ok ? prepared.search : null;
  // What is still missing once the widget has filled in its defaults (e.g. only the place).
  const shown = prepared && !prepared.ok ? prepared.issues : issues;
  const incomplete = shown.every((issue) => issue.code === "missing");

  function show() {
    if (!fixed) {
      return;
    }
    const query = searchToQuery(fixed);
    saveSearchQuery(fixed.term, query);
    startTransition(() => router.replace(reservationHref(lang, fixed.term, query), { scroll: false }));
  }

  return (
    <EmptyState icon={incomplete ? Search : SearchX} title={incomplete ? "Uzupełnij wyszukiwanie" : "Brak wyników"}>
      {incomplete ? (
        <p className="text-sm text-muted-dark">Pokażemy dostępne samochody, gdy podasz miejsce i termin wynajmu.</p>
      ) : null}
      <ul className="flex flex-col gap-1 text-sm text-blue-dark/80">
        {shown.map((issue) => (
          <li key={`${issue.field}:${issue.code}`}>{issueMessage(issue)}</li>
        ))}
      </ul>
      {fixed ? (
        <button
          type="button"
          onClick={show}
          disabled={pending}
          className="mt-2 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-medium px-5 py-2 text-sm font-bold text-white transition-colors duration-200 ease-out hover:bg-blue-dark disabled:opacity-70 motion-reduce:transition-none"
        >
          <span>
            Pokaż samochody: <span className="whitespace-nowrap">{compactTrip(fixed, places).dates}</span>
          </span>
          {pending ? (
            <LoaderCircle className="size-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden />
          ) : (
            <ArrowRight className="size-4 shrink-0" aria-hidden />
          )}
        </button>
      ) : incomplete ? null : (
        <p className="text-sm text-muted-dark">Zmień miejsce lub termin u góry strony.</p>
      )}
    </EmptyState>
  );
}
