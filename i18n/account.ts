import { useMemo } from "react";

import type { Lang } from "./config";
import { fill } from "./fill";
import { useLang } from "./lang-context";
import type { Messages } from "./messages";
import { useMessages } from "./messages-context";
import { plural } from "./plural";

export type AccountCopy = {
  login: {
    title: string;
    intro: string;
    email: string;
    password: string;
    showPassword: string;
    hidePassword: string;
    submit: string;
    submitting: string;
    errors: {
      invalid: string;
      reset_pending: string;
      banned: string;
      rate_limited: string;
      unavailable: string;
    };
  };
  nav: {
    label: string;
    overview: string;
    reservations: string;
    details: string;
    security: string;
    newReservation: string;
    backHome: string;
    logout: string;
  };
  overview: {
    title: string;
    intro: string;
    greeting: (name: string | null) => string;
    details: string;
    editDetails: string;
    clientNumber: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    lastLogin: string;
    nextReservation: string;
    currentReservation: string;
    noUpcoming: string;
    bookCar: string;
    toPay: string;
    nothingToPay: string;
    toPayCount: (count: number) => string;
    allReservations: string;
  };
  reservations: {
    title: string;
    intro: string;
    upcoming: string;
    history: string;
    emptyUpcoming: string;
    emptyHistory: string;
    details: string;
    back: string;
    number: string;
    createdAt: string;
    pickUp: string;
    return: string;
    pickupCode: string;
    car: string;
    carFallback: string;
    longTerm: string;
    payment: string;
    amountDue: string;
    totalPaid: string;
    remainingToPay: string;
    deposit: string;
    paid: string;
    unpaid: string;
    mileage: string;
    mileageUnlimited: string;
    mileageLimit: (daily: string | null, total: string | null) => string;
    extraKm: string;
    extras: string;
    comment: string;
    manager: string;
    notFoundTitle: string;
    notFoundText: string;
  };
  loading: string;
};

/** Panel texts from `messages/{lang}.json` (`account`), with the placeholders turned into functions. */
export function accountCopyOf(lang: Lang, { account }: Messages): AccountCopy {
  const { greeting, greetingAnonymous, toPayCount, ...overview } = account.overview;
  const { mileagePerDay, mileageTotal, ...reservations } = account.reservations;
  return {
    ...account,
    overview: {
      ...overview,
      greeting: (name) => (name ? fill(greeting, { name }) : greetingAnonymous),
      toPayCount: (count) => fill(plural(lang, count, toPayCount), { count }),
    },
    reservations: {
      ...reservations,
      mileageLimit: (daily, total) =>
        [daily ? fill(mileagePerDay, { value: daily }) : null, total ? fill(mileageTotal, { value: total }) : null]
          .filter(Boolean)
          .join(", "),
    },
  };
}

/** For client components: built from the page language's messages only. */
export function useAccountCopy(): AccountCopy {
  const lang = useLang();
  const messages = useMessages();
  return useMemo(() => accountCopyOf(lang, messages), [lang, messages]);
}
