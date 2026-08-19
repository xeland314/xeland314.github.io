import { describe, it, expect } from "vitest";
import {
  buildDeferLines,
  deferItems,
  deferLineId,
  DEFER_META,
  PUSH_ORDER,
  POP_ORDER,
} from "./sequence";

describe("buildDeferLines", () => {
  it("returns the three deferred calls with their items", () => {
    const lines = buildDeferLines();
    const defers = lines.filter((l) => l.type === "defer");
    expect(defers.map((l) => l.item)).toEqual(["db", "lock", "log"]);
    expect(defers.every((l) => l.html.includes("anim-tok-kw"))).toBe(true);
  });

  it("names defer line ids consistently with deferLineId", () => {
    for (const item of deferItems()) {
      expect(buildDeferLines().some((l) => l.id === deferLineId(item))).toBe(
        true,
      );
    }
  });

  it("exposes plain and blank lines for the demo flow", () => {
    const lines = buildDeferLines();
    expect(lines.some((l) => l.id === "func" && l.type === "plain")).toBe(true);
    expect(lines.some((l) => l.id === "p1" && l.type === "plain")).toBe(true);
    expect(lines.some((l) => l.id === "p2" && l.type === "plain")).toBe(true);
    expect(lines.some((l) => l.id === "close" && l.type === "plain")).toBe(true);
    expect(lines.filter((l) => l.type === "blank").length).toBeGreaterThan(0);
  });

  it("keeps line ids unique", () => {
    const ids = buildDeferLines().map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("LIFO ordering", () => {
  it("pops in the exact reverse of the push order", () => {
    expect(POP_ORDER).toEqual([...PUSH_ORDER].reverse());
    expect(POP_ORDER).toEqual(["log", "lock", "db"]);
  });

  it("has metadata for every scheduled defer", () => {
    for (const item of deferItems()) {
      expect(DEFER_META[item].label.length).toBeGreaterThan(0);
      expect(DEFER_META[item].color).toMatch(/^var\(--anim-defer-/);
    }
  });
});