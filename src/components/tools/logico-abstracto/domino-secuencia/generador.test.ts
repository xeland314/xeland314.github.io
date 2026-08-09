import { describe, it, expect } from "vitest";
import { generateItem, RECOMMENDED_RULES } from "./generador";
import type { DominoSequenceConfig } from "./types";

describe("generateItem", () => {
  it("produce shown + options + correctIndex", () => {
    const config: DominoSequenceConfig = {
      rule: { type: "suma-constante", delta: 1 },
      length: 4,
      startTop: 0,
      startBottom: 0,
      seed: 1,
    };
    const item = generateItem(config);
    expect(item.shown).toHaveLength(4);
    expect(item.options).toHaveLength(4);
    expect(item.correctIndex).toBeGreaterThanOrEqual(0);
    expect(item.correctIndex).toBeLessThan(4);
    expect(item.distractors).toHaveLength(3);
  });

  it("marca la última ficha como isHidden", () => {
    const config: DominoSequenceConfig = {
      rule: { type: "suma-constante", delta: 1 },
      length: 4,
      seed: 2,
    };
    const item = generateItem(config);
    expect(item.shown[3].isHidden).toBe(true);
    expect(item.shown[0].isHidden).toBe(false);
  });

  it("la opción correcta continúa el patrón suma-constante", () => {
    // Mostradas 4 fichas: (0,0),(1,1),(2,2),(?,?). Incógnita = (3,3).
    const config: DominoSequenceConfig = {
      rule: { type: "suma-constante", delta: 1 },
      length: 4,
      startTop: 0,
      startBottom: 0,
      seed: 3,
    };
    const item = generateItem(config);
    const correct = item.options[item.correctIndex];
    expect(correct.top).toBe(3);
    expect(correct.bottom).toBe(3);
  });

  it("patrón fracción: topDelta=1, bottomDelta=-1", () => {
    // (0,6),(1,5),(2,4),(3,3): incógnita al final = (3,3).
    const config: DominoSequenceConfig = {
      rule: { type: "fraccion", topDelta: 1, bottomDelta: -1 },
      length: 4,
      startTop: 0,
      startBottom: 6,
      seed: 4,
    };
    const item = generateItem(config);
    const correct = item.options[item.correctIndex];
    expect(correct.top).toBe(3);
    expect(correct.bottom).toBe(3);
  });

  it("distractores son distintos a la opción correcta", () => {
    const config: DominoSequenceConfig = {
      rule: { type: "suma-constante", delta: 1 },
      length: 4,
      seed: 5,
      numOptions: 5,
    };
    const item = generateItem(config);
    expect(item.options).toHaveLength(5);
    const correct = item.options[item.correctIndex];
    for (const di of item.distractors) {
      const d = item.options[di];
      expect(d.top === correct.top && d.bottom === correct.bottom).toBe(false);
    }
  });

  it("las 4 opciones son todas distintas", () => {
    const config: DominoSequenceConfig = {
      rule: { type: "suma-constante", delta: 1 },
      length: 4,
      seed: 6,
    };
    const item = generateItem(config);
    const keys = item.options.map((t) => `${t.top}|${t.bottom}`);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });

  it("es determinista con la misma seed", () => {
    const config: DominoSequenceConfig = {
      rule: { type: "fraccion", topDelta: 1, bottomDelta: -1 },
      length: 4,
      seed: 42,
    };
    const a = generateItem(config);
    const b = generateItem(config);
    expect(a.correctIndex).toBe(b.correctIndex);
    expect(a.options[a.correctIndex].top).toBe(b.options[b.correctIndex].top);
    expect(a.options[a.correctIndex].bottom).toBe(b.options[b.correctIndex].bottom);
  });

  it("permite hiddenIndex personalizado", () => {
    const config: DominoSequenceConfig = {
      rule: { type: "suma-constante", delta: 1 },
      length: 4,
      hiddenIndex: 1,
      seed: 7,
    };
    const item = generateItem(config);
    expect(item.hiddenIndex).toBe(1);
    expect(item.shown[1].isHidden).toBe(true);
    expect(item.shown[0].isHidden).toBe(false);
    expect(item.shown[3].isHidden).toBe(false);
  });

  it("respects mod7 wrap-around (progresión geométrica factor 2)", () => {
    // (1,1),(2,2),(4,4),(8%7=1, 8%7=1): incógnita = (1,1).
    const config: DominoSequenceConfig = {
      rule: { type: "progresion-geometrica", factor: 2 },
      length: 4,
      startTop: 1,
      startBottom: 1,
      seed: 8,
    };
    const item = generateItem(config);
    const correct = item.options[item.correctIndex];
    expect(correct.top).toBe(1);
    expect(correct.bottom).toBe(1);
  });

  it("todas las RECOMMENDED_RULES generan ítems válidos", () => {
    for (const rule of RECOMMENDED_RULES) {
      const config: DominoSequenceConfig = {
        rule,
        length: 4,
        seed: 99,
      };
      const item = generateItem(config);
      expect(item.options.length).toBe(4);
      expect(item.correctIndex).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("RECOMMENDED_RULES", () => {
  it("contiene reglas variadas", () => {
    const types = RECOMMENDED_RULES.map((r) => r.type);
    expect(types).toContain("suma-constante");
    expect(types).toContain("fraccion");
    expect(types).toContain("encadenado-clasico");
    expect(types).toContain("progresion-geometrica");
  });
});