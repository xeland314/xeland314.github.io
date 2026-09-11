import { describe, it, expect } from "vitest";
import { buildPdfFilename, calcScaledWidths, rowsPerPage, buildMapImageFilename, sanitizeFileName } from "./export-helpers";

describe("buildPdfFilename", () => {
  it("sanitiza nombre y forma", () => {
    expect(buildPdfFilename("Ruta Quito Centro", "2026-01-01", 10, "A4", 9)).toBe("Ruta-Quito-Centro-2026-01-01-10pts-A4-9pt.pdf");
  });
  it("fallback mapa si nombre inválido", () => expect(buildPdfFilename("!!!", "2026-01-01", 1, "A4", 7)).toMatch(/^mapa-/));
  it("corta 30 chars", () => {
    const long = "a".repeat(40);
    expect(buildPdfFilename(long, "2026-01-01", 1, "A4", 7).startsWith("a".repeat(30))).toBe(true);
  });
});

describe("calcScaledWidths", () => {
  it("escala proporcional", () => {
    const w = calcScaledWidths([28, 280, 75, 75], 458);
    expect(w.reduce((a, b) => a + b, 0)).toBeCloseTo(458, 5);
  });
  it("mantiene proporción", () => {
    const [a, b] = calcScaledWidths([100, 200], 150);
    expect(a).toBeCloseTo(50, 5);
    expect(b).toBeCloseTo(100, 5);
  });
});

describe("rowsPerPage", () => {
  it("calcula filas", () => expect(rowsPerPage(841.89, 36, 14, 14)).toBeGreaterThan(10));
  it("menos filas con font grande", () => {
    const small = rowsPerPage(800, 36, 14, 13);
    const large = rowsPerPage(800, 36, 14, 18);
    expect(small).toBeGreaterThan(large);
  });
});

describe("buildMapImageFilename", () => {
  it("forma mapa fecha pts rotacion tamaño", () => {
    expect(buildMapImageFilename("2026-01-01", 5, 45, "1920x1080", "png")).toBe("mapa-2026-01-01-5pts-45deg-1920x1080.png");
  });
});

describe("sanitizeFileName", () => {
  it("reemplaza no alfanum", () => expect(sanitizeFileName("Hola Mundo!")).toBe("Hola-Mundo"));
});
