import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { nextAnnouncementChange, parseChrome, parsePage } from "./internal/entities";
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

  it("builds hrefs", () => {
    assert.equal(pageHref("pl", []), "/pl");
    assert.equal(pageHref("en", ["rent", "warsaw"]), "/en/rent/warsaw");
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
  const [hero] = page.blocks;

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
    assert.equal(hero.image.url, "http://localhost:1337/uploads/hero.jpg");
    assert.equal(hero.image.alt, "");
    assert.equal(hero.badge, null);
    assert.deepEqual(hero.reservation, { layout: "horizontal", defaultTerm: "long" });
    assert.deepEqual(page.seo, { title: null, description: null, noIndex: false, noFollow: false });
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
      contact: { phone: "+48 881 328 328", email: "biuro@mobicars.pl", address: null, openingHours: " " },
      social: [
        { platform: "facebook" as const, url: "https://facebook.com/mobicars" },
        { platform: "x" as const, url: "javascript:alert(1)" },
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
    assert.deepEqual(chrome.social.map((item) => item.platform), ["facebook"]);
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
