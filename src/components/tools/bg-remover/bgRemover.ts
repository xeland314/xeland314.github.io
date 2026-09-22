export type BgMode = "white" | "checker" | "custom";
export type BgMethod = "global" | "flood";

export interface BgRemoveOptions {
  mode: BgMode;
  tolerance: number; // 0..60
  customColor?: { r: number; g: number; b: number };
  method: BgMethod;
  feather?: number; // 0..3 px feather (alpha ramp)
  trim?: boolean;
}

export function clampTolerance(v: number): number {
  if (isNaN(v)) return 15;
  return Math.max(0, Math.min(60, Math.round(v)));
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    if ([r, g, b].some(isNaN)) return null;
    return { r, g, b };
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if ([r, g, b].some(isNaN)) return null;
    return { r, g, b };
  }
  return null;
}

function colorDist(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/** Umbral derivado de tolerancia: 0->12, 15->~42, 30->~90, 60->~150 */
export function toleranceToThreshold(tol: number): number {
  const t = clampTolerance(tol);
  return 12 + t * 2.35; // 0->12, 60->153
}

function isNearWhite(r: number, g: number, b: number, threshold: number, custom?: { r: number; g: number; b: number }, mode: BgMode = "white"): boolean {
  if (mode === "custom" && custom) {
    return colorDist(r, g, b, custom.r, custom.g, custom.b) < threshold;
  }
  const dWhite = colorDist(r, g, b, 255, 255, 255);
  if (dWhite < threshold) return true;
  if (mode === "checker") {
    // cuadricula: blanco + gris claro ~204 y ~221 (checker típico)
    const dGray1 = colorDist(r, g, b, 204, 204, 204);
    const dGray2 = colorDist(r, g, b, 221, 221, 221);
    const dGray3 = colorDist(r, g, b, 192, 192, 192);
    if (Math.min(dGray1, dGray2, dGray3) < threshold) return true;
    // también líneas tenues de cuadrícula (gris ~230 con baja saturación)
    const avg = (r + g + b) / 3;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    if (avg > 190 && avg < 253 && sat < 18 && dWhite < threshold + 18) return true;
  }
  // anti-alias atenuado: si es muy claro y poco saturado, también cuenta con umbral ampliado
  if (mode === "white") {
    const avg = (r + g + b) / 3;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    if (avg > 200 && sat < 22 && dWhite < threshold + 12) return true;
  }
  return false;
}

/** Elimina global: todo pixel cercano al fondo -> transparencia (o feather) */
export function removeBackgroundGlobal(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  opts: BgRemoveOptions,
): void {
  const thr = toleranceToThreshold(opts.tolerance);
  const feather = Math.max(0, Math.min(4, opts.feather ?? 0));
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const a = data[i + 3];
    if (a === 0) continue;
    // distancia a color objetivo
    let dist: number;
    if (opts.mode === "custom" && opts.customColor) dist = colorDist(r, g, b, opts.customColor.r, opts.customColor.g, opts.customColor.b);
    else if (opts.mode === "checker") dist = Math.min(colorDist(r, g, b, 255, 255, 255), colorDist(r, g, b, 204, 204, 204), colorDist(r, g, b, 221, 221, 221));
    else dist = colorDist(r, g, b, 255, 255, 255);
    if (dist < thr) {
      if (feather === 0) data[i + 3] = 0;
      else {
        // rampa: totalmente transparente si muy cerca, semi si cerca del borde
        const t = dist / thr; // 0..1
        const alpha = Math.round(t * 255 * (feather / 4) + t * 0); // feather atenúa: we lerp
        // más simple: alpha proporcional a distancia
        const newA = Math.round((dist / thr) * 255);
        data[i + 3] = Math.min(a, newA > 250 ? 0 : newA);
        if (dist < thr * 0.45) data[i + 3] = 0;
      }
    } else if (feather > 0 && dist < thr + 18) {
      // anti-alias pluma: reduce alpha gradualmente
      const t = (dist - thr) / 18;
      data[i + 3] = Math.min(a, Math.round( (0.2 + 0.8 * t) * a));
    }
  }
}

/** Flood desde bordes: solo pixeles conectados al borde que sean fondo */
export function removeBackgroundFlood(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  opts: BgRemoveOptions,
): void {
  const thr = toleranceToThreshold(opts.tolerance);
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];
  const idx = (x: number, y: number) => y * width + x;

  function shouldRemove(r: number, g: number, b: number): boolean {
    return isNearWhite(r, g, b, thr, opts.customColor, opts.mode);
  }

  // semillas: todo el perímetro
  for (let x = 0; x < width; x++) {
    for (const y of [0, height - 1]) {
      const i = idx(x, y);
      if (visited[i]) continue;
      visited[i] = 1;
      const p = i * 4;
      if (data[p + 3] === 0) continue;
      if (shouldRemove(data[p], data[p + 1], data[p + 2])) queue.push(i);
    }
  }
  for (let y = 1; y < height - 1; y++) {
    for (const x of [0, width - 1]) {
      const i = idx(x, y);
      if (visited[i]) continue;
      visited[i] = 1;
      const p = i * 4;
      if (data[p + 3] === 0) continue;
      if (shouldRemove(data[p], data[p + 1], data[p + 2])) queue.push(i);
    }
  }
  // si bordes no son fondo (imagen sin marco), intenta semillas en esquinas con flood más permisivo?
  // si queue vacía, no hay fondo conectado -> no hace nada (preserva)
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]] as const;
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    const cx = cur % width;
    const cy = Math.floor(cur / width);
    const p = cur * 4;
    // marca transparente
    data[p + 3] = 0;
    for (const [dx, dy] of dirs) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      const ni = idx(nx, ny);
      if (visited[ni]) continue;
      visited[ni] = 1;
      const np = ni * 4;
      if (data[np + 3] === 0) continue;
      if (shouldRemove(data[np], data[np + 1], data[np + 2])) queue.push(ni);
    }
  }
}

/** Aplica según método, muta data in-place */
export function applyBackgroundRemoval(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  opts: BgRemoveOptions,
): void {
  if (opts.method === "flood") removeBackgroundFlood(data, width, height, opts);
  else removeBackgroundGlobal(data, width, height, opts);
}

/** Calcula bounds del contenido no transparente */
export function getTrimBounds(data: Uint8ClampedArray, width: number, height: number): { x: number; y: number; w: number; h: number } | null {
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 8) { // casi transparente no cuenta
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX === -1) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/** Procesa canvas en su resolución nativa (sin pérdida) y opcionalmente hace trim */
export function processCanvas(
  srcCanvas: HTMLCanvasElement,
  opts: BgRemoveOptions,
  targetCanvas?: HTMLCanvasElement,
): HTMLCanvasElement {
  const w = srcCanvas.width, h = srcCanvas.height;
  const dst = targetCanvas ?? document.createElement("canvas");
  const ctx = dst.getContext("2d", { willReadFrequently: true } as any) as CanvasRenderingContext2D;
  if (!ctx) throw new Error("No 2D context");
  // si trim, procesamos primero en canvas temporal del mismo tamaño
  const tmp = document.createElement("canvas");
  tmp.width = w; tmp.height = h;
  const tctx = tmp.getContext("2d", { willReadFrequently: true } as any) as CanvasRenderingContext2D;
  tctx.drawImage(srcCanvas, 0, 0);
  const img = tctx.getImageData(0, 0, w, h);
  applyBackgroundRemoval(img.data, w, h, opts);
  tctx.putImageData(img, 0, 0);
  if (opts.trim) {
    const b = getTrimBounds(img.data, w, h);
    if (b) {
      // padding 1px para no cortar anti-alias
      const pad = 1;
      const x = Math.max(0, b.x - pad), y = Math.max(0, b.y - pad);
      const ww = Math.min(w - x, b.w + pad * 2), hh = Math.min(h - y, b.h + pad * 2);
      dst.width = ww; dst.height = hh;
      const dctx = dst.getContext("2d")!;
      dctx.clearRect(0, 0, ww, hh);
      dctx.drawImage(tmp, x, y, ww, hh, 0, 0, ww, hh);
      return dst;
    }
  }
  dst.width = w; dst.height = h;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(tmp, 0, 0);
  return dst;
}
