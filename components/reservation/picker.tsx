"use client";

import { useId, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Dialog, SelectionIndicator, Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { LoaderCircle } from "lucide-react";
import type { ZonedDateTime } from "@internationalized/date";

import type { TermBarProps } from "@/components/reservation/bar-field";
import { DialogActions, DialogHeader, WidgetModal } from "@/components/reservation/dialog-parts";
import { LongTermBar } from "@/components/reservation/long-term-bar";
import {
  defaultShortTermSchedule,
  earliestPickup,
  formatSchedulePoint,
  pointFromValue,
  valueFromPoint,
} from "@/components/reservation/schedule";
import { ShortTermBar } from "@/components/reservation/short-term-bar";
import { StickySearch } from "@/components/reservation/sticky-search";
import { issueMessage } from "@/components/reservation/messages";
import { useClientOnlyValue } from "@/components/reservation/use-client-only-value";
import type { Lang } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import type { Messages } from "@/i18n/messages";
import { useMessages } from "@/i18n/messages-context";
import { reservationHref } from "@/i18n/routes";
import { reservationConfig } from "@/lib/reservation/config";
import { withPagePickup, type PickupPlace } from "@/lib/reservation/places";
import {
  QUERY_KEYS,
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
  /** Tab shown first when there is no saved search; both stay offered. Ignored with `term`. */
  defaultTerm?: ReservationTerm;
  /** Search read from the URL. Wins over the copy saved in the browser. */
  initial?: SearchDraft | null;
  /**
   * Reservation pages: every valid change reloads the results at once, keeping
   * the chosen car, protection and layout. "Szukaj" then asks before starting
   * over from the car list.
   */
  live?: boolean;
  /**
   * Car offer id (`offerId` of a fleet car). A normal search then opens the
   * booking on the protection step for this car (`offer=<id>&step=protection`),
   * e.g. from a car's page. Ignored with `live`, where the URL's own choice is kept.
   */
  offerId?: number;
  /** Hero search: on phones, a pinned bar with the place, dates and "Pokaż auta" once the form scrolls away. */
  sticky?: boolean;
  /** RentCarSoft point a city or local page starts from (`withPagePickup`). */
  defaultPickupId?: number | null;
};

/** Booking choices a live change carries over; a confirmed new search keeps only `KEPT_ON_RESTART`. */
const KEPT_ON_CHANGE = [
  QUERY_KEYS.offer,
  QUERY_KEYS.step,
  QUERY_KEYS.protection,
  QUERY_KEYS.zone,
  QUERY_KEYS.extras,
  QUERY_KEYS.accessories,
  QUERY_KEYS.view,
  QUERY_KEYS.promo,
];
/** A new search starts the booking over, but the layout and a discount code stay. */
const KEPT_ON_RESTART = [QUERY_KEYS.view, QUERY_KEYS.promo];

const tabClassName =
  "relative flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-full px-3 text-xs font-bold tracking-wide text-blue-dark/65 outline-none hover:bg-muted-light data-selected:text-white data-selected:hover:bg-transparent data-focus-visible:ring-2 data-focus-visible:ring-blue-dark data-focus-visible:ring-offset-2 data-focus-visible:ring-offset-white @5xl:flex-none @5xl:px-6";

/** The selected tab's background. No transition: the switch is instant, on or off. */
const indicatorClassName = "pointer-events-none absolute top-0 left-0 z-0 h-full w-full rounded-full bg-blue-medium";

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
  defaultTerm,
  initial = null,
  live = false,
  offerId,
  sticky = false,
  defaultPickupId = null,
}: ReservationPickerProps) {
  const firstTerm = lockedTerm ?? defaultTerm;
  const router = useRouter();
  const messages = useMessages();
  const texts = messages.search;
  const [updating, startUpdate] = useTransition();
  const [restartOpen, setRestartOpen] = useState(false);
  const [edits, setEdits] = useState<Partial<SearchDraft>>({});
  const [invalid, setInvalid] = useState<ReadonlySet<SearchField>>(() => new Set());
  // The last "Szukaj"'s problems; one disappears once its field is changed (`invalid`).
  const [issues, setIssues] = useState<SearchIssue[]>([]);
  const errorId = useId();
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const fields = useRef<Partial<Record<SearchField, HTMLButtonElement | null>>>({});
  const prepared = useClientOnlyValue(() =>
    prepareDraft(
      withPagePickup(initial ?? loadSearchDraft() ?? emptyDraft(firstTerm), defaultPickupId, places),
      places,
      // On the reservation page the dates are the URL's, also a pickup that has
      // passed: the page asks for a new time (`PickupTimeGuard`), never silently.
      live ? null : earliestPickup(),
    ),
  );
  const draft: SearchDraft = {
    // The server's HTML already shows the page's point, so nothing jumps once the saved search is read.
    ...(prepared ?? initial ?? withPagePickup(emptyDraft(firstTerm), defaultPickupId, places)),
    ...edits,
    ...(lockedTerm ? { term: lockedTerm } : {}),
  };

  function change(patch: Partial<SearchDraft>) {
    setEdits((current) => ({ ...current, ...patch }));
    if (live) {
      // Half-done edits (e.g. "Inne miejsce zwrotu" before the place) wait for the rest.
      // So does any change while the pickup is too close or past: the page asks for a
      // new time first (`PickupTimeGuard`). A time picked in the dialog respects the lead time.
      const result = validateSearch({ ...draft, ...patch }, { places, earliestStart: earliestPickup() });
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
      setIssues(result.issues);
      fields.current[result.issues[0].field]?.focus();
      return;
    }
    setInvalid(new Set());
    setIssues([]);
    if (live) {
      setRestartOpen(true);
      return;
    }
    router.push(searchHref(result.search, [], offerId));
  }

  /** Confirmed "Szukaj" on a reservation page: same search, back to the car list. */
  function restart() {
    const result = validateSearch(draft, { places, earliestStart: earliestPickup() });
    setRestartOpen(false);
    if (result.ok) {
      router.push(searchHref(result.search, KEPT_ON_RESTART));
    }
  }

  /**
   * Saves the search and builds its page URL, carrying `keep` over from the
   * current one. `offer` preselects a car; it is not saved with the search.
   */
  function searchHref(search: ReservationSearch, keep: readonly string[], offer?: number): string {
    const query = searchToQuery(search);
    saveSearchQuery(search.term, query);
    if (offer !== undefined) {
      // Straight to protection for that car; if the dates rule it out, the
      // page falls back to the car list with a note.
      query.set(QUERY_KEYS.offer, String(offer));
      query.set(QUERY_KEYS.step, "protection");
    }
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
    <form ref={formRef} id={formId} noValidate onSubmit={submit} className={`@container min-w-0 ${shell}`}>
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
            aria-label={texts.termLabel}
            className="flex w-full rounded-full bg-white p-1 @5xl:inline-flex @5xl:w-fit"
          >
            <Tab id="short" className={tabClassName}>
              <span className="relative z-10">{texts.tabShort}</span>
              <SelectionIndicator className={indicatorClassName} />
            </Tab>
            <Tab id="long" className={tabClassName}>
              <span className="relative z-10">{texts.tabLong}</span>
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
      <SearchErrors id={errorId} messages={messages} issues={issues.filter((issue) => invalid.has(issue.field))} />
      {live ? (
        <p aria-live="polite" className="mt-2 flex h-5 items-center gap-1.5 text-xs text-white/85">
          {updating ? (
            <>
              <LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden />
              {texts.updating}
            </>
          ) : null}
        </p>
      ) : null}
      {live ? <RestartDialog open={restartOpen} onOpenChange={setRestartOpen} onConfirm={restart} /> : null}
      {sticky && !live ? (
        <StickySearch
          form={formRef}
          formId={formId}
          place={stickyPlace(draft, places, texts.placeTitle.pickupAndReturn)}
          dates={stickyDates(lang, draft, texts.fromDate) ?? texts.chooseDate}
          onEdit={() => {
            formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            fields.current.pickup?.focus({ preventScroll: true });
          }}
        />
      ) : null}
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
  const texts = useMessages().search;
  return (
    <WidgetModal
      open={open}
      onOpenChange={onOpenChange}
      className="w-[min(28rem,calc(100%-1.5rem))] rounded-card shadow-float"
    >
      <Dialog aria-labelledby={titleId} className="flex flex-col outline-none">
        <DialogHeader titleId={titleId} title={texts.restartTitle} className="pt-4 pb-1" />
        <div className="flex flex-col gap-5 px-5 pb-5">
          <p className="text-center text-sm text-blue-dark/80">{texts.restartText}</p>
          <DialogActions
            cancel={texts.cancel}
            confirm={texts.restartConfirm}
            onCancel={() => onOpenChange(false)}
            onConfirm={onConfirm}
          />
        </div>
      </Dialog>
    </WidgetModal>
  );
}

/**
 * What stops the search, under the form instead of a toast: read out at once
 * (`role="alert"`), next to the fields marked red, and gone field by field as
 * they are fixed. Focus goes to the first wrong field (`submit`).
 */
function SearchErrors({ id, messages, issues }: { id: string; messages: Messages; issues: SearchIssue[] }) {
  if (issues.length === 0) {
    return null;
  }
  const lines = [...new Set(issues.map((issue) => issueMessage(messages, issue)))];
  return (
    <div id={id} role="alert" className="mt-3 rounded-control bg-red-50 px-4 py-3 text-sm text-red-700 shadow-card">
      {lines.length === 1 ? (
        <p>{lines[0]}</p>
      ) : (
        <>
          <p className="font-semibold">{messages.search.completeSearch}</p>
          <ul className="mt-1 list-disc pl-5">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/** The pinned bar's place: the chosen point (or own address), else the field's name. */
function stickyPlace(draft: SearchDraft, places: PickupPlace[], empty: string): string {
  if (!draft.pickup) {
    return empty;
  }
  return draft.pickup.address ?? places.find((place) => place.id === draft.pickup?.id)?.name ?? empty;
}

/** The pinned bar's dates: "14 lis, 10:00 – 17 lis, 10:00", or "od 14 lis, 10:00" by the month. */
function stickyDates(lang: Lang, draft: SearchDraft, fromDate: string): string | null {
  const start = pointFromValue(draft.start);
  if (!start) {
    return null;
  }
  if (draft.term === "long") {
    return fill(fromDate, { date: formatSchedulePoint(lang, start) });
  }
  const end = pointFromValue(draft.end);
  return end ? `${formatSchedulePoint(lang, start)} – ${formatSchedulePoint(lang, end)}` : formatSchedulePoint(lang, start);
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
 * before `earliest` (unless it is `null`) is replaced by the default schedule,
 * and a missing return date follows the pickup by `defaultRentalDays`. The
 * results page offers the same dates for a search it cannot show
 * (`SearchProblem`), so the page and the widget never disagree.
 */
export function prepareDraft(draft: SearchDraft, places: PickupPlace[], earliest: ZonedDateTime | null): SearchDraft {
  const known = (ref: SearchDraft["pickup"]) =>
    ref && places.some((place) => place.id === ref.id) ? ref : null;
  const next: SearchDraft = { ...draft, pickup: known(draft.pickup), dropoff: known(draft.dropoff) };

  const start = next.start ? toZonedDateTime(next.start) : null;
  if (!start || (earliest && start.compare(earliest) < 0)) {
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
