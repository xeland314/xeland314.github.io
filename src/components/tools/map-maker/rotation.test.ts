/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from "vitest";
import L from "leaflet";
import {
  getRotationFactor,
  normalizeAngle,
  correctContainerPoint,
  getCorrectedLatLng,
  getAdjustedPadding,
  getExtraPadding,
  angleFromPointer,
} from "./rotation";

describe("getRotationFactor", () => {
  it("0° factor 1", () => expect(getRotationFactor(0)).toBeCloseTo(1, 5));
  it("90° factor 1", () => expect(getRotationFactor(90)).toBeCloseTo(1, 5));
  it("180° factor 1", () => expect(getRotationFactor(180)).toBeCloseTo(1, 5));
  it("45° factor ~1.414", () => expect(getRotationFactor(45)).toBeCloseTo(1.41421356, 3));
  it("30° factor ~1.366", () => expect(getRotationFactor(30)).toBeCloseTo(Math.abs(Math.sin((30 * Math.PI) / 180)) + Math.abs(Math.cos((30 * Math.PI) / 180)), 5));
  it("360° factor 1", () => expect(getRotationFactor(360)).toBeCloseTo(1, 5));
  it("range 1..1.414", () => {
    for (const deg of [0, 15, 30, 45, 60, 90, 135, 180]) {
      const f = getRotationFactor(deg);
      expect(f).toBeGreaterThanOrEqual(1 - 1e-9);
      expect(f).toBeLessThanOrEqual(1.414213562373095 + 1e-9);
    }
  });
});

describe("normalizeAngle", () => {
  it("0 stays 0", () => expect(normalizeAngle(0)).toBe(0));
  it("360 -> 0", () => expect(normalizeAngle(360)).toBe(0));
  it("720 -> 0", () => expect(normalizeAngle(720)).toBe(0));
  it("negative -90 -> 270", () => expect(normalizeAngle(-90)).toBe(270));
  it("450 -> 90", () => expect(normalizeAngle(450)).toBe(90));
});

describe("getAdjustedPadding / getExtraPadding", () => {
  it("0° padding 0.2 and no extra", () => {
    expect(getAdjustedPadding(0)).toBeCloseTo(0.2, 5);
    expect(getExtraPadding(0)).toEqual([0, 0]);
  });
  it("45° padding ~0.43", () => expect(getAdjustedPadding(45)).toBeCloseTo(0.43, 2));
  it("45° extra padding >0", () => {
    const [x, y] = getExtraPadding(45);
    expect(x).toBeGreaterThan(0);
    expect(y).toBeGreaterThan(0);
  });
});

describe("angleFromPointer", () => {
  it("arriba es 0°", () => {
    const rect = { left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    // centro 50,50, punto arriba 50,0 -> dx 0 dy -50 => atan2 -90 => 0°
    expect(angleFromPointer(50, 0, rect)).toBe(0);
  });
  it("derecha es 90°", () => {
    const rect = { left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    expect(angleFromPointer(100, 50, rect)).toBe(90);
  });
  it("abajo es 180°", () => {
    const rect = { left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    expect(angleFromPointer(50, 100, rect)).toBe(180);
  });
  it("izquierda es 270°", () => {
    const rect = { left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    expect(angleFromPointer(0, 50, rect)).toBe(270);
  });
});

describe("correctContainerPoint", () => {
  function makeDiv(clientW: number, clientH: number, rectLeft: number, rectTop: number, rectW: number, rectH: number) {
    return {
      clientWidth: clientW,
      clientHeight: clientH,
      getBoundingClientRect: () => ({
        left: rectLeft,
        top: rectTop,
        width: rectW,
        height: rectH,
        right: rectLeft + rectW,
        bottom: rectTop + rectH,
        x: rectLeft,
        y: rectTop,
        toJSON: () => ({}),
      }),
    } as unknown as HTMLElement;
  }

  it("0° centro mapea a centro local", () => {
    const div = makeDiv(200, 200, 0, 0, 200, 200);
    const pt = correctContainerPoint(100, 100, 0, div);
    expect(pt.x).toBeCloseTo(100, 5);
    expect(pt.y).toBeCloseTo(100, 5);
  });

  it("0° esquina mapea identidad", () => {
    const div = makeDiv(200, 200, 0, 0, 200, 200);
    const pt = correctContainerPoint(0, 0, 0, div);
    expect(pt.x).toBeCloseTo(0, 5);
    expect(pt.y).toBeCloseTo(0, 5);
  });

  it("90° punto derecha del centro visual se corrige arriba", () => {
    // div 200x200 centro pantalla 100,100, bbox 200x200 a 0,0
    // visual: 90° rotado, punto a la derecha visual (client 200,100) dx=100,dy=0
    // inverse -90: rx=0, ry=-100 => local (100+0,100-100)=(100,0) arriba
    const div = makeDiv(200, 200, 0, 0, 200, 200);
    const pt = correctContainerPoint(200, 100, 90, div);
    expect(pt.x).toBeCloseTo(100, 0);
    expect(pt.y).toBeCloseTo(0, 0);
  });

  it("360° identidad", () => {
    const div = makeDiv(200, 200, 10, 10, 200, 200);
    const pt0 = correctContainerPoint(50, 50, 0, div);
    const pt360 = correctContainerPoint(50, 50, 360, div);
    expect(pt360.x).toBeCloseTo(pt0.x, 5);
    expect(pt360.y).toBeCloseTo(pt0.y, 5);
  });

  it("180° centro permanece centro", () => {
    const div = makeDiv(400, 200, 0, 0, 400, 200);
    const pt = correctContainerPoint(200, 100, 180, div);
    expect(pt.x).toBeCloseTo(200, 0);
    expect(pt.y).toBeCloseTo(100, 0);
  });
});

describe("getCorrectedLatLng", () => {
  it("sin rotación delega a containerPointToLatLng", () => {
    const mockMap = {
      getContainer: () => ({ getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 200, right: 200, bottom: 200, x: 0, y: 0, toJSON: () => ({}) }), parentElement: null } as any),
      containerPointToLatLng: (pt: L.Point) => L.latLng(pt.y / 10, pt.x / 10),
    } as unknown as L.Map;
    const ll = getCorrectedLatLng(mockMap, 20, 30, 0);
    expect(ll.lat).toBeCloseTo(3, 5);
    expect(ll.lng).toBeCloseTo(2, 5);
  });

  it("con rotación usa correctContainerPoint", () => {
    const div = {
      clientWidth: 200,
      clientHeight: 200,
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 200, right: 200, bottom: 200, x: 0, y: 0, toJSON: () => ({}) }),
    } as unknown as HTMLElement;
    const mockMap = {
      getContainer: () => ({ parentElement: div, getBoundingClientRect: () => ({ left: 0, top: 0, width: 10, height: 10, right: 10, bottom: 10, x: 0, y: 0, toJSON: () => ({}) }) } as any),
      containerPointToLatLng: (pt: L.Point) => L.latLng(pt.y, pt.x),
    } as unknown as L.Map;
    const ll0 = getCorrectedLatLng(mockMap, 100, 100, 0);
    const ll90 = getCorrectedLatLng(mockMap, 200, 100, 90);
    expect(ll90.lat).toBeCloseTo(0, 0);
    expect(ll90.lng).toBeCloseTo(100, 0);
    expect(ll0.lat).toBeCloseTo(100, 0);
  });
});
