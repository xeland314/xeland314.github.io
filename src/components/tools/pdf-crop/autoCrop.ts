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
      const isBrown = r > 90 && r > b + 30 && g < 120 && avg < 170;
      // generalizado: cualquier borde coloreado (no gris) para sidebars no-Moodle
      const maxC = Math.max(r,g,b), minC = Math.min(r,g,b);
      const isColored = (maxC - minC) > 32 && avg < 200 && maxC > 80;
      if (isBlue || isBrown || isColored) columnBlue[x]++;
    }
  }

  // 2a. Generalizado: detecta grilla lateral por color (no solo #002a51 exacto)
  // Moodle azul/borde, pero también cualquier sidebar no-blanco: generaliza a pixel coloreado
  // vs OCR: no hace falta, layout analysis basta
  const blueThr = Math.max(6, Math.round(height * 0.03)); // 3% altura, más permissivo para no-Moodle
  let sidebarLeftByBlue = -1;
  for (let x = width - 1; x >= 0; x--) {
    if (columnBlue[x] > blueThr) {
      let left = x;
      while (left > 0 && columnBlue[left] > 1) left--; // más permisivo para grillas tenues
      const gutterPx = Math.round(width * 0.015); // 1.5% ≈ 12px en 800px (compromiso 20px/5px en 180px)
      const cutX = Math.max(0, left - gutterPx);
      sidebarLeftByBlue = cutX;
      break;
    }
  }
  if (sidebarLeftByBlue !== -1) {
    const crop = sidebarLeftByBlue / width;
    // generalizado: acepta 0.50-0.94 para no-Moodle con barras más anchas/estrechas
    if (crop > 0.50 && crop < 0.94) return crop;
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
  // solo lateral — top/bottom deshabilitado para evitar cortar pregunta
  return { x: 0, y: 0, w: right, h: 1 };
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

function median(arr: number[]): number {
  if (arr.length===0) return 1.0;
  const s=[...arr].sort((a,b)=>a-b);
  const mid=Math.floor(s.length/2);
  return s.length%2===0 ? (s[mid-1]+s[mid])/2 : s[mid];
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
  const imageDatas: (ImageData|null)[] = [];
  try {
    // Pasada 1: estricta (como hasta ahora)
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
        imageDatas.push(imageData);
        const rect = calculateSmartCropRect(imageData);
        out.push(rect);
        onProgress?.(idx + 1, pageCount, rect);
      } else {
        imageDatas.push(null);
        out.push({x:0,y:0,w:1,h:1});
      }
      try { page.cleanup(); } catch {}
      await new Promise((r) => setTimeout(r, 0));
    }
  } finally {
    try { await doc.destroy(); } catch {}
  }
  // Estrategia 3 pasadas + consenso (sin IA)
  const successful = out.filter(r=> r.w < 0.97 && r.w > 0.50).map(r=>r.w);
  const medianCrop = median(successful);
  const hasConsensus = successful.length >= 5 && medianCrop < 1.0;
  for (let i=0; i<out.length; i++) {
    if (out[i].w >= 0.999) {
      // Pasada 2: desesperada — más agresiva solo en fallidas
      const im = imageDatas[i];
      let aggressiveW = 1.0;
      if (im) {
        // minGutter 8px + lum 210 + inkTol 3 para gutters estrechos sin azul
        aggressiveW = calculateSmartCropRight(im, 8, 210, 3);
        // derivada: pico de cambio brusco si gutter pegado (sin canal blanco)
        if (aggressiveW >= 0.999) {
          // derivada simple: busca salto >15% altura
          const { width, height, data } = im;
          const colInk = new Uint32Array(width);
          for (let y=0;y<height;y++) for(let x=0;x<width;x++) if ((data[(y*width+x)*4]+data[(y*width+x)*4+1]+data[(y*width+x)*4+2])/3 < 210) colInk[x]++;
          let bestX = -1, bestDeriv = 0;
          for (let x=width-2;x>=0;x--) {
            const d = Math.abs((colInk[x] as number) - (colInk[x+1] as number));
            if (d > height*0.15 && d > bestDeriv) { bestDeriv=d; bestX=x; }
          }
          if (bestX !== -1 && bestX/width >0.50 && bestX/width <0.94) aggressiveW = bestX/width;
        }
      }
      if (aggressiveW < 0.97 && aggressiveW > 0.50) {
        out[i] = { x:0, y:0, w: aggressiveW, h:1 };
      } else if (hasConsensus) {
        // Pasada 3: consenso del lote — hereda mediana
        out[i] = { x:0, y:0, w: medianCrop, h:1 };
        onProgress?.(i+1, pageCount, out[i]);
      }
    }
  }
  return out;
}
