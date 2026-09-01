export type Point = { x: number; y: number };
export type Quad = [Point, Point, Point, Point]; // TL, TR, BR, BL en normalizado 0-1 o píxeles

function solveLinear(A: number[][], b: number[]): number[] {
  const n = A.length;
  // augment
  for (let i = 0; i < n; i++) A[i].push(b[i]);
  // forward
  for (let i = 0; i < n; i++) {
    // pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
    [A[i], A[maxRow]] = [A[maxRow], A[i]];
    const piv = A[i][i];
    if (Math.abs(piv) < 1e-12) continue;
    for (let k = i + 1; k < n; k++) {
      const factor = A[k][i] / piv;
      for (let j = i; j <= n; j++) A[k][j] -= factor * A[i][j];
    }
  }
  // back
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = A[i][n];
    for (let j = i + 1; j < n; j++) sum -= A[i][j] * x[j];
    x[i] = sum / A[i][i];
  }
  return x;
}

// H src->dst, 3x3 con h33=1
export function getPerspectiveTransform(src: Quad, dst: Quad): number[][] {
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i];
    const { x: u, y: v } = dst[i];
    A.push([x, y, 1, 0, 0, 0, -x * u, -y * u]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -x * v, -y * v]);
    b.push(v);
  }
  const h = solveLinear(A, b); // 8 valores
  return [
    [h[0], h[1], h[2]],
    [h[3], h[4], h[5]],
    [h[6], h[7], 1],
  ];
}

function invert3x3(m: number[][]): number[][] {
  const a = m[0][0], b = m[0][1], c = m[0][2];
  const d = m[1][0], e = m[1][1], f = m[1][2];
  const g = m[2][0], h = m[2][1], i = m[2][2];
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  if (Math.abs(det) < 1e-12) return m;
  const invDet = 1 / det;
  return [
    [(e * i - f * h) * invDet, (c * h - b * i) * invDet, (b * f - c * e) * invDet],
    [(f * g - d * i) * invDet, (a * i - c * g) * invDet, (c * d - a * f) * invDet],
    [(d * h - e * g) * invDet, (b * g - a * h) * invDet, (a * e - b * d) * invDet],
  ];
}

// warp src ImageData via quad (src en píxeles) a rect W×H
export function warpImageData(src: ImageData, srcQuad: Quad, dstW: number, dstH: number): ImageData {
  const dst: ImageData = new ImageData(dstW, dstH);
  const dstQuad: Quad = [
    { x: 0, y: 0 },
    { x: dstW, y: 0 },
    { x: dstW, y: dstH },
    { x: 0, y: dstH },
  ];
  const H = getPerspectiveTransform(srcQuad, dstQuad);
  const Hinv = invert3x3(H);
  const sData = src.data;
  const sW = src.width, sH = src.height;
  const dData = dst.data;

  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const denom = Hinv[2][0] * x + Hinv[2][1] * y + Hinv[2][2];
      const sx = (Hinv[0][0] * x + Hinv[0][1] * y + Hinv[0][2]) / denom;
      const sy = (Hinv[1][0] * x + Hinv[1][1] * y + Hinv[1][2]) / denom;
      const dx = x, dy = y;
      const dIdx = (dy * dstW + dx) * 4;
      // fuera del src -> blanco
      if (sx < 0 || sx >= sW - 1 || sy < 0 || sy >= sH - 1) {
        dData[dIdx] = 255; dData[dIdx + 1] = 255; dData[dIdx + 2] = 255; dData[dIdx + 3] = 255;
        continue;
      }
      // bilinear
      const x0 = Math.floor(sx), y0 = Math.floor(sy);
      const x1 = Math.min(x0 + 1, sW - 1), y1 = Math.min(y0 + 1, sH - 1);
      const fx = sx - x0, fy = sy - y0;
      const i00 = (y0 * sW + x0) * 4, i10 = (y0 * sW + x1) * 4, i01 = (y1 * sW + x0) * 4, i11 = (y1 * sW + x1) * 4;
      for (let c = 0; c < 3; c++) {
        const v00 = sData[i00 + c], v10 = sData[i10 + c], v01 = sData[i01 + c], v11 = sData[i11 + c];
        const v0 = v00 * (1 - fx) + v10 * fx;
        const v1 = v01 * (1 - fx) + v11 * fx;
        dData[dIdx + c] = Math.round(v0 * (1 - fy) + v1 * fy);
      }
      dData[dIdx + 3] = 255;
    }
  }
  return dst;
}
