import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { FeaturesBlockFragment } from "./generated/graphql";
import { placeKindOf, placeSegments } from "./modules/places";
import { relatedCards } from "./modules/blog";
import { StrapiError } from "./internal/errors";
import { isTransient, withRetry } from "./internal/http";
import {
  DEFAULT_SECTION,
  faqGroups,
  latestPostQueries,
  nextAnnouncementChange,
  pageNeedsReviews,
  parseChrome,
  parsePage,
  type HeroBlock,
  type OpeningHours,
} from "./internal/entities";
import { formatDays, formatOpeningHours, openingHoursSpecification } from "./internal/opening-hours";
import { parseRichBlocks, richBlocksText } from "./internal/rich-blocks";
import { buildRoutes, findRoute, pageHref, type RouteNode } from "./internal/routes";
import { tagsForWebhook } from "./internal/tags";

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
    ...overrides,
  });
  const page = parsePage(
    {
      documentId: "home",
      title: "Strona główna",
      seo: null,
      blocks: [
        { __typename: "Error" },
        {
          __typename: "ComponentBlocksHero",
          id: "1",
          badge: "",
          title: "Wynajem aut",
          subtitle: null,
          overlay: "medium",
          height: "default",
          reservationLayout: "horizontal",
          reservationDefaultTerm: "longTerm",
          highlights: [{ icon: "check", text: " Bez kaucji " }, { icon: null, text: " " }, null],
          heroLayout: "split",
          searchSide: null,
          focalPoint: null,
          breadcrumbLabel: null,
          trust: null,
          backgroundImage: image,
          backgroundImageMobile: null,
          backgroundVideo: null,
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
    },
    "pl",
    [{ documentId: "rent", segments: ["wynajem"] }],
  );
  const hero = page.blocks[0] as HeroBlock;

  it("skips blocks it does not know", () => {
    assert.equal(page.blocks.length, 1);
    assert.equal(hero.type, "hero");
  });

  it("resolves links and drops unsafe or unroutable ones", () => {
    assert.deepEqual(
      hero.ctas.map((cta) => [cta.href, cta.newTab]),
      [
        ["/pl/wynajem", false],
        ["https://example.com", true],
      ],
    );
  });

  it("maps media, empty strings and the booking form", () => {
    assert.equal(hero.image?.url, "http://localhost:1337/uploads/hero.jpg");
    assert.equal(hero.image?.alt, "");
    assert.equal(hero.searchSide, "start");
    assert.equal(hero.focalPoint, "center");
    assert.equal(hero.trust, null);
    assert.equal(hero.badge, null);
    assert.deepEqual(hero.reservation, { layout: "horizontal", defaultTerm: "long" });
    assert.deepEqual(hero.highlights, [{ icon: "check", text: "Bez kaucji" }]);
    assert.equal(hero.layout, "split");
    assert.deepEqual(page.seo, { title: null, description: null, noIndex: false, noFollow: false, image: null });
  });

  it("reads the page's own share image", () => {
    const withImage = parsePage(
      {
        documentId: "home",
        title: "Strona główna",
        seo: { metaTitle: "Tytuł", metaDescription: null, noIndex: null, noFollow: null, shareImage: { ...image, url: "/uploads/og.jpg" } },
        blocks: [],
      },
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
        departments: [
          {
            name: " Biuro rezerwacji ",
            text: null,
            phone: "+48 881 328 328",
            email: null,
            hours: "24/7",
            schedule: [{ days: ["sat", "sun"], from: "09:00:00.000", to: "17:00:00.000", closed: false }],
            showInFooter: true,
            link: null,
          },
          { name: " ", text: null, phone: null, email: null, hours: null, schedule: [], showInFooter: false, link: null },
        ],
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
    assert.deepEqual(chrome.contact?.departments, [
      {
        name: "Biuro rezerwacji",
        text: null,
        phone: "+48 881 328 328",
        phoneHref: "tel:+48881328328",
        email: null,
        hours: "24/7",
        schedule: [{ days: ["sat", "sun"], opens: "09:00", closes: "17:00", closed: false }],
        showInFooter: true,
        link: null,
      },
    ]);
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

  it("reads payment methods once each, the company name and the default header button", () => {
    const chrome = parsePageChrome(raw(null));
    assert.deepEqual(chrome.footer.paymentMethods, ["blik", "card"]);
    assert.equal(chrome.footer.companyName, "MobiCars Sp. z o.o. Sp. k.");
    assert.equal(chrome.footer.legalText, null);
    assert.equal(chrome.headerCta, null);
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

describe("blog posts block", () => {
  const card = (id: string, overrides: object = {}) => ({
    documentId: id,
    title: `Wpis ${id}`,
    slug: `wpis-${id}`,
    excerpt: "  Zajawka  ",
    publishedAt: "2026-11-01T10:00:00.000Z",
    createdAt: "2026-10-30T10:00:00.000Z",
    category: { documentId: "porady", name: "Porady", color: null },
    coverImage: { url: `/uploads/${id}.jpg`, mime: "image/jpeg", width: 800, height: 450, alternativeText: null },
    ...overrides,
  });
  const block = (id: string, overrides: object = {}) => ({
    __typename: "ComponentBlocksBlogPosts" as const,
    id,
    badge: "BLOG",
    title: "Z bloga",
    subtitle: null,
    source: "latest" as const,
    limit: 4,
    category: null,
    posts: [],
    cta: null,
    ...overrides,
  });
  const raw = {
    documentId: "home",
    title: "Strona",
    seo: null,
    blocks: [
      block("1", { category: { documentId: "tips" }, limit: 2 }),
      block("2", { source: "picked" as const, posts: [card("b"), null, card("c", { publishedAt: null, category: null })] }),
      block("3"),
    ],
  };

  it("lists what to read for latest blocks", () => {
    assert.deepEqual(latestPostQueries(raw), [
      { blockId: "1", limit: 2, categoryId: "tips" },
      { blockId: "3", limit: 4, categoryId: null },
    ]);
  });

  it("maps latest and picked posts and leaves out empty blocks", () => {
    const page = parsePage(raw, "pl", [], { "1": [card("a")], "3": [] });
    assert.deepEqual(
      page.blocks.map((b) => [b.type, b.id]),
      [
        ["blogPosts", "1"],
        ["blogPosts", "2"],
      ],
    );
    const [latest, picked] = page.blocks;
    assert.ok(latest.type === "blogPosts" && picked.type === "blogPosts");
    assert.deepEqual(latest.posts[0], {
      id: "a",
      title: "Wpis a",
      href: "/pl/blog/wpis-a",
      excerpt: "Zajawka",
      category: "Porady",
      categoryColor: null,
      publishedAt: "2026-10-30T10:00:00.000Z",
      image: { url: "http://localhost:1337/uploads/a.jpg", mime: "image/jpeg", width: 800, height: 450, alt: "" },
    });
    assert.deepEqual(
      picked.posts.map((post) => [post.id, post.category, post.publishedAt]),
      [
        ["b", "Porady", "2026-10-30T10:00:00.000Z"],
        ["c", null, "2026-10-30T10:00:00.000Z"],
      ],
    );
  });
});

describe("features block", () => {
  type Item = NonNullable<FeaturesBlockFragment["items"][number]>;
  const item = (overrides: Partial<Item>): Item => ({ title: "Brak kaucji", text: "  ", icon: "shield-check", tone: null, image: null, imageMobile: null, link: null, ...overrides });
  const page = (items: Item[]) =>
    parsePage(
      {
        documentId: "home",
        title: "Strona",
        seo: null,
        blocks: [{ __typename: "ComponentBlocksFeatures", id: "9", heading: " Dlaczego my ", variant: "cards", items }],
      },
      "pl",
      [{ documentId: "rent", segments: ["wynajem"] }],
    );

  it("maps items and falls back to the item title for an empty link label", () => {
    const [block] = page([
      item({ link: { label: null, linkType: "page", customUrl: null, newTab: false, page: { documentId: "rent" }, blog: null } }),
      item({ icon: null, image: { url: "/uploads/a.png", mime: "image/png", width: 64, height: 64, alternativeText: null } }),
    ]).blocks;
    assert.ok(block.type === "features");
    assert.equal(block.title, "Dlaczego my");
    assert.deepEqual(block.items[0].link, { label: "Brak kaucji", href: "/pl/wynajem", newTab: false });
    assert.equal(block.items[0].text, null);
    assert.equal(block.items[1].image?.url, "http://localhost:1337/uploads/a.png");
    assert.equal(block.items[0].tone, "photo");
    assert.equal(block.items[0].imageMobile, null);
  });

  it("leaves out a block without items", () => {
    assert.equal(page([]).blocks.length, 0);
  });
});

describe("faq block", () => {
  const text = (value: string, marks: object = {}) => ({ type: "text", text: value, ...marks });
  const paragraph = (...children: object[]) => ({ type: "paragraph", children });
  const page = (items: { question: string; answer: unknown }[]) =>
    parsePage(
      {
        documentId: "faq",
        title: "FAQ",
        seo: null,
        blocks: [
          {
            __typename: "ComponentBlocksFaq",
            id: "5",
            header: { eyebrow: null, title: " Pytania ", lead: "  " },
            structuredData: null,
            section: null,
            // GraphQL types the answer as the editor's HTML string; the parser also reads blocks JSON.
            groupByCategory: null,
            faqCta: null,
            items: [null, ...(items as { question: string; answer: string }[]).map((item) => ({ ...item, category: null }))],
          },
        ],
      },
      "pl",
      [],
    );

  it("keeps the rich text the site renders and drops the rest", () => {
    const [block] = page([
      {
        question: " Czy potrzebuję kaucji? ",
        answer: [
          paragraph(text("Nie", { bold: true, color: "red" }), text(", "), {
            type: "link",
            url: "/pl/dokumenty",
            children: [text("zobacz dokumenty")],
          }),
          paragraph(text("")),
          { type: "image", image: { url: "/a.png" } },
          paragraph({ type: "link", url: "javascript:alert(1)", children: [text("tekst zostaje")] }),
          {
            type: "list",
            format: "ordered",
            children: [
              { type: "list-item", children: [text("Prawo jazdy")] },
              { type: "list", format: "unordered", children: [{ type: "list-item", children: [text("kategoria B")] }] },
              { type: "list-item", children: [text(" ")] },
            ],
          },
          { type: "heading", level: 9, children: [text("Uwaga")] },
          { type: "quote", children: [text("Cytat")] },
        ],
      },
    ]).blocks;
    assert.ok(block.type === "faq");
    assert.equal(block.title, "Pytania");
    assert.equal(block.lead, null);
    assert.equal(block.structuredData, true);
    assert.deepEqual(block.section, DEFAULT_SECTION);
    const [item] = block.items;
    assert.equal(item.question, "Czy potrzebuję kaucji?");
    assert.deepEqual(item.answer[0], {
      type: "paragraph",
      children: [
        { type: "text", text: "Nie", bold: true },
        { type: "text", text: ", " },
        { type: "link", href: "/pl/dokumenty", children: [{ type: "text", text: "zobacz dokumenty" }] },
      ],
    });
    assert.deepEqual(item.answer[1], { type: "paragraph", children: [{ type: "text", text: "tekst zostaje" }] });
    assert.deepEqual(item.answer[2], {
      type: "list",
      format: "ordered",
      children: [
        { type: "list-item", children: [{ type: "text", text: "Prawo jazdy" }] },
        { type: "list", format: "unordered", children: [{ type: "list-item", children: [{ type: "text", text: "kategoria B" }] }] },
      ],
    });
    assert.deepEqual(item.answer[3], { type: "heading", level: 2, children: [{ type: "text", text: "Uwaga" }] });
    assert.equal(item.answer.length, 5);
    assert.equal(item.answerText, "Nie, zobacz dokumenty tekst zostaje Prawo jazdy kategoria B Uwaga Cytat");
  });

  it("drops questions without an answer and then the block", () => {
    assert.equal(page([{ question: "Pusta?", answer: [paragraph(text("  "))] }, { question: " ", answer: [paragraph(text("Tak"))] }]).blocks.length, 0);
    assert.equal(page([{ question: "Zły JSON?", answer: 42 }]).blocks.length, 0);
    assert.equal(page([{ question: "Pusty HTML?", answer: "<p>&nbsp;</p>" }]).blocks.length, 0);
  });
});

describe("content, media-text and reviews blocks", () => {
  const paragraph = (value: string) => [{ type: "paragraph", children: [{ type: "text", text: value }] }];
  const header = { eyebrow: " O nas ", title: "Dlaczego MobiCars", lead: null };
  const section = { tone: "tint" as const, spacing: null, width: "reading" as const, anchor: " o-nas " };
  const rating = (documentId: string, date: string, rate: number, source = "Google") => ({
    documentId,
    name: " Anna ",
    rate,
    text: " Polecam ",
    date,
    source,
  });
  const page = (blocks: object[], reviews: unknown[] = []) =>
    parsePage(
      { documentId: "p", title: "Strona", seo: null, blocks } as Parameters<typeof parsePage>[0],
      "pl",
      [{ documentId: "rent", segments: ["wynajem"] }],
      {},
      reviews as Parameters<typeof parsePage>[4],
    ).blocks;

  it("maps content with its heading, section and buttons", () => {
    const [block] = page([
      {
        __typename: "ComponentBlocksContent",
        id: "1",
        header,
        body: paragraph("Tekst"),
        align: "center",
        section,
        ctas: [{ variant: "primary", icon: null, link: { label: "Wynajem", linkType: "page", customUrl: null, newTab: false, page: { documentId: "rent" }, blog: null } }],
      },
    ]);
    assert.ok(block.type === "content");
    assert.equal(block.eyebrow, "O nas");
    assert.equal(block.align, "center");
    assert.deepEqual(block.section, { ...DEFAULT_SECTION, tone: "tint", width: "reading", anchor: "o-nas" });
    assert.equal(block.ctas[0].href, "/pl/wynajem");
  });

  it("leaves out empty content and media-text without an image", () => {
    assert.deepEqual(
      page([
        { __typename: "ComponentBlocksContent", id: "1", header: null, body: [], align: null, section: null, ctas: [] },
        { __typename: "ComponentBlocksMediaText", id: "2", header, body: null, image: null, imagePosition: "end", section: null, ctas: [] },
      ]),
      [],
    );
  });

  it("lists the newest reviews of one source with a summary over all of them", () => {
    const reviews = [
      rating("a", "2026-01-01", 4),
      rating("b", "2026-03-01", 5),
      rating("c", "2026-02-01", 5, "Facebook"),
      { ...rating("d", "2026-04-01", 3), text: " " },
      null,
    ];
    const [block] = page(
      [{ __typename: "ComponentBlocksReviews", id: "3", header: null, limit: 1, reviewSource: "google", showSummary: true, section: null }],
      reviews,
    );
    assert.ok(block.type === "reviews");
    assert.deepEqual(block.reviews, [{ id: "b", author: "Anna", rating: 5, text: "Polecam", date: "2026-03-01", source: "Google" }]);
    assert.deepEqual(block.summary, { average: 4.5, count: 2, source: "Google" });
    assert.equal(block.layout, "cards");
    const none = page(
      [{ __typename: "ComponentBlocksReviews", id: "3", header: null, limit: 9, reviewSource: "facebook", showSummary: false, section: null }],
      [rating("a", "2026-01-01", 4)],
    );
    assert.equal(none.length, 0);
  });
});

describe("business blocks", () => {
  const link = (overrides: object) => ({
    label: "Zapytaj",
    linkType: "customUrl",
    customUrl: "/pl/dla-firm#formularz",
    newTab: false,
    page: null,
    blog: null,
    ...overrides,
  });
  const page = (blocks: object[]) =>
    parsePage({ documentId: "b2b", title: "Dla firm", seo: null, blocks } as Parameters<typeof parsePage>[0], "pl", []).blocks;

  it("maps scenarios, dropping empty benefits and unroutable links", () => {
    const [block] = page([
      {
        __typename: "ComponentBlocksScenarios",
        id: "1",
        header: { eyebrow: null, title: "Dla kogo", lead: null },
        section: null,
        items: [
          null,
          {
            label: "Flota",
            title: " Auta dla floty ",
            audience: " ",
            text: "Tekst",
            benefits: [{ text: "Faktura VAT" }, { text: " " }, null],
            image: null,
            cta: link({ customUrl: "javascript:alert(1)" }),
          },
        ],
      },
    ]);
    assert.ok(block.type === "scenarios");
    assert.deepEqual(block.items, [
      { label: "Flota", title: "Auta dla floty", audience: null, text: "Tekst", benefits: ["Faktura VAT"], image: null, imageMobile: null, cta: null },
    ]);
  });

  it("gives every comparison row one value per column", () => {
    const [block] = page([
      {
        __typename: "ComponentBlocksComparison",
        id: "2",
        header: null,
        footnote: " ",
        section: null,
        columns: [
          { label: "MobiCars", highlighted: true },
          { label: "Leasing", highlighted: null },
        ],
        rows: [
          { criterion: "Bez wkładu", values: [{ kind: "yes", text: null }] },
          { criterion: "Serwis", values: [{ kind: "partial", text: " w cenie " }, { kind: "no", text: null }, { kind: "yes", text: null }] },
        ],
      },
    ]);
    assert.ok(block.type === "comparison");
    assert.deepEqual(block.columns, [
      { label: "MobiCars", highlighted: true },
      { label: "Leasing", highlighted: false },
    ]);
    assert.deepEqual(block.rows[0].values, [
      { kind: "yes", text: null },
      { kind: "text", text: null },
    ]);
    assert.deepEqual(block.rows[1].values, [
      { kind: "partial", text: "w cenie" },
      { kind: "no", text: null },
    ]);
    assert.equal(block.footnote, null);
  });

  it("reads car segment ids and an empty limit", () => {
    const [block] = page([
      {
        __typename: "ComponentBlocksCars",
        id: "3",
        header: null,
        section: null,
        carsSource: "classes",
        segmentIds: [3, "7", 4.5, 12],
        carsCategory: null,
        limit: 0,
        carsLayout: "grid",
        onlyPromotions: true,
        carsCta: null,
      },
    ]);
    assert.ok(block.type === "cars");
    assert.deepEqual(block.segmentIds, [3, 12]);
    assert.equal(block.limit, null);
    assert.equal(block.onlyPromotions, true);
    assert.equal(block.cta, null);
  });

  it("maps locations; a city filter without a city waits for the page's pickup point", () => {
    const blocks = page([
      { __typename: "ComponentBlocksLocations", id: "8", header: null, section: null, locationsFilter: "city", city: " Kraków ", showMap: null },
      { __typename: "ComponentBlocksLocations", id: "9", header: null, section: null, locationsFilter: "airports", city: "Kraków", showMap: false },
      { __typename: "ComponentBlocksLocations", id: "10", header: null, section: null, locationsFilter: "city", city: "  ", showMap: true },
    ]);
    assert.deepEqual(
      blocks.map((block) => block.type === "locations" && [block.filter, block.city, block.showMap]),
      [
        ["city", "Kraków", true],
        ["airports", null, false],
        ["city", null, true],
      ],
    );
  });

  it("maps the lead form, logos and the closing band", () => {
    const blocks = page([
      {
        __typename: "ComponentBlocksLeadForm",
        id: "4",
        header: null,
        section: null,
        formVariant: "business",
        contactTitle: null,
        contactText: null,
        steps: [{ text: "Oddzwonimy w 24 h" }],
        consent: [{ type: "paragraph", children: [{ type: "text", text: "Zgoda" }] }],
        successTitle: " Dziękujemy ",
        successText: null,
      },
      { __typename: "ComponentBlocksLogos", id: "5", header: null, section: null, logos: [{ name: "Firma", image: null }] },
      { __typename: "ComponentBlocksCtaBand", id: "6", title: "Porozmawiajmy", text: null, primary: link({}), secondary: null, tone: "dark" },
      { __typename: "ComponentBlocksCtaBand", id: "7", title: "Bez linku", text: null, primary: link({ customUrl: null }), secondary: null, tone: "tint" },
    ]);
    assert.deepEqual(
      blocks.map((block) => block.type),
      ["leadForm", "ctaBand"],
    );
    const [form, band] = blocks;
    assert.ok(form.type === "leadForm" && band.type === "ctaBand");
    assert.equal(form.successTitle, "Dziękujemy");
    assert.deepEqual(form.steps, ["Oddzwonimy w 24 h"]);
    assert.equal(form.consent.length, 1);
    assert.deepEqual(band.primary, { label: "Zapytaj", href: "/pl/dla-firm#formularz", newTab: false });
  });
});

describe("page pickup point", () => {
  const raw = (pickupPoint?: number | null) => ({ documentId: "c", title: "Kraków", seo: null, blocks: [], ...(pickupPoint === undefined ? {} : { pickupPoint }) });

  it("keeps the point of a city or local page and nothing for other pages", () => {
    assert.equal(parsePage(raw(490), "pl", []).pickupId, 490);
    assert.equal(parsePage(raw(null), "pl", []).pickupId, null);
    assert.equal(parsePage(raw(0), "pl", []).pickupId, null);
    assert.equal(parsePage(raw(), "pl", []).pickupId, null);
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

describe("design catalog fields", () => {
  const media = (name: string) => ({ url: `/uploads/${name}`, mime: "image/jpeg", width: 800, height: 600, alternativeText: null });
  const link = { label: "Więcej", linkType: "customUrl", customUrl: "https://example.com", newTab: false, page: null, blog: null };
  const rating = (documentId: string, rate: number) => ({ documentId, name: "Ola", rate, text: "Super", date: "2026-01-01", source: "Google" });
  const hero = (overrides: object) => ({
    __typename: "ComponentBlocksHero",
    id: "h",
    badge: null,
    title: "Kontakt",
    subtitle: null,
    ctas: [],
    backgroundImage: null,
    backgroundImageMobile: null,
    backgroundVideo: null,
    overlay: "none",
    height: "compact",
    reservationLayout: "default",
    reservationDefaultTerm: "shortTerm",
    highlights: [],
    heroLayout: "page",
    searchSide: "end",
    focalPoint: "left",
    breadcrumbLabel: " Kontakt ",
    trust: null,
    ...overrides,
  });
  const page = (blocks: object[], reviews: unknown[] = []) =>
    parsePage(
      { documentId: "p", title: "Strona", seo: null, blocks } as Parameters<typeof parsePage>[0],
      "pl",
      [],
      {},
      reviews as Parameters<typeof parsePage>[4],
    ).blocks;

  it("keeps a page hero without a photo and drops a cover hero without one", () => {
    const [block, ...rest] = page([hero({}), hero({ id: "c", heroLayout: "cover" })]);
    assert.equal(rest.length, 0);
    assert.ok(block.type === "hero" && block.layout === "page");
    assert.equal(block.image, null);
    assert.equal(block.breadcrumbLabel, "Kontakt");
    assert.equal(block.searchSide, "end");
    assert.equal(block.focalPoint, "left");
    // `default` in Strapi is the vertical form.
    assert.deepEqual(block.reservation, { layout: "vertical", defaultTerm: "short" });
  });

  it("builds a trust bar with the rating of every review, figures once each and at most 4 claims", () => {
    const trust = {
      id: "t",
      trustVariant: "inline",
      showRating: true,
      stats: [{ kind: "points" }, { kind: "points" }, { kind: "airports" }, null],
      claims: ["a", "b", " ", "c", "d", "e"].map((text) => ({ icon: null, text })),
    };
    const raw = { documentId: "p", title: "Strona", seo: null, blocks: [hero({ heroLayout: "cover", backgroundImage: media("h.jpg"), trust })] };
    assert.equal(pageNeedsReviews(raw as Parameters<typeof pageNeedsReviews>[0]), true);
    const [block] = page(raw.blocks, [rating("a", 5), rating("b", 4)]);
    assert.ok(block.type === "hero");
    assert.deepEqual(block.trust, {
      type: "trustBar",
      id: "t",
      variant: "inline",
      rating: { average: 4.5, count: 2, source: "Google" },
      stats: ["points", "airports"],
      claims: ["a", "b", "c", "d"].map((text) => ({ icon: null, text })),
    });
    const empty = { __typename: "ComponentBlocksTrustBar", ...trust, showRating: false, stats: [], claims: [] };
    assert.deepEqual(page([empty], [rating("a", 5)]), []);
  });

  it("reads section backdrops and falls back from a photo without an image", () => {
    const content = (section: object) => ({ __typename: "ComponentBlocksContent", id: "1", header: { eyebrow: null, title: "T", lead: null }, body: [], align: null, ctas: [], section });
    const base = { tone: null, spacing: null, width: null, anchor: null, backgroundImageMobile: null };
    const [photo, missing] = page([
      content({ ...base, background: "photo", backgroundImage: media("bg.jpg"), ornament: null }),
      content({ ...base, background: "photo", backgroundImage: null, ornament: "road" }),
    ]);
    assert.ok(photo.type === "content" && missing.type === "content");
    assert.equal(photo.section.background, "photo");
    assert.equal(photo.section.backgroundImage?.url, "http://localhost:1337/uploads/bg.jpg");
    assert.equal(photo.section.ornament, "none");
    assert.equal(missing.section.background, "none");
    assert.equal(missing.section.ornament, "road");
  });

  it("maps the cta band variants and needs an image for the photo card", () => {
    const band = (overrides: object) => ({
      __typename: "ComponentBlocksCtaBand",
      id: "b",
      title: "Aplikacja",
      text: null,
      primary: link,
      secondary: null,
      tone: "dark",
      ctaVariant: "photo",
      eyebrow: " Nowość ",
      ctaImage: null,
      ctaImageMobile: null,
      media: null,
      showStoreBadges: true,
      ...overrides,
    });
    const [plain, photo] = page([band({}), band({ id: "p", ctaImage: media("card.jpg"), media: media("phones.png") })]);
    assert.ok(plain.type === "ctaBand" && photo.type === "ctaBand");
    assert.equal(plain.variant, "band");
    assert.equal(plain.eyebrow, "Nowość");
    assert.equal(plain.showStoreBadges, true);
    assert.equal(photo.variant, "photo");
    assert.equal(photo.media?.url, "http://localhost:1337/uploads/phones.png");
  });

  it("groups FAQ questions by category order, the rest last", () => {
    const category = (documentId: string, name: string, order: number | null) => ({ documentId, name, slug: documentId, icon: null, order });
    const [block] = page([
      {
        __typename: "ComponentBlocksFaq",
        id: "f",
        header: null,
        structuredData: true,
        groupByCategory: true,
        faqCta: link,
        section: null,
        items: [
          { question: "Q1", answer: "<p>A</p>", category: null },
          { question: "Q2", answer: "<p>A</p>", category: category("pay", "Płatności", 2) },
          { question: "Q3", answer: "<p>A</p>", category: category("doc", "Dokumenty", 1) },
          { question: "Q4", answer: "<p>A</p>", category: category("pay", "Płatności", 2) },
        ],
      },
    ]);
    assert.ok(block.type === "faq");
    assert.equal(block.groupByCategory, true);
    assert.equal(block.cta?.href, "https://example.com");
    assert.deepEqual(
      faqGroups(block.items).map((group) => [group.category?.slug ?? null, group.items.map((item) => item.question)]),
      [
        ["doc", ["Q3"]],
        ["pay", ["Q2", "Q4"]],
        [null, ["Q1"]],
      ],
    );
  });

  it("maps the contact block and its departments", () => {
    const [block] = page([
      {
        __typename: "ComponentBlocksContact",
        id: "k",
        header: { eyebrow: null, title: "Napisz do nas", lead: null },
        showCompany: null,
        contactImage: null,
        formTopics: [{ text: " Rezerwacja " }, { text: " " }],
        departments: [
          { name: " Flota ", text: null, phone: "+48 881 328 328", email: "flota@mobicars.pl", hours: " pn–pt 8–16 ", link: null },
          { name: " ", text: null, phone: null, email: null, hours: null, link: null },
        ],
        section: null,
      },
    ]);
    assert.ok(block.type === "contact");
    assert.equal(block.showCompany, true);
    assert.deepEqual(block.topics, ["Rezerwacja"]);
    assert.deepEqual(block.departments, [
      { name: "Flota", text: null, phone: "+48 881 328 328", phoneHref: "tel:+48881328328", email: "flota@mobicars.pl", hours: "pn–pt 8–16", schedule: [], showInFooter: false, link: null },
    ]);
  });

  it("reads the locations, reviews and media-text layouts", () => {
    const blocks = page(
      [
        { __typename: "ComponentBlocksLocations", id: "l", header: null, locationsFilter: "all", locationsLayout: "compact", city: null, showMap: null, section: null },
        { __typename: "ComponentBlocksReviews", id: "r", header: null, limit: 3, reviewSource: "all", reviewsLayout: "spotlight", showSummary: true, section: null },
        { __typename: "ComponentBlocksMediaText", id: "m", header: null, body: null, image: media("car.png"), imagePosition: "start", imageStyle: "cutout", section: null, ctas: [] },
      ],
      [rating("a", 5)],
    );
    assert.deepEqual(
      blocks.map((block) => (block.type === "locations" || block.type === "reviews" ? block.layout : block.type === "mediaText" ? block.imageStyle : null)),
      ["compact", "spotlight", "cutout"],
    );
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

describe("round 4 catalog fields", () => {
  const link = { label: "Więcej", linkType: "customUrl", customUrl: "https://example.com", newTab: false, page: null, blog: null };
  const media = { url: "/uploads/p.jpg", mime: "image/jpeg", width: 800, height: 500, alternativeText: null };
  const promo = (overrides: object) => ({
    title: " Rabat w aplikacji ",
    text: null,
    code: " MOBI10 ",
    validFrom: null,
    validUntil: null,
    tone: "photo",
    image: null,
    imageMobile: null,
    link,
    termsLink: null,
    ...overrides,
  });
  const raw = (blocks: object[]) => ({ documentId: "p", title: "Strona", seo: null, blocks }) as Parameters<typeof parsePage>[0];
  // 2026-11-13 12:00 in Warsaw (UTC+1 in November).
  const now = new Date("2026-11-13T11:00:00Z");
  const promos = (items: object[]) => [{ __typename: "ComponentBlocksPromoCards", id: "pc", header: null, promos: items, section: null }];

  it("keeps only promotion cards valid today, Polish time, and knows the next change", () => {
    const page = parsePage(
      raw(
        promos([
          promo({}),
          promo({ title: "Ends today", validUntil: "2026-11-13", tone: "go" }),
          promo({ title: "Ended", validUntil: "2026-11-12" }),
          promo({ title: "Starts tomorrow", validFrom: "2026-11-14" }),
        ]),
      ),
      "pl",
      [],
      {},
      [],
      now,
    );
    const [block] = page.blocks;
    assert.ok(block.type === "promoCards");
    assert.deepEqual(block.items.map((item) => [item.title, item.tone, item.code]), [
      ["Rabat w aplikacji", "brand", "MOBI10"],
      ["Ends today", "go", "MOBI10"],
    ]);
    // Midnight of 14 November in Warsaw: the last card ends, the next one starts.
    assert.equal(page.changesAt, "2026-11-13T23:00:00.000Z");
    assert.equal(parsePage(raw(promos([promo({ validUntil: "2026-11-12" })])), "pl", [], {}, [], now).blocks.length, 0);
    assert.equal(parsePage(raw([]), "pl", [], {}, [], now).changesAt, null);
  });

  it("uses the summer offset for dates in summer", () => {
    const page = parsePage(raw(promos([promo({ validFrom: "2027-07-01", image: media })])), "pl", [], {}, [], now);
    assert.equal(page.changesAt, "2027-06-30T22:00:00.000Z");
  });

  it("reads the scenarios panel, the folded content and the cars tabs", () => {
    const blocks = parsePage(
      raw([
        {
          __typename: "ComponentBlocksScenarios",
          id: "s",
          header: null,
          scenariosLayout: "panel",
          items: [{ label: "Weekend", title: "Na weekend", audience: null, text: null, benefits: [], image: media, imageMobile: media, cta: null }],
          section: null,
        },
        {
          __typename: "ComponentBlocksContent",
          id: "c",
          header: { eyebrow: null, title: "SEO", lead: null },
          body: "<p>A</p><p>B</p><p>C</p>",
          align: null,
          collapsible: true,
          previewParagraphs: null,
          collapsedLabel: " ",
          ctas: [],
          section: null,
        },
        {
          __typename: "ComponentBlocksCars",
          id: "k",
          header: null,
          carsSource: "all",
          segmentIds: null,
          carsCategory: null,
          limit: null,
          carsLayout: "tabs",
          defaultCategory: "delivery",
          onlyPromotions: null,
          carsCta: null,
          section: null,
        },
      ]),
      "pl",
      [],
    ).blocks;
    const [scenarios, content, cars] = blocks;
    assert.ok(scenarios.type === "scenarios" && content.type === "content" && cars.type === "cars");
    assert.equal(scenarios.layout, "panel");
    assert.equal(scenarios.items[0].imageMobile?.url, "http://localhost:1337/uploads/p.jpg");
    assert.deepEqual(content.collapsible, { previewParagraphs: 2, label: null });
    assert.equal(cars.layout, "tabs");
    assert.equal(cars.defaultCategory, "delivery");
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
    category: { documentId: "porady", name: "Porady", color: "blue" as const },
    coverImage: { url: "/uploads/a.jpg", mime: "image/jpeg", width: 800, height: 450, alternativeText: null },
  });

  it("leaves out the post itself and shows at most three", () => {
    assert.deepEqual(
      relatedCards([card("a"), null, card("self"), card("b"), card("c"), card("d")], "self", "pl").map((post) => [post.id, post.href, post.categoryColor]),
      [
        ["a", "/pl/blog/wpis-a", "blue"],
        ["b", "/pl/blog/wpis-b", "blue"],
        ["c", "/pl/blog/wpis-c", "blue"],
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
