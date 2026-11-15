/** Site paths, http(s), `mailto:` and `tel:`. Anything else (`javascript:`) is dropped. */
export function safeUrl(raw: string | null): string | null {
  const value = raw?.trim();
  if (!value) {
    return null;
  }
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return /^(https?:\/\/|mailto:|tel:)/i.test(value) ? value : null;
}
