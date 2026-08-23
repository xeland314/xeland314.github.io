import { describe, it, expect } from "vitest";
import {
  buildFdLines,
  estimateFdDemoMs,
  FD_CODE,
  FD_STEPS,
  FD_TIMING,
} from "./sequence";

describe("buildFdLines", () => {
  it("has one line per redirection step", () => {
    expect(buildFdLines().map((l) => l.id)).toEqual([1, 2, 3, 4]);
  });

  it("covers stdout overwrite, append and stderr duplication", () => {
    const html = FD_CODE.map((l) => l.html).join("\n");
    expect(html).toContain("fd1→archivo");
    expect(html).toContain("añade al final");
    expect(html).toContain("2&gt;&amp;1");
  });
});

describe("FD_STEPS / FD_TIMING", () => {
  it("orders the four canonical states", () => {
    expect(FD_STEPS).toEqual(["default", "gt", "gtgt", "both"]);
  });

  it("keeps every timing positive", () => {
    for (const ms of Object.values(FD_TIMING)) {
      expect(ms).toBeGreaterThan(0);
    }
  });

  it("runs the full demo between 15s and 60s", () => {
    const total = estimateFdDemoMs();
    expect(total).toBeGreaterThanOrEqual(15000);
    expect(total).toBeLessThanOrEqual(60000);
  });
});
