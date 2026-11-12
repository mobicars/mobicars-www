"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BadgePercent, LoaderCircle, X } from "lucide-react";

import { currentHrefWith } from "@/components/reservation/url";
import { buttonClass } from "@/components/ui/button";
import { useMessages } from "@/i18n/messages-context";
import { QUERY_KEYS } from "@/lib/reservation/search";

/**
 * "Masz kod rabatowy?" in the booking summary, like the old site's coupon box.
 * A code is checked with `GET /api/reservation/promo` for the pickup date and
 * then put in the URL (`promo=`). The page re-renders with it, so every quote
 * and the reservation itself carry the code; the discount shows in the
 * prices RentCarSoft returns, nothing is subtracted here.
 */
export function PromoCode({ searchQuery }: { searchQuery: string }) {
  const t = useMessages().promo;
  const router = useRouter();
  const query = new URLSearchParams(searchQuery);
  const applied = query.get(QUERY_KEYS.promo);
  const start = query.get(QUERY_KEYS.start);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [navigating, startNavigation] = useTransition();

  function go(promo: string | null) {
    startNavigation(() => router.replace(currentHrefWith({ [QUERY_KEYS.promo]: promo }), { scroll: false }));
  }

  // A code that came with the link (or a changed pickup date) is checked once
  // more: an invalid one leaves the URL with a message instead of looking applied.
  useEffect(() => {
    if (!applied || !start) {
      return;
    }
    const controller = new AbortController();
    check(applied, start, controller.signal).then((result) => {
      if (result === "invalid") {
        setError(t.invalid);
        setOpen(true);
        startNavigation(() => router.replace(currentHrefWith({ [QUERY_KEYS.promo]: null }), { scroll: false }));
      }
    });
    return () => controller.abort();
  }, [applied, start, router, t.invalid]);

  async function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const typed = code.trim().toUpperCase();
    if (!typed || !start) {
      return;
    }
    setChecking(true);
    setError(null);
    const result = await check(typed, start);
    setChecking(false);
    if (result === "valid") {
      setOpen(false);
      setCode("");
      go(typed);
    } else {
      setError(result === "rate_limited" ? t.rateLimited : result === "failed" ? t.failed : t.invalid);
    }
  }

  if (applied) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-green-medium bg-green-light/50 px-3 py-2">
          <span className="flex min-w-0 items-center gap-2 text-sm text-green-dark">
            <BadgePercent className="size-4 shrink-0" aria-hidden />
            <span className="min-w-0">
              <span className="sr-only">{t.applied}: </span>
              <span className="font-bold tracking-wide break-all">{applied}</span>
            </span>
          </span>
          <button
            type="button"
            onClick={() => go(null)}
            disabled={navigating}
            className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            {navigating ? (
              <LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden />
            ) : (
              <X className="size-3.5" aria-hidden />
            )}
            {t.remove}
          </button>
        </div>
        <p className="text-xxs text-muted-dark">{t.note}</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex cursor-pointer items-center gap-2 self-start text-sm font-semibold text-blue-medium underline-offset-2 hover:underline"
      >
        <BadgePercent className="size-4" aria-hidden />
        {t.question}
      </button>
    );
  }

  return (
    <form onSubmit={apply} className="flex flex-col gap-2">
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-blue-dark">
        {t.question}
        <span className="flex gap-2">
          <input
            name="promo"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setError(null);
            }}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={40}
            placeholder={t.placeholder}
            aria-invalid={error ? true : undefined}
            className="h-12 min-w-0 flex-1 rounded-xl border border-dashed border-blue-medium/40 bg-white px-3 font-normal tracking-wide text-ink uppercase outline-none focus:border-blue-medium focus:ring-2 focus:ring-blue-light aria-invalid:border-red-500"
          />
          <button type="submit" disabled={checking || !code.trim()} className={buttonClass("primary")}>
            {checking ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : null}
            {checking ? t.checking : t.apply}
          </button>
        </span>
      </label>
      {error ? (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </form>
  );
}

type CheckResult = "valid" | "invalid" | "rate_limited" | "failed" | "aborted";

/** `GET /api/reservation/promo` for a code and a pickup (`YYYY-MM-DDTHH:mm`). */
async function check(code: string, start: string, signal?: AbortSignal): Promise<CheckResult> {
  try {
    const response = await fetch(`/api/reservation/promo?${new URLSearchParams({ code, from: start })}`, {
      cache: "no-store",
      signal,
    });
    if (response.status === 429) {
      return "rate_limited";
    }
    if (response.status === 400) {
      return "invalid";
    }
    if (!response.ok) {
      return "failed";
    }
    const body = (await response.json()) as { valid?: boolean };
    return body.valid ? "valid" : "invalid";
  } catch {
    return signal?.aborted ? "aborted" : "failed";
  }
}
