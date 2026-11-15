import type { Lang } from "./config";
import { getMessages, type Messages } from "./messages";

/**
 * The message namespaces each part of the site sends to the browser, so a page
 * does not carry every text of its language in its RSC payload (all of
 * `pl.json` was about 33 KB on every page).
 *
 * - `base`: every page (`app/[lang]/layout.tsx`): header and menus, the search
 *   widget with its dialogs, the "finish your booking" popup.
 * - `reservation`: added by `app/[lang]/reservation/layout.tsx` for the
 *   booking steps.
 * - `account`: added by `app/[lang]/account/layout.tsx` for the panel and the
 *   sign-in forms.
 *
 * `MessagesProvider` merges a nested scope into its parent's. Server
 * components keep using `getMessages` and see every namespace.
 * `client-messages.test.ts` walks the import graph from every route and fails
 * when a client component reads a namespace its route does not send: add the
 * namespace here when that test says so.
 */
export const CLIENT_MESSAGE_SCOPES = {
  base: ["layout", "search", "dates", "blocks", "booking", "steps", "upsell"],
  reservation: ["cars", "protection", "extras", "summary", "quoteLines", "promo", "details", "account", "auth"],
  account: ["account", "accountDetails", "auth"],
} as const satisfies Record<string, readonly (keyof Messages)[]>;

export type ClientMessageScope = keyof typeof CLIENT_MESSAGE_SCOPES;

/**
 * The namespaces of one scope for `MessagesProvider`. Typed as `Messages`:
 * client code reads the namespaces its route sends, which the test enforces.
 */
export function clientMessages(lang: Lang, scope: ClientMessageScope): Messages {
  const all = getMessages(lang);
  return Object.fromEntries(CLIENT_MESSAGE_SCOPES[scope].map((key) => [key, all[key]])) as unknown as Messages;
}
