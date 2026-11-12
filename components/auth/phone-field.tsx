"use client";

import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";
import { Check, ChevronDown, Search } from "lucide-react";
import { useId, useMemo, useState } from "react";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogTrigger,
  Input,
  ListBox,
  ListBoxItem,
  Popover,
  SearchField,
  useFilter,
} from "react-aria-components";

import { authFormsCopy } from "@/i18n/auth-forms";
import type { Lang } from "@/i18n/config";

/** Countries MobiCars customers come from most, shown first. */
const TOP_COUNTRIES: CountryCode[] = ["PL", "UA", "DE", "GB", "CZ", "SK", "LT", "NL"];

type Country = { code: CountryCode; name: string; callingCode: string };

function flag(code: string): string {
  return String.fromCodePoint(...[...code].map((char) => 0x1f1a5 + char.charCodeAt(0)));
}

function useCountries(lang: Lang): Country[] {
  return useMemo(() => {
    const names = new Intl.DisplayNames([lang], { type: "region" });
    const all = getCountries().map((code) => ({
      code,
      name: names.of(code) ?? code,
      callingCode: getCountryCallingCode(code),
    }));
    const top = TOP_COUNTRIES.map((code) => all.find((country) => country.code === code)!);
    const rest = all
      .filter((country) => !TOP_COUNTRIES.includes(country.code))
      .sort((a, b) => a.name.localeCompare(b.name, lang));
    return [...top, ...rest];
  }, [lang]);
}

/** Splits a stored number (`+48 512345678`, `+48512345678`, `512345678`) into country and national part. */
function splitPhone(value: string | undefined): { country: CountryCode; national: string } {
  const phone = value ? parsePhoneNumberFromString(value.replace(/^00(?=[1-9])/, "+"), "PL") : undefined;
  if (phone?.country) {
    return { country: phone.country, national: phone.formatNational() };
  }
  return { country: "PL", national: value ?? "" };
}

/**
 * Phone number with a searchable country list.
 * Typing or pasting a full international number (`+49 …`, `0049 …`) switches
 * the country. The form receives `+<code> <national digits>`, the format
 * RentCarSoft stores; the server validates it again.
 */
export function PhoneField({
  lang,
  label,
  name,
  defaultValue,
  required,
  invalid,
}: {
  lang: Lang;
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  invalid?: boolean;
}) {
  const t = authFormsCopy[lang].phone;
  const inputId = useId();
  const countries = useCountries(lang);
  const initial = useMemo(() => splitPhone(defaultValue), [defaultValue]);
  const [country, setCountry] = useState<CountryCode>(initial.country);
  const [national, setNational] = useState(initial.national);
  const [open, setOpen] = useState(false);
  // Judge the number only after the field was left once, not mid-typing.
  const [blurred, setBlurred] = useState(false);
  const { contains } = useFilter({ sensitivity: "base" });

  const current = countries.find((item) => item.code === country)!;
  const digits = national.replace(/\D/g, "");
  const submitted = digits ? `+${current.callingCode} ${digits.replace(/^0+/, "")}` : "";
  const parsed = digits ? parsePhoneNumberFromString(submitted) : undefined;
  const looksWrong = blurred && digits.length > 0 && !parsed?.isValid();
  const example = getExampleNumber(country, examples)?.formatNational();

  const onType = (text: string) => {
    const international = text.trim().replace(/^00(?=[1-9])/, "+");
    if (international.startsWith("+")) {
      const typed = new AsYouType();
      typed.input(international);
      const detected = typed.getCountry();
      const number = typed.getNumber();
      if (detected && number) {
        setCountry(detected);
        setNational(new AsYouType(detected).input(number.nationalNumber));
        return;
      }
    }
    setNational(text);
  };

  return (
    <div className="flex flex-col gap-1.5 text-sm font-medium text-blue-dark">
      <label htmlFor={inputId}>{label}</label>
      <div
        className={`flex h-12 rounded-lg border bg-white transition-colors focus-within:border-blue-medium focus-within:ring-2 focus-within:ring-blue-light ${
          invalid ? "border-red-500" : "border-muted"
        }`}
      >
        <DialogTrigger isOpen={open} onOpenChange={setOpen}>
          <Button
            aria-label={t.country(current.name, current.callingCode)}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-l-lg border-r border-muted px-3 font-normal text-ink outline-none hover:bg-surface data-focus-visible:bg-surface"
          >
            <span className="text-lg leading-none" aria-hidden>
              {flag(country)}
            </span>
            <span>+{current.callingCode}</span>
            <ChevronDown className="size-4 text-muted-dark" aria-hidden />
          </Button>
          <Popover
            placement="bottom start"
            className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-muted bg-white text-ink shadow-xl outline-none"
          >
            <Dialog aria-label={t.chooseCountry} className="outline-none">
              <Autocomplete filter={contains}>
                <SearchField aria-label={t.search} autoFocus className="border-b border-muted p-2">
                  <div className="flex items-center gap-2 rounded-lg bg-surface px-3">
                    <Search className="size-4 text-muted-dark" aria-hidden />
                    <Input
                      placeholder={t.search}
                      className="h-10 w-full bg-transparent text-sm outline-none [&::-webkit-search-cancel-button]:hidden"
                    />
                  </div>
                </SearchField>
                <ListBox
                  aria-label={t.chooseCountry}
                  items={countries}
                  selectionMode="single"
                  selectedKeys={[country]}
                  onSelectionChange={(keys) => {
                    const [key] = keys === "all" ? [] : [...keys];
                    if (key) {
                      setCountry(key as CountryCode);
                      setOpen(false);
                    }
                  }}
                  renderEmptyState={() => <p className="p-4 text-sm text-muted-dark">{t.noResults}</p>}
                  className="max-h-72 overflow-y-auto p-1 outline-none"
                >
                  {(item) => (
                    <ListBoxItem
                      id={item.code}
                      textValue={`${item.name} +${item.callingCode} ${item.code}`}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none data-focused:bg-blue-light data-selected:font-semibold"
                    >
                      {({ isSelected }) => (
                        <>
                          <span className="text-lg leading-none" aria-hidden>
                            {flag(item.code)}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{item.name}</span>
                          <span className="text-muted-dark">+{item.callingCode}</span>
                          {isSelected ? <Check className="size-4 text-blue-medium" aria-hidden /> : null}
                        </>
                      )}
                    </ListBoxItem>
                  )}
                </ListBox>
              </Autocomplete>
            </Dialog>
          </Popover>
        </DialogTrigger>
        <input
          id={inputId}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required={required}
          value={national}
          placeholder={example}
          onChange={(event) => onType(event.target.value)}
          onBlur={() => {
            setBlurred(true);
            if (digits) {
              setNational(new AsYouType(country).input(digits));
            }
          }}
          aria-invalid={invalid || looksWrong || undefined}
          className="h-full min-w-0 flex-1 rounded-r-lg bg-transparent px-3 font-normal text-ink outline-none"
        />
      </div>
      <input type="hidden" name={name} value={submitted} />
      {looksWrong ? (
        <span className="text-xs font-normal text-red-700">{t.invalidFor(current.name)}</span>
      ) : null}
    </div>
  );
}
