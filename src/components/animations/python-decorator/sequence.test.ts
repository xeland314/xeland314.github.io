import { describe, it, expect } from "vitest";
import {
  buildDecoratorLines,
  decoratorTimingTotal,
  DECORATOR_FILE,
  DECORATOR_TIMING,
} from "./sequence";

describe("buildDecoratorLines", () => {
  it("keeps ids 1..8 in order", () => {
    expect(buildDecoratorLines().map((l) => l.id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8,
    ]);
  });

  it("marks the decorator application line", () => {
    const lines = buildDecoratorLines();
    expect(lines.find((l) => l.id === 7)?.html).toContain("@medir_tiempo");
  });

  it("contains the wrapper inner function", () => {
    const lines = buildDecoratorLines();
    expect(lines.find((l) => l.id === 2)?.html).toContain("wrapper");
  });

  it("contains before/during/after comments", () => {
    const html = buildDecoratorLines()
      .map((l) => l.html)
      .join("\n");
    expect(html).toContain("1. ANTES");
    expect(html).toContain("2. DURANTE");
    expect(html).toContain("3. DESPUÉS");
  });
});

describe("DECORATOR_TIMING", () => {
  it("keeps every phase positive", () => {
    for (const ms of Object.values(DECORATOR_TIMING)) {
      expect(ms).toBeGreaterThan(0);
    }
  });

  it("makes the whole sequence last at least 10 seconds", () => {
    expect(decoratorTimingTotal()).toBeGreaterThanOrEqual(10000);
  });
});

describe("DECORATOR_FILE", () => {
  it("points to the decorators file", () => {
    expect(DECORATOR_FILE).toBe("decoradores.py");
  });
});