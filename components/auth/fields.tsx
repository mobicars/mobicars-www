"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Button, FieldError, Input, Label, Text, TextField as AriaTextField } from "react-aria-components";

const inputClass =
  "h-12 w-full rounded-lg border bg-white px-4 font-normal text-ink outline-none transition-colors focus:border-blue-medium focus:ring-2 focus:ring-blue-light aria-invalid:border-red-500";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  /** Marks the field invalid; `hint` is then its error message. */
  invalid?: boolean;
  /** A hint under the field, or the error while `invalid`. */
  hint?: ReactNode;
};

/**
 * React Aria's text field: the label, the input and the text under it are
 * linked by ids, and while `invalid` the text under it is the field's error
 * (`FieldError`), so a screen reader says it with the field. Validation stays
 * ours (server and form code), hence `validationBehavior="aria"`. The input
 * takes the usual input props; `value` and `defaultValue` go to the field so
 * a controlled and an uncontrolled input both keep working.
 */
function Field({
  label,
  invalid,
  hint,
  className,
  value,
  defaultValue,
  disabled,
  children,
}: Omit<FieldProps, "onChange"> & { children: ReactNode }) {
  return (
    <AriaTextField
      value={value === undefined ? undefined : String(value)}
      defaultValue={defaultValue === undefined ? undefined : String(defaultValue)}
      isDisabled={disabled}
      isInvalid={invalid}
      validationBehavior="aria"
      className={`flex flex-col gap-1.5 text-sm font-medium text-blue-dark ${className ?? ""}`}
    >
      <Label>{label}</Label>
      {children}
      {hint ? (
        invalid ? (
          <FieldError className="text-xs font-normal text-red-700">{hint}</FieldError>
        ) : (
          <Text slot="description" className="text-xs font-normal text-muted-dark">
            {hint}
          </Text>
        )
      ) : null}
    </AriaTextField>
  );
}

export function TextField({ label, invalid, hint, className, value, defaultValue, ...input }: FieldProps) {
  return (
    <Field label={label} invalid={invalid} hint={hint} className={className} value={value} defaultValue={defaultValue} disabled={input.disabled}>
      <Input {...input} className={`${inputClass} border-muted`} />
    </Field>
  );
}

export function PasswordField({
  label,
  invalid,
  hint,
  showLabel,
  hideLabel,
  value,
  defaultValue,
  ...input
}: FieldProps & { showLabel: string; hideLabel: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} invalid={invalid} hint={hint} value={value} defaultValue={defaultValue} disabled={input.disabled}>
      <span className="relative">
        <Input {...input} type={visible ? "text" : "password"} className={`${inputClass} border-muted pr-12`} />
        <Button
          onPress={() => setVisible((current) => !current)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center rounded-r-lg text-muted-dark outline-none hover:text-blue-dark data-focus-visible:ring-2 data-focus-visible:ring-blue-medium"
        >
          {visible ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
        </Button>
      </span>
    </Field>
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
