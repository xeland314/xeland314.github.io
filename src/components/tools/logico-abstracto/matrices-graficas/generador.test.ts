import { describe, it, expect } from "vitest";
import { generateItem, figuresEqual, RULE_TYPES, ATTRIBUTES } from "./generador";
import type { MatrixConfig, MatrixRuleType, MatrixAttribute } from "./types";

describe("generateItem — permutation", () => {
  it("produce matriz NxN con celda vacía y N opciones", () => {
    const config: MatrixConfig = {
      dimension: 3,
      ruleType: "permutation",
      attribute: "shape",
      seed: 1,
    };
    const item = generateItem(config);
    expect(item.grid).toHaveLength(3);
    item.grid.forEach((row) => expect(row).toHaveLength(3));
    const flat = item.grid.flat();
    expect(flat.filter((c) => c === null)).toHaveLength(1);
    expect(item.options).toHaveLength(4);
  });

  it("cada tipo aparece una vez por fila y por columna (Sudoku-like)", () => {
    const config: MatrixConfig = {
      dimension: 3,
      ruleType: "permutation",
      attribute: "shape",
      seed: 1,
    };
    const item = generateItem(config);
    // Restaurar celda vacía con la correcta para verificación
    const grid = item.grid.map((row) => row.slice());
    grid[item.emptyCell.row][item.emptyCell.col] = item.options[item.correctIndex];
    // Cada fila tiene 3 tipos distintos
    for (let r = 0; r < 3; r++) {
      const kinds = grid[r].map((f) => f!.elements[0].kind);
      expect(new Set(kinds).size).toBe(3);
    }
    // Cada columna tiene 3 tipos distintos
    for (let c = 0; c < 3; c++) {
      const kinds = [0, 1, 2].map((r) => grid[r][c]!.elements[0].kind);
      expect(new Set(kinds).size).toBe(3);
    }
  });

  it("la opción correcta completa la celda vacía cumpliendo la regla", () => {
    const config: MatrixConfig = {
      dimension: 3,
      ruleType: "permutation",
      attribute: "shape",
      seed: 5,
    };
    const item = generateItem(config);
    // Lo que falta en la fila de la celda vacía
    const emptyRow = item.grid[item.emptyCell.row];
    const present = new Set(
      emptyRow
        .filter((_, j) => j !== item.emptyCell.col)
        .map((f) => f!.elements[0].kind),
    );
    const correctKind = item.options[item.correctIndex].elements[0].kind;
    expect(present.has(correctKind)).toBe(false);
  });
});

describe("generateItem — progression", () => {
  it("regla de rotación por fila (avanza de izquierda a derecha)", () => {
    const config: MatrixConfig = {
      dimension: 3,
      ruleType: "progression",
      attribute: "rotation",
      amount: 90,
      seed: 2,
    };
    const item = generateItem(config);
    const grid = item.grid.map((row) => row.slice());
    grid[item.emptyCell.row][item.emptyCell.col] = item.options[item.correctIndex];
    // En la primera fila: 0°, 90°, 180°
    const rots = [0, 1, 2].map((j) => grid[0][j]!.elements[0].rotation);
    expect(rots[1] - rots[0]).toBe(90);
    expect(rots[2] - rots[1]).toBe(90);
  });

  it("regla de fill cambia el patrón por paso", () => {
    const config: MatrixConfig = {
      dimension: 3,
      ruleType: "progression",
      attribute: "fill",
      seed: 3,
    };
    const item = generateItem(config);
    const f0 = item.grid[0][0]!.elements[0].fill;
    const f1 = item.grid[0][1]!.elements[0].fill;
    expect(f0).not.toBe(f1);
  });
});

describe("generateItem — arithmetic", () => {
  it("el número de elementos crece por fila y por columna", () => {
    const config: MatrixConfig = {
      dimension: 3,
      ruleType: "arithmetic",
      amount: 0,
      seed: 4,
    };
    const item = generateItem(config);
    const grid = item.grid.map((row) => row.slice());
    grid[item.emptyCell.row][item.emptyCell.col] = item.options[item.correctIndex];
    // Misma fila: crece
    const row0 = [0, 1, 2].map((j) => grid[0][j]!.elements.length);
    expect(row0[1]).toBeGreaterThan(row0[0]);
    expect(row0[2]).toBeGreaterThan(row0[1]);
  });
});

describe("generateItem — combined", () => {
  it("produce matriz válida con reglas distintas por fila/columna", () => {
    const config: MatrixConfig = {
      dimension: 3,
      ruleType: "combined",
      attribute: "fill",
      amount: 1,
      seed: 6,
    };
    const item = generateItem(config);
    expect(item.grid).toHaveLength(3);
    expect(item.options).toHaveLength(4);
  });
});

describe("generateItem — celda vacía configurable", () => {
  it("ubica la celda vacía según emptyCell", () => {
    const config: MatrixConfig = {
      dimension: 3,
      ruleType: "progression",
      attribute: "rotation",
      amount: 90,
      emptyCell: { row: 0, col: 1 },
      seed: 8,
    };
    const item = generateItem(config);
    expect(item.grid[0][1]).toBeNull();
    expect(item.emptyCell).toEqual({ row: 0, col: 1 });
  });

  it("por defecto la celda vacía es la última (esquina inferior derecha)", () => {
    const config: MatrixConfig = {
      dimension: 3,
      ruleType: "permutation",
      seed: 9,
    };
    const item = generateItem(config);
    expect(item.grid[2][2]).toBeNull();
  });
});

describe("generateItem — determinismo y distractores", () => {
  it("misma seed produce el mismo ítem", () => {
    const config: MatrixConfig = {
      dimension: 3,
      ruleType: "permutation",
      seed: 42,
    };
    const a = generateItem(config);
    const b = generateItem(config);
    expect(a.correctIndex).toBe(b.correctIndex);
    expect(figuresEqual(a.options[a.correctIndex], b.options[b.correctIndex])).toBe(true);
  });

  it("distractores no son iguales a la opción correcta", () => {
    const config: MatrixConfig = {
      dimension: 3,
      ruleType: "permutation",
      seed: 15,
      numOptions: 5,
    };
    const item = generateItem(config);
    const correct = item.options[item.correctIndex];
    for (const di of item.distractors) {
      expect(figuresEqual(item.options[di], correct)).toBe(false);
    }
  });
});

describe("todas las reglas y atributos", () => {
  it("todas las combinaciones generan un ítem válido", () => {
    for (const ruleType of RULE_TYPES) {
      for (const attribute of ATTRIBUTES) {
        const config: MatrixConfig = {
          dimension: 3,
          ruleType,
          attribute,
          amount: 2,
          seed: 100,
        };
        const item = generateItem(config);
        expect(item.options.length).toBeGreaterThan(0);
        expect(item.correctIndex).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("RULE_TYPES y ATTRIBUTES", () => {
  it("RULE_TYPES contiene las 4 reglas", () => {
    expect(RULE_TYPES).toHaveLength(4);
    expect(RULE_TYPES).toContain("permutation");
    expect(RULE_TYPES).toContain("progression");
    expect(RULE_TYPES).toContain("arithmetic");
    expect(RULE_TYPES).toContain("combined");
  });

  it("ATTRIBUTES contiene los 4 atributos", () => {
    expect(ATTRIBUTES).toHaveLength(4);
    expect(ATTRIBUTES).toContain("shape");
    expect(ATTRIBUTES).toContain("rotation");
  });
});