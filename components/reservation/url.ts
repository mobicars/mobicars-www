/** Sets or removes one query parameter without a navigation (`history.replaceState`). */
export function replaceParam(key: string, value: string | null): void {
  const url = new URL(window.location.href);
  if (value === null) {
    url.searchParams.delete(key);
  } else {
    url.searchParams.set(key, value);
  }
  window.history.replaceState(null, "", url);
}

/** The current URL with some parameters changed, as a path for `router.push`. */
export function currentHrefWith(changes: Record<string, string | null>): string {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  }
  return `${url.pathname}${url.search}`;
}
