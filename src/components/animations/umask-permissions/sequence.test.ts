import { describe, it, expect } from "vitest";
import {
  buildUmaskLines,
  estimateUmaskDemoMs,
  UMASK_CODE,
  UMASK_TIMING,
} from "./sequence";

describe("buildUmaskLines", () => {
  it("computes 666 & ~022 = 644 and 777 & ~022 = 755", () => {
    const html = UMASK_CODE.map((l) => l.html).join("\n");
    expect(html).toContain("666 &amp; ~022 = <span");
    expect(html).toContain("644");
    expect(html).toContain("755");
  });

  it("mentions the stricter 077 mask", () => {
    expect(UMASK_CODE[3].html).toContain("077");
    expect(UMASK_CODE[3].html).toContain("600 / 700");
  });
});

describe("UMASK_TIMING / estimate", () => {
  it("keeps every timing positive", () => {
    for (const ms of Object.values(UMASK_TIMING)) {
      expect(ms).toBeGreaterThan(0);
    }
  });

  it("runs the full demo between 15s and 60s", () => {
    const total = estimateUmaskDemoMs();
    expect(total).toBeGreaterThanOrEqual(15000);
    expect(total).toBeLessThanOrEqual(60000);
  });
});
