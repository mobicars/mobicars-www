import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { toIcs } from "./calendar";

const stamp = new Date("2026-11-12T08:00:00Z");

describe("toIcs", () => {
  it("writes Warsaw wall time as UTC in winter and in summer", () => {
    const ics = toIcs(
      [
        { uid: "a@mobicars.pl", start: "2026-12-01T10:00", minutes: 30, title: "Odbiór", location: "Warszawa", description: "x" },
        { uid: "b@mobicars.pl", start: "2027-07-01T10:00", minutes: 30, title: "Zwrot", location: "Warszawa", description: "x" },
      ],
      stamp,
    );
    assert.match(ics, /DTSTART:20261201T090000Z\r\nDTEND:20261201T093000Z/);
    assert.match(ics, /DTSTART:20270701T080000Z/);
    assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
    assert.match(ics, /END:VCALENDAR\r\n$/);
  });

  it("escapes text and folds long lines", () => {
    const ics = toIcs(
      [
        {
          uid: "c@mobicars.pl",
          start: "2026-12-01T10:00",
          minutes: 30,
          title: "Skoda, Kamiq; auto",
          location: "Warszawa Biuro - Górczewska 53 (Metro Młynów, PKP Młynów), parking przed budynkiem",
          description: "linia 1\nlinia 2",
        },
      ],
      stamp,
    );
    assert.match(ics, /SUMMARY:Skoda\\, Kamiq\; auto/);
    assert.match(ics, /DESCRIPTION:linia 1\\nlinia 2/);
    for (const line of ics.split("\r\n")) {
      assert.ok(new TextEncoder().encode(line).length <= 75, line);
    }
    assert.match(ics, /\r\n /);
  });
});
