import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loginPath, safeReturnPath } from "../lib/auth/paths";
import {
  accountHref,
  fleetHref,
  reservationHref,
  resolveAccountPath,
  resolveFleetPath,
  resolveReservationPath,
  switchLangHref,
} from "./routes";

describe("account routes", () => {
  it("builds localized public URLs", () => {
    assert.equal(accountHref("pl"), "/pl/konto");
    assert.equal(accountHref("pl", "reservations", 12), "/pl/konto/rezerwacje/12");
    assert.equal(accountHref("en", "reservations", 12), "/en/account/reservations/12");
    assert.equal(loginPath("pl", "/pl/konto"), "/pl/konto/logowanie?next=%2Fpl%2Fkonto");
  });

  it("rewrites Polish URLs to the English app folders", () => {
    assert.deepEqual(resolveAccountPath("pl", "/pl/konto/rezerwacje/12"), {
      canonical: "/pl/konto/rezerwacje/12",
      internal: "/pl/account/reservations/12",
      page: "reservations",
      isPublic: false,
      isGuestOnly: false,
    });
    assert.equal(resolveAccountPath("en", "/en/account")?.internal, "/en/account");
  });

  it("points mixed or internal spellings at the canonical URL", () => {
    assert.equal(resolveAccountPath("pl", "/pl/account/reservations")?.canonical, "/pl/konto/rezerwacje");
    assert.equal(resolveAccountPath("pl", "/pl/konto/reservations")?.canonical, "/pl/konto/rezerwacje");
    assert.equal(resolveAccountPath("en", "/en/konto")?.canonical, undefined);
  });

  it("marks only sign-in pages as public", () => {
    assert.equal(resolveAccountPath("pl", "/pl/konto/logowanie")?.isPublic, true);
    assert.equal(resolveAccountPath("en", "/en/account/forgot-password")?.isPublic, true);
    assert.equal(resolveAccountPath("pl", "/pl/konto")?.isPublic, false);
    assert.equal(resolveAccountPath("pl", "/pl/konto/cokolwiek")?.isPublic, false);
    assert.equal(resolveAccountPath("pl", "/pl/oferta"), null);
  });

  it("sends signed-in clients away from sign-in pages only", () => {
    assert.equal(resolveAccountPath("pl", "/pl/konto/logowanie")?.isGuestOnly, true);
    assert.equal(resolveAccountPath("en", "/en/account/register")?.isGuestOnly, true);
    assert.equal(resolveAccountPath("pl", "/pl/konto/sesja")?.isGuestOnly, false);
    assert.equal(resolveAccountPath("pl", "/pl/konto/sesja")?.isPublic, true);
    assert.equal(resolveAccountPath("pl", "/pl/konto")?.isGuestOnly, false);
  });
});

describe("reservation routes", () => {
  it("builds one localized URL per term, with the search query", () => {
    assert.equal(reservationHref("pl"), "/pl/rezerwacja");
    assert.equal(reservationHref("pl", "long"), "/pl/rezerwacja/dlugoterminowa");
    assert.equal(reservationHref("en", "long", new URLSearchParams({ pickup: "3" })), "/en/reservation/long-term?pickup=3");
  });

  it("rewrites Polish URLs to the English app folders", () => {
    assert.deepEqual(resolveReservationPath("pl", "/pl/rezerwacja"), {
      canonical: "/pl/rezerwacja",
      internal: "/pl/reservation",
      term: "short",
    });
    assert.deepEqual(resolveReservationPath("pl", "/pl/rezerwacja/dlugoterminowa"), {
      canonical: "/pl/rezerwacja/dlugoterminowa",
      internal: "/pl/reservation/long-term",
      term: "long",
    });
    assert.equal(resolveReservationPath("en", "/en/reservation/long-term")?.internal, "/en/reservation/long-term");
  });

  it("points mixed or internal spellings at the canonical URL", () => {
    assert.equal(resolveReservationPath("pl", "/pl/reservation")?.canonical, "/pl/rezerwacja");
    assert.equal(resolveReservationPath("pl", "/pl/rezerwacja/long-term")?.canonical, "/pl/rezerwacja/dlugoterminowa");
    assert.equal(resolveReservationPath("pl", "/pl/reservation/long-term")?.canonical, "/pl/rezerwacja/dlugoterminowa");
    assert.equal(resolveReservationPath("en", "/en/rezerwacja"), null);
    assert.equal(resolveReservationPath("pl", "/pl/konto"), null);
  });

  it("resolves the thank-you page, which is no return target", () => {
    assert.deepEqual(resolveReservationPath("pl", "/pl/rezerwacja/potwierdzenie"), {
      canonical: "/pl/rezerwacja/potwierdzenie",
      internal: "/pl/reservation/confirmation",
      term: null,
    });
    assert.equal(resolveReservationPath("pl", "/pl/reservation/confirmation")?.canonical, "/pl/rezerwacja/potwierdzenie");
    assert.equal(safeReturnPath("pl", "/pl/rezerwacja/potwierdzenie"), "/pl/konto");
  });

  it("leaves unknown pages to the 404", () => {
    assert.deepEqual(resolveReservationPath("pl", "/pl/rezerwacja/cokolwiek"), {
      canonical: "/pl/rezerwacja/cokolwiek",
      internal: "/pl/reservation/cokolwiek",
      term: null,
    });
  });
});

describe("safeReturnPath", () => {
  it("keeps canonical reservation pages with their query", () => {
    assert.equal(
      safeReturnPath("pl", "/pl/rezerwacja?pickup=479&step=details"),
      "/pl/rezerwacja?pickup=479&step=details",
    );
    assert.equal(safeReturnPath("pl", "/pl/reservation?pickup=479"), "/pl/konto");
    assert.equal(safeReturnPath("pl", "/pl/rezerwacja/cokolwiek"), "/pl/konto");
  });

  it("keeps canonical panel URLs of the same language", () => {
    assert.equal(safeReturnPath("pl", "/pl/konto/rezerwacje/12"), "/pl/konto/rezerwacje/12");
    assert.equal(safeReturnPath("en", "/en/account?tab=1"), "/en/account?tab=1");
  });

  it("falls back to the panel for anything else", () => {
    for (const value of [
      "https://evil.example/pl/konto",
      "//evil.example/pl/konto",
      "/\\evil.example",
      "/pl/konto/logowanie",
      "/en/account",
      "/pl/oferta",
      "/pl/account/reservations",
      null,
    ]) {
      assert.equal(safeReturnPath("pl", value), "/pl/konto", String(value));
    }
  });
});

describe("switchLangHref", () => {
  it("keeps the reservation term and search", () => {
    assert.equal(
      switchLangHref("/pl/rezerwacja", "?pickup=479&from=2026-11-14T10%3A00", "en"),
      "/en/reservation?pickup=479&from=2026-11-14T10%3A00",
    );
    assert.equal(switchLangHref("/pl/rezerwacja/dlugoterminowa", "", "de"), "/de/buchung/langzeit");
    assert.equal(switchLangHref("/en/reservation", "pickup=1", "pl"), "/pl/rezerwacja?pickup=1");
    assert.equal(switchLangHref("/pl/rezerwacja/potwierdzenie", "", "uk"), "/uk/bronyuvannya/pidtverdzhennya");
  });

  it("keeps the panel page and its id", () => {
    assert.equal(switchLangHref("/pl/konto/rezerwacje/12", "", "en"), "/en/account/reservations/12");
    assert.equal(switchLangHref("/pl/konto/logowanie", "?next=%2Fpl%2Fkonto", "en"), "/en/account/login?next=%2Fpl%2Fkonto");
    assert.equal(switchLangHref("/en/account", "", "pl"), "/pl/konto");
  });

  it("swaps only the language elsewhere, and falls back to the home page", () => {
    assert.equal(switchLangHref("/pl", "", "de"), "/de");
    assert.equal(switchLangHref("/pl/o-nas", "", "en"), "/en/o-nas");
    assert.equal(switchLangHref("/", "", "en"), "/en");
    assert.equal(switchLangHref("/pl/rezerwacja/cokolwiek", "", "en"), "/en");
  });
});

describe("fleet routes", () => {
  it("builds the localized list and car URLs", () => {
    assert.equal(fleetHref("pl"), "/pl/flota");
    assert.equal(fleetHref("pl", "toyota-yaris-1219"), "/pl/flota/toyota-yaris-1219");
    assert.equal(fleetHref("en", "toyota-yaris-1219"), "/en/fleet/toyota-yaris-1219");
    assert.equal(fleetHref("de"), "/de/flotte");
  });

  it("rewrites Polish URLs to the English app folder", () => {
    assert.deepEqual(resolveFleetPath("pl", "/pl/flota"), {
      canonical: "/pl/flota",
      internal: "/pl/fleet",
      slug: null,
    });
    assert.deepEqual(resolveFleetPath("pl", "/pl/flota/toyota-yaris-1219"), {
      canonical: "/pl/flota/toyota-yaris-1219",
      internal: "/pl/fleet/toyota-yaris-1219",
      slug: "toyota-yaris-1219",
    });
    assert.equal(resolveFleetPath("uk", "/uk/avtopark/mg-4-4560")?.internal, "/uk/fleet/mg-4-4560");
  });

  it("points mixed spellings and trailing slashes at the canonical URL", () => {
    assert.equal(resolveFleetPath("pl", "/pl/fleet/mg-4-4560")?.canonical, "/pl/flota/mg-4-4560");
    assert.equal(resolveFleetPath("pl", "/pl/flota/")?.canonical, "/pl/flota");
    assert.equal(resolveFleetPath("en", "/en/flota"), null);
    assert.equal(resolveFleetPath("pl", "/pl/flota/a/b")?.slug, null);
  });

  it("keeps the car when the language changes", () => {
    assert.equal(switchLangHref("/pl/flota/toyota-yaris-1219", "", "en"), "/en/fleet/toyota-yaris-1219");
    assert.equal(switchLangHref("/en/fleet", "?kategoria=eco", "pl"), "/pl/flota?kategoria=eco");
  });
});

describe("German and Ukrainian segments", () => {
  it("builds localized panel and reservation URLs, Ukrainian in Latin letters", () => {
    assert.equal(accountHref("de", "reservations", 12), "/de/konto/buchungen/12");
    assert.equal(accountHref("uk", "forgotPassword"), "/uk/kabinet/vidnovyty-parol");
    assert.equal(reservationHref("uk", "long"), "/uk/bronyuvannya/dovhostrokova");
    for (const lang of ["de", "uk"] as const) {
      assert.match(accountHref(lang, "security"), /^[a-z0-9/-]+$/);
    }
  });

  it("redirects English segments to the localized ones and rewrites to the app folder", () => {
    const route = resolveAccountPath("de", "/de/account/login");
    assert.equal(route?.canonical, "/de/konto/anmelden");
    assert.equal(route?.internal, "/de/account/login");
    assert.equal(resolveAccountPath("uk", "/uk/kabinet/dani")?.internal, "/uk/account/details");
    assert.equal(resolveReservationPath("de", "/de/buchung/bestaetigung")?.internal, "/de/reservation/confirmation");
  });

  it("switches between languages keeping the page", () => {
    assert.equal(switchLangHref("/pl/konto/rezerwacje/12", "", "uk"), "/uk/kabinet/bronyuvannya/12");
    assert.equal(switchLangHref("/de/konto/daten", "", "pl"), "/pl/konto/dane");
    assert.equal(switchLangHref("/uk/bronyuvannya", "?pickup=3", "de"), "/de/buchung?pickup=3");
  });
});
