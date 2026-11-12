"use client";

import { useRouter } from "next/navigation";
import { Button, Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import { Check, ChevronDown } from "lucide-react";

import { languages, type Lang } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { useMessages } from "@/i18n/messages-context";
import { switchLangHref } from "@/i18n/routes";

/**
 * Language menu, like the old site's (code and flag, a list with names and
 * flags), on react-aria instead of Headless UI. Languages come from
 * `i18n/config`; flags from `public/assets/flags/{lang}.svg`. Picking one
 * opens the same page in that language (`switchLangHref`), search included.
 */
export function LanguageSwitcher({ lang }: { lang: Lang }) {
  const router = useRouter();
  const current = languages.find((item) => item.lang === lang) ?? languages[0];
  const t = useMessages().layout;

  return (
    <MenuTrigger>
      <Button
        aria-label={fill(t.languageCurrent, { label: current.label })}
        className="flex h-10 cursor-pointer items-center gap-2 rounded-full px-3 text-xs font-bold text-blue-dark uppercase outline-none transition-colors duration-200 ease-out hover:bg-blue-dark/[0.05] data-focus-visible:ring-2 data-focus-visible:ring-blue-medium motion-reduce:transition-none"
      >
        {current.lang}
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVG flag */}
        <img src={`/assets/flags/${current.lang}.svg`} alt="" width={20} height={14} className="h-3.5 w-5 rounded-[2px] object-cover" />
        <ChevronDown className="size-4" aria-hidden />
      </Button>
      <Popover placement="bottom end" offset={6} className="min-w-44 rounded-xl bg-white p-1 shadow-xl ring-1 ring-blue-dark/10 outline-none">
        <Menu
          aria-label={t.languageChoose}
          selectionMode="single"
          selectedKeys={[lang]}
          onAction={(key) => {
            const target = key as Lang;
            if (target !== lang) {
              // Read at the click, not with `usePathname`: that hook would make every page
              // with an unknown param (e.g. a reservation id) fail to prerender.
              router.push(switchLangHref(window.location.pathname, window.location.search, target));
            }
          }}
          className="outline-none"
        >
          {languages.map((item) => (
            <MenuItem
              key={item.lang}
              id={item.lang}
              textValue={item.label}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-blue-dark outline-none data-focused:bg-blue-light"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVG flag */}
              <img src={`/assets/flags/${item.lang}.svg`} alt="" width={20} height={14} className="h-3.5 w-5 rounded-[2px] object-cover" />
              <span className="flex-1">{item.label}</span>
              {item.lang === lang ? <Check className="size-4 text-green-medium" aria-hidden /> : null}
            </MenuItem>
          ))}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}
