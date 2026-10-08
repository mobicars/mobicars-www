"use client";

import { useActionState } from "react";

import { probeLogin, type LoginProbe } from "./login-action";

export function LoginForm() {
  const [result, action, pending] = useActionState<LoginProbe | null, FormData>(
    probeLogin,
    null,
  );

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        E-mail
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="h-10 rounded-md border border-zinc-300 px-3 dark:border-zinc-700"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Hasło
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-10 rounded-md border border-zinc-300 px-3 dark:border-zinc-700"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="h-10 rounded-md bg-zinc-900 text-sm text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Sprawdzam…" : "Zaloguj"}
      </button>
      {result?.ok ? (
        <p className="text-sm">API zwróciło clientId: {result.clientId}</p>
      ) : null}
      {result && !result.ok ? (
        <p className="text-sm">
          API: {result.code}
          {result.status !== null ? ` (HTTP ${result.status})` : ""}
        </p>
      ) : null}
    </form>
  );
}
