"use client";

import { ChevronDown, TextAlignJustify, X } from "lucide-react";
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

import { Logo } from "@/components/layout/logo";
import { useMessages } from "@/i18n/messages-context";

export type MainNavEntry =
  | { label: string; href: string; newTab: boolean }
  | { label: string; panel: ReactNode };

/** Opening and closing the phone menu: a 48px circle, the size a thumb needs (Apple and Google ask for 44–48px). */
const iconButtonClass =
  "flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full text-blue-dark outline-none transition-colors duration-200 ease-out hover:bg-blue-dark/[0.05] data-focus-visible:ring-2 data-focus-visible:ring-blue-medium motion-reduce:transition-none";

const itemClass =
  "flex h-10 cursor-pointer items-center gap-1 whitespace-nowrap rounded-full px-3 text-sm font-bold text-blue-dark outline-none transition-colors duration-200 ease-out hover:bg-blue-dark/[0.05] data-focus-visible:ring-2 data-focus-visible:ring-blue-medium focus-visible:ring-2 focus-visible:ring-blue-medium motion-reduce:transition-none";

/**
 * Desktop menu items: tighter until `2xl`, so six items, the actions and the CTA fit at 1280 px in every language.
 * White on the blue row once the top bar has hidden (`scrolled`).
 */
const desktopItemClass = `${itemClass.replace("px-3", "px-2 2xl:px-3")} scrolled:text-white scrolled:hover:bg-white/10 scrolled:focus-visible:ring-white`;

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
 * - From `xl`: one submenu open at a time, as a full-width panel under the
 *   header. React Aria closes it on a press outside its button and panel
 *   (`useInteractOutside`), Escape (`useKeyboard`, focus back on the button)
 *   and focus leaving the menu (`useFocusWithin`).
 * - Below `xl`: a full-screen React Aria `Sheet` from the end edge: a modal
 *   dialog (focus kept inside, page scroll locked, Escape, focus back on the
 *   menu button) that can also be swiped away; submenus expand in place as an
 *   accordion, and `menuFooter` (hotline, bookings, language) closes the list.
 *
 * `actions` sit between the desktop menu and the menu button, so the DOM, and
 * with it the Tab order, follows the header as it is drawn.
 *
 * The header lives in the layout and survives navigation, so a new page also
 * closes whatever is open.
 */
export function MainNav({
  entries,
  menuFooter,
  actions,
  className = "",
  menuButtonClassName = "",
}: {
  entries: MainNavEntry[];
  menuFooter?: ReactNode;
  /** Header controls drawn after the desktop menu and before the menu button (phone, language, CTA). */
  actions?: ReactNode;
  /** On the desktop menu, e.g. its flex `order` in the header. */
  className?: string;
  menuButtonClassName?: string;
}) {
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

  return (
    <>
      <div className={`hidden flex-1 xl:block ${className}`} onClick={closeOnLink} {...focusWithinProps}>
        <nav aria-label={t.mainNav}>
          <DisclosureGroup expandedKeys={expanded} onExpandedChange={setExpanded}>
            {/* Centred between the logo and the hotline. */}
            <ul className="flex items-center justify-center gap-0.5 2xl:gap-1">
              {entries.map((entry, index) => (
                <li key={index}>
                  {"href" in entry ? (
                    <EntryLink entry={entry} className={desktopItemClass} />
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

      {actions}

      <SheetTrigger isOpen={sheet} onOpenChange={setSheet}>
        <Button className={`${iconButtonClass} xl:hidden scrolled:hover:bg-white/10 scrolled:data-focus-visible:ring-white ${menuButtonClassName}`} aria-label={t.menu}>
          <TextAlignJustify className="size-7 text-blue-medium scrolled:text-white" aria-hidden />
        </Button>
        <SheetOverlay position="end" className="z-50 xl:hidden">
          <SheetBackdrop swipeAnimation="sheet-backdrop" className="bg-blue-dark/40 backdrop-blur-[4px]" />
          {/* `box-content`: with `overscrollPadding` the sheet pads itself past the screen edge,
              and Tailwind's border-box would take that padding out of its width.
              1px narrower than the screen (the white shadow fills the gap): fully swiped out, a full-width
              sheet would rest exactly against the screen edge, which IntersectionObserver still counts as
              visible, so React Aria would never finish closing it and the page would stay locked. */}
          <Sheet overscrollPadding className="box-content h-full w-[calc(100vw-1px)] bg-white shadow-[-1px_0_0_white] outline-none">
            <SheetContent className="flex h-full flex-col overflow-y-auto pb-[var(--sheet-scroll-padding-y)] outline-none">
              {/* Blue, as the page's header row under it, once its top bar has hidden (`topbar-hidden`, `globals.css`). */}
              <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-gutter topbar-hidden:border-transparent topbar-hidden:bg-blue-medium">
                {/* The header's logo, as on the page under it; the sheet is still named "Menu" for screen readers. */}
                <Heading slot="title" className="flex items-center">
                  <span className="sr-only">{t.menu}</span>
                  <span aria-hidden>
                    <Logo className="h-6 w-auto fill-blue-medium min-[360px]:h-7 sm:h-8 topbar-hidden:fill-white" taglineClassName="topbar-hidden:fill-white" />
                  </span>
                </Heading>
                <Button slot="close" aria-label={t.closeMenu} className={`${iconButtonClass} -mr-1 topbar-hidden:hover:bg-white/10 topbar-hidden:data-focus-visible:ring-white`}>
                  <X className="size-7 text-blue-medium topbar-hidden:text-white" aria-hidden />
                </Button>
              </div>
              <nav aria-label={t.mainNav} className="px-gutter py-3" onClick={closeOnLink}>
                <DisclosureGroup>
                  <ul className="flex flex-col divide-y divide-line">
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
                                <DisclosurePanel>
                                  {/* Padding on an inner box: a hidden panel keeps its own box. */}
                                  <div className="px-3 pt-2 pb-4">{entry.panel}</div>
                                </DisclosurePanel>
                              </>
                            )}
                          </Disclosure>
                        )}
                      </li>
                    ))}
                  </ul>
                </DisclosureGroup>
              </nav>
              {menuFooter ? (
                <div className="mt-auto border-t border-line px-gutter py-4" onClick={closeOnLink}>
                  {menuFooter}
                </div>
              ) : null}
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
      <Button ref={trigger} slot="trigger" className={desktopItemClass}>
        {label}
        <Chevron open={isExpanded} />
      </Button>
      {/* The frame and shadow only while open: a closed panel is `hidden="until-found"`, and its empty box would
          still draw the top line under the header (white on the blue bar). */}
      <DisclosurePanel className={`absolute inset-x-0 top-full bg-white ${isExpanded ? "border-t border-muted shadow-lg" : ""}`}>
        <div className="mx-auto max-h-[calc(100dvh-8rem)] w-full max-w-7xl overflow-y-auto px-6 py-8">{children}</div>
      </DisclosurePanel>
    </div>
  );
}

function Chevron({ open, size = "size-4" }: { open: boolean; size?: string }) {
  return (
    <ChevronDown
      className={`${size} text-blue-medium transition-transform scrolled:text-white duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
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
