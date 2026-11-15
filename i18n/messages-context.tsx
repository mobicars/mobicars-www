"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { Messages } from "./messages";

const MessagesContext = createContext<Messages | null>(null);

/**
 * Texts of the page language for client components. The `[lang]` layout sets
 * the namespaces every page needs; a nested provider (the reservation and
 * account layouts) adds its own on top. Only what `clientMessages` picks
 * travels to the browser (see `i18n/client-messages.ts`).
 */
export function MessagesProvider({ messages, children }: { messages: Messages; children: ReactNode }) {
  const parent = useContext(MessagesContext);
  const value = useMemo(() => (parent ? { ...parent, ...messages } : messages), [parent, messages]);
  return <MessagesContext value={value}>{children}</MessagesContext>;
}

export function useMessages(): Messages {
  const messages = useContext(MessagesContext);
  if (!messages) {
    throw new Error("useMessages needs MessagesProvider (app/[lang]/layout.tsx).");
  }
  return messages;
}
