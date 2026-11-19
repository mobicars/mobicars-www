import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { legacyExactPaths, legacyRedirect } from "./legacy-redirects";

function target(pathname: string, search?: string): string | null {
  return legacyRedirect(pathname, search)?.destination ?? null;
}

describe("legacy redirects", () => {
  it("leaves URLs the new site serves at the same address alone", () => {
    for (const path of [
      "/",
      "/pl",
      "/pl/kontakt",
      "/pl/wynajem-na-miesiace",
      "/pl/dodatki-i-akcesoria",
      "/pl/flota",
      "/pl/flota/toyota-yaris-1219",
      "/pl/flota/nissan-x-trail-7-os.-4431",
      "/pl/hub-mobilnosci-archicom/modern-mokotow",
      "/pl/blog",
      "/pl/blog/typy-samochodow-hybrydowych",
      "/pl/wypozyczalnia-samochodow-warszawa",
      "/pl/lokalna-wypozyczalnia-samochodow/warszawa-mokotow",
      "/en/rent-for-months",
      "/en/fleet/toyota-yaris-1219",
      "/pl/rezerwacja",
      "/pl/konto/logowanie",
    ]) {
      assert.equal(legacyRedirect(path), null, path);
    }
  });

  it("sends long-term car pages to the car page, without the old dots", () => {
    assert.equal(target("/pl/wynajem-na-miesiace/toyota-yaris-1219"), "/pl/flota/toyota-yaris-1219");
    assert.equal(target("/pl/wynajem-na-miesiace/nissan-x-trail-7-os.-4431"), "/pl/flota/nissan-x-trail-7-os-4431");
    assert.equal(target("/en/rent-for-months/byd-seal-5-dm-i-6654"), "/en/fleet/byd-seal-5-dm-i-6654");
    assert.equal(target("/pl/rent-for-months/mg-4-4560"), "/pl/flota/mg-4-4560");
  });

  it("keeps CMS children of the long-term page that are not cars", () => {
    assert.equal(legacyRedirect("/pl/wynajem-na-miesiace/dla-firm"), null);
  });

  it("keeps add-on pages, which have their own pages again", () => {
    // `app/[lang]/extras/[slug]` reads the id at the end and redirects a stale name itself.
    assert.equal(legacyRedirect("/pl/dodatki-i-akcesoria/apteczka-155"), null);
    assert.equal(legacyRedirect("/pl/dodatki-i-akcesoria/pelny-bak-na-start-(benzyna)-3758"), null);
    assert.equal(legacyRedirect("/en/addons-and-accessories/first-aid-kit-155"), null);
    assert.equal(target("/pl/addons-and-accessories/apteczka-155"), "/pl/dodatki-i-akcesoria/apteczka-155");
    assert.equal(target("/en/fleet/i-park-my-own-car-2757"), "/en/addons-and-accessories");
  });

  it("matches encoded, upper-case and trailing-slash spellings", () => {
    assert.equal(target("/PL/Cennik/"), "/pl/wynajem-na-dni");
    assert.equal(target("/blog/szukaj/tagi/ABS"), "/pl/blog/abs-co-to-takiego");
    assert.equal(target("/blog/szukaj/tagi/samoch%C3%B3d%20elektryczny"), "/pl/wynajem-samochodow-elektrycznych");
    assert.equal(target("/pl/samochody-na-sprzeda%C5%BC"), "/pl/sprzedaz-samochodow");
    assert.equal(target("/Standardowe-Warunki-Umowy.pdf"), "/pl/dokumenty");
  });

  it("ignores paths that do not decode", () => {
    assert.equal(legacyRedirect("/pl/dodatki-i-akcesoria/%E0%A4%A"), null);
  });

  it("keeps the query string", () => {
    assert.equal(
      target("/pl/wynajem-na-miesiace/toyota-yaris-1219", "?utm_source=google"),
      "/pl/flota/toyota-yaris-1219?utm_source=google",
    );
    assert.equal(target("/pl/kod-promocyjny/Lato2026", "utm=x"), "/pl/rezerwacja?promo=lato2026&utm=x");
  });

  it("opens the booking with a promo code", () => {
    assert.equal(target("/pl/kod-promocyjny/lato"), "/pl/rezerwacja?promo=lato");
    assert.equal(target("/en/promo-code/summer"), "/en/reservation?promo=summer");
  });

  it("carries over the old site's own redirects, resolved to one hop", () => {
    assert.equal(target("/pl/reservation-1"), "/pl/rezerwacja");
    assert.equal(target("/en/reservation-2"), "/en/reservation");
    assert.equal(target("/en/cars"), "/en/fleet");
    assert.equal(target("/pl/regulations"), "/pl/dokumenty");
    assert.equal(target("/panel_klienta"), "/pl/konto");
    assert.equal(target("/typy-samochodow-hybrydowych"), "/pl/blog/typy-samochodow-hybrydowych");
    assert.equal(target("/pl/abs-co-to-takiego"), "/pl/blog/abs-co-to-takiego");
    assert.equal(target("/pl/blog/szukaj/tagi/hybryda"), "/pl/blog");
    assert.equal(target("/pl/addon/wypozyczalnia-samochodow-kielce"), "/pl/wypozyczalnia-samochodow-kielce");
    assert.equal(
      target("/pl/dodatek/wypozyczalnia-samochodow-katowice-lotnisko-pyrzowice"),
      "/pl/wypozyczalnia-samochodow-katowice-lotnisko-pyrzowice",
    );
    assert.equal(target("/pl/dodatek/dodatkowy-kierowca-1262"), "/pl/dodatki-i-akcesoria");
    assert.equal(target("/wypozyczalnia-samochodow-gdansk/cennik"), "/pl/wypozyczalnia-samochodow-gdansk");
  });

  it("finds pages the old sitemap listed without their parent page", () => {
    assert.equal(target("/pl/modern-mokotow"), "/pl/hub-mobilnosci-archicom/modern-mokotow");
    assert.equal(target("/pl/wieza-jezyce-poznan"), "/pl/hub-mobilnosci-archicom/wieza-jezyce-poznan");
  });

  it("maps sales and old folder names, and leaves single documents to their route", () => {
    assert.equal(target("/pl/dokumenty/regulamin-rezerwacji"), null);
    assert.equal(target("/en/documents/terms"), null);
    assert.equal(target("/pl/sprzedaz-samochodow/toyota-yaris"), "/pl/sprzedaz-samochodow");
    assert.equal(target("/pl/cargo"), "/pl/wynajem-samochodow-dostawczych");
    assert.equal(target("/en/ev"), "/en/electric-vehicles-rental");
    assert.equal(target("/pl/local-car-rental/warszawa-bemowo"), "/pl/lokalna-wypozyczalnia-samochodow/warszawa-bemowo");
  });

  it("answers 308 and never a chain or a loop", () => {
    const samples = [
      ...legacyExactPaths(),
      "/pl/wynajem-na-miesiace/nissan-x-trail-7-os.-4431",
      "/pl/addons-and-accessories/apteczka-155",
      "/pl/kod-promocyjny/lato",
      "/blog/szukaj/tagi/x",
    ];
    for (const path of samples) {
      const found = legacyRedirect(path);
      assert.ok(found, path);
      assert.equal(found.status, 308);
      const [destination] = found.destination.split("?");
      assert.notEqual(destination, path, path);
      assert.equal(legacyRedirect(destination), null, `${path} → ${destination} redirects again`);
      assert.match(destination, /^\/(pl|en|de|uk)(\/|$)/, path);
    }
  });

  it("keys exact paths in their normalized form", () => {
    for (const path of legacyExactPaths()) {
      assert.equal(path, path.toLowerCase(), path);
      assert.ok(!path.endsWith("/"), path);
    }
  });
});
