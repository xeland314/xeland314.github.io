import { describe, it, expect } from "vitest";
import {
  buildLinkLines,
  estimateLinkDemoMs,
  LINK_CODE,
  LINK_TIMING,
} from "./sequence";

describe("buildLinkLines", () => {
  it("has the four shell steps", () => {
    expect(buildLinkLines().map((l) => l.id)).toEqual([1, 2, 3, 4]);
  });

  it("creates a hard link and a symlink", () => {
    const html = LINK_CODE.map((l) => l.html).join("\n");
    expect(html).toContain("ln&nbsp;&nbsp;archivo.txt");
    expect(html).toContain("ln -s");
    expect(html).toContain("# mismo inodo");
    expect(html).toContain("# ruta → nombre".replace("→", "→"));
  });
});

describe("LINK_TIMING / estimate", () => {
  it("keeps every timing positive", () => {
    for (const ms of Object.values(LINK_TIMING)) {
      expect(ms).toBeGreaterThan(0);
    }
  });

  it("runs the full demo between 15s and 60s", () => {
    const total = estimateLinkDemoMs();
    expect(total).toBeGreaterThanOrEqual(15000);
    expect(total).toBeLessThanOrEqual(60000);
  });
});
