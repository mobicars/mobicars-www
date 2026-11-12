/**
 * `fill("Język: {label}", { label: "Polski" })` → "Język: Polski". Unknown
 * placeholders stay as written. Kept apart from `messages.ts`, which imports
 * every language's JSON: client code can use this without shipping them all.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
