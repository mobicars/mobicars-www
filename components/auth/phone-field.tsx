"use client";

import { PhoneInput, type PhoneFieldProps } from "@/components/ui/phone-input";
import { useAuthFormsCopy } from "@/i18n/auth-forms";

/** `PhoneField` on the pages that load the `auth` messages (account, booking). */
export function PhoneField(props: PhoneFieldProps) {
  return <PhoneInput {...props} t={useAuthFormsCopy().phone} />;
}
