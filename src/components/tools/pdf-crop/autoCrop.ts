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
  const columnBlue = new Uint32Array(width); // para grid azul #002a51 y bordes

  // 1. perfil vertical + perfil azul (no solo fondo blanco)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const avg = (r + g + b) / 3;
      if (avg < luminanceThreshold) columnInk[x]++;
      // azul Moodle: #002a51 (0,42,81) y bordes grilla azulados
      // b dominante y relativamente oscuro = borde/celda
      const isBlue = b > 70 && b > r + 18 && b > g + 6 && avg < 190;
      // marrón dorado botón ocultar #704a06 (112,74,6) también marca sidebar
      const isBrown = r > 90 && r > b + 30 && g < 120 && avg < 170;
      if (isBlue || isBrown) columnBlue[x]++;
    }
  }

  // 2a. Intento por color: borde izquierdo de la grilla azul (más robusto que gutter blanco)
  // Colores no exactos → tolerancia amplia ya aplicada en isBlue/isBrown
  const blueThr = Math.max(8, Math.round(height * 0.04)); // 4% altura = ~30px en 800px
  let sidebarLeftByBlue = -1;
  for (let x = width - 1; x >= 0; x--) {
    if (columnBlue[x] > blueThr) {
      let left = x;
      while (left > 0 && columnBlue[left] > 2) left--;
      // margen de seguridad: 20px en miniatura 180px ≈ 88px en 800px es mucho,
      // para no comerse botón azul usamos 14px en 800px (~3px en 180px) y para
      // las que falta morder 5-10px en 180px ≈ 22-44px en 800px → compromiso 12-14
      // Ajuste fino: 14px a 800px ≈ 3.1px a 180px, evita comer botón sin dejar grid
      const gutterPx = Math.round(width * 0.018); // 1.8% ≈ 14px en 800px
      const cutX = Math.max(0, left - gutterPx);
      sidebarLeftByBlue = cutX;
      break;
    }
  }
  if (sidebarLeftByBlue !== -1) {
    const crop = sidebarLeftByBlue / width;
    if (crop > 0.55 && crop < 0.92) return crop;
  }

  // 2b. Fallback gutter blanco clásico (para PDFs sin grilla o sin azul)
  let seenSidebar = false;
  let gutter = 0;
  const minGutter = Math.max(10, minGutterWidthPixels); // 10-16px (antes 12-25) para gutters estrechos

  for (let x = width - 1; x >= 0; x--) {
    const hasInk = columnInk[x] > inkPerColumnTol;
    if (!seenSidebar) {
      if (hasInk) seenSidebar = true;
    } else {
      if (!hasInk) {
        gutter++;
        if (gutter >= minGutter) return x / width;
      } else {
        // si es una línea vertical fina (1px azul), no reiniciar del todo
        if (columnInk[x] < height * 0.12 && columnBlue[x] < blueThr) gutter++;
        else gutter = 0;
      }
    }
  }
  return 1.0;
}

export function calculateSmartCropRect(
  imageData: ImageData,
  opts?: { minGutterPx?: number; lumThr?: number },
): { x: number; y: number; w: number; h: number } {
  const right = calculateSmartCropRight(imageData, opts?.minGutterPx ?? 25, opts?.lumThr ?? 240, 5);
  // top/bottom solo fondo blanco (sin azul) — usa fila
  const { data, width, height } = imageData;
  const lumThr = opts?.lumThr ?? 240;
  const rowInk = new Uint32Array(height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const avg = (data[i] + data[i+1] + data[i+2]) / 3;
      if (avg < lumThr) rowInk[y]++;
    }
  }
  const tol = 5;
  const minGutterY = Math.max(8, Math.round(height * 0.015)); // 1.5% alto
  let top = 0, bottom = height;
  // top: busca primer gutter blanco después de margen superior
  let seenTop = false, gutter = 0;
  for (let y = 0; y < height; y++) {
    const hasInk = rowInk[y] > tol;
    if (!seenTop) { if (hasInk) seenTop = true; }
    else if (!hasInk) { gutter++; if (gutter >= minGutterY) { top = y - gutter; break; } } else gutter = 0;
  }
  // bottom
  let seenBottom = false; gutter = 0;
  for (let y = height - 1; y >= 0; y--) {
    const hasInk = rowInk[y] > tol;
    if (!seenBottom) { if (hasInk) seenBottom = true; }
    else if (!hasInk) { gutter++; if (gutter >= minGutterY) { bottom = y + gutter; break; } } else gutter = 0;
  }
  const yN = Math.max(0, top / height - 0.005); // pequeño margen 0.5% para no cortar texto
  const hN = Math.min(1 - yN, (bottom - top) / height + 0.01);
  // si no hay recorte vertical significativo (<2%), deja 0,1
  const finalY = hN > 0.96 && yN < 0.02 ? 0 : yN;
  const finalH = hN > 0.96 ? 1 : hN;
  return { x: 0, y: finalY, w: right, h: finalH };
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
  const rects = await detectCropBatchRects(pdfBytes, pageCount, (d,t,r)=> onProgress?.(d,t,r.w), signal);
  return rects.map(r=>r.w);
}

export async function detectCropBatchRects(
  pdfBytes: Uint8Array,
  pageCount: number,
  onProgress?: (done: number, total: number, rect: {x:number,y:number,w:number,h:number}) => void,
  signal?: AbortSignal,
): Promise<{x:number,y:number,w:number,h:number}[]> {
  const task = pdfjsLib.getDocument({ data: pdfBytes.slice(0) });
  const doc = await task.promise;
  const out: {x:number,y:number,w:number,h:number}[] = [];
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
        const rect = calculateSmartCropRect(imageData);
        out.push(rect);
        onProgress?.(idx + 1, pageCount, rect);
      } else {
        out.push({x:0,y:0,w:1,h:1});
      }
      try { page.cleanup(); } catch {}
      await new Promise((r) => setTimeout(r, 0));
    }
  } finally {
    try { await doc.destroy(); } catch {}
  }
  return out;
}
