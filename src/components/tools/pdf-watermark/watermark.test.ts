import { describe, it, expect } from "vitest";
import { clampOpacity, clampScale, getWatermarkDrawRect } from "./watermark";

describe("watermark helpers", () => {
  it("clampOpacity y clampScale", () => {
    expect(clampOpacity(2)).toBe(0.9);
    expect(clampOpacity(-1)).toBe(0.05);
    expect(clampOpacity(0.184)).toBe(0.18);
    expect(clampScale(10)).toBe(0.6);
    expect(clampScale(0)).toBe(0.1);
    expect(clampScale(0.33)).toBe(0.35);
  });
  it("getWatermarkDrawRect posiciones", () => {
    const r = getWatermarkDrawRect(1000, 800, 200, 100, 0.2, "center");
    expect(r.w).toBe(200);
    expect(r.h).toBe(100);
    expect(r.x).toBe(400);
    expect(r.y).toBe(350);
    const tl = getWatermarkDrawRect(1000, 800, 200, 100, 0.2, "top-left");
    expect(tl.x).toBe(20); expect(tl.y).toBe(20);
    const br = getWatermarkDrawRect(1000, 800, 200, 100, 0.2, "bottom-right");
    expect(br.x).toBe(780); expect(br.y).toBe(680);
    const tile = getWatermarkDrawRect(1000, 800, 200, 100, 0.2, "tile");
    expect(tile.x).toBe(0); expect(tile.y).toBe(0);
  });
});
