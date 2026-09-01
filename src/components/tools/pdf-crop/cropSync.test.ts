import { describe, it, expect } from "vitest";
import { syncRectsForSelection, reindexRectsAfterDelete, reindexRectsAfterExtract } from "./cropSync";
import type { NormalizedRect } from "./pdfOperations";

describe("syncRectsForSelection", () => {
  it("updates only dragged when not selected or single", () => {
    const rects = new Map<number, NormalizedRect>([[0, { x: 0, y: 0, w: 0.5, h: 0.5 }]]);
    const selected = new Set([1]); // dragged 0 not in selected
    const start = { x: 0, y: 0, w: 0.5, h: 0.5 };
    const nextRect = { x: 0.1, y: 0.1, w: 0.5, h: 0.5 };
    const out = syncRectsForSelection(rects, 0, start, nextRect, selected);
    expect(out.get(0)).toEqual(nextRect);
    expect(out.has(1)).toBe(false);
  });

  it("moves all selected in unison", () => {
    const rects = new Map<number, NormalizedRect>([
      [0, { x: 0, y: 0, w: 0.5, h: 0.5 }],
      [1, { x: 0.1, y: 0.1, w: 0.5, h: 0.5 }],
      [2, { x: 0.2, y: 0.2, w: 0.5, h: 0.5 }],
    ]);
    const selected = new Set([0, 1, 2]);
    const start = { x: 0, y: 0, w: 0.5, h: 0.5 };
    const moved = { x: 0.05, y: 0.05, w: 0.5, h: 0.5 }; // dx=0.05, dy=0.05
    const out = syncRectsForSelection(rects, 0, start, moved, selected);
    const r1 = out.get(1)!; expect(r1.x).toBeCloseTo(0.15,5); expect(r1.y).toBeCloseTo(0.15,5);
    const r2 = out.get(2)!; expect(r2.x).toBeCloseTo(0.25,5); expect(r2.y).toBeCloseTo(0.25,5);
    expect(out.get(0)).toEqual(moved);
  });

  it("resizes all selected in unison", () => {
    const rects = new Map<number, NormalizedRect>([
      [0, { x: 0, y: 0, w: 0.5, h: 0.5 }],
      [1, { x: 0, y: 0, w: 0.5, h: 0.5 }],
    ]);
    const selected = new Set([0, 1]);
    const start = { x: 0, y: 0, w: 0.5, h: 0.5 };
    const resized = { x: 0, y: 0, w: 0.6, h: 0.6 }; // dw=0.1
    const out = syncRectsForSelection(rects, 0, start, resized, selected);
    expect(out.get(0)).toEqual(resized);
    expect(out.get(1)).toEqual({ x: 0, y: 0, w: 0.6, h: 0.6 });
  });
});

describe("reindex", () => {
  it("reindex after delete keeps order", () => {
    const rects = new Map<number, NormalizedRect>([
      [0, { x: 0, y: 0, w: 0.4, h: 0.4 }],
      [1, { x: 0.1, y: 0.1, w: 0.4, h: 0.4 }],
      [2, { x: 0.2, y: 0.2, w: 0.4, h: 0.4 }],
      [3, { x: 0.3, y: 0.3, w: 0.4, h: 0.4 }],
    ]);
    const kept = [0, 2]; // delete 1,3
    const out = reindexRectsAfterDelete(rects, kept);
    expect(out.size).toBe(2);
    expect(out.get(0)).toEqual({ x: 0, y: 0, w: 0.4, h: 0.4 });
    expect(out.get(1)).toEqual({ x: 0.2, y: 0.2, w: 0.4, h: 0.4 });
  });

  it("reindex after extract keeps order", () => {
    const rects = new Map<number, NormalizedRect>([
      [1, { x: 0.1, y: 0.1, w: 0.3, h: 0.3 }],
      [3, { x: 0.3, y: 0.3, w: 0.3, h: 0.3 }],
    ]);
    const extracted = [3, 1]; // weird order input but we sort before calling in app; test direct
    const out = reindexRectsAfterExtract(rects, [1, 3]);
    expect(out.get(0)).toEqual({ x: 0.1, y: 0.1, w: 0.3, h: 0.3 });
    expect(out.get(1)).toEqual({ x: 0.3, y: 0.3, w: 0.3, h: 0.3 });
  });
});
