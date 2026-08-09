import { describe, it, expect } from "vitest";
import {
  generateItem,
  buildString,
  applyDifference,
  findConfusable,
  findDifferences,
  estimateDifficulty,
  DIFFERENCE_KINDS,
  ALPHABET_KINDS,
  STRUCTURES,
  mulberry32,
} from "./generador";
import { ALPHABETS, CONFUSABLE_PAIRS } from "./types";
import type { DiscriminationConfig } from "./types";

describe("generateItem — par idéntico", () => {
  it("numDifferences=0 produce cadenas iguales y esIgual=true", () => {
    const config: DiscriminationConfig = {
      length: 20,
      alphabet: "letters",
      numDifferences: 0,
      differenceType: "substitution",
      position: "middle",
      seed: 1,
    };
    const item = generateItem(config);
    expect(item.cadenaA).toBe(item.cadenaB);
    expect(item.esIgual).toBe(true);
    expect(item.posicionDiferencia).toEqual([]);
  });
});

describe("generateItem — sustitución", () => {
  it("numDifferences=1 introduce exactamente 1 diferencia", () => {
    const config: DiscriminationConfig = {
      length: 20,
      alphabet: "letters",
      numDifferences: 1,
      differenceType: "substitution",
      position: "middle",
      seed: 5,
    };
    const item = generateItem(config);
    expect(item.esIgual).toBe(false);
    expect(item.posicionDiferencia).toHaveLength(1);
    expect(findDifferences(item.cadenaA, item.cadenaB).length).toBeGreaterThanOrEqual(1);
  });

  it("position=middle coloca la diferencia en el medio", () => {
    const config: DiscriminationConfig = {
      length: 20,
      alphabet: "letters",
      numDifferences: 1,
      differenceType: "substitution",
      position: "middle",
      seed: 99,
    };
    const item = generateItem(config);
    const pos = item.posicionDiferencia[0];
    expect(pos).toBe(10);
  });

  it("position=start coloca la diferencia en la posición 0", () => {
    const config: DiscriminationConfig = {
      length: 10,
      alphabet: "letters",
      numDifferences: 1,
      differenceType: "substitution",
      position: "start",
      seed: 3,
    };
    const item = generateItem(config);
    expect(item.posicionDiferencia[0]).toBe(0);
  });

  it("numDifferences=2 introduce 2 diferencias", () => {
    const config: DiscriminationConfig = {
      length: 30,
      alphabet: "letters",
      numDifferences: 2,
      differenceType: "substitution",
      position: "random",
      seed: 7,
    };
    const item = generateItem(config);
    expect(item.posicionDiferencia.length).toBeGreaterThanOrEqual(2);
  });
});

describe("generateItem — tipos de diferencia", () => {
  it("inserción añade un carácter", () => {
    const config: DiscriminationConfig = {
      length: 10,
      alphabet: "letters",
      numDifferences: 1,
      differenceType: "insertion",
      position: "end",
      seed: 12,
    };
    const item = generateItem(config);
    expect(item.cadenaB.length).toBe(item.cadenaA.length + 1);
  });

  it("eliminación quita un carácter", () => {
    const config: DiscriminationConfig = {
      length: 10,
      alphabet: "letters",
      numDifferences: 1,
      differenceType: "deletion",
      position: "middle",
      seed: 21,
    };
    const item = generateItem(config);
    expect(item.cadenaB.length).toBe(item.cadenaA.length - 1);
  });

  it("swap-adjacente mantiene la longitud", () => {
    const config: DiscriminationConfig = {
      length: 10,
      alphabet: "letters",
      numDifferences: 1,
      differenceType: "swap-adjacent",
      position: "middle",
      seed: 33,
    };
    const item = generateItem(config);
    expect(item.cadenaB.length).toBe(item.cadenaA.length);
  });

  it("confusable usa un par de la tabla de confusiones", () => {
    const config: DiscriminationConfig = {
      length: 10,
      alphabet: "letters-special",
      numDifferences: 1,
      differenceType: "confusable",
      position: "random",
      seed: 100,
    };
    const item = generateItem(config);
    expect(item.cadenaA).not.toBe(item.cadenaB);
  });
});

describe("generateItem — estructuras (cadenas largas)", () => {
  it("repeated-block repite un bloque", () => {
    const config: DiscriminationConfig = {
      length: 16,
      alphabet: "letters",
      numDifferences: 0,
      differenceType: "substitution",
      position: "middle",
      structure: "repeated-block",
      blockSize: 4,
      seed: 2,
    };
    const item = generateItem(config);
    expect(item.cadenaA.length).toBe(16);
    const block = item.cadenaA.slice(0, 4);
    expect(item.cadenaA.slice(4, 8)).toBe(block);
    expect(item.cadenaA.slice(8, 12)).toBe(block);
  });

  it("repeated-block-separated inserta separadores", () => {
    const config: DiscriminationConfig = {
      length: 14,
      alphabet: "letters",
      numDifferences: 0,
      differenceType: "substitution",
      position: "middle",
      structure: "repeated-block-separated",
      blockSize: 4,
      separator: "-",
      seed: 8,
    };
    const item = generateItem(config);
    expect(item.cadenaA).toContain("-");
  });
});

describe("buildString", () => {
  it("random genera una cadena del tamaño esperado", () => {
    const s = buildString(20, ALPHABETS.letters, mulberry32(1), "random");
    expect(s.length).toBe(20);
  });

  it("respects longitudes límite", () => {
    expect(buildString(0, ALPHABETS.letters, mulberry32(1))).toBe("");
  });
});

describe("applyDifference", () => {
  it("substitution cambia exactamente un char", () => {
    const rng = mulberry32(50);
    const { result, diffIndex } = applyDifference(
      "abcde",
      2,
      "substitution",
      ALPHABETS.letters,
      rng,
    );
    expect(result.length).toBe(5);
    expect(result[2]).not.toBe("c");
    expect(diffIndex).toBe(2);
  });
});

describe("findConfusable", () => {
  it("encuentra un par confusable para 0", () => {
    const rng = mulberry32(1);
    const result = findConfusable("0", rng);
    expect(result).toBe("O");
  });

  it("devuelve null para un carácter sin par confusable", () => {
    const rng = mulberry32(1);
    const result = findConfusable("x", rng);
    expect(result).toBeNull();
  });
});

describe("CONFUSABLE_PAIRS", () => {
  it("contiene los pares documentados en el README", () => {
    const asPairs = CONFUSABLE_PAIRS.map((p) => p.join("|"));
    expect(asPairs).toContain("0|O");
    expect(asPairs).toContain("1|l");
    expect(asPairs).toContain("8|B");
  });
});

describe("findDifferences", () => {
  it("detecta todas las diferencias por sustitución", () => {
    const a = "abcde";
    const b = "axcye";
    expect(findDifferences(a, b)).toEqual([1, 3]);
  });

  it("detecta diferencias de longitud", () => {
    const a = "abcd";
    const b = "abc";
    expect(findDifferences(a, b)).toEqual([3]);
  });

  it("devuelve [] para cadenas idénticas", () => {
    expect(findDifferences("abc", "abc")).toEqual([]);
  });
});

describe("estimateDifficulty", () => {
  it("longitud corta es baja", () => {
    expect(estimateDifficulty(10, "start")).toBe("baja");
  });

  it("longitud media en posición media es media", () => {
    expect(estimateDifficulty(25, "middle")).toBe("media");
  });

  it("longitud larga en posición media es alta", () => {
    expect(estimateDifficulty(70, "middle")).toBe("alta");
  });
});

describe("listas exportadas", () => {
  it("DIFFERENCE_KINDS contiene los 5 tipos", () => {
    expect(DIFFERENCE_KINDS).toHaveLength(5);
    expect(DIFFERENCE_KINDS).toContain("confusable");
  });

  it("ALPHABET_KINDS contiene los 4 alfabetos", () => {
    expect(ALPHABET_KINDS).toHaveLength(4);
  });

  it("STRUCTURES contiene las 3 estructuras", () => {
    expect(STRUCTURES).toHaveLength(3);
  });
});