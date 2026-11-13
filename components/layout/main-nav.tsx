"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useFocusWithin, useInteractOutside, useKeyboard } from "react-aria";
import {
  Button,
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  Heading,
  Sheet,
  SheetBackdrop,
  SheetContent,
  SheetOverlay,
  SheetTrigger,
  type Key,
} from "react-aria-components";

import { useMessages } from "@/i18n/messages-context";

export type MainNavEntry =
  | { label: string; href: string; newTab: boolean }
  | { label: string; panel: ReactNode };

const itemClass =
  "flex h-10 cursor-pointer items-center gap-1 rounded-full px-3 text-sm font-bold text-blue-dark outline-none transition-colors duration-200 ease-out hover:bg-blue-dark/[0.05] data-focus-visible:ring-2 data-focus-visible:ring-blue-medium focus-visible:ring-2 focus-visible:ring-blue-medium motion-reduce:transition-none";

/**
 * The header menu, on React Aria's disclosure pattern (WAI-ARIA "disclosure
 * navigation"): links stay links in a `<nav>`, reached with Tab, and a submenu
 * is a button with `aria-expanded` that shows its panel. Not `Menu`, whose
 * `role="menu"` is for app actions, not site navigation.
 *
 * Panels are rendered on the server and passed in. A closed `DisclosurePanel`
 * keeps them in the DOM (`hidden="until-found"`), so the links are in the
 * prerendered HTML and find-in-page opens the panel holding a match.
 *
 * - From `lg`: one submenu open at a time, as a full-width panel under the
 *   header. React Aria closes it on a press outside its button and panel
 *   (`useInteractOutside`), Escape (`useKeyboard`, focus back on the button)
 *   and focus leaving the menu (`useFocusWithin`).
 * - Below `lg`: a React Aria `Sheet` from the end edge: a modal dialog (focus
 *   kept inside, page scroll locked, Escape, focus back on the menu button)
 *   that can also be swiped away; submenus expand in place.
 *
 * The header lives in the layout and survives navigation, so a new page also
 * closes whatever is open.
 */
export function MainNav({ entries }: { entries: MainNavEntry[] }) {
  const t = useMessages().layout;
  const [expanded, setExpanded] = useState<Set<Key>>(new Set());
  const [sheet, setSheet] = useState(false);

  const pathname = usePathname();
  const [shownPath, setShownPath] = useState(pathname);
  if (pathname !== shownPath) {
    setShownPath(pathname);
    setExpanded(new Set());
    setSheet(false);
  }

  const { focusWithinProps } = useFocusWithin({
    // Only a move to another element: a press on a blank part of the panel also blurs.
    onBlurWithin: (event) => {
      if (event.relatedTarget) setExpanded(new Set());
    },
  });

  /** Following any link closes the menu, also when it is the page already shown. */
  const closeOnLink = (event: MouseEvent) => {
    if ((event.target as HTMLElement).closest("a")) {
      setExpanded(new Set());
      setSheet(false);
    }
  };

  if (entries.length === 0) {
    return <div className="flex-1" />;
  }

  return (
    <>
      <div className="hidden flex-1 lg:block" onClick={closeOnLink} {...focusWithinProps}>
        <nav aria-label={t.mainNav}>
          <DisclosureGroup expandedKeys={expanded} onExpandedChange={setExpanded}>
            <ul className="flex items-center gap-1">
              {entries.map((entry, index) => (
                <li key={index}>
                  {"href" in entry ? (
                    <EntryLink entry={entry} className={itemClass} />
                  ) : (
                    // String ids: React Aria treats `0` as "no id" and makes up its own.
                    <Disclosure id={`entry-${index}`}>
                      {({ isExpanded }) => (
                        <Submenu
                          label={entry.label}
                          isExpanded={isExpanded}
                          onClose={() =>
                            setExpanded((keys) => {
                              const next = new Set(keys);
                              next.delete(`entry-${index}`);
                              return next;
                            })
                          }
                        >
                          {entry.panel}
                        </Submenu>
                      )}
                    </Disclosure>
                  )}
                </li>
              ))}
            </ul>
          </DisclosureGroup>
        </nav>
      </div>

      <SheetTrigger isOpen={sheet} onOpenChange={setSheet}>
        <Button className={`${itemClass} order-last lg:hidden`} aria-label={t.menu}>
          <Menu className="size-5 text-blue-medium" aria-hidden />
        </Button>
        <SheetOverlay position="end" className="z-50 lg:hidden">
          <SheetBackdrop swipeAnimation="sheet-backdrop" className="bg-blue-dark/40 backdrop-blur-[4px]" />
          {/* `box-content`: with `overscrollPadding` the sheet pads itself past the screen edge,
              and Tailwind's border-box would take that padding out of its width. */}
          <Sheet overscrollPadding className="box-content h-full w-[min(24rem,88vw)] bg-white shadow-xl outline-none">
            <SheetContent className="flex h-full flex-col overflow-y-auto pb-[var(--sheet-scroll-padding-y)] outline-none">
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-muted px-3">
                <Heading slot="title" className="px-3 text-base font-bold text-blue-dark">
                  {t.menu}
                </Heading>
                <Button slot="close" className={itemClass}>
                  <X className="size-5 text-blue-medium" aria-hidden />
                  <span>{t.closeMenu}</span>
                </Button>
              </div>
              <nav aria-label={t.mainNav} className="px-3 py-4" onClick={closeOnLink}>
                <DisclosureGroup>
                  <ul className="flex flex-col divide-y divide-muted">
                    {entries.map((entry, index) => (
                      <li key={index} className="py-1">
                        {"href" in entry ? (
                          <EntryLink entry={entry} className={`${itemClass} h-12 w-full text-base`} />
                        ) : (
                          <Disclosure id={`entry-${index}`}>
                            {({ isExpanded }) => (
                              <>
                                <Button slot="trigger" className={`${itemClass} h-12 w-full justify-between text-base`}>
                                  {entry.label}
                                  <Chevron open={isExpanded} size="size-5" />
                                </Button>
                                <DisclosurePanel className="px-3 pt-2 pb-4">{entry.panel}</DisclosurePanel>
                              </>
                            )}
                          </Disclosure>
                        )}
                      </li>
                    ))}
                  </ul>
                </DisclosureGroup>
              </nav>
            </SheetContent>
          </Sheet>
        </SheetOverlay>
      </SheetTrigger>
    </>
  );
}

/**
 * One desktop submenu: its button and its full-width panel. A press outside
 * both (the logo, the empty header, the page, another submenu's button) or
 * Escape closes it.
 */
function Submenu({
  label,
  isExpanded,
  onClose,
  children,
}: {
  label: string;
  isExpanded: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useInteractOutside({ ref, isDisabled: !isExpanded, onInteractOutside: onClose });
  const { keyboardProps } = useKeyboard({
    onKeyDown: (event) => {
      if (event.key === "Escape" && isExpanded) {
        onClose();
        trigger.current?.focus();
      } else {
        event.continuePropagation();
      }
    },
  });

  return (
    <div ref={ref} {...keyboardProps}>
      <Button ref={trigger} slot="trigger" className={itemClass}>
        {label}
        <Chevron open={isExpanded} />
      </Button>
      <DisclosurePanel className="absolute inset-x-0 top-full border-t border-muted bg-white shadow-lg">
        <div className="mx-auto max-h-[calc(100dvh-8rem)] w-full max-w-7xl overflow-y-auto px-6 py-8">{children}</div>
      </DisclosurePanel>
    </div>
  );
}

function Chevron({ open, size = "size-4" }: { open: boolean; size?: string }) {
  return (
    <ChevronDown
      className={`${size} text-blue-medium transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
      aria-hidden
    />
  );
}

function EntryLink({ entry, className }: { entry: { label: string; href: string; newTab: boolean }; className: string }) {
  if (entry.newTab) {
    return (
      <a href={entry.href} target="_blank" rel="noopener noreferrer" className={className}>
        {entry.label}
      </a>
    );
  }
  return (
    <Link href={entry.href} className={className}>
      {entry.label}
    </Link>
  );
}
