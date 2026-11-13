---
name: mobicars-react-aria
description: Build or change interactive UI in mobicars-www (buttons, choices, cards to pick, lists, fields, dialogs, tooltips, disclosures). React Aria Components is the first choice; use this before writing any control by hand.
---

# MobiCars and React Aria

Interactive UI in `mobicars-www` is built on `react-aria-components` first. Write a control by hand only when React Aria has nothing for it, and say why in a comment.

Docs: https://react-aria.adobe.com (each page has a `.md` version, e.g. `GridList.md`; the index is `llms.txt`). Check the installed version in `package.json` before using a new component.

## Which component

- One choice of a few, no navigation on pick (view, sort, gearbox, cars in a class): `ToggleButtonGroup` with `selectionMode="single"`. Add `disallowEmptySelection` when one must stay chosen. Arrow keys move focus, Space or Enter picks. Filter chips use the shared `ChoiceChips` (`components/ui/choice-chips.tsx`).
- Cards to pick, with buttons inside (protection packages, border zones, extras): `GridList` + `GridListItem`, `layout="grid"`. Arrow keys move without picking; Enter, Space or a click picks; Tab reaches the buttons inside. Multiple choice: `selectionMode="multiple"`; tiles that are not selectable but hold controls (quantity): `disabledKeys` + `disabledBehavior="selection"`.
- A list of options without buttons inside (hours, places): `ListBox`. Typing jumps to an option. To let the chosen option be pressed again (to close a dialog), treat an empty selection as "the chosen one again" (see `OptionList` in `components/reservation/dialog-parts.tsx`).
- Plain radios in a form: `RadioGroup` + `Radio`. Not for a choice that navigates: a radio picks on arrow keys.
- Text fields: `components/auth/fields.tsx` (`TextField`, `PasswordField`), built on React Aria `TextField` with `validationBehavior="aria"`; the error is a `FieldError` linked to the field.
- Dialogs: `WidgetModal` + `Dialog` + `DialogHeader` from `components/reservation/dialog-parts.tsx`.
- A sheet from the bottom on phones (swipe down to close): `BottomSheet` (`components/ui/sheet.tsx`), on React Aria's `Sheet`. It needs `box-content` on the sheet (React Aria pads it by 100vh to slide it) and no flex box around the content.
- Expand and collapse: `Disclosure` / `DisclosureGroup`.
- Icon-only button: React Aria `Button` with `aria-label`, wrapped in `IconTooltip` (`components/ui/tooltip.tsx`). Not the native `title`.
- Site navigation stays links in a `<nav>` (`components/layout/main-nav.tsx`); `Menu` is for app actions only.

## Rules learned here

- Inside a `GridListItem`, every button must be a React Aria `Button`. A native `<button>` lets the press through and also picks the card.
- `ListBoxItem` may not contain buttons or links; use `GridList` then.
- Use string or non-zero ids: React Aria treats `0` as "no id".
- Style state with data attributes (`data-selected:`, `data-focus-visible:`, `data-disabled:`) or render props, not `aria-pressed:`.
- A collection that must also be a scroll row (the phone `Slider`) gets the row as `list` and the item class: see `components/reservation/slider.tsx`.
- Keep `buttonClass()` (`components/ui/button.ts`) for links and Server Components; a client control can use the same classes.
- Check keyboard behaviour in the browser after the change (Tab, arrows, Space, Enter, Escape). The docs do not describe every key.
