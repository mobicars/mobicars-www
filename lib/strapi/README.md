# Strapi bridge

Server-only reads from `mobicars-cms` over GraphQL. Application code imports `@/lib/strapi`. HTTP, parsing and URL building live in `internal/` and are not a public import path. Same layout as `lib/rentcarsoft` and the same cache switch.

Only the Page `blocks` zone is read. The legacy `components` / `extraComponents` zones are for `mobicars-pl`.

## Configuration

Server environment, never `NEXT_PUBLIC_`:

- `STRAPI_URL`: CMS origin, default `http://localhost:1337`.
- `STRAPI_KEY`: Read-only API token of the CMS at `STRAPI_URL`. Required: the CMS's Public role reads nothing (`config/sync/user-role.public.json` in mobicars-cms). Tokens are per instance, so a local CMS needs its own (Settings → API Tokens); `npm run codegen` uses the same one.
- `CACHE_ENABLED` and `REVALIDATE_SECRET`: shared with RentCarSoft, see Caching.

## Pages and URLs

| Function | Returns |
| --- | --- |
| `listPageRoutes(lang)` | Every routable page of a language: `{ documentId, segments }` |
| `findPageRoute(lang, segments)` | The page at a URL, or `null` (404) |
| `getPage(lang, documentId)` | Title, SEO and parsed `blocks`, or `null` |
| `pageHref(lang, segments)` | `/pl/wynajem/warszawa`, `/pl` for the home page |

The URL of a page is its `slug` under its `parentPage` chain. One small list per language answers whether a URL exists, so an unknown URL costs no content query. The same list builds `generateStaticParams`, hreflang and links between pages.

- `homepage` is the page at `/{lang}`. Its children sit at the root.
- `404` is not routable.
- A page whose parent is missing, unroutable or in a cycle has no URL. In production that includes a published child of an unpublished parent.
- Matching ignores letter case; the page redirects to the stored spelling.
- All language versions share the `documentId` (Strapi 5), which is how hreflang finds the page in other languages. The CMS has `pl` and `en`; `de` and `uk` have no pages yet.
- App folders (`fleet`, `reservation`, `account`) win over the catch-all `app/[lang]/[...slug]`.

## Blocks

`Page.blocks` is a list of domain records (`Block`), not GraphQL shapes. Each has a component in `components/blocks`.

| Strapi | `type` | Notes |
| --- | --- | --- |
| `blocks.hero` | `hero` | As the first block: the page's `<h1>`, image loaded eagerly with high priority |

A page that does not open with a hero renders its title as a visually hidden `<h1>`.

Links (`elements.link`) resolve to an `href` in the bridge (`resolveLink`): `page` through the route list, `blog` to `/{lang}/blog/{slug}` (the old site's URLs; there is no blog route here yet), `customUrl` when it is a site path, http(s), `mailto:` or `tel:`. `localPage` and `sale` have no route here yet, so those links are left out, as is a link without a label. Only `customUrl` opens in a new tab.

Adding a block type:

1. Add the fragment to `graphql/page.graphql` and run `npm run codegen` against a CMS that has the component.
2. Add the record to `Block` and a case to `parsePage` in `internal/entities.ts`.
3. Add the component and a case in `components/blocks/blocks.tsx`.

## Header, footer and site settings

`getChrome(lang)` reads three single types in one request; `components/layout/site-chrome.tsx` renders them.

| Strapi | Holds |
| --- | --- |
| `layout` | `header` (menu entries), `footerGroups`, `footerText`, `legalLinks` |
| `site` | `seo` (defaults for `app/[lang]/layout.tsx`), `contact`, `social` |
| `announcement` | The bar above the header: `enabled`, `text`, `variant`, `link`, `startsAt` / `endsAt`, `closable` |

A header entry (`menu.item`) has a `submenu`:

- `none`: the entry is its `link`; the link's label may stay empty, the entry's `label` is used.
- `links`: its `links`, picked in Strapi.
- `fleet`: car classes with their lowest daily price, from RentCarSoft (`lib/fleet`).
- `locations`: pickup points by city; each opens the booking with that point.
- `blog`: the three newest posts (`listLatestPosts`) and the CMS `blog` page.

Submenus are rendered on the server and are in the prerendered HTML; `components/layout/main-nav.tsx` only opens and closes them.

The announcement shows when `enabled` and the current time is in `[startsAt, endsAt)`. Because pages are prerendered, the cached chrome lives only until the next start or end, so the bar turns on and off on time without a publish. A closed bar (`closable`) is remembered in the browser until the editor saves a new version.

## Caching and drafts

One switch for every data source, `CACHE_ENABLED` (`lib/cache.ts`): on unless `false`, `0` or `off`, and on when missing.

| `CACHE_ENABLED` | Where | Reads | Strapi content | Preview banner |
| --- | --- | --- | --- | --- |
| on | production | `use cache`, expired by `/api/revalidate` | published | no |
| off | local, preview deployments | live on every request | drafts | yes |

A site never caches drafts, and a cached site never shows them.

| Function | Profile | Tags |
| --- | --- | --- |
| `listPageRoutes` | `max` | `cms`, `cms:page` |
| `getPage` | `max` | `cms`, `cms:page` |
| `getChrome` | `max`, or until the announcement's next start or end | `cms`, `cms:layout`, `cms:site`, `cms:announcement`, `cms:page`, `cms:blog` |
| `listLatestPosts` | `max` | `cms`, `cms:blog` |

`max` keeps an entry until it is expired on demand. Tag every cached read with each content type its query reads (`cms:<api id>`), including types it only links to or lists: a read of the latest blog posts takes `cms:blog`, so publishing a post expires every page that shows the list.

### Revalidation

`POST /api/revalidate` with `Authorization: Bearer <REVALIDATE_SECRET>` (`lib/revalidate.ts`). The same endpoint and secret serve RentCarSoft. Without the secret it answers 503.

| Body | Expires |
| --- | --- |
| Strapi `entry.*` with `model` | `cms:<model>` |
| Strapi `media.*` | `cms` (every CMS read) |
| Strapi `trigger-test` | nothing |
| `{"tags":["cms:page","rcs:catalog"]}` | those tags; an unknown tag rejects the call |
| `{"event":"purge"}` | everything, CMS and RentCarSoft |

Tags expire with `{ expire: 0 }`: the next visit renders fresh content instead of serving the stale copy once more.

Strapi → Settings → Webhooks, for the cached site only (a preview reads live and needs none):

- URL: `https://mobicars.pl/api/revalidate`
- Header: `Authorization: Bearer <REVALIDATE_SECRET>`
- Events: Entry publish, unpublish, delete; Media update, delete. Not Entry create or update: they fire on saved drafts, which the cached site does not show.

## Code generation

`npm run codegen` reads the schema from `STRAPI_URL` and writes `generated/graphql.ts` (types and one `TypedDocumentString` per query) and `generated/schema.graphql`. Run it against a local CMS that has the current content types. `internal/http.ts` posts the documents with `fetch`; there is no GraphQL client at runtime.

## Errors

Every failure throws `StrapiError` with a fixed message: `unauthorized`, `api`, `graphql`, `timeout`, `network`, `malformed_response`.
