import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { fleetCollectionHref, parseFleetCollections } from "./modules/fleet-collections";
import { placeKindOf, placeSegments } from "./modules/places";
import { relatedCards } from "./modules/blog";
import { StrapiError } from "./internal/errors";
import { isTransient, withRetry } from "./internal/http";
import {
  latestPostQueries,
  latestReviewQueries,
  nextAnnouncementChange,
  parseChrome,
  parsePage,
  resolveLink,
  type OpeningHours,
} from "./internal/entities";
import { formatDays, formatOpeningHours, openingHoursSpecification } from "./internal/opening-hours";
import { parseRichBlocks, parseShortText, richBlocksText } from "./internal/rich-blocks";
import { buildRoutes, findRoute, pageHref, type RouteNode } from "./internal/routes";
import { tagsForWebhook } from "./internal/tags";
import { sectionEdgeTone, type TextSection } from "./internal/sections";

const node = (documentId: string, slug: string, parentDocumentId: string | null = null): RouteNode => ({
  documentId,
  slug,
  parentDocumentId,
});

describe("page routes", () => {
  const routes = buildRoutes([
    node("home", "homepage"),
    node("rent", "wynajem"),
    node("waw", "warszawa", "rent"),
    node("praga", "praga", "waw"),
    node("under-home", "kontakt", "home"),
    node("not-found", "404"),
    node("orphan", "sierota", "missing"),
    node("a", "a", "b"),
    node("b", "b", "a"),
    node("child-of-404", "dziecko", "not-found"),
  ]);
  const paths = Object.fromEntries(routes.map((route) => [route.documentId, route.segments.join("/")]));

  it("builds nested paths from parentPage", () => {
    assert.equal(paths.home, "");
    assert.equal(paths.rent, "wynajem");
    assert.equal(paths.waw, "wynajem/warszawa");
    assert.equal(paths.praga, "wynajem/warszawa/praga");
  });

  it("puts children of the home page at the root", () => {
    assert.equal(paths["under-home"], "kontakt");
  });

  it("leaves out pages it cannot place", () => {
    assert.equal(paths["not-found"], undefined);
    assert.equal(paths.orphan, undefined);
    assert.equal(paths.a, undefined);
    assert.equal(paths.b, undefined);
    assert.equal(paths["child-of-404"], undefined);
  });

  it("finds a route regardless of case and encoding", () => {
    assert.equal(findRoute(routes, ["wynajem", "warszawa"])?.documentId, "waw");
    assert.equal(findRoute(routes, ["Wynajem", "WARSZAWA"])?.documentId, "waw");
    assert.equal(findRoute(routes, ["wynajem%2Fwarszawa"]), null);
    assert.equal(findRoute(routes, ["warszawa"]), null);
    assert.equal(findRoute(routes, ["%E0"]), null);
  });

  it("keeps the change date for the sitemap", () => {
    const [route] = buildRoutes([{ documentId: "a", slug: "kontakt", parentDocumentId: null, updatedAt: "2026-11-01T10:00:00.000Z" }]);
    assert.equal(route.updatedAt, "2026-11-01T10:00:00.000Z");
    assert.equal("updatedAt" in buildRoutes([{ documentId: "b", slug: "faq", parentDocumentId: null, updatedAt: null }])[0], false);
  });

  it("builds hrefs", () => {
    assert.equal(pageHref("pl", []), "/pl");
    assert.equal(pageHref("en", ["rent", "warsaw"]), "/en/rent/warsaw");
  });
});

describe("rich text from CKEditor", () => {
  it("reads the editor's HTML into the same nodes as Strapi blocks", () => {
    const html =
      '<h2>Tytuł &amp; więcej</h2><p>Zwykły <strong>gruby <i>i kursywa</i></strong> i <a href="/pl/dokumenty/regulamin">regulamin</a>.<br>Linia&nbsp;2</p>' +
      "<p>&nbsp;</p><ul><li>Jeden</li><li>Dwa<ul><li>Zagnieżdżone</li></ul></li></ol><blockquote><p>Cytat</p></blockquote>";
    assert.deepEqual(parseRichBlocks(html), [
      { type: "heading", level: 2, children: [{ type: "text", text: "Tytuł & więcej" }] },
      {
        type: "paragraph",
        children: [
          { type: "text", text: "Zwykły " },
          { type: "text", text: "gruby ", bold: true },
          { type: "text", text: "i kursywa", bold: true, italic: true },
          { type: "text", text: " i " },
          { type: "link", href: "/pl/dokumenty/regulamin", children: [{ type: "text", text: "regulamin" }] },
          { type: "text", text: "." },
          { type: "text", text: "\n" },
          { type: "text", text: "Linia\u00a02" },
        ],
      },
      {
        type: "list",
        format: "unordered",
        children: [
          { type: "list-item", children: [{ type: "text", text: "Jeden" }] },
          { type: "list-item", children: [{ type: "text", text: "Dwa" }] },
          { type: "list", format: "unordered", children: [{ type: "list-item", children: [{ type: "text", text: "Zagnieżdżone" }] }] },
        ],
      },
      { type: "quote", children: [{ type: "text", text: "Cytat" }] },
    ]);
  });

  it("reads tables with header and merged cells, and drops empty ones", () => {
    const html =
      '<figure class="table"><table><thead><tr><th>Klasa</th><th colspan="2">Cena</th></tr></thead>' +
      '<tbody><tr><td rowspan="2"><p><strong>B</strong></p></td><td>od 89 zł</td><td></td></tr></tbody></table></figure><table><tr><td> </td></tr></table>';
    assert.deepEqual(parseRichBlocks(html), [
      {
        type: "table",
        rows: [
          [
            { header: true, children: [{ type: "text", text: "Klasa" }] },
            { header: true, colSpan: 2, children: [{ type: "text", text: "Cena" }] },
          ],
          [
            { header: false, rowSpan: 2, children: [{ type: "text", text: "B", bold: true }] },
            { header: false, children: [{ type: "text", text: "od 89 zł" }] },
            { header: false, children: [] },
          ],
        ],
      },
    ]);
    assert.equal(richBlocksText(parseRichBlocks(html)), "Klasa Cena B od 89 zł");
  });

  it("reads a short text: plain text as one paragraph, HTML as paragraphs and lists", () => {
    assert.deepEqual(parseShortText("Bez kaucji\ni limitu"), [{ type: "paragraph", children: [{ type: "text", text: "Bez kaucji i limitu" }] }]);
    assert.deepEqual(parseShortText('<h2 style="text-align:center">Tytuł</h2><p><s>Stara</s> cena</p><ol><li>Raz</li></ol><table><tr><td>x</td></tr></table>'), [
      { type: "paragraph", children: [{ type: "text", text: "Tytuł" }] },
      { type: "paragraph", children: [{ type: "text", text: "Stara", strikethrough: true }, { type: "text", text: " cena" }] },
      { type: "list", format: "ordered", children: [{ type: "list-item", children: [{ type: "text", text: "Raz" }] }] },
    ]);
    assert.equal(parseShortText("<p>&nbsp;</p>"), null);
    assert.equal(parseShortText(null), null);
  });

  it("keeps only the text of unsafe links and drops scripts and unknown tags", () => {
    assert.deepEqual(parseRichBlocks('<p><a href="javascript:alert(1)">zły</a><script>alert(1)</script><span>ok</span></p><figure><img src="x"></figure>'), [
      { type: "paragraph", children: [{ type: "text", text: "zły" }, { type: "text", text: "ok" }] },
    ]);
  });

  it("keeps CKEditor's alignment of paragraphs and headings, and no other style", () => {
    assert.deepEqual(parseRichBlocks('<h3 style="text-align:center;">Tytuł</h3><p style="text-align:right; color:red">Prawo</p><p style="color:red">Zwykły</p>'), [
      { type: "heading", level: 3, align: "center", children: [{ type: "text", text: "Tytuł" }] },
      { type: "paragraph", align: "right", children: [{ type: "text", text: "Prawo" }] },
      { type: "paragraph", children: [{ type: "text", text: "Zwykły" }] },
    ]);
  });
});

describe("webhook tags", () => {
  it("expires the changed content type", () => {
    assert.deepEqual(tagsForWebhook({ event: "entry.publish", model: "page" }), ["cms:page"]);
    assert.deepEqual(tagsForWebhook({ event: "entry.unpublish", model: "blog" }), ["cms:blog"]);
  });

  it("expires every CMS read for media", () => {
    assert.deepEqual(tagsForWebhook({ event: "media.update" }), ["cms"]);
  });

  it("does nothing for the test trigger and rejects the rest", () => {
    assert.deepEqual(tagsForWebhook({ event: "trigger-test" }), []);
    assert.equal(tagsForWebhook({ event: "entry.publish" }), null);
    assert.equal(tagsForWebhook({ event: "entry.publish", model: "Page; drop" }), null);
    assert.equal(tagsForWebhook({ event: "review-workflows.updateEntryStage", model: "page" }), null);
    assert.equal(tagsForWebhook({ event: "purge" }), null);
    assert.equal(tagsForWebhook("purge"), null);
    assert.equal(tagsForWebhook(null), null);
  });
});

describe("page parsing", () => {
  const image = { url: "/uploads/hero.jpg", mime: "image/jpeg", width: 1920, height: 1080, alternativeText: null };
  const link = (overrides: object) => ({
    label: "Zobacz",
    linkType: "customUrl" as const,
    customUrl: null,
    newTab: false,
    page: null,
    blog: null,
    document: null,
    ...overrides,
  });
  const page = parsePage(
    {
      documentId: "home",
      title: "Strona główna",
      seo: null,
      sections: [
        { __typename: "Error" },
        {
          __typename: "ComponentSectionsText",
          id: "1",
          badge: "",
          textTitle: "Wynajem aut",
          body: "<p>Tekst</p>",
          textAlign: "start",
          textWidth: "narrow",
          collapsible: false,
          previewParagraphs: null,
          background: null,
          textFrameWidth: "full",
          textSpacing: "medium",
          ctas: [
            { variant: "primary", icon: "arrow-right", link: link({ linkType: "page", page: { documentId: "rent" } }) },
            { variant: "secondary", icon: null, link: link({ customUrl: "https://example.com", newTab: true }) },
            { variant: "success", icon: null, link: link({ customUrl: "javascript:alert(1)" }) },
            { variant: "success", icon: null, link: link({ customUrl: "//evil.example" }) },
            { variant: "success", icon: null, link: link({ linkType: "page", page: { documentId: "draft-only" } }) },
            { variant: "success", icon: null, link: link({ linkType: "blog" }) },
          ],
        },
      ],
    } as unknown as Parameters<typeof parsePage>[0],
    "pl",
    [{ documentId: "rent", segments: ["wynajem"] }],
  );
  const text = page.sections[0] as TextSection;

  it("skips sections it does not know", () => {
    assert.equal(page.sections.length, 1);
    assert.equal(text.type, "text");
  });

  it("resolves links and drops unsafe or unroutable ones", () => {
    assert.deepEqual(
      text.ctas.map((cta) => [cta.href, cta.newTab]),
      [
        ["/pl/wynajem", false],
        ["https://example.com", true],
      ],
    );
  });

  it("links a document to its redirect, per language, and drops one without a document", () => {
    const doc = link({ linkType: "document", document: { slug: "regulamin" } });
    assert.equal(resolveLink(doc, "pl", [])?.href, "/pl/dokumenty/regulamin");
    assert.equal(resolveLink(doc, "en", [])?.href, "/en/documents/regulamin");
    assert.equal(resolveLink(link({ linkType: "document" }), "pl", []), null);
  });

  it("maps empty strings and the SEO fields", () => {
    assert.equal(text.badge, null);
    assert.deepEqual(page.seo, { title: null, description: null, noIndex: false, noFollow: false, image: null });
  });

  it("reads the page's own share image", () => {
    const withImage = parsePage(
      {
        documentId: "home",
        title: "Strona główna",
        seo: { metaTitle: "Tytuł", metaDescription: null, noIndex: null, noFollow: null, shareImage: { ...image, url: "/uploads/og.jpg" } },
        sections: [],
      } as unknown as Parameters<typeof parsePage>[0],
      "pl",
      [],
    );
    assert.equal(withImage.seo.image?.url, "http://localhost:1337/uploads/og.jpg");
    assert.equal(withImage.seo.title, "Tytuł");
  });
});

describe("chrome parsing", () => {
  const link = (overrides: object) => ({
    label: null,
    linkType: "page" as const,
    customUrl: null,
    newTab: false,
    page: { documentId: "rent" },
    blog: null,
    document: null,
    ...overrides,
  });
  const raw = (announcement: object | null) => ({
    layout: {
      header: [
        { label: "Wynajem", submenu: "none" as const, link: link({}), links: null },
        { label: "Zepsuty", submenu: "none" as const, link: link({ page: { documentId: "draft-only" } }), links: null },
        { label: "Więcej", submenu: "links" as const, link: null, links: [link({ label: "Blog", linkType: "blog", blog: { slug: "porady" } })] },
        { label: "Pusto", submenu: "links" as const, link: null, links: [] },
        { label: "Flota", submenu: "fleet" as const, link: null, links: null },
      ],
      footerGroups: [{ title: "Firma", links: [link({ label: "Wynajem" })] }, { title: "Pusta", links: [] }],
      footerText: "  ",
      legalLinks: [],
      headerCta: null,
      topLinks: [link({ label: "FAQ" }), null],
      paymentMethods: [{ method: "blik" as const }, null, { method: "card" as const }, { method: "blik" as const }],
      companyName: " MobiCars Sp. z o.o. Sp. k. ",
      legalText: null,
    },
    announcement: announcement
      ? {
          documentId: "a1",
          updatedAt: "2026-11-01T10:00:00.000Z",
          enabled: true,
          text: "Promocja",
          variant: "promo" as const,
          link: null,
          startsAt: null,
          endsAt: null,
          closable: true,
          ...announcement,
        }
      : null,
    site: {
      seo: null,
      contact: {
        phone: "+48 881 328 328",
        email: "biuro@mobicars.pl",
        salesPhone: "+48 730 194 190",
        salesEmail: "samochody@mobicars.pl",
        address: null,
        openingHours: " ",
        availabilityNote: null,
        whatsapp: "+48 881 328 328",
        chatUrl: "http://chat.example",
        hours: [
          { days: ["fri", "mon", "tue", "wed", "thu", "fri"], from: "07:00:00.000", to: "20:00:00.000", closed: false },
          { days: ["sun"], from: null, to: null, closed: true },
          { days: ["sat"], from: "08:00:00.000", to: null, closed: false },
          { days: [], from: "08:00:00.000", to: "12:00:00.000", closed: false },
        ],
        legalName: " MobiCars Sp. z o.o. Sp. k. ",
        nip: "5272887600",
        regon: null,
        krs: " ",
        mapUrl: "http://maps.example",
      },
      appStoreUrl: "https://apps.apple.com/pl/app/mobicars",
      googlePlayUrl: "javascript:alert(1)",
      social: [
        { platform: "x" as const, url: "javascript:alert(1)" },
        { platform: "facebook" as const, url: "https://facebook.com/mobicars" },
        { platform: "facebook" as const, url: "https://facebook.com/mobicars.pl" },
        { platform: "x" as const, url: "https://x.com/mobicars" },
      ],
    },
  });
  const routes = [{ documentId: "rent", segments: ["wynajem"] }];
  const now = new Date("2026-11-13T12:00:00Z");

  it("builds the menu and drops entries with nowhere to go", () => {
    const chrome = parsePageChrome(raw(null));
    assert.deepEqual(
      chrome.header.map((item) => [item.label, item.submenu]),
      [
        ["Wynajem", "none"],
        ["Więcej", "links"],
        ["Flota", "fleet"],
      ],
    );
    const [plain, more] = chrome.header;
    assert.deepEqual(plain.submenu === "none" && plain.link, { label: "Wynajem", href: "/pl/wynajem", newTab: false });
    assert.deepEqual(more.submenu === "links" && more.links, [{ label: "Blog", href: "/pl/blog/porady", newTab: false }]);
    assert.deepEqual(chrome.footer.groups.map((group) => group.title), ["Firma"]);
    assert.equal(chrome.footer.text, null);
  });

  it("reads contact and safe social links", () => {
    const chrome = parsePageChrome(raw(null));
    assert.equal(chrome.contact?.phoneHref, "tel:+48881328328");
    assert.equal(chrome.contact?.openingHours, null);
    assert.equal(chrome.contact?.whatsappHref, "https://wa.me/48881328328");
    assert.equal(chrome.contact?.chatUrl, null);
    assert.equal(chrome.contact?.mapUrl, null);
    assert.deepEqual(chrome.contact?.company, { legalName: "MobiCars Sp. z o.o. Sp. k.", nip: "5272887600", regon: null, krs: null });
    assert.equal(chrome.appStoreUrl, "https://apps.apple.com/pl/app/mobicars");
    assert.equal(chrome.googlePlayUrl, null);
    assert.deepEqual(chrome.social, [
      { platform: "facebook", url: "https://facebook.com/mobicars" },
      { platform: "x", url: "https://x.com/mobicars" },
    ]);
  });

  it("reads opening hours rows, in week order, without incomplete ones", () => {
    assert.deepEqual(parsePageChrome(raw(null)).contact?.hours, [
      { days: ["mon", "tue", "wed", "thu", "fri"], opens: "07:00", closes: "20:00", closed: false },
      { days: ["sun"], opens: null, closes: null, closed: true },
    ]);
  });

  it("reads payment methods once each, the company name, the default header button and the top bar links", () => {
    const chrome = parsePageChrome(raw(null));
    assert.deepEqual(chrome.footer.paymentMethods, ["blik", "card"]);
    assert.equal(chrome.footer.companyName, "MobiCars Sp. z o.o. Sp. k.");
    assert.equal(chrome.footer.legalText, null);
    assert.equal(chrome.headerCta, null);
    assert.deepEqual(chrome.topLinks.map((link) => link.label), ["FAQ"]);
  });

  it("shows the announcement only inside its dates", () => {
    assert.equal(parsePageChrome(raw({})).announcement?.key, "a1:2026-11-01T10:00:00.000Z");
    assert.equal(parsePageChrome(raw({ enabled: false })).announcement, null);
    assert.equal(parsePageChrome(raw({ startsAt: "2026-11-14T00:00:00Z" })).announcement, null);
    assert.equal(parsePageChrome(raw({ endsAt: "2026-11-13T12:00:00Z" })).announcement, null);
    assert.ok(parsePageChrome(raw({ startsAt: "2026-11-13T11:00:00Z", endsAt: "2026-11-13T13:00:00Z" })).announcement);
  });

  it("knows when the announcement turns on or off next", () => {
    assert.equal(nextAnnouncementChange(raw({}), now), null);
    assert.equal(
      nextAnnouncementChange(raw({ startsAt: "2026-11-20T00:00:00Z", endsAt: "2026-11-30T00:00:00Z" }), now)?.toISOString(),
      "2026-11-20T00:00:00.000Z",
    );
    assert.equal(
      nextAnnouncementChange(raw({ startsAt: "2026-11-01T00:00:00Z", endsAt: "2026-11-30T00:00:00Z" }), now)?.toISOString(),
      "2026-11-30T00:00:00.000Z",
    );
    assert.equal(nextAnnouncementChange(raw({ enabled: false, endsAt: "2026-11-30T00:00:00Z" }), now), null);
  });

  function parsePageChrome(input: ReturnType<typeof raw>) {
    return parseChrome(input, "pl", routes, now);
  }
});

describe("page pickup point", () => {
  const raw = (pickupPoint?: number | null) => ({ documentId: "c", title: "Kraków", seo: null, sections: [], ...(pickupPoint === undefined ? {} : { pickupPoint }) });

  it("keeps the point of a city or local page and nothing for other pages", () => {
    assert.equal(parsePage(raw(490) as never, "pl", []).pickupId, 490);
    assert.equal(parsePage(raw(null) as never, "pl", []).pickupId, null);
    assert.equal(parsePage(raw(0) as never, "pl", []).pickupId, null);
    assert.equal(parsePage(raw() as never, "pl", []).pickupId, null);
  });
});

describe("city and local page paths", () => {
  it("builds the old site's URLs", () => {
    assert.deepEqual(placeSegments("city", "pl", "wypozyczalnia-samochodow-warszawa"), ["wypozyczalnia-samochodow-warszawa"]);
    assert.deepEqual(placeSegments("local", "pl", "warszawa-bemowo"), ["lokalna-wypozyczalnia-samochodow", "warszawa-bemowo"]);
    assert.deepEqual(placeSegments("local", "en", "warsaw-bemowo"), ["local-car-rental", "warsaw-bemowo"]);
  });

  it("tells a city path from a local page path", () => {
    assert.equal(placeKindOf("pl", ["wypozyczalnia-samochodow-krakow"]), "city");
    assert.equal(placeKindOf("pl", ["Lokalna-Wypozyczalnia-Samochodow", "warszawa-bemowo"]), "local");
    assert.equal(placeKindOf("en", ["local-car-rental", "warsaw-bemowo"]), "local");
    // Another language's folder, a deeper path or another folder is neither.
    assert.equal(placeKindOf("en", ["lokalna-wypozyczalnia-samochodow", "warszawa-bemowo"]), null);
    assert.equal(placeKindOf("pl", ["lokalna-wypozyczalnia-samochodow", "a", "b"]), null);
    assert.equal(placeKindOf("pl", ["wynajem", "warszawa"]), null);
  });
});

describe("opening hours", () => {
  const rows: OpeningHours[] = [
    { days: ["mon", "tue", "wed", "thu", "fri"], opens: "07:00", closes: "20:00", closed: false },
    { days: ["sat", "sun"], opens: "08:00", closes: "18:00", closed: false },
    { days: ["mon", "wed"], opens: null, closes: null, closed: true },
  ];

  it("writes day ranges and lists in the page's language", () => {
    assert.deepEqual(formatOpeningHours(rows, "pl", "nieczynne"), ["pon.–pt. 07:00–20:00", "sob., niedz. 08:00–18:00", "pon., śr. nieczynne"]);
    assert.equal(formatDays(["mon", "tue", "wed", "fri"], "en"), "Mon–Wed, Fri");
  });

  it("builds schema.org opening hours without closed rows", () => {
    assert.deepEqual(openingHoursSpecification(rows).map((row) => [row.dayOfWeek.length, row.opens, row.closes]), [
      [5, "07:00", "20:00"],
      [2, "08:00", "18:00"],
    ]);
  });
});

describe("reviews and image sections", () => {
  const rating = (documentId: string, text: string, rate = 5) => ({ documentId, name: ` Klient ${documentId} `, rate, text });
  const reviews = (overrides: Record<string, unknown>) => ({
    __typename: "ComponentSectionsReviews",
    id: "7",
    badge: null,
    reviewsTitle: "Opinie",
    reviewsText: null,
    reviewsHeaderAlign: "center",
    reviewsSource: "latest",
    reviewsLimit: 2,
    ratings: [],
    reviewsLayout: "carousel",
    showScore: false,
    score: 4.75,
    scoreLabel: " na podstawie opinii ",
    ctas: [],
    background: null,
    reviewsWidth: "full",
    reviewsSpacing: "medium",
    ...overrides,
  });
  const page = (sections: unknown[], latestReviews: Record<string, unknown[]> = {}) =>
    parsePage({ documentId: "p", title: "Strona", seo: null, sections } as unknown as Parameters<typeof parsePage>[0], "pl", [], {}, latestReviews as never).sections;

  it("reads the newest reviews for a latest section, up to its limit, without leading star emoji", () => {
    const raw = reviews({});
    assert.deepEqual(latestReviewQueries({ documentId: "p", title: "Strona", seo: null, sections: [raw] } as never), [{ sectionId: "7", limit: 2 }]);
    const [section] = page([raw], { "7": [rating("a", "⭐️⭐️⭐️⭐️⭐️\nŚwietna obsługa"), null, rating("b", "Polecam", 4), rating("c", "Trzecia")] });
    assert.equal(section.type, "reviews");
    assert.deepEqual(section.type === "reviews" ? section.reviews : null, [
      { id: "a", author: "Klient a", rating: 5, text: "Świetna obsługa" },
      { id: "b", author: "Klient b", rating: 4, text: "Polecam" },
    ]);
    assert.equal(section.type === "reviews" ? section.score : undefined, null);
  });

  it("shows the picked reviews and the typed score only when turned on", () => {
    const [section] = page([reviews({ reviewsSource: "selected", ratings: [rating("x", "Super")], showScore: true, score: 7 })]);
    assert.deepEqual(section.type === "reviews" ? [section.reviews.map((review) => review.id), section.score] : null, [["x"], { value: 5, label: "na podstawie opinii" }]);
  });

  it("drops a section with no reviews in the page's language", () => {
    assert.deepEqual(page([reviews({}), reviews({ id: "8", reviewsSource: "selected", ratings: [] })], { "7": [] }), []);
  });

  it("reads the image section and drops one without an image", () => {
    const media = { url: "/uploads/a.png", mime: "image/png", width: 1600, height: 900, alternativeText: " Opis " };
    const image = (overrides: Record<string, unknown>) => ({ __typename: "ComponentSectionsImage", id: "3", picture: media, pictureMobile: null, imageSize: "narrow", caption: "  ", background: null, imageSpacing: "small", ...overrides });
    const [section] = page([image({}), image({ id: "4", picture: null })]);
    assert.equal(section.type, "image");
    assert.deepEqual(section.type === "image" ? [section.size, section.caption, section.image.alt, section.imageMobile] : null, ["narrow", null, "Opis", null]);
    assert.equal(page([image({ picture: null })]).length, 0);
  });
});

describe("blog listing", () => {
  const blog = (blogSource: string) => ({ __typename: "ComponentSectionsBlog", id: "5", badge: null, blogTitle: "Blog", blogText: null, blogHeaderAlign: "center", blogSource, blogLayout: "featured", posts: [], ctas: [], background: null, blogWidth: "full", blogSpacing: "medium" });
  const post = (n: number) => ({ documentId: `b${n}`, title: `Wpis ${n}`, slug: `wpis-${n}`, excerpt: null, publishedAt: null, createdAt: null, category: null, coverImage: null });
  const raw = (section: unknown) => ({ documentId: "p", title: "Strona", seo: null, sections: [section] }) as never;

  it("reads every post for an `all` section and keeps them all", () => {
    assert.deepEqual(latestPostQueries(raw(blog("all"))), [{ blockId: "section-5", limit: 1000 }]);
    const posts = Array.from({ length: 30 }, (_, n) => post(n));
    const [section] = parsePage(raw(blog("all")), "pl", [], { "section-5": posts as never }).sections;
    assert.deepEqual(section.type === "blog" ? [section.listing, section.posts.length] : null, [true, 30]);
    const [latest] = parsePage(raw(blog("latest")), "pl", [], { "section-5": posts as never }).sections;
    assert.deepEqual(latest.type === "blog" ? [latest.listing, latest.posts.length] : null, [false, 4]);
  });
});

describe("divider section", () => {
  const page = (sections: unknown[]) =>
    parsePage({ documentId: "p", title: "Strona", seo: null, sections } as unknown as Parameters<typeof parsePage>[0], "pl", []).sections;
  const text = (id: string, tone: string, width = "full") => ({ __typename: "ComponentSectionsText", id, textTitle: "T", body: "<p>Tekst</p>", textAlign: "center", textWidth: "narrow", collapsible: false, previewParagraphs: 2, ctas: [], background: { tone }, textFrameWidth: width, textSpacing: "small" });

  it("reads the divider, a missing direction falling to the right", () => {
    const [section] = page([{ __typename: "ComponentSectionsDivider", id: "9", dividerStyle: "slant", dividerSize: "large", dividerTone: "navy", dividerDirection: null }]);
    assert.deepEqual(section, { type: "divider", id: "9", style: "slant", size: "large", tone: "navy", direction: "right" });
  });

  it("gives a slant the colours at its neighbours' edges", () => {
    const [plain, fade, framed, photo] = page([text("1", "green"), text("2", "fade"), text("3", "navy", "boxed"), { ...text("4", "image"), background: { tone: "image", image: { url: "/uploads/a.jpg", mime: "image/jpeg", width: 10, height: 10 } } }]);
    assert.deepEqual(
      [sectionEdgeTone(plain, "top"), sectionEdgeTone(fade, "top"), sectionEdgeTone(fade, "bottom"), sectionEdgeTone(framed, "top"), sectionEdgeTone(photo, "bottom")],
      ["green", "light", "white", "white", null],
    );
  });
});

describe("related blog posts", () => {
  const card = (documentId: string) => ({
    documentId,
    title: `Wpis ${documentId}`,
    slug: `wpis-${documentId}`,
    excerpt: null,
    publishedAt: null,
    createdAt: "2026-10-01T10:00:00.000Z",
    coverImage: { url: "/uploads/a.jpg", mime: "image/jpeg", width: 800, height: 450, alternativeText: null },
  });

  it("leaves out the post itself and shows at most four", () => {
    assert.deepEqual(
      relatedCards([card("a"), null, card("self"), card("b"), card("c"), card("d"), card("e")], "self", "pl").map((post) => [post.id, post.href]),
      [
        ["a", "/pl/blog/wpis-a"],
        ["b", "/pl/blog/wpis-b"],
        ["c", "/pl/blog/wpis-c"],
        ["d", "/pl/blog/wpis-d"],
      ],
    );
    assert.deepEqual(relatedCards([], "self", "pl"), []);
  });
});

describe("strapi request retries", () => {
  const failing = (errors: unknown[], result = "ok") => {
    let calls = 0;
    return {
      attempt: async () => {
        const error = errors[calls++];
        if (error) throw error;
        return result;
      },
      calls: () => calls,
    };
  };
  const waits: number[] = [];
  const sleep = async (ms: number) => {
    waits.push(ms);
  };
  const retryable = (error: unknown) => isTransient(error, false);

  it("retries a dropped connection and a 5xx twice with backoff, then succeeds", async () => {
    waits.length = 0;
    const run = failing([new StrapiError("network"), new StrapiError("api", 503)]);
    assert.equal(await withRetry(run.attempt, retryable, [500, 1500], sleep), "ok");
    assert.equal(run.calls(), 3);
    assert.deepEqual(waits, [500, 1500]);
  });

  it("throws the last error after the retries", async () => {
    const run = failing([new StrapiError("network"), new StrapiError("network"), new StrapiError("api", 502)]);
    await assert.rejects(withRetry(run.attempt, retryable, [500, 1500], sleep), (error: StrapiError) => error.status === 502);
    assert.equal(run.calls(), 3);
  });

  it("does not retry what would fail again", async () => {
    for (const error of [new StrapiError("unauthorized", 401), new StrapiError("graphql", 400), new StrapiError("api", 404), new StrapiError("malformed_response", 200), new Error("bug")]) {
      const run = failing([error]);
      await assert.rejects(withRetry(run.attempt, retryable, [500, 1500], sleep));
      assert.equal(run.calls(), 1);
    }
  });

  it("retries a timeout only while building", () => {
    assert.equal(isTransient(new StrapiError("timeout"), false), false);
    assert.equal(isTransient(new StrapiError("timeout"), true), true);
    assert.equal(isTransient(new StrapiError("api", 429), false), true);
  });
});

describe("fleet collections", () => {
  const raw = (overrides: Record<string, unknown> = {}) => ({
    documentId: "c1",
    title: " Dla rodzin ",
    slug: "dla-rodzin",
    icon: "users",
    segmentIds: [],
    categories: [],
    fuels: [],
    bodies: [],
    gearboxes: [],
    minSeats: 7,
    onlyPromotion: false,
    onlyPopular: false,
    sort: "price",
    landingPage: { documentId: "p1" },
    ...overrides,
  });

  it("keeps the slug, icon and landing next to the rules; drops one without a slug or title", () => {
    const parsed = parseFleetCollections({ carCollections: [raw(), raw({ slug: null }), raw({ title: "  " }), null] } as never);
    assert.equal(parsed.length, 1);
    assert.deepEqual(
      { title: parsed[0].title, slug: parsed[0].slug, icon: parsed[0].icon, landing: parsed[0].landing, minSeats: parsed[0].minSeats, sort: parsed[0].sort },
      { title: "Dla rodzin", slug: "dla-rodzin", icon: "users", landing: "p1", minSeats: 7, sort: "price" },
    );
  });

  it("links to the landing page in this language, else to the fleet filtered to the collection", () => {
    const routes = [{ documentId: "p1", segments: ["auta-dla-rodzin"] }];
    assert.equal(fleetCollectionHref("pl", { slug: "dla-rodzin", landing: "p1" }, routes), "/pl/auta-dla-rodzin");
    // The landing page has no version in this language: no route, so the fleet.
    assert.equal(fleetCollectionHref("uk", { slug: "dlia-simei", landing: "p1" }, []), "/uk/avtopark?collection=dlia-simei");
    assert.equal(fleetCollectionHref("pl", { slug: "dla-rodzin", landing: null }, routes), "/pl/flota?collection=dla-rodzin");
  });
});

describe("car-sale specs", () => {
  it("reads the labelled lines of an ad's text, numbers as numbers", async () => {
    const { saleSpecs } = await import("./internal/sales");
    const html =
      "<p><strong>Silnik: </strong>2.0 mHEV <strong><br>Rok produkcji: </strong>2021 r.<br><strong>Moc: </strong>150 KM<br><strong>Paliwo:</strong> benzyna<br>" +
      "<strong>Skrzynia biegów: </strong>Automatyczna<br><strong>Przebieg:</strong> 198&nbsp;000 km<br><strong>Typ nadwozia:</strong> suv</p><p>Opis i wyposażenie</p>";
    assert.deepEqual(saleSpecs(html), {
      engine: "2.0 mHEV",
      year: 2021,
      power: "150 KM",
      fuel: "Benzyna",
      gearbox: "Automatyczna",
      mileage: 198000,
      body: "SUV",
    });
  });

  it("leaves out what the ad does not say", async () => {
    const { saleSpecs } = await import("./internal/sales");
    assert.deepEqual(saleSpecs("<p>Tylko opis.</p>"), { engine: null, year: null, power: null, fuel: null, gearbox: null, mileage: null, body: null });
    assert.equal(saleSpecs(null).year, null);
  });
});
