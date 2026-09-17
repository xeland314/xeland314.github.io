import { PDFDocument } from "pdf-lib";

export type CompressionLevel = "low" | "medium" | "high" | "extreme";

export interface CompressPreset {
  label: string;
  description: string;
  /** 1.0 = sin escala, <1 reduce resolución */
  scale: number;
  /** calidad JPEG 0..1 */
  quality: number;
  grayscale: boolean;
  /** si true, solo recompresión pdf-lib sin raster (vectorial) */
  useObjectStreams: boolean;
  /** indica si requiere rasterizado (scale/quality forcing raster) */
  requiresRaster: boolean;
}

export const COMPRESSION_PRESETS: Record<CompressionLevel, CompressPreset> = {
  low: {
    label: "Baja (conserva calidad)",
    description: "Reescribe objetos + streams sin rasterizar. Sin pérdida visible. ~5-15% ahorro.",
    scale: 1,
    quality: 0.92,
    grayscale: false,
    useObjectStreams: true,
    requiresRaster: false,
  },
  medium: {
    label: "Media (recomendada)",
    description: "Raster 900px ancho, JPEG 0.72. Buen equilibrio tamaño/calidad para PDFs escaneados.",
    scale: 900,
    quality: 0.72,
    grayscale: false,
    useObjectStreams: true,
    requiresRaster: true,
  },
  high: {
    label: "Alta",
    description: "Raster 750px ancho, JPEG 0.55. Reduce ~50-70% con pérdida moderada.",
    scale: 750,
    quality: 0.55,
    grayscale: false,
    useObjectStreams: true,
    requiresRaster: true,
  },
  extreme: {
    label: "Extrema (máxima compresión)",
    description: "Raster 600px ancho, JPEG 0.45 + escala de grises. Máximo ahorro para archivo/visualización.",
    scale: 600,
    quality: 0.45,
    grayscale: true,
    useObjectStreams: true,
    requiresRaster: true,
  },
};

export function getPreset(level: CompressionLevel): CompressPreset {
  return COMPRESSION_PRESETS[level] ?? COMPRESSION_PRESETS.medium;
}

export function listLevels(): CompressionLevel[] {
  return Object.keys(COMPRESSION_PRESETS) as CompressionLevel[];
}

export function isValidLevel(v: string): v is CompressionLevel {
  return v in COMPRESSION_PRESETS;
}

export function clampQuality(q: number): number {
  if (isNaN(q)) return 0.72;
  return Math.max(0.1, Math.min(1, Math.round(q * 100) / 100));
}

export function clampScale(s: number): number {
  if (isNaN(s)) return 900;
  return Math.max(400, Math.min(1600, Math.round(s)));
}

export interface CompressOptions {
  level?: CompressionLevel;
  /** override calidad 0.1-1 (si se especifica, ignora preset quality) */
  quality?: number;
  /** override ancho objetivo en px (si se especifica, ignora preset scale) */
  maxWidthPx?: number;
  grayscale?: boolean;
  /** si true fuerza raster incluso en low */
  forceRaster?: boolean;
}

export interface ResolvedCompressOptions {
  level: CompressionLevel;
  quality: number;
  maxWidthPx: number;
  grayscale: boolean;
  requiresRaster: boolean;
  preset: CompressPreset;
}

export function resolveCompressOptions(opts: CompressOptions = {}): ResolvedCompressOptions {
  const level: CompressionLevel = opts.level && isValidLevel(opts.level) ? opts.level : "medium";
  const preset = getPreset(level);
  const quality = opts.quality !== undefined ? clampQuality(opts.quality) : preset.quality;
  const maxWidthPx = opts.maxWidthPx !== undefined ? clampScale(opts.maxWidthPx) : preset.scale;
  const grayscale = opts.grayscale !== undefined ? !!opts.grayscale : preset.grayscale;
  const requiresRaster = opts.forceRaster ? true : preset.requiresRaster || opts.quality !== undefined || opts.maxWidthPx !== undefined || opts.grayscale !== undefined;
  // low sin overrides sigue sin raster
  const finalRequiresRaster = level === "low" && !opts.forceRaster && opts.quality === undefined && opts.maxWidthPx === undefined && opts.grayscale === undefined ? false : requiresRaster;
  return { level, quality, maxWidthPx, grayscale, requiresRaster: finalRequiresRaster, preset };
}

export interface CompressStats {
  originalBytes: number;
  compressedBytes: number;
  ratio: number; // 0..1 -> compressed/original
  savedPercent: number; // 0..100
  level: CompressionLevel;
}

/** Compresión sin pérdida visual: solo re-serializa con objectStreams (pdf-lib) */
export async function compressLossless(bytes: Uint8Array): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes);
  return await doc.save({ useObjectStreams: true, addDefaultPage: false });
}

/** Convierte ImageData a grayscale in-place helper exportado para test */
export function toGrayscale(imageData: ImageData): void {
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const v = Math.round(l);
    d[i] = v; d[i + 1] = v; d[i + 2] = v;
  }
}

export interface RasterDeps {
  getPdfjs: () => any; // pdfjsLib con getDocument
  createCanvas: (w: number, h: number) => { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; toDataUrl: (q: number) => string };
  destroyPdfjsDoc?: (doc: any) => Promise<void>;
}

/**
 * Compresión con rasterizado: renderiza cada página a canvas y re-embebe como JPEG.
 * En navegador, usa document.createElement('canvas') + pdfjs-dist. En Node tests, inyectar deps con node-canvas.
 */
export async function compressWithRaster(
  bytes: Uint8Array,
  opts: ResolvedCompressOptions,
  onProgress?: (done: number, total: number) => void,
  signal?: AbortSignal,
  deps?: RasterDeps,
): Promise<Uint8Array> {
  const pdfjsLib = deps?.getPdfjs ? deps.getPdfjs() : await getBrowserPdfjs();

  const task = pdfjsLib.getDocument({ data: bytes.slice(0) });
  const pdfjsDoc = await task.promise;
  const total = pdfjsDoc.numPages as number;
  const dstDoc = await PDFDocument.create();

  try {
    for (let idx = 0; idx < total; idx++) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      const page = await pdfjsDoc.getPage(idx + 1);
      const vp1 = page.getViewport({ scale: 1 });
      const targetW = opts.maxWidthPx;
      const scale = targetW / vp1.width;
      const vp = page.getViewport({ scale });

      let canvas: HTMLCanvasElement;
      let ctx: CanvasRenderingContext2D;
      let toDataUrl: (q: number) => string;
      if (deps?.createCanvas) {
        const created = deps.createCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
        canvas = created.canvas as any;
        ctx = created.ctx;
        toDataUrl = created.toDataUrl;
      } else {
        canvas = document.createElement("canvas");
        canvas.width = Math.ceil(vp.width);
        canvas.height = Math.ceil(vp.height);
        const c = canvas.getContext("2d", { alpha: false } as any) as CanvasRenderingContext2D | null;
        if (!c) throw new Error("No 2D context");
        ctx = c;
        toDataUrl = (q: number) => canvas.toDataURL("image/jpeg", q);
      }

      // Asegura tamaño correcto si deps ya creó pero vp cambió
      canvas.width = Math.ceil(vp.width);
      canvas.height = Math.ceil(vp.height);

      (ctx as any).fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx as any, viewport: vp, canvas } as any).promise;
      try { (page as any).cleanup?.(); } catch {}

      if (opts.grayscale) {
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          toGrayscale(imgData as unknown as ImageData);
          ctx.putImageData(imgData as any, 0, 0);
        } catch {}
      }

      const dataUrl = toDataUrl(opts.quality);
      const b64 = dataUrl.split(",")[1];
      if (!b64) throw new Error("toDataURL falló");
      const jpgBytes = Uint8Array.from(atobPolyfill(b64), (c) => c.charCodeAt(0));
      const jpg = await dstDoc.embedJpg(jpgBytes);
      const pg = dstDoc.addPage([canvas.width, canvas.height]);
      pg.drawImage(jpg, { x: 0, y: 0, width: canvas.width, height: canvas.height });

      onProgress?.(idx + 1, total);
      // ceder event loop
      await new Promise((r) => setTimeout(r, 0));
    }
  } finally {
    try {
      if (deps?.destroyPdfjsDoc) await deps.destroyPdfjsDoc(pdfjsDoc);
      else await pdfjsDoc.destroy();
    } catch {}
  }

  return await dstDoc.save({ useObjectStreams: true, addDefaultPage: false });
}

function atobPolyfill(b64: string): string {
  if (typeof atob !== "undefined") return atob(b64);
  // Node
  return Buffer.from(b64, "base64").toString("binary");
}

async function getBrowserPdfjs(): Promise<any> {
  // import dinámico para no romper Node sin DOM
  const mod: any = await import("pdfjs-dist");
  const workerUrl: any = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
  if (!mod.GlobalWorkerOptions.workerSrc) mod.GlobalWorkerOptions.workerSrc = workerUrl;
  return mod;
}

export interface CompressResult {
  bytes: Uint8Array;
  stats: CompressStats;
}

/** API principal: elige ruta lossless vs raster según opciones */
export async function compressPdf(
  bytes: Uint8Array,
  options: CompressOptions = {},
  onProgress?: (done: number, total: number) => void,
  signal?: AbortSignal,
  deps?: RasterDeps,
): Promise<CompressResult> {
  if (!bytes || bytes.length < 5) throw new Error("PDF vacío o inválido");
  const head = new TextDecoder().decode(bytes.slice(0, 5));
  if (head !== "%PDF-") throw new Error("No es PDF válido");

  const resolved = resolveCompressOptions(options);

  let out: Uint8Array;
  if (!resolved.requiresRaster) {
    out = await compressLossless(bytes);
  } else {
    out = await compressWithRaster(bytes, resolved, onProgress, signal, deps);
  }

  // Si la compresión agrandó el archivo (raster en PDFs vectoriales pequeños), devuelve el menor
  // Excepto en extreme donde se fuerza ahorro a toda costa -> respeta resultado
  if (resolved.level !== "extreme" && out.length >= bytes.length && resolved.requiresRaster) {
    // intenta fallback lossless
    const lossless = await compressLossless(bytes);
    if (lossless.length < out.length) out = lossless;
  }

  const stats: CompressStats = {
    originalBytes: bytes.length,
    compressedBytes: out.length,
    ratio: out.length / bytes.length,
    savedPercent: Math.max(0, (1 - out.length / bytes.length) * 100),
    level: resolved.level,
  };
  return { bytes: out, stats };
}

export function formatSaved(stats: CompressStats): string {
  return `${stats.savedPercent.toFixed(1)}% ahorrado (${(stats.originalBytes / 1024).toFixed(1)} KB → ${(stats.compressedBytes / 1024).toFixed(1)} KB)`;
}
