"use client";

import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Button } from "react-aria-components";

import { buttonClass } from "@/components/ui/button";
import { useAuthFormsCopy } from "@/i18n/auth-forms";
import { isValidTaxId, normalizeTaxId } from "@/lib/business/tax-id";
import type { RegistryResult } from "@/lib/business/vat-registry";

import { TextField } from "./fields";

export type CompanyFieldName = "companyName" | "vatNumber" | "companyAddress" | "companyPostalCode" | "companyCity";

type Status = { kind: "idle" } | { kind: "loading" } | { kind: "done"; result: RegistryResult["status"] };

/**
 * Company name, NIP and address for registration and the booking step (guest).
 * "Pobierz dane" fills the name and address from the VAT register: only on a
 * click, only for a NIP with a correct checksum, and every field stays
 * editable. A failure says so and the form goes on by hand. The register code
 * loads on the first click, so no page carries it up front.
 *
 * Signed in (`locked`): name and NIP come from the account and cannot change,
 * so there is no button and no address (the account has it).
 */
export function CompanyFields({
  labels,
  defaults = {},
  invalid = {},
  hints = {},
  locked = false,
  gridClass,
  children,
}: {
  labels: { companyName: string; vatNumber: string };
  defaults?: Partial<Record<CompanyFieldName, string>>;
  invalid?: Partial<Record<CompanyFieldName, boolean>>;
  hints?: Partial<Record<CompanyFieldName, ReactNode>>;
  locked?: boolean;
  /** The grid of the surrounding form (two columns from some width). */
  gridClass: string;
  /** More fields of the same group (the booking's contact person). */
  children?: ReactNode;
}) {
  const t = useAuthFormsCopy().company;
  const [values, setValues] = useState<Record<CompanyFieldName, string>>({
    companyName: defaults.companyName ?? "",
    vatNumber: defaults.vatNumber ?? "",
    companyAddress: defaults.companyAddress ?? "",
    companyPostalCode: defaults.companyPostalCode ?? "",
    companyCity: defaults.companyCity ?? "",
  });
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const asked = useRef<string | null>(null);
  /** What the register filled in, so another NIP clears it unless the customer edited it. */
  const filled = useRef<Partial<Record<CompanyFieldName, string>>>({});

  const set = (name: CompanyFieldName) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (name !== "vatNumber" || normalizeTaxId(value) === asked.current) {
      setValues((current) => ({ ...current, [name]: value }));
      return;
    }
    const stale = filled.current;
    filled.current = {};
    setValues((current) => {
      const next = { ...current, vatNumber: value };
      for (const [field, auto] of Object.entries(stale) as [CompanyFieldName, string][]) {
        if (current[field] === auto) next[field] = "";
      }
      return next;
    });
    if (status.kind === "done") setStatus({ kind: "idle" });
  };

  const digits = normalizeTaxId(values.vatNumber);
  const valid = isValidTaxId(values.vatNumber);
  const badChecksum = digits.length >= 10 && !valid;

  async function fetchCompany() {
    if (!valid || status.kind === "loading") return;
    setStatus({ kind: "loading" });
    asked.current = digits;
    const { lookupTaxId } = await import("@/lib/business/vat-registry");
    const result = await lookupTaxId(digits);
    if (asked.current !== digits) return;
    if (result.status === "found") {
      const { name, street, postalCode, city } = result.company;
      filled.current = { companyName: name, companyAddress: street, companyPostalCode: postalCode, companyCity: city };
      setValues((current) => ({
        ...current,
        companyName: name,
        companyAddress: street || current.companyAddress,
        companyPostalCode: postalCode || current.companyPostalCode,
        companyCity: city || current.companyCity,
      }));
    }
    setStatus({ kind: "done", result: result.status });
  }

  const message = status.kind === "done" ? t[status.result === "found" ? "filled" : status.result] : status.kind === "loading" ? t.fetching : "";
  const vatHint = hints.vatNumber ?? (badChecksum ? t.badTaxId : locked ? undefined : t.hint);

  return (
    <div className={gridClass}>
      <div className="flex flex-col gap-1.5 col-span-full">
        <div className="flex items-end gap-2">
          <TextField
            label={labels.vatNumber}
            required
            name="vatNumber"
            inputMode="numeric"
            autoComplete="off"
            maxLength={32}
            value={values.vatNumber}
            onChange={set("vatNumber")}
            disabled={locked}
            invalid={invalid.vatNumber || badChecksum}
            className="min-w-0 flex-1"
          />
          {locked ? null : (
            <Button
              type="button"
              onPress={fetchCompany}
              isDisabled={!valid}
              isPending={status.kind === "loading"}
              aria-label={t.fetchLabel}
              aria-describedby="company-lookup-status"
              className={buttonClass("secondary", "md", "px-4")}
            >
              {t.fetch}
            </Button>
          )}
        </div>
        {vatHint ? (
          <p className={`text-xs ${invalid.vatNumber || badChecksum ? "text-red-700" : "text-muted-dark"}`}>{vatHint}</p>
        ) : null}
        <p
          id="company-lookup-status"
          role="status"
          className={`text-sm empty:hidden ${status.kind === "done" && status.result !== "found" ? "text-red-700" : "text-muted-dark"}`}
        >
          {message}
        </p>
      </div>
      <TextField
        label={labels.companyName}
        required
        name="companyName"
        autoComplete="organization"
        maxLength={200}
        value={values.companyName}
        onChange={set("companyName")}
        disabled={locked}
        invalid={invalid.companyName}
        hint={hints.companyName}
        className="col-span-full"
      />
      {locked ? null : (
        <>
          <TextField
            label={t.street}
            name="companyAddress"
            autoComplete="street-address"
            maxLength={200}
            value={values.companyAddress}
            onChange={set("companyAddress")}
            invalid={invalid.companyAddress}
            hint={hints.companyAddress}
            className="col-span-full"
          />
          <TextField
            label={t.postalCode}
            name="companyPostalCode"
            autoComplete="postal-code"
            maxLength={16}
            value={values.companyPostalCode}
            onChange={set("companyPostalCode")}
            invalid={invalid.companyPostalCode}
            hint={hints.companyPostalCode}
          />
          <TextField
            label={t.city}
            name="companyCity"
            autoComplete="address-level2"
            maxLength={100}
            value={values.companyCity}
            onChange={set("companyCity")}
            invalid={invalid.companyCity}
            hint={hints.companyCity}
          />
        </>
      )}
      {children}
    </div>
  );
}
