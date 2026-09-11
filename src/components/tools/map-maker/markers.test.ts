import { describe, it, expect } from "vitest";
import { validateMarker, validateLatLng, reorderMarkers, createMarker, updateMarker, removeMarker, duplicateMarker, parseImportedMarkers } from "./markers";
import type { MarkerData } from "./types";

describe("validateMarker", () => {
  it("válido true", () => expect(validateMarker({ lat: 0, lng: 1 })).toBe(true));
  it("NaN false", () => expect(validateMarker({ lat: NaN, lng: 0 })).toBe(false));
  it("faltante false", () => expect(validateMarker({ lat: 0 })).toBe(false));
});

describe("validateLatLng", () => {
  it("parsea strings válidos", () => expect(validateLatLng("-0.2", "-78.5")).toEqual({ lat: -0.2, lng: -78.5 }));
  it("null si inválido", () => expect(validateLatLng("bad", "0")).toBeNull());
});

describe("reorderMarkers", () => {
  const base: MarkerData[] = [
    { id: "a", lat: 0, lng: 0, title: "A", description: "", icon: "map-pin", color: "blue" },
    { id: "b", lat: 1, lng: 1, title: "B", description: "", icon: "flag", color: "red" },
    { id: "c", lat: 2, lng: 2, title: "C", description: "", icon: "star", color: "green" },
  ];
  it("mueve arriba", () => {
    const r = reorderMarkers(base, "b", -1);
    expect(r.map((m) => m.id)).toEqual(["b", "a", "c"]);
  });
  it("mueve abajo", () => {
    const r = reorderMarkers(base, "b", 1);
    expect(r.map((m) => m.id)).toEqual(["a", "c", "b"]);
  });
  it("límite primer elemento no mueve", () => expect(reorderMarkers(base, "a", -1)).toEqual(base));
  it("límite último no mueve", () => expect(reorderMarkers(base, "c", 1)).toEqual(base));
  it("id inexistente", () => expect(reorderMarkers(base, "x", 1)).toEqual(base));
});

describe("createMarker", () => {
  it("6 decimales y título", () => {
    const m = createMarker(-0.123456789, -78.987654321, "Hola", "map-pin", "blue", () => "id123");
    expect(m.lat).toBe(-0.123457);
    expect(m.lng).toBe(-78.987654);
    expect(m.id).toBe("id123");
  });
});

describe("updateMarker", () => {
  it("actualiza patch", () => {
    const base: MarkerData[] = [{ id: "a", lat: 0, lng: 0, title: "A", description: "", icon: "map-pin", color: "blue" }];
    const r = updateMarker(base, "a", { title: "Z" });
    expect(r[0].title).toBe("Z");
  });
});

describe("removeMarker", () => {
  it("elimina por id", () => {
    const base: MarkerData[] = [
      { id: "a", lat: 0, lng: 0, title: "A", description: "", icon: "map-pin", color: "blue" },
      { id: "b", lat: 1, lng: 1, title: "B", description: "", icon: "flag", color: "red" },
    ];
    expect(removeMarker(base, "a")).toHaveLength(1);
  });
});

describe("duplicateMarker", () => {
  it("duplica con (copia)", () => {
    const base: MarkerData[] = [{ id: "a", lat: 0, lng: 0, title: "A", description: "", icon: "map-pin", color: "blue" }];
    const r = duplicateMarker(base, base[0], () => "b");
    expect(r[1].id).toBe("b");
    expect(r[1].title).toBe("A (copia)");
  });
});

describe("parseImportedMarkers", () => {
  it("FeatureCollection", () => {
    const raw = { type: "FeatureCollection", features: [{ geometry: { coordinates: [-78.5, -0.2] }, properties: { title: "Q" } }] };
    const res = parseImportedMarkers(raw, () => "id");
    expect(res[0].lat).toBe(-0.2);
    expect(res[0].lng).toBe(-78.5);
  });
  it("array", () => {
    const raw = [{ lat: 0, lng: 0, title: "A" }];
    expect(parseImportedMarkers(raw, () => "id")).toHaveLength(1);
  });
  it("formato no reconocido throw", () => expect(() => parseImportedMarkers({}, () => "id")).toThrow());
  it("sin válidos throw", () => expect(() => parseImportedMarkers([{ lat: null }], () => "id")).toThrow());
});
