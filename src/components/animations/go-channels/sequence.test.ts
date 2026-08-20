import { describe, it, expect } from "vitest";
import {
  buildChannelLines,
  buildDemoPlan,
  CHANNEL_CAPACITY,
  CHANNEL_FILE,
  CHANNEL_TIMING,
} from "./sequence";

describe("buildChannelLines", () => {
  it("keeps ids 1..5 in order", () => {
    expect(buildChannelLines().map((l) => l.id)).toEqual([1, 2, 3, 4, 5]);
  });

  it("marks the go keyword", () => {
    expect(buildChannelLines().find((l) => l.id === 2)?.html).toContain(
      "anim-tok-go",
    );
  });

  it("contains send and receive operators", () => {
    const html = buildChannelLines()
      .map((l) => l.html)
      .join("\n");
    expect(html).toContain(`anim-tok-mut">&lt;-</span>`);
    expect(html).toContain(`&lt;-</span>ch`);
  });

  it("builds the channel with the declared capacity", () => {
    const html = buildChannelLines().find((l) => l.id === 1)?.html ?? "";
    expect(html).toContain(`anim-tok-fn">make`);
    expect(html).toContain(`anim-tok-str">${CHANNEL_CAPACITY}`);
  });
});

describe("buildDemoPlan", () => {
  it("marks blocked steps exactly where the simulation would block", () => {
    const buffer: string[] = [];
    for (const step of buildDemoPlan()) {
      if (step.action === "send") {
        const wouldBlock = buffer.length >= CHANNEL_CAPACITY;
        expect(Boolean(step.blocked)).toBe(wouldBlock);
        if (!wouldBlock) buffer.push(step.item ?? "");
      } else {
        const wouldBlock = buffer.length === 0;
        expect(Boolean(step.blocked)).toBe(wouldBlock);
        if (!wouldBlock) buffer.shift();
      }
      expect(buffer.length).toBeLessThanOrEqual(CHANNEL_CAPACITY);
    }
  });

  it("shows both a full-block and an empty-block moment", () => {
    const plan = buildDemoPlan();
    const blockedSends = plan.filter((s) => s.blocked && s.action === "send");
    const blockedRecvs = plan.filter((s) => s.blocked && s.action === "recv");
    expect(blockedSends).toHaveLength(1);
    expect(blockedRecvs).toHaveLength(1);
  });

  it("ends with data in the channel", () => {
    const buffer: string[] = [];
    for (const step of buildDemoPlan()) {
      if (step.action === "send" && !step.blocked) buffer.push(step.item ?? "");
      if (step.action === "recv" && !step.blocked) buffer.shift();
    }
    expect(buffer).toEqual(["📦#4"]);
  });
});

describe("CHANNEL_FILE / CHANNEL_TIMING", () => {
  it("points to the concurrency file", () => {
    expect(CHANNEL_FILE).toBe("concurrencia.go");
  });

  it("keeps every timing positive", () => {
    for (const ms of Object.values(CHANNEL_TIMING)) {
      expect(ms).toBeGreaterThan(0);
    }
  });
});