import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

/**
 * Static check behind `CLIENT_MESSAGE_SCOPES` (`client-messages.ts`): which
 * message namespaces the client components of each route read. Used by the
 * test; not imported by the app.
 *
 * It walks the import graph from every page, layout and error file under
 * `app/[lang]`, collects the `"use client"` files it reaches and reads how
 * each one takes texts:
 * - `useMessages().ns`, `const { a, b } = useMessages()`,
 *   `const t = useMessages();` followed by `t.ns`;
 * - a whole `useMessages()` object passed on: the namespaces its local
 *   imports read as `messages.ns`;
 * - the copy hooks (`useAccountCopy` …), by `COPY_HOOKS`.
 * A spread (`...rest = useMessages()`) is reported as unknown.
 */

const ROOT = join(dirname(new URL(import.meta.url).pathname), "..");

/** Copy hooks that read the provider, and the namespaces behind them. */
export const COPY_HOOKS: Record<string, string[]> = {
  useAccountCopy: ["account"],
  useAuthFormsCopy: ["auth"],
  useDetailsCopy: ["accountDetails"],
};

export type Scope = "base" | "reservation" | "account";

/** Which provider scope an entry file under `app/[lang]` renders in. */
export function scopeOf(entry: string): Scope {
  const path = relative(join(ROOT, "app", "[lang]"), entry);
  if (path.startsWith("reservation/")) return "reservation";
  if (path.startsWith("account/")) return "account";
  return "base";
}

const ENTRY = /^(page|layout|error|not-found|loading|template|global-error)\.tsx?$/;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (ENTRY.test(name)) out.push(path);
  }
  return out;
}

function resolve(from: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = join(ROOT, spec.slice(2));
  else if (spec.startsWith(".")) base = join(dirname(from), spec);
  else return null;
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const IMPORT = /(?:from\s+|import\s*\(\s*|import\s+)["']([^"']+)["']/g;

function imports(file: string, source: string): string[] {
  return [...source.matchAll(IMPORT)].map((match) => resolve(file, match[1])).filter((path): path is string => path !== null);
}

const read = (file: string) => readFileSync(file, "utf8");
const isClient = (source: string) => /^\s*["']use client["']/.test(source);

/** Namespaces one client file reads, plus anything the scan cannot follow. */
export function namespacesOf(file: string): { namespaces: Set<string>; unknown: string[] } {
  const source = read(file);
  const namespaces = new Set<string>();
  const unknown: string[] = [];
  for (const match of source.matchAll(/useMessages\(\)\s*\.\s*(\w+)/g)) namespaces.add(match[1]);
  for (const match of source.matchAll(/const\s*\{([^}]*)\}\s*=\s*useMessages\(\)/g)) {
    for (const part of match[1].split(",").map((item) => item.trim()).filter(Boolean)) {
      if (part.startsWith("...")) unknown.push(`spread of useMessages() in ${relative(ROOT, file)}`);
      else namespaces.add(part.split(":")[0].trim());
    }
  }
  for (const match of source.matchAll(/const\s+(\w+)\s*=\s*useMessages\(\)\s*;/g)) {
    const name = match[1];
    for (const use of source.matchAll(new RegExp(`\\b${name}\\.(\\w+)`, "g"))) namespaces.add(use[1]);
    const passedOn = new RegExp(`(?:[(,]\\s*|=\\{?)${name}\\s*[,)}]`).test(source);
    if (passedOn) {
      for (const dependency of imports(file, source)) {
        // `messages.search`, not a path such as "./messages.ts".
        for (const use of read(dependency).matchAll(/\bmessages\.(?!tsx?\b|json\b)(\w+)/g)) namespaces.add(use[1]);
      }
    }
  }
  for (const [hook, keys] of Object.entries(COPY_HOOKS)) {
    if (new RegExp(`\\b${hook}\\(\\)`).test(source)) keys.forEach((key) => namespaces.add(key));
  }
  return { namespaces, unknown };
}

/** Per scope: the namespaces its client files read, and who reads each one. */
export function scanClientMessages(): {
  needs: Record<Scope, Map<string, Set<string>>>;
  unknown: string[];
} {
  const needs: Record<Scope, Map<string, Set<string>>> = { base: new Map(), reservation: new Map(), account: new Map() };
  const unknown = new Set<string>();
  const cache = new Map<string, ReturnType<typeof namespacesOf>>();
  for (const entry of walk(join(ROOT, "app", "[lang]"))) {
    const scope = scopeOf(entry);
    const seen = new Set<string>();
    const queue = [entry];
    while (queue.length) {
      const file = queue.pop()!;
      if (seen.has(file)) continue;
      seen.add(file);
      const source = read(file);
      if (isClient(source) && !file.endsWith("messages-context.tsx")) {
        const result = cache.get(file) ?? namespacesOf(file);
        cache.set(file, result);
        result.unknown.forEach((item) => unknown.add(item));
        for (const namespace of result.namespaces) {
          const readers = needs[scope].get(namespace) ?? new Set<string>();
          readers.add(relative(ROOT, file));
          needs[scope].set(namespace, readers);
        }
      }
      queue.push(...imports(file, source));
    }
  }
  return { needs, unknown: [...unknown] };
}
