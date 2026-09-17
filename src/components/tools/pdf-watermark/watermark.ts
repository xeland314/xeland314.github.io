export type WatermarkPosition = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "tile";

export interface WatermarkOptions {
  opacity: number; // 0.05..0.9
  scale: number; // 0.1..0.6 (fracción ancho página)
  position: WatermarkPosition;
}

export function clampOpacity(v: number): number {
  if (isNaN(v)) return 0.18;
  return Math.max(0.05, Math.min(0.9, Math.round(v * 100) / 100));
}
export function clampScale(v: number): number {
  if (isNaN(v)) return 0.35;
  return Math.max(0.1, Math.min(0.6, Math.round(v * 20) / 20));
}

/** Genera canvas con marca procesada (blanco -> transparente) desde dataUrl. En Node requiere createCanvas dep. */
export async function processWatermarkImage(
  dataUrl: string,
  createCanvas?: (w: number, h: number) => { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D },
): Promise<{ canvas: HTMLCanvasElement; previewUrl: string; width: number; height: number }> {
  const img = await loadImage(dataUrl);
  const w = (img as any).naturalWidth || (img as any).width;
  const h = (img as any).naturalHeight || (img as any).height;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  if (createCanvas) {
    const c = createCanvas(w, h);
    canvas = c.canvas as any;
    ctx = c.ctx;
  } else {
    canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const cc = canvas.getContext("2d", { willReadFrequently: true } as any) as CanvasRenderingContext2D | null;
    if (!cc) throw new Error("No 2D context");
    ctx = cc;
  }
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img as any, 0, 0);
  try {
    const id = ctx.getImageData(0, 0, w, h);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      if (r > 240 && g > 240 && b > 240 && Math.max(r, g, b) - Math.min(r, g, b) < 15) d[i + 3] = 0;
      else if ((r + g + b) / 3 > 245) d[i + 3] = 0;
    }
    ctx.putImageData(id as any, 0, 0);
  } catch {}
  const previewUrl = (canvas as any).toDataURL ? (canvas as any).toDataURL("image/png") : dataUrl;
  return { canvas: canvas as any, previewUrl, width: w, height: h };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (typeof Image === "undefined") {
      // Node fallback: use canvas Image
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Image } = require("canvas");
        const img = new (Image as any)();
        img.onload = () => resolve(img as any);
        img.onerror = reject;
        img.src = src;
      } catch (e) { reject(e); }
      return;
    }
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function getWatermarkDrawRect(
  pageW: number,
  pageH: number,
  wmW: number,
  wmH: number,
  scale: number,
  position: WatermarkPosition,
): { x: number; y: number; w: number; h: number } {
  const w = pageW * scale;
  const h = (wmH / wmW) * w;
  switch (position) {
    case "center": return { x: (pageW - w) / 2, y: (pageH - h) / 2, w, h };
    case "top-left": return { x: 20, y: 20, w, h };
    case "top-right": return { x: pageW - w - 20, y: 20, w, h };
    case "bottom-left": return { x: 20, y: pageH - h - 20, w, h };
    case "bottom-right": return { x: pageW - w - 20, y: pageH - h - 20, w, h };
    case "tile": return { x: 0, y: 0, w, h }; // tile usa loop
    default: return { x: (pageW - w) / 2, y: (pageH - h) / 2, w, h };
  }
}

/** Aplica marca a canvas destino (ya con página renderizada). */
export function applyWatermarkToCanvas(
  dstCanvas: HTMLCanvasElement,
  watermarkCanvas: HTMLCanvasElement,
  opts: WatermarkOptions,
): void {
  const ctx = dstCanvas.getContext("2d")!;
  const wmW = watermarkCanvas.width;
  const wmH = watermarkCanvas.height;
  const scaleW = dstCanvas.width * opts.scale;
  const scaleH = (wmH / wmW) * scaleW;
  ctx.globalAlpha = opts.opacity;
  if (opts.position === "tile") {
    for (let y = 0; y < dstCanvas.height; y += scaleH + 40) {
      for (let x = 0; x < dstCanvas.width; x += scaleW + 40) ctx.drawImage(watermarkCanvas, x, y, scaleW, scaleH);
    }
  } else {
    const r = getWatermarkDrawRect(dstCanvas.width, dstCanvas.height, wmW, wmH, opts.scale, opts.position);
    ctx.drawImage(watermarkCanvas, r.x, r.y, r.w, r.h);
  }
  ctx.globalAlpha = 1;
}
