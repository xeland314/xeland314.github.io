import { describe, it, expect } from "vitest";
import {
  buildHpackLines,
  BYTES_REQUEST_1,
  BYTES_REQUEST_2,
  HEADER_ROWS,
  HPACK_CODE,
  HPACK_TIMING,
} from "./sequence";

describe("buildHpackLines", () => {
  it("has the static index for :method GET", () => {
    expect(HPACK_CODE[0].html).toContain("[2]");
  });

  it("explains that request 2 sends only indices", () => {
    const html = buildHpackLines().map((l) => l.html).join("\n");
    expect(html).toContain("solo manda [2][62][63]");
  });
});

describe("HEADER_ROWS", () => {
  it("assigns consecutive dynamic indices from 62", () => {
    expect(HEADER_ROWS.map((r) => r.index)).toEqual(["#62", "#63", "#64"]);
  });

  it("pairs each request row with a dynamic row and a chip", () => {
    for (const r of HEADER_ROWS) {
      expect(r.rowId).toMatch(/^r_/);
      expect(r.dynId).toMatch(/^d6[234]$/);
      expect(r.chipId).toMatch(/^c_/);
    }
  });

  it("has unique ids", () => {
    const ids = HEADER_ROWS.flatMap((r) => [r.rowId, r.dynId, r.chipId]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("HPACK_TIMING / bytes", () => {
  it("keeps every timing positive", () => {
    for (const ms of Object.values(HPACK_TIMING)) {
      expect(ms).toBeGreaterThan(0);
    }
  });

  it("runs the demo between 15s and 60s", () => {
    const total =
      HPACK_TIMING.introPause +
      HEADER_ROWS.length * (HPACK_TIMING.headerStep + HPACK_TIMING.tablePause) +
      HPACK_TIMING.req2Intro +
      HEADER_ROWS.length * (HPACK_TIMING.chipStep + HPACK_TIMING.chipTablePause) +
      HPACK_TIMING.barPause +
      HPACK_TIMING.savingsReveal +
      HPACK_TIMING.endPause;
    expect(total).toBeGreaterThanOrEqual(15000);
    expect(total).toBeLessThanOrEqual(60000);
  });

  it("compresses headers to less than half", () => {
    expect(BYTES_REQUEST_2).toBeLessThan(BYTES_REQUEST_1 / 2);
  });
});
