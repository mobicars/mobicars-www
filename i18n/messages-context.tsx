"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Messages } from "./messages";

const MessagesContext = createContext<Messages | null>(null);

/**
 * Texts of the page language for client components, set once in the `[lang]`
 * layout. Only that language travels to the browser, not all four files.
 */
export function MessagesProvider({ messages, children }: { messages: Messages; children: ReactNode }) {
  return <MessagesContext value={messages}>{children}</MessagesContext>;
}

export function useMessages(): Messages {
  const messages = useContext(MessagesContext);
  if (!messages) {
    throw new Error("useMessages needs MessagesProvider (app/[lang]/layout.tsx).");
  }
  return messages;
}
