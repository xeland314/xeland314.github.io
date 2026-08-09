import { describe, it, expect } from "vitest";
import {
  generateSeriesItem,
  generateDistractores,
  mulberry32,
  PATTERNS,
} from "./generador";
import { ALPHABETS } from "./types";
import type { SeriesConfig } from "./types";

describe("generateSeriesItem — fijo", () => {
  it("repite el bloque del alfabeto en bucle", () => {
    const config: SeriesConfig = {
      pattern: "fijo",
      longitudCiclo: 4,
      alfabeto: "letras",
      puntoDeCorte: 1,
      longitudVisible: 8,
    };
    const item = generateSeriesItem(config);
    expect(item.shown.length).toBe(8);
    expect(item.shown.slice(0, 4)).toBe("abcd");
    expect(item.shown.slice(4, 8)).toBe("abcd");
  });

  it("la respuesta continúa el ciclo correctamente", () => {
    const config: SeriesConfig = {
      pattern: "fijo",
      longitudCiclo: 3,
      alfabeto: "letras",
      puntoDeCorte: 2,
      longitudVisible: 4,
    };
    const item = generateSeriesItem(config);
    expect(item.respuesta).toBe("bc");
  });
});

describe("generateSeriesItem — salto", () => {
  it("avanza k posiciones en cada paso", () => {
    const config: SeriesConfig = {
      pattern: "salto",
      longitudCiclo: 3,
      alfabeto: "letras",
      puntoDeCorte: 1,
      longitudVisible: 4,
      salto: 3,
    };
    const item = generateSeriesItem(config);
    expect(item.shown).toBe("adgj");
    expect(item.respuesta).toBe("m");
  });

  it("el salto salta cíclicamente al final del alfabeto", () => {
    const config: SeriesConfig = {
      pattern: "salto",
      longitudCiclo: 3,
      alfabeto: "letras",
      puntoDeCorte: 2,
      longitudVisible: 28,
      salto: 1,
    };
    const item = generateSeriesItem(config);
    expect(item.shown[26]).toBe(item.alfabeto[26]);
    expect(item.shown[27]).toBe(item.alfabeto[0]);
  });
});

describe("generateSeriesItem — acumulativo", () => {
  it("el bloque crece en cada vuelta", () => {
    const config: SeriesConfig = {
      pattern: "acumulativo",
      longitudCiclo: 3,
      alfabeto: "letras",
      puntoDeCorte: 1,
      longitudVisible: 9,
    };
    const item = generateSeriesItem(config);
    expect(item.shown.slice(0, 2)).toBe("ab");
    expect(item.shown.slice(2, 5)).toBe("abc");
    expect(item.shown.slice(5, 9)).toBe("abcd");
  });
});

describe("generateSeriesItem — alternado", () => {
  it("alterna letra y número", () => {
    const config: SeriesConfig = {
      pattern: "alternado",
      longitudCiclo: 3,
      alfabeto: "letras",
      puntoDeCorte: 1,
      longitudVisible: 4,
    };
    const item = generateSeriesItem(config);
    expect(item.shown[0]).toBe("a");
    expect(item.shown[1]).toBe("0");
    expect(item.shown[2]).toBe("b");
    expect(item.shown[3]).toBe("1");
  });
});

describe("generateSeriesItem — espejo", () => {
  it("avanza y retrocede", () => {
    const config: SeriesConfig = {
      pattern: "espejo",
      longitudCiclo: 3,
      alfabeto: "letras",
      puntoDeCorte: 2,
      longitudVisible: 9,
    };
    const item = generateSeriesItem(config);
    expect(item.shown).toBe("abcdedcba");
  });
});

describe("generateSeriesItem — intruso", () => {
  it("introduce un carácter intruso en el medio", () => {
    const config: SeriesConfig = {
      pattern: "intruso",
      longitudCiclo: 3,
      alfabeto: "letras",
      puntoDeCorte: 1,
      longitudVisible: 6,
      conDistractor: true,
    };
    const item = generateSeriesItem(config);
    expect(item.shown.length).toBe(6);
    const base = "abcabc".slice(0, 6);
    const diffs = [...item.shown].filter((ch, i) => ch !== base[i]);
    expect(diffs.length).toBeGreaterThan(0);
  });
});

describe("generateSeriesItem — simbolos", () => {
  it("genera una serie con símbolos no alfabéticos", () => {
    const config: SeriesConfig = {
      pattern: "fijo",
      longitudCiclo: 3,
      alfabeto: "simbolos",
      puntoDeCorte: 1,
      longitudVisible: 6,
    };
    const item = generateSeriesItem(config);
    expect(item.alfabeto).toBe(ALPHABETS.simbolos);
    expect(item.shown).toBe("*#%*#%");
  });
});

describe("generateSeriesItem — determinismo", () => {
  it("misma seed produce el mismo resultado", () => {
    const config: SeriesConfig = {
      pattern: "intruso",
      longitudCiclo: 3,
      alfabeto: "letras",
      puntoDeCorte: 1,
      longitudVisible: 8,
      seed: 42,
    };
    const a = generateSeriesItem(config);
    const b = generateSeriesItem(config);
    expect(a.shown).toBe(b.shown);
    expect(a.respuesta).toBe(b.respuesta);
  });
});

describe("generateDistractores", () => {
  const rng = mulberry32(1);
  it("genera distractores distintos a la respuesta", () => {
    const distractores = generateDistractores(
      3,
      ALPHABETS.letras,
      "abc",
      3,
      rng,
    );
    expect(distractores).toHaveLength(3);
    expect(distractores).not.toContain("abc");
    for (const d of distractores) {
      expect(d.length).toBe(3);
    }
  });

  it("evita duplicados en la lista de distractores", () => {
    const distractores = generateDistractores(
      2,
      ALPHABETS.letras,
      "ab",
      4,
      mulberry32(7),
    );
    const unique = new Set(distractores);
    expect(distractores.length).toBe(unique.size);
    expect(distractores).not.toContain("ab");
  });
});

describe("PATTERNS", () => {
  it("incluye los 6 patrones documentados", () => {
    expect(PATTERNS).toHaveLength(6);
    expect(PATTERNS).toContain("acumulativo");
    expect(PATTERNS).toContain("fijo");
    expect(PATTERNS).toContain("salto");
    expect(PATTERNS).toContain("alternado");
    expect(PATTERNS).toContain("espejo");
    expect(PATTERNS).toContain("intruso");
  });
});