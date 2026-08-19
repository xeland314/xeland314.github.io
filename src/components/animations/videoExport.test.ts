import { afterEach, describe, it, expect } from "vitest";
import {
  DEFAULT_BITS_PER_SECOND,
  computeExportScale,
  pickMimeType,
} from "./videoExport";

const ORIGINAL_MEDIA_RECORDER = (
  globalThis as unknown as Record<string, unknown>
).MediaRecorder;

afterEach(() => {
  if (ORIGINAL_MEDIA_RECORDER === undefined) {
    delete (globalThis as unknown as Record<string, unknown>).MediaRecorder;
  } else {
    (globalThis as unknown as Record<string, unknown>).MediaRecorder =
      ORIGINAL_MEDIA_RECORDER;
  }
});

describe("computeExportScale", () => {
  it("returns an integer scale covering the target width (supersampling)", () => {
    expect(computeExportScale(405, 1080)).toBe(3);
    expect(computeExportScale(200, 1000)).toBe(5);
    expect(computeExportScale(500, 1080)).toBe(2);
    expect(computeExportScale(1080, 1080)).toBe(1);
  });

  it("falls back to 1 for invalid stage widths", () => {
    expect(computeExportScale(0, 1080)).toBe(1);
    expect(computeExportScale(-10, 1080)).toBe(1);
    expect(computeExportScale(Number.NaN, 1080)).toBe(1);
  });
});

describe("pickMimeType", () => {
  it("prefers vp9 when supported", () => {
    (globalThis as unknown as Record<string, unknown>).MediaRecorder = {
      isTypeSupported: (type: string) => type.includes("vp9"),
    };
    expect(pickMimeType()).toBe("video/webm;codecs=vp9");
  });

  it("falls back to vp8 and then plain webm", () => {
    (globalThis as unknown as Record<string, unknown>).MediaRecorder = {
      isTypeSupported: (type: string) => type.includes("vp8") && !type.includes("vp9"),
    };
    expect(pickMimeType()).toBe("video/webm;codecs=vp8");

    (globalThis as unknown as Record<string, unknown>).MediaRecorder = {
      isTypeSupported: () => false,
    };
    expect(pickMimeType()).toBe("video/webm");
  });

  it("returns webm when MediaRecorder is undefined", () => {
    delete (globalThis as unknown as Record<string, unknown>).MediaRecorder;
    expect(pickMimeType()).toBe("video/webm");
  });

  it("keeps DEFAULT_BITS_PER_SECOND at 12 Mbps for crisp video", () => {
    expect(DEFAULT_BITS_PER_SECOND).toBe(12_000_000);
  });
});