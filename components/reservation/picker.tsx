"use client";

import { useId, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Dialog, SelectionIndicator, Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import type { ZonedDateTime } from "@internationalized/date";

import type { TermBarProps } from "@/components/reservation/bar-field";
import { DialogHeader, WidgetModal } from "@/components/reservation/dialog-parts";
import { LongTermBar } from "@/components/reservation/long-term-bar";
import {
  defaultShortTermSchedule,
  earliestPickup,
  pointFromValue,
  valueFromPoint,
} from "@/components/reservation/schedule";
import { ShortTermBar } from "@/components/reservation/short-term-bar";
import { issueMessage } from "@/components/reservation/messages";
import { useClientOnlyValue } from "@/components/reservation/use-client-only-value";
import type { Lang } from "@/i18n/config";
import { reservationHref } from "@/i18n/routes";
import { reservationConfig } from "@/lib/reservation/config";
import type { PickupPlace } from "@/lib/reservation/places";
import {
  QUERY_KEYS,
  bookingInProgressStart,
  emptyDraft,
  searchToQuery,
  toZonedDateTime,
  validateSearch,
  type ReservationSearch,
  type ReservationTerm,
  type SearchDraft,
  type SearchField,
  type SearchIssue,
} from "@/lib/reservation/search";
import { loadSearchDraft, saveSearchQuery } from "@/lib/reservation/storage";

export type ReservationPickerLayout = "vertical" | "horizontal";

type ReservationPickerProps = {
  lang: Lang;
  places: PickupPlace[];
  layout?: ReservationPickerLayout;
  /** Shows one bar without the switch. Without it both terms are offered. */
  term?: ReservationTerm;
  /** Search read from the URL. Wins over the copy saved in the browser. */
  initial?: SearchDraft | null;
  /**
   * Reservation pages: every valid change reloads the results at once, keeping
   * the chosen car, protection and layout. "Szukaj" then asks before starting
   * over from the car list.
   */
  live?: boolean;
};

/** Booking choices a live change carries over; a confirmed new search drops all but `view`. */
const KEPT_ON_CHANGE = [
  QUERY_KEYS.offer,
  QUERY_KEYS.step,
  QUERY_KEYS.protection,
  QUERY_KEYS.zone,
  QUERY_KEYS.extras,
  QUERY_KEYS.accessories,
  QUERY_KEYS.view,
];
const KEPT_ON_RESTART = [QUERY_KEYS.view];

const tabClassName =
  "relative flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-full px-3 text-xs font-bold tracking-wide text-blue-dark/65 outline-none transition-colors duration-200 ease-out hover:bg-muted-light data-selected:text-white data-selected:hover:bg-transparent data-focus-visible:ring-2 data-focus-visible:ring-blue-medium data-focus-visible:ring-inset motion-reduce:transition-none @5xl:flex-none @5xl:px-6";

const indicatorClassName =
  "pointer-events-none absolute top-0 left-0 z-0 h-full w-full rounded-full bg-blue-medium transition-[translate,width,height] duration-200 ease-out motion-reduce:transition-none";

/**
 * The search widget. It owns one draft for both terms, so switching the tab
 * keeps the place and pickup date. On submit it validates, remembers the
 * search in the browser and opens the reservation page with it in the URL.
 * With `live` (reservation pages) changes apply without submitting.
 */
export function ReservationPicker({
  lang,
  places,
  layout = "vertical",
  term: lockedTerm,
  initial = null,
  live = false,
}: ReservationPickerProps) {
  const router = useRouter();
  const [updating, startUpdate] = useTransition();
  const [restartOpen, setRestartOpen] = useState(false);
  const [edits, setEdits] = useState<Partial<SearchDraft>>({});
  const [invalid, setInvalid] = useState<ReadonlySet<SearchField>>(() => new Set());
  const fields = useRef<Partial<Record<SearchField, HTMLButtonElement | null>>>({});
  const prepared = useClientOnlyValue(() =>
    prepareDraft(
      initial ?? loadSearchDraft() ?? emptyDraft(lockedTerm),
      places,
      // On the reservation page the URL's booking is in progress: keep its dates.
      live ? bookingInProgressStart() : earliestPickup(),
    ),
  );
  const draft: SearchDraft = {
    ...(prepared ?? initial ?? emptyDraft(lockedTerm)),
    ...edits,
    ...(lockedTerm ? { term: lockedTerm } : {}),
  };

  function change(patch: Partial<SearchDraft>) {
    setEdits((current) => ({ ...current, ...patch }));
    if (live) {
      // Half-done edits (e.g. "Inne miejsce zwrotu" before the place) wait for the rest.
      // A change without "Szukaj" keeps the booking going: the pickup minute may have
      // passed meanwhile. A newly picked time already respects the lead time in the dialog.
      const result = validateSearch({ ...draft, ...patch }, { places, earliestStart: bookingInProgressStart() });
      if (result.ok) {
        startUpdate(() => router.replace(searchHref(result.search, KEPT_ON_CHANGE), { scroll: false }));
      }
    }
    setInvalid((current) => {
      if (current.size === 0) {
        return current;
      }
      const next = new Set(current);
      for (const field of touchedFields(patch)) {
        next.delete(field);
      }
      return next;
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateSearch(draft, { places, earliestStart: earliestPickup() });
    if (!result.ok) {
      setInvalid(new Set(result.issues.map((issue) => issue.field)));
      showIssues(result.issues);
      fields.current[result.issues[0].field]?.focus();
      return;
    }
    setInvalid(new Set());
    toast.dismiss(TOAST_ID);
    if (live) {
      setRestartOpen(true);
      return;
    }
    router.push(searchHref(result.search, []));
  }

  /** Confirmed "Szukaj" on a reservation page: same search, back to the car list. */
  function restart() {
    const result = validateSearch(draft, { places, earliestStart: earliestPickup() });
    setRestartOpen(false);
    if (result.ok) {
      router.push(searchHref(result.search, KEPT_ON_RESTART));
    }
  }

  /** Saves the search and builds its page URL, carrying `keep` over from the current one. */
  function searchHref(search: ReservationSearch, keep: readonly string[]): string {
    const query = searchToQuery(search);
    saveSearchQuery(search.term, query);
    const current = new URL(window.location.href).searchParams;
    for (const key of keep) {
      const value = current.get(key);
      if (value !== null) {
        query.set(key, value);
      }
    }
    return reservationHref(lang, search.term, query);
  }

  const barProps: TermBarProps = {
    places,
    draft,
    onChange: change,
    invalid,
    fieldRef: (field) => (element) => {
      fields.current[field] = element;
    },
  };
  const shell = layout === "horizontal" ? "w-full" : "mx-auto w-full max-w-[28rem]";

  return (
    <form noValidate onSubmit={submit} className={`@container min-w-0 ${shell}`}>
      {lockedTerm ? (
        lockedTerm === "short" ? (
          <ShortTermBar {...barProps} />
        ) : (
          <LongTermBar {...barProps} />
        )
      ) : (
        <Tabs
          selectedKey={draft.term}
          onSelectionChange={(key) => {
            change({ term: key === "long" ? "long" : "short" });
            setInvalid(new Set());
          }}
          className="flex w-full min-w-0 flex-col gap-3 outline-none"
        >
          <TabList
            aria-label="Rodzaj wynajmu"
            className="flex w-full rounded-full bg-white p-1 @5xl:inline-flex @5xl:w-fit"
          >
            <Tab id="short" className={tabClassName}>
              <span className="relative z-10">NA DNI</span>
              <SelectionIndicator className={indicatorClassName} />
            </Tab>
            <Tab id="long" className={tabClassName}>
              <span className="relative z-10">NA MIESIĄCE</span>
              <SelectionIndicator className={indicatorClassName} />
            </Tab>
          </TabList>
          <TabPanel id="short">
            <ShortTermBar {...barProps} />
          </TabPanel>
          <TabPanel id="long">
            <LongTermBar {...barProps} />
          </TabPanel>
        </Tabs>
      )}
      {live ? (
        <p aria-live="polite" className="mt-2 flex h-5 items-center gap-1.5 text-xs text-white/85">
          {updating ? (
            <>
              <LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden />
              Aktualizujemy auta i ceny…
            </>
          ) : null}
        </p>
      ) : null}
      {live ? <RestartDialog open={restartOpen} onOpenChange={setRestartOpen} onConfirm={restart} /> : null}
    </form>
  );
}

function RestartDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  return (
    <WidgetModal
      open={open}
      onOpenChange={onOpenChange}
      className="w-[min(28rem,calc(100%-1.5rem))] rounded-2xl shadow-2xl"
    >
      <Dialog aria-labelledby={titleId} className="flex flex-col outline-none">
        <DialogHeader titleId={titleId} title="Zacząć od nowa?" className="pt-4 pb-1" />
        <div className="flex flex-col gap-5 px-5 pb-5">
          <p className="text-center text-sm text-blue-dark/80">
            Nie musisz klikać „Szukaj”: zmiana miejsca lub terminu od razu aktualizuje auta i ceny,
            a Twój wybór zostaje. „Szukaj” wraca do początku, czyli do wyboru auta.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-12 w-full shrink-0 sm:w-auto sm:flex-1 cursor-pointer rounded-xl border border-blue-dark/15 text-sm font-bold text-blue-dark transition-colors duration-200 ease-out hover:bg-blue-dark/[0.04] motion-reduce:transition-none"
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="h-12 w-full shrink-0 sm:w-auto sm:flex-1 cursor-pointer rounded-xl bg-blue-medium text-sm font-bold text-white transition-colors duration-200 ease-out hover:bg-blue-dark motion-reduce:transition-none"
            >
              Zacznij od wyboru auta
            </button>
          </div>
        </div>
      </Dialog>
    </WidgetModal>
  );
}

const TOAST_ID = "reservation-search";

function showIssues(issues: SearchIssue[]) {
  const messages = issues.map(issueMessage);
  if (messages.length === 1) {
    toast.error(messages[0], { id: TOAST_ID });
    return;
  }
  toast.error("Uzupełnij wyszukiwanie", {
    id: TOAST_ID,
    description: (
      <ul className="list-disc pl-4">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    ),
  });
}

/** Fields whose error a change clears. */
function touchedFields(patch: Partial<SearchDraft>): SearchField[] {
  const touched: SearchField[] = [];
  if ("pickup" in patch) touched.push("pickup");
  if ("dropoff" in patch || "differentReturn" in patch) touched.push("dropoff");
  if ("start" in patch) touched.push("start", "end");
  if ("end" in patch) touched.push("end");
  if ("months" in patch) touched.push("months");
  if ("km" in patch) touched.push("km");
  return touched;
}

/**
 * Makes a restored draft usable now: unknown places are dropped, a pickup
 * before `earliest` is replaced by the default schedule, and a missing return
 * date follows the pickup by `defaultRentalDays`. The results page offers the
 * same dates for a search that went stale (`SearchProblem`), so the page and
 * the widget never disagree.
 */
export function prepareDraft(draft: SearchDraft, places: PickupPlace[], earliest: ZonedDateTime): SearchDraft {
  const known = (ref: SearchDraft["pickup"]) =>
    ref && places.some((place) => place.id === ref.id) ? ref : null;
  const next: SearchDraft = { ...draft, pickup: known(draft.pickup), dropoff: known(draft.dropoff) };

  const start = next.start ? toZonedDateTime(next.start) : null;
  if (!start || start.compare(earliest) < 0) {
    const schedule = defaultShortTermSchedule();
    next.start = schedule ? valueFromPoint(schedule.start, schedule.pickup) : null;
    next.end = schedule ? valueFromPoint(schedule.end, schedule.dropoff) : null;
    return next;
  }

  const end = next.end ? toZonedDateTime(next.end) : null;
  if (!end || end.compare(start) <= 0) {
    const point = pointFromValue(next.start);
    next.end = point
      ? valueFromPoint(point.date.add({ days: Math.max(1, reservationConfig.defaultRentalDays) }), point.time)
      : null;
  }
  return next;
}
