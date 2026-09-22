import { describe, it, expect } from "vitest";
import { clampTolerance, toleranceToThreshold, getTrimBounds, applyBackgroundRemoval, hexToRgb } from "./bgRemover";
import type { BgRemoveOptions } from "./bgRemover";

function makeData(w: number, h: number, filler: (x: number, y: number) => [number, number, number, number]): Uint8ClampedArray {
  const d = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const [r, g, b, a] = filler(x, y);
    const i = (y * w + x) * 4;
    d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a;
  }
  return d;
}

describe("bgRemover helpers", () => {
  it("clampTolerance", () => {
    expect(clampTolerance(100)).toBe(60);
    expect(clampTolerance(-5)).toBe(0);
    expect(clampTolerance(15.6)).toBe(16);
  });
  it("toleranceToThreshold monotonic", () => {
    expect(toleranceToThreshold(0)).toBeLessThan(toleranceToThreshold(30));
    expect(toleranceToThreshold(60)).toBeGreaterThan(100);
  });
  it("hexToRgb", () => {
    expect(hexToRgb("#ff00ff")).toEqual({ r: 255, g: 0, b: 255 });
    expect(hexToRgb("#fff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb("zzzz")).toBeNull();
  });
  it("global white removal sin perder resolucion", () => {
    // 4x4: borde blanco, centro rojo 2x2
    const w = 4, h = 4;
    const data = makeData(w, h, (x, y) => (x >= 1 && x <= 2 && y >= 1 && y <= 2 ? [200, 30, 30, 255] : [255, 255, 255, 255]));
    const opts: BgRemoveOptions = { mode: "white", tolerance: 15, method: "global" };
    applyBackgroundRemoval(data, w, h, opts);
    // esquinas deben ser transparentes
    expect(data[3]).toBe(0); // 0,0 alpha
    expect(data[(3 * 4 + 3) * 4 + 3]).toBe(0);
    // centro rojo preservado
    const centerIdx = (1 * w + 1) * 4;
    expect(data[centerIdx + 3]).toBe(255);
    expect(data[centerIdx]).toBe(200);
  });
  it("checker mode elimina gris cuadriculado", () => {
    const w = 4, h = 2;
    // fila 0: blanco / gris 204, fila 1: gris 221 / blanco
    const data = makeData(w, h, (x, y) => {
      if ((x + y) % 2 === 0) return [255, 255, 255, 255];
      if (y === 0) return [204, 204, 204, 255];
      return [221, 221, 221, 255];
    });
    const opts: BgRemoveOptions = { mode: "checker", tolerance: 15, method: "global" };
    applyBackgroundRemoval(data, w, h, opts);
    for (let i = 3; i < data.length; i += 4) expect(data[i]).toBe(0);
  });
  it("flood solo bordes conectados preserva blanco interior", () => {
    const w = 5, h = 5;
    // fondo blanco bordes, interior blanco aislado en centro 1px rodeado de rojo
    // capa: todo rojo, pero borde y cruz blanca? Simplificamos: matriz con anillo rojo
    const data = makeData(w, h, (x, y) => {
      // borde blanco
      if (x === 0 || y === 0 || x === 4 || y === 4) return [255, 255, 255, 255];
      // anillo rojo en x=1..3,y=1..3 borde del anillo
      if (x === 1 || x === 3 || y === 1 || y === 3) return [180, 20, 20, 255];
      // centro blanco aislado
      return [255, 255, 255, 255];
    });
    const opts: BgRemoveOptions = { mode: "white", tolerance: 15, method: "flood" };
    applyBackgroundRemoval(data, w, h, opts);
    // bordes transparentes
    expect(data[3]).toBe(0);
    // centro blanco NO debe ser transparente porque no conectado
    const center = (2 * w + 2) * 4 + 3;
    expect(data[center]).toBe(255);
  });
  it("custom color removal", () => {
    const w = 2, h = 2;
    const data = makeData(w, h, () => [0, 200, 0, 255]); // verde
    const opts: BgRemoveOptions = { mode: "custom", tolerance: 18, customColor: { r: 0, g: 200, b: 0 }, method: "global" };
    applyBackgroundRemoval(data, w, h, opts);
    expect(data[3]).toBe(0);
  });
  it("getTrimBounds detecta contenido", () => {
    const w = 4, h = 4;
    const data = makeData(w, h, (x, y) => (x === 2 && y === 2 ? [10, 10, 10, 255] : [0, 0, 0, 0]));
    const b = getTrimBounds(data, w, h)!;
    expect(b).toEqual({ x: 2, y: 2, w: 1, h: 1 });
    expect(getTrimBounds(new Uint8ClampedArray(w * h * 4), w, h)).toBeNull();
  });
});
