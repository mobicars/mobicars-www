"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

const inputClass =
  "h-12 w-full rounded-lg border bg-white px-4 font-normal text-ink outline-none transition-colors focus:border-blue-medium focus:ring-2 focus:ring-blue-light aria-invalid:border-red-500";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  invalid?: boolean;
  hint?: ReactNode;
};

export function TextField({ label, invalid, hint, className, ...input }: FieldProps) {
  const hintId = useId();
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-medium text-blue-dark ${className ?? ""}`}>
      {label}
      <input
        {...input}
        aria-invalid={invalid || undefined}
        aria-describedby={hint ? hintId : undefined}
        className={`${inputClass} border-muted`}
      />
      {hint ? (
        <span id={hintId} className="text-xs font-normal text-muted-dark">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function PasswordField({
  label,
  invalid,
  hint,
  showLabel,
  hideLabel,
  ...input
}: FieldProps & { showLabel: string; hideLabel: string }) {
  const hintId = useId();
  const [visible, setVisible] = useState(false);
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-blue-dark">
      {label}
      <span className="relative">
        <input
          {...input}
          type={visible ? "text" : "password"}
          aria-invalid={invalid || undefined}
          aria-describedby={hint ? hintId : undefined}
          className={`${inputClass} border-muted pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-dark hover:text-blue-dark"
        >
          {visible ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
        </button>
      </span>
      {hint ? (
        <span id={hintId} className="text-xs font-normal text-muted-dark">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function FormAlert({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg px-3 py-2 text-sm ${
        tone === "error" ? "bg-red-50 text-red-700" : "bg-green-light text-green-dark"
      }`}
    >
      {children}
    </p>
  );
}

export function SubmitButton({ pending, label, pendingLabel }: { pending: boolean; label: string; pendingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 h-12 rounded-lg bg-green-medium px-6 text-sm font-semibold text-white transition-colors hover:bg-green-dark disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
