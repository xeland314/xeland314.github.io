import { describe, it, expect } from "vitest";
import {
  buildForkLines,
  estimateForkDemoMs,
  CHILD_PID,
  PARENT_PID,
  FORK_CODE,
  FORK_TIMING,
  FORK_VIEWS,
} from "./sequence";

describe("buildForkLines", () => {
  it("renders the full fork_demo.c program", () => {
    expect(buildForkLines().map((l) => l.id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    ]);
  });

  it("calls fork and branches on pid == 0", () => {
    const html = FORK_CODE.map((l) => l.html).join("\n");
    expect(html).toContain("fork");
    expect(html).toContain("pid == <span");
    expect(html).toContain("hijo: pid=%d");
    expect(html).toContain("padre: hijo=%d");
    expect(html).toContain("return");
  });
});

describe("FORK_VIEWS / FORK_TIMING / estimate", () => {
  it("orders the three canonical states", () => {
    expect(FORK_VIEWS).toEqual(["single", "forked", "branches"]);
  });

  it("uses distinct pids for padre and hijo", () => {
    expect(PARENT_PID).not.toBe(CHILD_PID);
    expect(CHILD_PID).toBeGreaterThan(PARENT_PID);
  });

  it("keeps every timing positive", () => {
    for (const ms of Object.values(FORK_TIMING)) {
      expect(ms).toBeGreaterThan(0);
    }
  });

  it("runs the full demo between 15s and 60s", () => {
    const total = estimateForkDemoMs();
    expect(total).toBeGreaterThanOrEqual(15000);
    expect(total).toBeLessThanOrEqual(60000);
  });
});
