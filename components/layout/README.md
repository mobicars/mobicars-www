# Site header and footer

Provisional, until the CMS navigation (old site: Strapi `navigation` and `footer`) is wired in. Both render on every page from `app/[lang]/layout.tsx`.

- **Logo** (`logo.tsx`): the old site's SVG, unchanged. The wordmark takes the `fill-*` from `className`; "RENT & GO" stays green.
- **Header** (`site-chrome.tsx`): logo, the hotline (+48 881 328 328, from the old header), the language button and "Moje konto". On phones the hotline and account show as icons with screen-reader labels.
- **Footer**: white logo, the hotline, the language button (flag and name), links to both rental pages, the account and the documents (still on the old site's `/pl/dokumenty`).
- **Language dialog** (`language-switcher.tsx`): the button (globe, flag and code in the header; flag and name in the footer) opens a `WidgetModal` like the booking dialogs, with the languages one under another: the language's own name and, below, its name in the page's language (`layout.languageNames`). Languages come from `i18n/config.ts`, flags from `public/assets/flags/{lang}.svg`. A choice opens the same page in that language through `switchLangHref` (`i18n/routes.ts`, tested): a reservation page keeps its term and search, a panel page its page and id.
- The customer panel and the sign-in pages lost their own logo bars; the panel keeps a logout button on phones.
- The phone booking bar (`MobileSummaryBar`) sets `data-mobile-summary-bar`; `globals.css` then keeps room at the end of the page so it covers neither the steps nor the footer.

## German and Ukrainian

`i18n/config.ts` lists `de` and `uk`. Until they are translated:

- Their URL segments are the English ones (`/de/account/login`, `/uk/reservation`).
- The panel and sign-in texts show the English copy (`i18n/account.ts`, `auth-forms.ts`, `details.ts`). Dates and money already use `de-DE` and `uk-UA`.
- The header and footer labels are translated.
- The reservation flow is Polish in every language, as before.
