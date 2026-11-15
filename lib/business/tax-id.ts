/**
 * Polish tax number (NIP). Tiny on purpose: the browser imports it next to the
 * NIP field, without the rest of the business lead code.
 */

/** Digits only, without spaces, dashes or a "PL" prefix. */
export function normalizeTaxId(raw: string): string {
  return raw.replace(/[\s-]/g, "").replace(/^PL/i, "");
}

/** Polish NIP: 10 digits with a weighted checksum. Dashes and spaces are allowed. */
export function isValidTaxId(raw: string): boolean {
  const digits = normalizeTaxId(raw);
  if (!/^\d{10}$/.test(digits)) return false;
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const sum = weights.reduce((total, weight, index) => total + weight * Number(digits[index]), 0);
  return sum % 11 === Number(digits[9]);
}
