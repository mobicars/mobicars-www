import "server-only";

import type { ClientRecord } from "@/lib/rentcarsoft";

import {
  CONSENT_FIELDS,
  TEXT_FIELDS,
  type AccountDetails,
  type ConsentName,
  type TextFieldName,
} from "./fields";

/** Raw custom-field values by key id, as RentCarSoft stores them. */
export function rawKeys(client: ClientRecord): Map<number, string> {
  return new Map(client.keys.map((key) => [key.id, key.value.trim()]));
}

export function toAccountDetails(client: ClientRecord): AccountDetails {
  const raw = rawKeys(client);
  return {
    isCompany: client.company === true,
    email: raw.get(5) || null,
    text: Object.fromEntries(
      TEXT_FIELDS.map((field) => [field.name, raw.get(field.keyId) ?? ""]),
    ) as Record<TextFieldName, string>,
    consents: Object.fromEntries(
      CONSENT_FIELDS.map((field) => [field.name, raw.get(field.keyId) === field.yes]),
    ) as Record<ConsentName, boolean>,
  };
}
