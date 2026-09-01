import type { Quad, QuadPoint } from "./storage";

function linearFitYX(points: { y: number; x: number }[]): { a: number; b: number } | null {
  if (points.length < 10) return null;
  let sumY = 0, sumX = 0, sumYY = 0, sumYX = 0;
  for (const p of points) { sumY += p.y; sumX += p.x; sumYY += p.y * p.y; sumYX += p.y * p.x; }
  const n = points.length;
  const denom = n * sumYY - sumY * sumY;
  if (Math.abs(denom) < 1e-9) return null;
  const a = (n * sumYX - sumY * sumX) / denom; // x = a*y + b
  const b = (sumX - a * sumY) / n;
  return { a, b };
}
function linearFitXY(points: { x: number; y: number }[]): { a: number; b: number } | null {
  if (points.length < 10) return null;
  let sumX = 0, sumY = 0, sumXX = 0, sumXY = 0;
  for (const p of points) { sumX += p.x; sumY += p.y; sumXX += p.x * p.x; sumXY += p.x * p.y; }
  const n = points.length;
  const denom = n * sumXX - sumX * sumX;
  if (Math.abs(denom) < 1e-9) return null;
  const a = (n * sumXY - sumX * sumY) / denom; // y = a*x + b
  const b = (sumY - a * sumX) / n;
  return { a, b };
}

// detecta trapecio por bordes de papel sobre fondo (foto celular)
// retorna Quad normalizado 0-1 o null si no hay trapecio / es rectángulo
export function detectTrapezoidQuad(imageData: ImageData, opts?: { paperThr?: number }): Quad | null {
  const { data, width: W, height: H } = imageData;
  const thr = opts?.paperThr ?? 200; // papel brillante vs fondo
  const leftPts: { y: number; x: number }[] = [];
  const rightPts: { y: number; x: number }[] = [];
  const topPts: { x: number; y: number }[] = [];
  const bottomPts: { x: number; y: number }[] = [];

  // bordes horizontales por fila
  for (let y = 0; y < H; y++) {
    let leftX = -1, rightX = -1;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (lum > thr) { leftX = x; break; }
    }
    for (let x = W - 1; x >= 0; x--) {
      const i = (y * W + x) * 4;
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (lum > thr) { rightX = x; break; }
    }
    if (leftX !== -1 && rightX !== -1 && rightX - leftX > W * 0.4) {
      // ignora filas con poco papel (ruido)
      leftPts.push({ y, x: leftX });
      rightPts.push({ y, x: rightX });
    }
  }
  // bordes verticales por columna
  for (let x = 0; x < W; x++) {
    let topY = -1, bottomY = -1;
    for (let y = 0; y < H; y++) {
      const i = (y * W + x) * 4;
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (lum > thr) { topY = y; break; }
    }
    for (let y = H - 1; y >= 0; y--) {
      const i = (y * W + x) * 4;
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (lum > thr) { bottomY = y; break; }
    }
    if (topY !== -1 && bottomY !== -1 && bottomY - topY > H * 0.4) {
      topPts.push({ x, y: topY });
      bottomPts.push({ x, y: bottomY });
    }
  }

  const left = linearFitYX(leftPts);
  const right = linearFitYX(rightPts);
  const top = linearFitXY(topPts);
  const bottom = linearFitXY(bottomPts);
  if (!left || !right || !top || !bottom) return null;

  // pendiente suave = papel casi recto; pendiente fuerte = perspectiva
  const isNearRect = Math.abs(left.a) < 0.08 && Math.abs(right.a) < 0.08 && Math.abs(top.a) < 0.08 && Math.abs(bottom.a) < 0.08;
  // si es casi rectángulo, no vale warp (usa CropBox)
  // pero si detectamos y es casi rectángulo, retornamos null para que no rasterice innecesariamente

  const intersect = (lr: { a: number; b: number }, tb: { a: number; b: number }, isLeft: boolean) => {
    // lr: x = a*y + b, tb: y = a*x + b
    // resuelve x = a_lr*(a_tb*x + b_tb) + b_lr => x = (a_lr*b_tb + b_lr)/(1 - a_lr*a_tb)
    const denom = 1 - lr.a * tb.a;
    if (Math.abs(denom) < 1e-9) return null;
    const x = (lr.a * tb.b + lr.b) / denom;
    const y = tb.a * x + tb.b;
    return { x, y };
  };

  const tl = intersect(left, top, true);
  const tr = intersect(right, top, false);
  const br = intersect(right, bottom, false);
  const bl = intersect(left, bottom, true);
  if (!tl || !tr || !br || !bl) return null;

  const quadPx: Quad = [
    { x: tl.x / W, y: tl.y / H },
    { x: tr.x / W, y: tr.y / H },
    { x: br.x / W, y: br.y / H },
    { x: bl.x / W, y: bl.y / H },
  ];
  // valida dentro 0-1 con pequeño margen y área >40%
  for (const p of quadPx) if (p.x < -0.05 || p.x > 1.05 || p.y < -0.05 || p.y > 1.05) return null;
  const area = Math.abs((quadPx[1].x - quadPx[0].x) * (quadPx[3].y - quadPx[0].y) - (quadPx[3].x - quadPx[0].x) * (quadPx[1].y - quadPx[0].y) + (quadPx[2].x - quadPx[1].x) * (quadPx[2].y - quadPx[1].y));
  // aproximado área normalizada 0-1, si <0.35 es ruido
  if (area < 0.35) return null;
  // si casi rectángulo y sin perspectiva, no vale la pena warp
  if (isNearRect) {
    // calcula desviación max respecto a rect [0,0,1,0,1,1,0,1]
    const ideal: Quad = [{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}];
    let maxDev = 0;
    for (let i=0;i<4;i++) maxDev = Math.max(maxDev, Math.hypot(quadPx[i].x - ideal[i].x, quadPx[i].y - ideal[i].y));
    if (maxDev < 0.03) return null; // <3% es rectángulo, usa CropBox
  }
  // clamp 0-1
  for (const p of quadPx) { p.x = Math.max(0, Math.min(1, p.x)); p.y = Math.max(0, Math.min(1, p.y)); }
  return quadPx;
}
