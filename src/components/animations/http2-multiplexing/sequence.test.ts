import { describe, it, expect } from "vitest";
import {
  buildMuxLines,
  FRAME_ORDER,
  MODE_CODE,
  MODE_FILE,
  H2_TIMING,
} from "./sequence";

describe("buildMuxLines", () => {
  it("has 4 lines per mode", () => {
    for (const mode of ["http1", "http2"] as const) {
      expect(buildMuxLines(mode).map((l) => l.id)).toEqual([1, 2, 3, 4]);
    }
  });

  it("explains one connection per request in http/1.1", () => {
    const html = buildMuxLines("http1").map((l) => l.html).join("\n");
    expect(html).toContain("una petición por conexión");
  });

  it("explains interleaved frames in http/2", () => {
    const html = buildMuxLines("http2").map((l) => l.html).join("\n");
    expect(html).toContain("intercalados");
    expect(html).toContain("Stream 5");
  });
});

describe("FRAME_ORDER", () => {
  it("interleaves headers and data of three odd streams", () => {
    const labels = FRAME_ORDER.map((f) => f.label);
    expect(labels).toEqual(["H1", "H3", "D1", "H5", "D3", "D5"]);
  });

  it("has unique element ids", () => {
    const ids = FRAME_ORDER.map((f) => f.elId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("MODE_FILE / H2_TIMING", () => {
  it("uses a different file per mode", () => {
    expect(MODE_FILE.http1).toBe("http_1_1.txt");
    expect(MODE_FILE.http2).toBe("http_2_frames.txt");
    expect(Object.keys(MODE_FILE).sort()).toEqual(
      Object.keys(MODE_CODE).sort(),
    );
  });

  it("keeps every timing positive", () => {
    for (const ms of Object.values(H2_TIMING)) {
      expect(ms).toBeGreaterThan(0);
    }
  });

  it("runs the full demo between 15s and 60s", () => {
    const http1 = H2_TIMING.introPause + 3 * (H2_TIMING.sendPause + H2_TIMING.respPause + H2_TIMING.laneDonePause);
    const http2 = H2_TIMING.h2IntroPause + FRAME_ORDER.length * H2_TIMING.framePause + 3 * H2_TIMING.streamDonePause;
    const total = http1 + http2 + H2_TIMING.endPause;
    expect(total).toBeGreaterThanOrEqual(15000);
    expect(total).toBeLessThanOrEqual(60000);
  });
});
