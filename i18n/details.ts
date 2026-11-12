import type { ConsentName, TextFieldName } from "@/lib/account/fields";

import type { Messages } from "./messages";
import { useMessages } from "./messages-context";

export type DetailsCopy = {
  title: string;
  intro: string;
  personal: string;
  address: string;
  company: string;
  preferences: string;
  email: string;
  emailNote: string;
  fields: Record<TextFieldName, string>;
  consents: Record<ConsentName, { label: string; hint: string }>;
  required: string;
  submit: string;
  saving: string;
  saved: string;
  nothingChanged: string;
  errors: {
    missing: string;
    invalid_phone: string;
    invalid_vat: string;
    not_saved: string;
    rate_limited: string;
    unavailable: string;
  };
};

/** "Moje dane" texts from `messages/{lang}.json` (`accountDetails`). */
export function detailsCopyOf(messages: Messages): DetailsCopy {
  return messages.accountDetails;
}

/** For client components: the page language's messages only. */
export function useDetailsCopy(): DetailsCopy {
  return detailsCopyOf(useMessages());
}
