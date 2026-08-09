import { describe, it, expect } from "vitest";
import {
  generateItem,
  applyRelation,
  figuresEqual,
  RELATIONS,
  ATTRIBUTES,
} from "./generador";
import { createSimpleFigure } from "../figuras/figuras";
import type { AnalogyConfig, AnalogyRelation, AnalogyAttribute } from "./types";

describe("applyRelation", () => {
  it("single-attribute/rotation rota figure por amount grados", () => {
    const f = createSimpleFigure("square");
    const r = applyRelation(f, "single-attribute", "rotation", 90);
    expect(r.elements[0].rotation).toBe(90);
  });

  it("single-attribute/fill cambia el patrón de relleno", () => {
    const f = createSimpleFigure("square");
    const r = applyRelation(f, "single-attribute", "fill", 2);
    expect(r.elements[0].fill).not.toBe("solid");
  });

  it("composition añade un elemento", () => {
    const f = createSimpleFigure("square");
    const r = applyRelation(f, "composition", undefined, 0);
    expect(r.elements.length).toBeGreaterThan(f.elements.length);
  });

  it("rotation-overlay aplica rotación", () => {
    const f = createSimpleFigure("square");
    const r = applyRelation(f, "rotation-overlay", undefined, 45);
    expect(r.elements[0].rotation).toBe(45);
  });
});

describe("generateItem", () => {
  it("produce pair A→B, c, options, correctIndex", () => {
    const config: AnalogyConfig = {
      baseShape: "square",
      relation: "single-attribute",
      attribute: "rotation",
      amount: 90,
      seed: 1,
    };
    const item = generateItem(config);
    expect(item.pair).toHaveLength(2);
    expect(item.pair[0]).toBeDefined();
    expect(item.pair[1]).toBeDefined();
    expect(item.c).toBeDefined();
    expect(item.options).toHaveLength(4);
    expect(item.correctIndex).toBeGreaterThanOrEqual(0);
    expect(item.correctIndex).toBeLessThan(4);
    expect(item.distractors).toHaveLength(3);
  });

  it("relation rotation: A→B aplica misma rotación que C→D", () => {
    const config: AnalogyConfig = {
      baseShape: "square",
      relation: "single-attribute",
      attribute: "rotation",
      amount: 90,
      seed: 2,
    };
    const item = generateItem(config);
    const deltaAB = item.pair[1].elements[0].rotation - item.pair[0].elements[0].rotation;
    const correctD = item.options[item.correctIndex];
    const deltaCD = correctD.elements[0].rotation - item.c.elements[0].rotation;
    expect(normalize(deltaCD)).toBe(normalize(deltaAB));
  });

  it("lowSimilarity elige una forma distinta para C", () => {
    const config: AnalogyConfig = {
      baseShape: "square",
      relation: "single-attribute",
      attribute: "rotation",
      amount: 90,
      lowSimilarity: true,
      seed: 3,
    };
    const item = generateItem(config);
    const aKind = item.pair[0].elements[0].kind;
    const cKind = item.c.elements[0].kind;
    expect(cKind).not.toBe(aKind);
  });

  it("es determinista con misma seed", () => {
    const config: AnalogyConfig = {
      baseShape: "triangle",
      relation: "single-attribute",
      attribute: "scale",
      amount: 1.5,
      seed: 42,
    };
    const a = generateItem(config);
    const b = generateItem(config);
    expect(a.correctIndex).toBe(b.correctIndex);
    expect(
      figuresEqual(a.options[a.correctIndex], b.options[b.correctIndex]),
    ).toBe(true);
  });

  it("distractores no son iguales a la opción correcta", () => {
    const config: AnalogyConfig = {
      baseShape: "square",
      relation: "single-attribute",
      attribute: "fill",
      amount: 2,
      seed: 7,
      numOptions: 5,
    };
    const item = generateItem(config);
    expect(item.options).toHaveLength(5);
    const correct = item.options[item.correctIndex];
    for (const di of item.distractors) {
      expect(figuresEqual(item.options[di], correct)).toBe(false);
    }
  });

  it("composition genera item válido", () => {
    const config: AnalogyConfig = {
      baseShape: "square",
      relation: "composition",
      seed: 11,
    };
    const item = generateItem(config);
    expect(item.pair[1].elements.length).toBeGreaterThan(item.pair[0].elements.length);
  });

  it("todas las relaciones y atributos producen ítems válidos", () => {
    for (const relation of RELATIONS) {
      for (const attribute of ATTRIBUTES) {
        const config: AnalogyConfig = {
          baseShape: "square",
          relation,
          attribute,
          amount: 90,
          seed: 99,
        };
        const item = generateItem(config);
        expect(item.options.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("RELATIONS y ATTRIBUTES", () => {
  it("RELATIONS contiene las 3 categorías documentadas", () => {
    expect(RELATIONS).toHaveLength(3);
    expect(RELATIONS).toContain("single-attribute");
    expect(RELATIONS).toContain("composition");
    expect(RELATIONS).toContain("rotation-overlay");
  });

  it("ATTRIBUTES contiene los 5 atributos", () => {
    expect(ATTRIBUTES).toHaveLength(5);
    expect(ATTRIBUTES).toContain("rotation");
    expect(ATTRIBUTES).toContain("fill");
  });
});

function normalize(deg: number): number {
  return ((Math.round(deg) % 360) + 360) % 360;
}