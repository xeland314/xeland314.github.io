import { describe, it, expect } from "vitest";
import { generateId, encodeMarkersHash, decodeMarkersHash, buildShareUrl, sanitizeProjectName, parseStoredPayload } from "./storage";
import type { MarkerData } from "./types";

describe("generateId", () => {
  it("longitud 7 y alfanumérico", () => {
    const id = generateId();
    expect(id).toHaveLength(7);
    expect(id).toMatch(/^[a-z0-9]+$/);
  });
  it("único", () => expect(generateId()).not.toBe(generateId()));
});

describe("encode/decode hash", () => {
  it("roundtrip", () => {
    const markers: MarkerData[] = [{ id: "1", lat: -0.2, lng: -78.5, title: "A", description: "", icon: "map-pin", color: "blue" }];
    const hash = encodeMarkersHash(markers);
    const decoded = decodeMarkersHash(`map=${hash}`);
    expect(decoded).toHaveLength(1);
    expect(decoded![0].lat).toBe(-0.2);
  });
  it("hash sin prefijo también decodifica", () => {
    const m: MarkerData[] = [{ id: "x", lat: 0, lng: 0, title: "T", description: "", icon: "flag", color: "red" }];
    const h = encodeMarkersHash(m);
    expect(decodeMarkersHash(h)).not.toBeNull();
  });
  it("filtra lat/lng inválidos", () => {
    const raw = btoa(encodeURIComponent(JSON.stringify([{ lat: "bad", lng: 0 }, { lat: 1, lng: 2, title: "ok" }])));
    const dec = decodeMarkersHash(`map=${raw}`);
    expect(dec).toHaveLength(1);
    expect(dec![0].lat).toBe(1);
  });
  it("hash inválido -> null", () => expect(decodeMarkersHash("map=!!!")).toBeNull());
  it("vacío -> null", () => {
    const raw = btoa(encodeURIComponent(JSON.stringify([])));
    expect(decodeMarkersHash(`map=${raw}`)).toBeNull();
  });
});

describe("buildShareUrl", () => {
  it("construye origin+pathname+#map=", () => {
    const m: MarkerData[] = [{ id: "1", lat: 0, lng: 0, title: "A", description: "", icon: "map-pin", color: "blue" }];
    const url = buildShareUrl("/mapa-personalizado", "https://example.com", m);
    expect(url).toMatch(/^https:\/\/example\.com\/mapa-personalizado#map=/);
  });
});

describe("sanitizeProjectName", () => {
  it("sanitiza y corta 30", () => {
    expect(sanitizeProjectName("Hola Mundo 123")).toBe("Hola-Mundo-123");
    expect(sanitizeProjectName("a".repeat(50)).length).toBe(30);
  });
  it("fallback si vacío", () => expect(sanitizeProjectName("!!!")).toBe("mapa"));
});

describe("parseStoredPayload", () => {
  it("null si raw null", () => expect(parseStoredPayload(null)).toBeNull());
  it("parsea json válido", () => expect(parseStoredPayload('{"a":1}')).toEqual({ a: 1 }));
  it("null si json inválido", () => expect(parseStoredPayload("{")).toBeNull());
});
