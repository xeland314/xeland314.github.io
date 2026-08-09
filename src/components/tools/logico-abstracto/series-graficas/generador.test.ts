import { describe, it, expect } from "vitest";
import { generateSeriesItem, figuresEqual, PATTERN_TYPES } from "./generador";
import { createSimpleFigure } from "../figuras/figuras";
import { generateSequence } from "../figuras/primitivas";
import type { SeriesConfig } from "./types";

describe("generateSeriesItem", () => {
  it("genera un ítem con el número correcto de figuras visibles y opciones", () => {
    const config: SeriesConfig = {
      baseShape: "square",
      pattern: "rotation",
      numVisible: 4,
      numOptions: 4,
    };
    const item = generateSeriesItem(config);
    expect(item.shown).toHaveLength(4);
    expect(item.options).toHaveLength(4);
    expect(item.correctIndex).toBeGreaterThanOrEqual(0);
    expect(item.correctIndex).toBeLessThan(4);
    expect(item.distractors).toHaveLength(3);
    expect(item.distractors).not.toContain(item.correctIndex);
  });

  it("la opción correcta continúa la secuencia de rotación", () => {
    const config: SeriesConfig = {
      baseShape: "square",
      pattern: "rotation",
      numVisible: 3,
    };
    const item = generateSeriesItem(config);
    const lastShown = item.shown[item.shown.length - 1];
    const correct = item.options[item.correctIndex];
    expect(correct.elements[0].rotation).toBeGreaterThan(
      lastShown.elements[0].rotation,
    );
  });

  it("es determinista para la misma configuración", () => {
    const config: SeriesConfig = {
      baseShape: "circle",
      pattern: "scale",
      numVisible: 3,
      numOptions: 4,
    };
    const a = generateSeriesItem(config);
    const b = generateSeriesItem(config);
    expect(a.correctIndex).toBe(b.correctIndex);
    expect(a.shown.length).toBe(b.shown.length);
  });

  it("patrón addition produce una secuencia creciente en nº de elementos", () => {
    const config: SeriesConfig = {
      baseShape: "dot",
      pattern: "addition",
      numVisible: 3,
    };
    const item = generateSeriesItem(config);
    expect(item.steps[0].kind).toBe("addition");
    expect(item.shown[0].elements.length).toBeLessThanOrEqual(
      item.shown[1].elements.length,
    );
  });

  it("patrón removal produce una secuencia decreciente en nº de elementos", () => {
    const config: SeriesConfig = {
      baseShape: "dot",
      pattern: "removal",
      numVisible: 3,
    };
    const item = generateSeriesItem(config);
    expect(item.steps[0].kind).toBe("removal");
    expect(item.shown[0].elements.length).toBeGreaterThanOrEqual(
      item.shown[1].elements.length,
    );
  });

  it("numRules=2 produce dos steps distintos", () => {
    const config: SeriesConfig = {
      baseShape: "square",
      pattern: "rotation",
      numVisible: 3,
      numRules: 2,
    };
    const item = generateSeriesItem(config);
    expect(item.steps).toHaveLength(2);
    expect(item.steps[0].kind).not.toBe(item.steps[1].kind);
  });

  it("todos los tipos de patrón generan un ítem válido", () => {
    for (const pattern of PATTERN_TYPES) {
      const config: SeriesConfig = {
        baseShape: "square",
        pattern,
        numVisible: 3,
      };
      const item = generateSeriesItem(config);
      expect(item.options.length).toBeGreaterThan(0);
      expect(item.correctIndex).toBeGreaterThanOrEqual(0);
    }
  });

  it("los distractores no son iguales a la opción correcta", () => {
    const config: SeriesConfig = {
      baseShape: "square",
      pattern: "rotation",
      numVisible: 3,
      numOptions: 4,
    };
    const item = generateSeriesItem(config);
    const correct = item.options[item.correctIndex];
    for (const di of item.distractors) {
      expect(figuresEqual(item.options[di], correct)).toBe(false);
    }
  });
});

describe("figuresEqual", () => {
  it("devuelve true para la misma figura", () => {
    const f = createSimpleFigure("square");
    expect(figuresEqual(f, f)).toBe(true);
  });

  it("devuelve false si cambia un atributo", () => {
    const a = createSimpleFigure("square");
    const b = { ...a, elements: [{ ...a.elements[0], rotation: 90 }] };
    expect(figuresEqual(a, b)).toBe(false);
  });

  it("devuelve false si cambia el número de elementos", () => {
    const seq = generateSequence(
      createSimpleFigure("square"),
      [{ kind: "rotation", amount: 90 }],
      2,
    );
    const withExtra = {
      ...seq[0],
      elements: [...seq[0].elements, seq[0].elements[0]],
    };
    expect(figuresEqual(seq[0], withExtra)).toBe(false);
  });
});

describe("PATTERN_TYPES", () => {
  it("incluye los 7 patrones documentados", () => {
    expect(PATTERN_TYPES).toHaveLength(7);
    expect(PATTERN_TYPES).toContain("rotation");
    expect(PATTERN_TYPES).toContain("addition");
    expect(PATTERN_TYPES).toContain("removal");
    expect(PATTERN_TYPES).toContain("translation");
    expect(PATTERN_TYPES).toContain("scale");
    expect(PATTERN_TYPES).toContain("fill");
    expect(PATTERN_TYPES).toContain("combined");
  });
});