import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

/**
 * Phone numbers as RentCarSoft stores most of them: country calling code,
 * one space, national number without spaces, e.g. `+48 512345678`.
 * Seen on 219 of 236 client phones in October 2026 reservations.
 */
export function toRentCarSoftPhone(raw: string, defaultCountry: CountryCode = "PL"): string | null {
  const text = raw.trim();
  if (!text) {
    return null;
  }
  // “0048 …” is the same as “+48 …”.
  const international = text.replace(/^00(?=[1-9])/, "+");
  const phone = parsePhoneNumberFromString(international, defaultCountry);
  if (!phone?.isValid()) {
    return null;
  }
  return `+${phone.countryCallingCode} ${phone.nationalNumber}`;
}
