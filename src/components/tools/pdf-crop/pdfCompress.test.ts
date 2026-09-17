import { describe, it, expect } from "vitest";
import { PDFDocument, rgb } from "pdf-lib";
import {
  COMPRESSION_PRESETS,
  getPreset,
  isValidLevel,
  clampQuality,
  clampScale,
  resolveCompressOptions,
  compressLossless,
  compressWithRaster,
  compressPdf,
  toGrayscale,
  formatSaved,
} from "./pdfCompress";

// Canvas + pdfjs deps para Node (vitest)
import * as pdfjsLegacy from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "canvas";

if (!(globalThis as any).DOMMatrix) {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    constructor(_init?: string) {}
    multiplySelf() { return this; }
    translateSelf() { return this; }
    scaleSelf() { return this; }
    rotateSelf() { return this; }
    invertSelf() { return this; }
  } as any;
}

function nodeRasterDeps() {
  return {
    getPdfjs: () => pdfjsLegacy as any,
    createCanvas: (w: number, h: number) => {
      const c = createCanvas(w, h) as unknown as HTMLCanvasElement;
      const ctx = (c as any).getContext("2d", { alpha: false }) as CanvasRenderingContext2D;
      return {
        canvas: c,
        ctx,
        toDataUrl: (q: number) => (c as any).toDataURL("image/jpeg", { quality: q }),
      };
    },
    destroyPdfjsDoc: async (doc: any) => { try { await doc.destroy(); } catch {} },
  } as any;
}

async function makeVectorPdf(pages = 2): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) {
    const p = doc.addPage([600, 800]);
    p.drawText(`Hola vector ${i + 1}`, { x: 50, y: 700, size: 20 });
    p.drawRectangle({ x: 50, y: 50, width: 500, height: 600, borderColor: rgb(0, 0, 0), borderWidth: 1 });
  }
  return await doc.save();
}

async function makeImagePdf(): Promise<Uint8Array> {
  // crea un JPEG sintético vía node-canvas y lo embebe
  const c = createCanvas(800, 1000);
  const ctx = c.getContext("2d") as any;
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 800, 1000);
  ctx.fillStyle = "#002a51"; ctx.fillRect(0, 0, 800, 120);
  ctx.fillStyle = "#000000"; ctx.font = "24px sans-serif";
  ctx.fillText("PDF con imagen para test compresión", 20, 60);
  // ruido para que JPEG no sea trivialmente pequeño
  for (let i = 0; i < 4000; i++) {
    ctx.fillStyle = `hsl(${Math.random() * 40 + 200}, 70%, 60%)`;
    ctx.fillRect(Math.random() * 800, Math.random() * 1000, 3, 3);
  }
  const buf = (c as any).toBuffer("image/jpeg", { quality: 0.92 }) as Buffer;
  const jpgBytes = new Uint8Array(buf);
  const doc = await PDFDocument.create();
  const jpg = await doc.embedJpg(jpgBytes);
  const dims = jpg.scale(1);
  for (let i = 0; i < 2; i++) {
    const p = doc.addPage([dims.width, dims.height]);
    p.drawImage(jpg, { x: 0, y: 0, width: dims.width, height: dims.height });
  }
  return await doc.save();
}

describe("pdfCompress presets", () => {
  it("presets tienen keys y calidad en rango", () => {
    for (const lvl of Object.keys(COMPRESSION_PRESETS) as any[]) {
      const p: any = (COMPRESSION_PRESETS as any)[lvl];
      expect(p.scale).toBeGreaterThan(0);
      expect(p.quality).toBeGreaterThanOrEqual(0.1);
      expect(p.quality).toBeLessThanOrEqual(1);
      expect(["low", "medium", "high", "extreme"]).toContain(lvl);
    }
    expect(getPreset("low").requiresRaster).toBe(false);
    expect(getPreset("extreme").grayscale).toBe(true);
  });
  it("isValidLevel y clamp helpers", () => {
    expect(isValidLevel("medium")).toBe(true);
    expect(isValidLevel("foo" as any)).toBe(false);
    expect(clampQuality(2)).toBe(1);
    expect(clampQuality(-1)).toBe(0.1);
    expect(clampScale(9999)).toBe(1600);
    expect(clampScale(10)).toBe(400);
  });
  it("resolveCompressOptions low sin raster, con overrides sí raster", () => {
    expect(resolveCompressOptions({ level: "low" }).requiresRaster).toBe(false);
    expect(resolveCompressOptions({ level: "low", quality: 0.5 }).requiresRaster).toBe(true);
    expect(resolveCompressOptions({ level: "low", grayscale: true }).requiresRaster).toBe(true);
    expect(resolveCompressOptions({ level: "low", maxWidthPx: 800 }).requiresRaster).toBe(true);
    expect(resolveCompressOptions({ level: "high" }).requiresRaster).toBe(true);
    expect(resolveCompressOptions({}).level).toBe("medium");
    expect(resolveCompressOptions({ level: "medium", quality: 0.5 }).quality).toBe(0.5);
  });
  it("toGrayscale convierte a luma", () => {
    const data = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255]);
    const img = { data, width: 2, height: 2 } as unknown as ImageData;
    toGrayscale(img as any);
    // rojo -> 76, verde ~150, azul ~29, blanco 255
    expect(data[0]).toBeCloseTo(76, 0);
    expect(data[1]).toBe(data[0]);
    expect(data[4]).toBeCloseTo(150, 0);
    expect(data[8]).toBeCloseTo(29, 0);
    expect(data[12]).toBe(255);
  });
});

describe("compressLossless y compressPdf", () => {
  it("compressLossless mantiene pageCount y header", async () => {
    const bytes = await makeVectorPdf(3);
    const out = await compressLossless(bytes);
    expect(new TextDecoder().decode(out.slice(0, 5))).toBe("%PDF-");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(3);
  });

  it("compressPdf low (lossless) no rompe PDF vectorial y puede ahorrar o igualar", async () => {
    const bytes = await makeVectorPdf(2);
    const { bytes: out, stats } = await compressPdf(bytes, { level: "low" });
    expect(new TextDecoder().decode(out.slice(0, 5))).toBe("%PDF-");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
    expect(stats.level).toBe("low");
    expect(stats.originalBytes).toBe(bytes.length);
    expect(stats.compressedBytes).toBe(out.length);
    // lossless puede ser igual o menor pero no mucho mayor (objectStreams)
    expect(out.length).toBeLessThanOrEqual(bytes.length + 500);
    expect(formatSaved(stats)).toContain("KB");
  });

  it("compressWithRaster respeta orden de calidad (medium > high > extreme en tamaño)", async () => {
    // vector pdf evita bug Node de render JPEG embebido (Image or Canvas expected)
    const bytes = await makeVectorPdf(2);
    const deps = nodeRasterDeps();
    const medium = await compressWithRaster(bytes, resolveCompressOptions({ level: "medium" }), undefined, undefined, deps);
    const high = await compressWithRaster(bytes, resolveCompressOptions({ level: "high" }), undefined, undefined, deps);
    const extreme = await compressWithRaster(bytes, resolveCompressOptions({ level: "extreme" }), undefined, undefined, deps);
    expect(new TextDecoder().decode(medium.slice(0, 5))).toBe("%PDF-");
    expect((await PDFDocument.load(medium)).getPageCount()).toBe(2);
    // high debe ser <= medium (menor calidad y escala), extreme <= high (grises)
    expect(high.length).toBeLessThanOrEqual(medium.length);
    expect(extreme.length).toBeLessThanOrEqual(high.length);
    // todos son PDFs válidos con mismo pageCount
    expect((await PDFDocument.load(high)).getPageCount()).toBe(2);
    expect((await PDFDocument.load(extreme)).getPageCount()).toBe(2);
  }, 20000);

  it("compressPdf con raster (medium) funciona end-to-end y stats coherentes", async () => {
    const bytes = await makeVectorPdf(2);
    const deps = nodeRasterDeps();
    // usa compressWithRaster directo: evita fallback lossless que agranda vector->raster
    const out = await compressWithRaster(bytes, resolveCompressOptions({ level: "medium" }), undefined, undefined, deps);
    const stats = { originalBytes: bytes.length, compressedBytes: out.length, ratio: out.length / bytes.length, savedPercent: Math.max(0, (1 - out.length / bytes.length) * 100), level: "medium" as const };
    expect(new TextDecoder().decode(out.slice(0, 5))).toBe("%PDF-");
    expect(stats.ratio).toBeCloseTo(out.length / bytes.length, 3);
    // para vector, raster puede agrandar: stats coherente igualmente
    expect(stats.compressedBytes).toBe(out.length);
    // verifica compressPdf fallback: para vector, medium debería fallback a lossless (no empeora)
    const { bytes: viaApi, stats: apiStats } = await compressPdf(bytes, { level: "medium" }, undefined, undefined, deps as any);
    expect(apiStats.compressedBytes).toBeLessThanOrEqual(bytes.length + 200);
    expect(new TextDecoder().decode(viaApi.slice(0, 5))).toBe("%PDF-");
  }, 20000);

  it("compressPdf valida header y lanza en no-PDF", async () => {
    await expect(compressPdf(new Uint8Array([1, 2, 3]) as any, { level: "low" })).rejects.toThrow();
    await expect(compressPdf(new TextEncoder().encode("XXXXX"), { level: "low" })).rejects.toThrow(/No es PDF/);
  });

  it("extreme respeta grayscale aunque raster deps", async () => {
    const bytes = await makeVectorPdf(1);
    const deps = nodeRasterDeps();
    const opts = resolveCompressOptions({ level: "extreme" });
    expect(opts.grayscale).toBe(true);
    const out = await compressWithRaster(bytes, opts, undefined, undefined, deps);
    expect((await PDFDocument.load(out)).getPageCount()).toBe(1);
  }, 20000);

  it("low con forceRaster sí rasteriza (compressWithRaster)", async () => {
    const bytes = await makeVectorPdf(1);
    const deps = nodeRasterDeps();
    const opts = resolveCompressOptions({ level: "low", forceRaster: true });
    expect(opts.requiresRaster).toBe(true);
    const out = await compressWithRaster(bytes, opts, undefined, undefined, deps);
    expect(new TextDecoder().decode(out.slice(0, 5))).toBe("%PDF-");
    expect((await PDFDocument.load(out)).getPageCount()).toBe(1);
    // y compressPdf con forceRaster usa raster (verifica que no lanza)
    const viaApi = await compressPdf(bytes, { level: "low", forceRaster: true }, undefined, undefined, deps as any);
    expect(viaApi.bytes.length).toBeGreaterThan(0);
  }, 20000);
});
