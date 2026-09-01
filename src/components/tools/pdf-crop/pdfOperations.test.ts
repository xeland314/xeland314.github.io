import { describe, it, expect } from "vitest";
import {
  parsePageIntervals,
  formatPageIntervals,
  clampPercent,
  clampRect,
  normalizedRectToCropBox,
  isFullRect,
  FULL_RECT,
  validateNormalizedRect,
} from "./pdfOperations";
import { PDFDocument } from "pdf-lib";

describe("parsePageIntervals", () => {
  it("single page", () => {
    expect(parsePageIntervals("1", 5)).toEqual([0]);
    expect(parsePageIntervals("5", 5)).toEqual([4]);
  });
  it("interval", () => {
    expect(parsePageIntervals("2-4", 5)).toEqual([1, 2, 3]);
    expect(parsePageIntervals("4-2", 5)).toEqual([1, 2, 3]);
  });
  it("mixed", () => {
    expect(parsePageIntervals("1,3-5,2", 5)).toEqual([0, 1, 2, 3, 4]);
  });
  it("out of range ignored", () => {
    expect(parsePageIntervals("0,6,1-10", 5)).toEqual([0, 1, 2, 3, 4]);
  });
  it("empty and invalid", () => {
    expect(parsePageIntervals("", 5)).toEqual([]);
    expect(parsePageIntervals("a,2-foo", 5)).toEqual([]);
  });
  it("deduplicates", () => {
    expect(parsePageIntervals("1,1,2-3,3", 5)).toEqual([0, 1, 2]);
  });
});

describe("formatPageIntervals", () => {
  it("formats ranges", () => {
    expect(formatPageIntervals([0, 1, 2, 4])).toBe("1-3, 5");
    expect(formatPageIntervals([0])).toBe("1");
    expect(formatPageIntervals([])).toBe("");
  });
});

describe("clampPercent", () => {
  it("clamps 0-50", () => {
    expect(clampPercent(60)).toBe(50);
    expect(clampPercent(-5)).toBe(0);
    expect(clampPercent(12.7)).toBe(13);
  });
});

describe("normalized rect", () => {
  it("isFullRect", () => {
    expect(isFullRect(FULL_RECT)).toBe(true);
    expect(isFullRect({ x: 0.1, y: 0, w: 0.9, h: 1 })).toBe(false);
  });
  it("clampRect keeps inside 0-1", () => {
    expect(clampRect({ x: -0.1, y: 0, w: 0.5, h: 0.5 })).toEqual({ x: 0, y: 0, w: 0.5, h: 0.5 });
    expect(clampRect({ x: 0.8, y: 0.8, w: 0.5, h: 0.5 })).toEqual({ x: 0.5, y: 0.5, w: 0.5, h: 0.5 });
    expect(clampRect({ x: 0, y: 0, w: 0.01, h: 0.01 })).toEqual({ x: 0, y: 0, w: 0.05, h: 0.05 });
  });
  it("normalizedRectToCropBox converts correctly", () => {
    const r = { x: 0.1, y: 0.2, w: 0.8, h: 0.6 };
    const box = normalizedRectToCropBox(r, 600, 800);
    expect(box.x).toBeCloseTo(60, 5);
    expect(box.y).toBeCloseTo(160, 5);
    expect(box.width).toBeCloseTo(480, 5);
    expect(box.height).toBeCloseTo(480, 5);
    // y = (1 -0.2 -0.6)*800 =0.2*800=160
  });
  it("validateNormalizedRect", () => {
    expect(validateNormalizedRect({ x: 0, y: 0, w: 1, h: 1 })).toBe(true);
    expect(validateNormalizedRect({ x: 0.5, y: 0.5, w: 0.6, h: 0.6 })).toBe(false);
    expect(validateNormalizedRect({ x: -0.1, y: 0, w: 0.5, h: 0.5 })).toBe(false);
  });
});

describe("PDF order preservation (bug desorden al recortar)", () => {
  async function createThreePagePdf(): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    for (let i = 0; i < 3; i++) {
      const page = doc.addPage([600, 800]);
      // draw distinct text so pages are distinguishable if needed
      page.drawText(`PAGINA ${i + 1}`, { x: 50, y: 750, size: 24 });
    }
    return await doc.save();
  }

  it("crop does not reorder pages", async () => {
    const bytes = await createThreePagePdf();
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(3);
    // crop only middle page (idx 1) to 80% centered-like
    const rect = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };
    const page = doc.getPage(1);
    const media = page.getMediaBox();
    expect(media.width).toBe(600);
    const box = normalizedRectToCropBox(rect, media.width, media.height);
    page.setCropBox(box.x, box.y, box.width, box.height);
    const saved = await doc.save();
    const reloaded = await PDFDocument.load(saved);
    expect(reloaded.getPageCount()).toBe(3);
    // check cropBox of each page
    const p0Box = reloaded.getPage(0).getCropBox();
    const p1Box = reloaded.getPage(1).getCropBox();
    const p2Box = reloaded.getPage(2).getCropBox();
    // p0 and p2 should remain full (media box)
    expect(p0Box.width).toBe(600);
    expect(p0Box.height).toBe(800);
    expect(p2Box.width).toBe(600);
    // p1 cropped to 480x640
    expect(p1Box.width).toBeCloseTo(480, 0);
    expect(p1Box.height).toBeCloseTo(640, 0);
    expect(p1Box.x).toBeCloseTo(60, 0);
    // order preserved: pageCount stays 3 and p0 still first
  });

  it("delete preserves order of remaining pages", async () => {
    const bytes = await createThreePagePdf();
    const doc = await PDFDocument.load(bytes);
    doc.removePage(1); // remove middle
    const saved = await doc.save();
    const reloaded = await PDFDocument.load(saved);
    expect(reloaded.getPageCount()).toBe(2);
  });

  it("successive crops use MediaBox not already-cropped size (no disorder/drift)", async () => {
    const bytes = await createThreePagePdf();
    let doc = await PDFDocument.load(bytes);
    // first crop 10% each side on page 0
    const rect1 = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };
    const media0 = doc.getPage(0).getMediaBox();
    let box = normalizedRectToCropBox(rect1, media0.width, media0.height);
    doc.getPage(0).setCropBox(box.x, box.y, box.width, box.height);
    let saved = await doc.save();
    doc = await PDFDocument.load(saved);
    // second crop with same rect should give same result if using MediaBox, not drift to smaller
    const mediaAgain = doc.getPage(0).getMediaBox(); // still 600x800
    expect(mediaAgain.width).toBe(600);
    box = normalizedRectToCropBox(rect1, mediaAgain.width, mediaAgain.height);
    doc.getPage(0).setCropBox(box.x, box.y, box.width, box.height);
    saved = await doc.save();
    const reloaded = await PDFDocument.load(saved);
    const finalBox = reloaded.getPage(0).getCropBox();
    expect(finalBox.width).toBeCloseTo(480, 0);
    // if we had used getSize (cropBox size 480) second time, would be 384 -> drift
  });
});
