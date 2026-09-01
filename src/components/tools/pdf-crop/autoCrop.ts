/**
 * Recorte inteligente barra lateral Moodle — Visión clásica sin IA
 * Espejo de pdfs_moodle/auto_crop_study.py (tunear ahí primero con uv run)
 * Corre 100% en navegador vía <canvas> ImageData
 */

export function calculateSmartCropRight(
  imageData: ImageData,
  minGutterWidthPixels = 25,
  luminanceThreshold = 240,
  inkPerColumnTol = 5,
): number {
  const { data, width, height } = imageData;
  const columnInk = new Uint32Array(width);

  // 1. perfil vertical
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const avg = (r + g + b) / 3;
      if (avg < luminanceThreshold) columnInk[x]++;
    }
  }

  // 2. escanear desde derecha buscando gutter blanco
  let seenSidebar = false;
  let gutter = 0;
  const minGutter = Math.max(12, minGutterWidthPixels);

  for (let x = width - 1; x >= 0; x--) {
    const hasInk = columnInk[x] > inkPerColumnTol;
    if (!seenSidebar) {
      if (hasInk) seenSidebar = true;
    } else {
      if (!hasInk) {
        gutter++;
        if (gutter >= minGutter) return x / width;
      } else {
        gutter = 0;
      }
    }
  }
  return 1.0;
}

// helper para renderizar una página a ancho ~800px y analizar
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export async function detectCropForPage(
  pdfBytes: Uint8Array,
  pageIdx: number, // 0-based
  opts?: { width?: number; signal?: AbortSignal },
): Promise<number> {
  const width = opts?.width ?? 800;
  const task = pdfjsLib.getDocument({ data: pdfBytes.slice(0) });
  const doc = await task.promise;
  try {
    if (opts?.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const page = await doc.getPage(pageIdx + 1);
    const vp1 = page.getViewport({ scale: 1 });
    const scale = width / vp1.width;
    const vp = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(vp.width);
    canvas.height = Math.ceil(vp.height);
    const ctx = canvas.getContext("2d", { willReadFrequently: true } as any);
    if (!ctx) return 1.0;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx as any, viewport: vp, canvas } as any).promise;
    try { page.cleanup(); } catch {}
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const minGutter = Math.max(12, Math.round(canvas.width * 0.02));
    return calculateSmartCropRight(imageData, minGutter, 240, 5);
  } finally {
    try { await doc.destroy(); } catch {}
  }
}

export async function detectCropBatch(
  pdfBytes: Uint8Array,
  pageCount: number,
  onProgress?: (done: number, total: number, crop: number) => void,
  signal?: AbortSignal,
): Promise<number[]> {
  // usa un solo doc para lote (más rápido)
  const task = pdfjsLib.getDocument({ data: pdfBytes.slice(0) });
  const doc = await task.promise;
  const out: number[] = [];
  try {
    for (let idx = 0; idx < pageCount; idx++) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      const page = await doc.getPage(idx + 1);
      const vp1 = page.getViewport({ scale: 1 });
      const scale = 800 / vp1.width;
      const vp = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(vp.width);
      canvas.height = Math.ceil(vp.height);
      const ctx = canvas.getContext("2d", { willReadFrequently: true } as any);
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx as any, viewport: vp, canvas } as any).promise;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const minGutter = Math.max(12, Math.round(canvas.width * 0.02));
        const crop = calculateSmartCropRight(imageData, minGutter, 240, 5);
        out.push(crop);
        onProgress?.(idx + 1, pageCount, crop);
      } else {
        out.push(1.0);
      }
      try { page.cleanup(); } catch {}
      await new Promise((r) => setTimeout(r, 0));
    }
  } finally {
    try { await doc.destroy(); } catch {}
  }
  return out;
}
