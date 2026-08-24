import { describe, it, expect } from "vitest";
import {
  bitsToLetters,
  bitsToMode,
  bitsToOctalDigit,
  buildChmodLines,
  estimateChmodDemoMs,
  CHMOD_CODE,
  CHMOD_TIMING,
  PERM_BITS_644,
  PERM_BITS_755,
} from "./sequence";

describe("buildChmodLines", () => {
  it("shows the rw-r--r-- to rwxr-xr-x transition with 755", () => {
    const html = CHMOD_CODE.map((l) => l.html).join("\n");
    expect(html).toContain("rw-r--r--");
    expect(html).toContain("chmod");
    expect(html).toContain("755");
    expect(html).toContain("rwxr-xr-x");
  });

  it("starts from the 644 mode", () => {
    expect(CHMOD_CODE[1].html).toContain("644");
  });
});

describe("bit helpers", () => {
  it("maps each rwx triple to its octal digit", () => {
    expect(bitsToOctalDigit([1, 1, 0])).toBe(6);
    expect(bitsToOctalDigit([1, 0, 0])).toBe(4);
    expect(bitsToOctalDigit([1, 0, 1])).toBe(5);
    expect(bitsToOctalDigit([1, 1, 1])).toBe(7);
  });

  it("computes 644 and 755 from raw bits", () => {
    expect(bitsToMode(PERM_BITS_644)).toBe("644");
    expect(bitsToMode(PERM_BITS_755)).toBe("755");
  });

  it("renders permission letters", () => {
    expect(bitsToLetters([1, 1, 0])).toBe("rw-");
    expect(bitsToLetters([1, 0, 1])).toBe("r-x");
  });
});

describe("CHMOD_TIMING / estimate", () => {
  it("keeps every timing positive", () => {
    for (const ms of Object.values(CHMOD_TIMING)) {
      expect(ms).toBeGreaterThan(0);
    }
  });

  it("runs the full demo between 15s and 60s", () => {
    const total = estimateChmodDemoMs();
    expect(total).toBeGreaterThanOrEqual(15000);
    expect(total).toBeLessThanOrEqual(60000);
  });

  it("stays inside the 16s-24s production budget", () => {
    const total = estimateChmodDemoMs();
    expect(total).toBeGreaterThanOrEqual(16000);
    expect(total).toBeLessThanOrEqual(24000);
  });
});
