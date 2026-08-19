import { describe, it, expect } from "vitest";
import {
  buildCodeLines,
  fileNameFor,
  modeLabel,
  YIELD_TIMING,
  type YieldMode,
} from "./sequence";

describe("buildCodeLines", () => {
  it("puts a return statement in return mode", () => {
    const lines = buildCodeLines("return");
    expect(lines.some((l) => l.html.includes("anim-tok-kw\">return"))).toBe(true);
    expect(lines.some((l) => l.html.includes("lista.<span class=\"anim-tok-fn\">append"))).toBe(true);
  });

  it("puts a yield statement in yield mode", () => {
    const lines = buildCodeLines("yield");
    expect(lines.some((l) => l.html.includes("anim-tok-kw\">yield"))).toBe(true);
    expect(lines.some((l) => l.html.includes("return"))).toBe(false);
  });

  it("keeps line ids 1..5 for both modes", () => {
    for (const mode of ["return", "yield"] as YieldMode[]) {
      expect(buildCodeLines(mode).map((l) => l.id)).toEqual([1, 2, 3, 4, 5]);
    }
  });
});

describe("fileNameFor / modeLabel", () => {
  it("maps each mode to its file name", () => {
    expect(fileNameFor("return")).toBe("modo_return.py");
    expect(fileNameFor("yield")).toBe("modo_yield.py");
  });

  it("maps each mode to a human label", () => {
    expect(modeLabel("return")).toContain("return");
    expect(modeLabel("yield")).toContain("yield");
  });
});

describe("YIELD_TIMING", () => {
  it("keeps every phase positive", () => {
    for (const ms of Object.values(YIELD_TIMING)) {
      expect(ms).toBeGreaterThan(0);
    }
  });
});