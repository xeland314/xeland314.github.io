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
      const isBlue = b > 70 && b > r + 18 && b > g + 6 && avg < 190;
      const isBrown = r > 90 && r > b + 30 && g < 120 && avg < 170;
      const maxC = Math.max(r,g,b), minC = Math.min(r,g,b);
      const isColored = (maxC - minC) > 32 && avg < 200 && maxC > 80;
      if (isBlue || isBrown || isColored) columnBlue[x]++;
    }
  }
  // 1b. Suavizado 1D (media móvil 3px) para ruido JPEG — barato y evita gutter roto
  const smooth = (arr: Uint32Array, k=1): Uint32Array => {
    const out = new Uint32Array(arr.length);
    for (let x=0;x<arr.length;x++) {
      let s=0,c=0;
      for (let d=-k; d<=k; d++) { const j=x+d; if (j>=0 && j<arr.length) { s+=arr[j]; c++; } }
      out[x]=Math.round(s/c);
    }
    return out;
  };
  const columnInkS = smooth(columnInk, 1); // ventana 3
  const columnBlueS = smooth(columnBlue, 1);

  // 2a. Generalizado por color con perfil suavizado
  const blueThr = Math.max(6, Math.round(height * 0.03));
  let sidebarLeftByBlue = -1;
  for (let x = width - 1; x >= 0; x--) {
    if (columnBlueS[x] > blueThr) {
      let left = x;
      while (left > 0 && columnBlueS[left] > 1) left--;
      const gutterPx = Math.round(width * 0.015);
      const cutX = Math.max(0, left - gutterPx);
      sidebarLeftByBlue = cutX;
      break;
    }
  }
  if (sidebarLeftByBlue !== -1) {
    const crop = sidebarLeftByBlue / width;
    if (crop > 0.50 && crop < 0.94) return crop;
  }

  // 2a-bis. Gradiente horizontal (robusto a hex no exacto) — salto sostenido
  let bestGradX = -1, bestGrad = 0;
  for (let x = width - 2; x >= 0; x--) {
    const grad = Math.abs((columnInkS[x] as number) - (columnInkS[x+1] as number));
    const gradBlue = Math.abs((columnBlueS[x] as number) - (columnBlueS[x+1] as number));
    const g = grad + gradBlue * 2; // pondera color
    if (g > height * 0.12 && g > bestGrad) { bestGrad = g; bestGradX = x; }
  }
  if (bestGradX !== -1 && bestGrad > height * 0.12) {
    const crop = bestGradX / width;
    if (crop > 0.50 && crop < 0.94) return crop;
  }

  // 2b. Fallback gutter blanco con perfil suavizado
  let seenSidebar = false;
  let gutter = 0;
  const minGutter = Math.max(10, minGutterWidthPixels);
  for (let x = width - 1; x >= 0; x--) {
    const hasInk = columnInkS[x] > inkPerColumnTol;
    if (!seenSidebar) {
      if (hasInk) seenSidebar = true;
    } else {
      if (!hasInk) {
        gutter++;
        if (gutter >= minGutter) return x / width;
      } else {
        if (columnInkS[x] < height * 0.12 && columnBlueS[x] < blueThr) gutter++;
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
import { detectTrapezoidQuad } from "./detectQuad";
import type { Quad } from "./storage";

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

function boundingBoxCrop(imageData: ImageData, marginRatio=0.02): number {
  const { data, width, height } = imageData;
  const lumThr = 240, tol = 5;
  const colInk = new Uint32Array(width);
  for (let y=0;y<height;y++) for(let x=0;x<width;x++) {
    const i=(y*width+x)*4;
    if ((data[i]+data[i+1]+data[i+2])/3 < lumThr) colInk[x]++;
  }
  let minX = width, maxX = -1;
  for (let x=0;x<width;x++) if (colInk[x] > tol) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
  if (maxX === -1) return 1.0;
  const margin = Math.round(width * marginRatio);
  minX = Math.max(0, minX - margin);
  maxX = Math.min(width-1, maxX + margin);
  const w = (maxX - minX + 1) / width;
  // solo si recorta algo significativo pero no demasiado (evita página casi vacía)
  if (w < 0.98 && w > 0.50) return (minX + (maxX-minX+1)) / width; // = maxX+1 /width con margen
  // fallback: w = maxX/width
  return (maxX + 1) / width;
}

function windowMedian(out: {w:number}[], idx: number, k=7): number | null {
  const vals:number[]=[];
  for (let d=-k; d<=k; d++) {
    const j= idx+d;
    if (j<0 || j>=out.length || j===idx) continue;
    const w= out[j].w;
    if (w < 0.97 && w > 0.50) vals.push(w);
  }
  if (vals.length >= 3) return median(vals);
  return null;
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
  // Estrategia: 3 pasadas + consenso ventana + fallback bounding box (sin IA)
  const successful = out.filter(r=> r.w < 0.97 && r.w > 0.50).map(r=>r.w);
  const medianCrop = median(successful);
  const hasConsensus = successful.length >= 5 && medianCrop < 1.0;
  for (let i=0; i<out.length; i++) {
    if (out[i].w >= 0.999) {
      const im = imageDatas[i];
      let aggressiveW = 1.0;
      if (im) {
        aggressiveW = calculateSmartCropRight(im, 8, 210, 3);
        if (aggressiveW >= 0.999) {
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
      } else {
        // Fallback 1: bounding box de contenido (para págs sin grilla/gutter)
        let bboxW = 1.0;
        if (im) bboxW = boundingBoxCrop(im, 0.02);
        if (bboxW < 0.97 && bboxW > 0.50) {
          out[i] = { x:0, y:0, w: bboxW, h:1 };
        } else if (hasConsensus) {
          // Fallback 2: consenso ventana deslizante (k=7) > global
          const winMed = windowMedian(out, i, 7);
          const useCrop = winMed ?? medianCrop;
          out[i] = { x:0, y:0, w: useCrop, h:1 };
          onProgress?.(i+1, pageCount, out[i]);
        }
      }
    }
  }
  return out;
}

// Pipeline 2 pasos: rect vectorial primero, quad trapezoidal solo si rect==1.0 (cascada)
export async function detectSmartBatchWithQuads(
  pdfBytes: Uint8Array,
  pageCount: number,
  onProgress?: (done: number, total: number, rect: {x:number,y:number,w:number,h:number}, quad?: Quad | null) => void,
  signal?: AbortSignal,
): Promise<{ rects: {x:number,y:number,w:number,h:number}[]; quads: Map<number, Quad> }> {
  const rects = await detectCropBatchRects(pdfBytes, pageCount, onProgress as any, signal);
  const quads = new Map<number, Quad>();
  // re-render solo fallidas para quad (usa mismo 800px pero con detector de bordes)
  // Para no re-render, reutiliza lógica: si rect==1.0 intenta quad sobre copia 200px (más rápido y robusto a perspectiva)
  // Hacemos render extra solo para fallidas
  const task = pdfjsLib.getDocument({ data: pdfBytes.slice(0) });
  const doc = await task.promise;
  try {
    for (let i=0;i<pageCount;i++) {
      if (rects[i].w < 0.999) continue;
      if (signal?.aborted) throw new DOMException("Aborted","AbortError");
      const page = await doc.getPage(i+1);
      const vp1 = page.getViewport({ scale: 1 });
      const scale = 800 / vp1.width;
      const vp = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(vp.width);
      canvas.height = Math.ceil(vp.height);
      const ctx = canvas.getContext("2d", { willReadFrequently: true } as any);
      if (!ctx) { try{ page.cleanup(); }catch{}; continue; }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0,0,canvas.width,canvas.height);
      await page.render({ canvasContext: ctx as any, viewport: vp, canvas } as any).promise;
      try{ page.cleanup(); }catch{}
      const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
      const quad = detectTrapezoidQuad(imageData);
      if (quad) {
        quads.set(i, quad);
        onProgress?.(i+1, pageCount, rects[i], quad);
      }
      await new Promise(r=>setTimeout(r,0));
    }
  } finally { try{ await doc.destroy(); }catch{} }
  return { rects, quads };
}
