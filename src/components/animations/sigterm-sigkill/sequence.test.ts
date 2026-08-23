import { describe, it, expect } from "vitest";
import {
  buildSigLines,
  CLEANUP_TASKS,
  estimateSigDemoMs,
  SIG_CODE,
  SIG_TIMING,
} from "./sequence";

describe("buildSigLines", () => {
  it("has 4 lines per mode", () => {
    for (const mode of ["sigterm", "sigkill"] as const) {
      expect(buildSigLines(mode).map((l) => l.id)).toEqual([1, 2, 3, 4]);
    }
  });

  it("registers a SIGTERM handler with cleanup and exit 0", () => {
    const html = buildSigLines("sigterm").map((l) => l.html).join("\n");
    expect(html).toContain("SIGTERM");
    expect(html).toContain("close_sockets()");
    expect(html).toContain("exit");
  });

  it("explains that SIGKILL cannot be trapped", () => {
    const html = buildSigLines("sigkill").map((l) => l.html).join("\n");
    expect(html).toContain("-9 NO puede atraparse");
  });
});

describe("CLEANUP_TASKS", () => {
  it("lists three cleanup steps", () => {
    expect(CLEANUP_TASKS.map((t) => t.label)).toEqual([
      "cerrar sockets",
      "vaciar buffers",
      "cerrar archivos",
    ]);
  });
});

describe("SIG_TIMING / estimate", () => {
  it("keeps every timing positive", () => {
    for (const ms of Object.values(SIG_TIMING)) {
      expect(ms).toBeGreaterThan(0);
    }
  });

  it("runs the full demo between 15s and 60s", () => {
    const total = estimateSigDemoMs();
    expect(total).toBeGreaterThanOrEqual(15000);
    expect(total).toBeLessThanOrEqual(60000);
  });
});
