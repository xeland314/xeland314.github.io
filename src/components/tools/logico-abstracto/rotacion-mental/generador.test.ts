import { describe, it, expect } from "vitest";
import {
  generateItem,
  simplifyAngle,
  figuresEqual,
  estimateDifficulty,
  DIRECTIONS,
} from "./generador";
import { createSimpleFigure } from "../figuras/figuras";
import { rotate } from "../figuras/primitivas";
import type { MentalRotationConfig, RotationDirection } from "./types";

describe("simplifyAngle", () => {
  it("210° horario se simplifica a 150° antihorario", () => {
    const r = simplifyAngle(210, "clockwise");
    expect(r.effective).toBe(150);
    expect(r.effectiveDirection).toBe("counterclockwise");
  });

  it("600° horario → normalize a 240° y simplifica a 120° antihorario", () => {
    const r = simplifyAngle(600, "clockwise");
    expect(r.effective).toBe(120);
    expect(r.effectiveDirection).toBe("counterclockwise");
  });

  it("160° horario se queda como 160° horario (no > 180)", () => {
    const r = simplifyAngle(160, "clockwise");
    expect(r.effective).toBe(160);
    expect(r.effectiveDirection).toBe("clockwise");
  });

  it("ángulos antihorarios se preservan", () => {
    const r = simplifyAngle(150, "counterclockwise");
    expect(r.effective).toBe(150);
    expect(r.effectiveDirection).toBe("counterclockwise");
  });
});

describe("generateItem", () => {
  it("produce N opciones y correctIndex válido", () => {
    const config: MentalRotationConfig = {
      baseShape: "triangle",
      angleDegrees: 90,
      direction: "clockwise",
    };
    const item = generateItem(config);
    expect(item.options).toHaveLength(4);
    expect(item.correctIndex).toBeGreaterThanOrEqual(0);
    expect(item.correctIndex).toBeLessThan(4);
    expect(item.distractors).toHaveLength(3);
    expect(item.distractors).not.toContain(item.correctIndex);
  });

  it("la opción correcta tiene la rotación firmada esperada", () => {
    const config: MentalRotationConfig = {
      baseShape: "square",
      angleDegrees: 90,
      direction: "clockwise",
      seed: 1,
    };
    const item = generateItem(config);
    const correct = item.options[item.correctIndex];
    const expected = rotate(createSimpleFigure("square"), 90);
    expect(correct.elements[0].rotation).toBe(expected.elements[0].rotation);
  });

  it("dirección antihoraria aplica rotación negativa", () => {
    const config: MentalRotationConfig = {
      baseShape: "square",
      angleDegrees: 90,
      direction: "counterclockwise",
      seed: 3,
    };
    const item = generateItem(config);
    const correct = item.options[item.correctIndex];
    expect(correct.elements[0].rotation).toBe(270);
  });

  it("es determinista con la misma seed", () => {
    const config: MentalRotationConfig = {
      baseShape: "square",
      angleDegrees: 60,
      direction: "clockwise",
      seed: 42,
    };
    const a = generateItem(config);
    const b = generateItem(config);
    expect(a.correctIndex).toBe(b.correctIndex);
    expect(figuresEqual(a.options[a.correctIndex], b.options[b.correctIndex])).toBe(true);
  });

  it("los distractores no son iguales a la opción correcta", () => {
    const config: MentalRotationConfig = {
      baseShape: "square",
      angleDegrees: 45,
      direction: "clockwise",
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

  it("acepta dirección antihoraria", () => {
    for (const direction of DIRECTIONS) {
      const config: MentalRotationConfig = {
        baseShape: "square",
        angleDegrees: 45,
        direction,
        seed: 9,
      };
      const item = generateItem(config);
      expect(item.options.length).toBeGreaterThan(0);
    }
  });
});

describe("estimateDifficulty", () => {
  it("múltiplos de 90° o 180° son baja", () => {
    expect(estimateDifficulty(90)).toBe("baja");
    expect(estimateDifficulty(180)).toBe("baja");
  });

  it("múltiplos de 30° son media", () => {
    expect(estimateDifficulty(30)).toBe("media");
    expect(estimateDifficulty(60)).toBe("media");
  });

  it("ángulos irregulares son alta", () => {
    expect(estimateDifficulty(127)).toBe("alta");
  });
});

describe("DIRECTIONS", () => {
  it("contiene ambas direcciones", () => {
    expect(DIRECTIONS).toContain("clockwise");
    expect(DIRECTIONS).toContain("counterclockwise");
  });
});