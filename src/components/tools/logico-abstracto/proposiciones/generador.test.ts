import { describe, it, expect } from "vitest";
import {
  generateItem,
  toSymbol,
  toPhrase,
  mulberry32,
  ALL_CONNECTOR_LIST,
  MODES,
} from "./generador";
import type { Atom, Application, Proposition, PropositionalConfig } from "./types";

// Helpers para construir AST manualmente en los tests
function atom(v: string): Proposition {
  return { type: "atom", variable: v };
}
function app(c: string, ops: Proposition[]): Proposition {
  return { type: "application", connector: c as any, operands: ops };
}

describe("toSymbol", () => {
  it("átomo: devuelve la variable", () => {
    expect(toSymbol(atom("p"))).toBe("p");
  });

  it("negación: prefijo ~", () => {
    expect(toSymbol(app("~", [atom("p")]))).toBe("~p");
  });

  it("implicación: (p -> q)", () => {
    expect(toSymbol(app("->", [atom("p"), atom("q")]))).toBe("(p -> q)");
  });

  it("conjunción: (p & q)", () => {
    expect(toSymbol(app("&", [atom("p"), atom("q")]))).toBe("(p & q)");
  });

  it("anidada: (p | (q & r))", () => {
    const t: Application = {
      type: "application",
      connector: "|",
      operands: [atom("p"), app("&", [atom("q"), atom("r")])],
    };
    expect(toSymbol(t)).toBe("(p | (q & r))");
  });
});

describe("toPhrase", () => {
  it("átomo: usa el diccionario por defecto", () => {
    expect(toPhrase(atom("p"))).toBe("El sistema está actualizado");
  });

  it("negación: 'no <frase>'", () => {
    expect(toPhrase(app("~", [atom("p")]))).toBe("no El sistema está actualizado");
  });

  it("implicación: 'Si X, entonces Y'", () => {
    const r = toPhrase(app("->", [atom("p"), atom("q")]));
    expect(r).toContain("Si");
    expect(r).toContain("entonces");
  });

  it("acepta diccionario custom", () => {
    const dict = { p: "Llueve", q: "Me mojo" };
    expect(toPhrase(atom("p"), dict)).toBe("Llueve");
  });

  it("bicondicional: 'X si y solo si Y'", () => {
    const r = toPhrase(app("<->", [atom("p"), atom("q")]));
    expect(r).toContain("si y solo si");
  });
});

describe("generateItem", () => {
  it("produce prompt + options + correctIndex", () => {
    const config: PropositionalConfig = {
      mode: "to-symbol",
      numVars: 2,
      depth: 1,
      seed: 1,
    };
    const item = generateItem(config);
    expect(item.prompt).toBeTruthy();
    expect(item.options).toHaveLength(4);
    expect(item.correctIndex).toBeGreaterThanOrEqual(0);
    expect(item.correctIndex).toBeLessThan(4);
    expect(item.truth).toBeDefined();
  });

  it("mode=to-symbol: prompt es frase en español", () => {
    const config: PropositionalConfig = {
      mode: "to-symbol",
      numVars: 2,
      depth: 1,
      seed: 2,
    };
    const item = generateItem(config);
    // La frase no debería contener símbolos lógicos como ( ) -> &
    expect(item.prompt).not.toMatch(/^\(.*\)$/);
  });

  it("mode=to-phrase: prompt es expresión simbólica", () => {
    const config: PropositionalConfig = {
      mode: "to-phrase",
      numVars: 2,
      depth: 2,
      seed: 3,
    };
    const item = generateItem(config);
    expect(item.prompt).toMatch(/[pqrs]/);
  });

  it("la opción correcta coincide con el truth", () => {
    const config: PropositionalConfig = {
      mode: "to-symbol",
      numVars: 2,
      depth: 1,
      seed: 5,
    };
    const item = generateItem(config);
    const correct = item.options[item.correctIndex];
    expect(correct.symbol).toBe(toSymbol(item.truth));
    expect(correct.phrase).toBe(toPhrase(item.truth));
  });

  it("los distractores son distintos al correcto", () => {
    const config: PropositionalConfig = {
      mode: "to-phrase",
      numVars: 2,
      depth: 2,
      seed: 7,
      numOptions: 5,
    };
    const item = generateItem(config);
    expect(item.options).toHaveLength(5);
    const correctSym = item.options[item.correctIndex].symbol;
    const allSyms = item.options.map((o) => o.symbol);
    const uniqueSyms = new Set(allSyms);
    expect(uniqueSyms.size).toBe(allSyms.length);
  });

  it("es determinista con la misma seed", () => {
    const config: PropositionalConfig = {
      mode: "to-symbol",
      numVars: 3,
      depth: 2,
      seed: 42,
    };
    const a = generateItem(config);
    const b = generateItem(config);
    expect(a.prompt).toBe(b.prompt);
    expect(a.correctIndex).toBe(b.correctIndex);
    expect(a.options[a.correctIndex].symbol).toBe(b.options[b.correctIndex].symbol);
  });

  it("respeta connectors limitado", () => {
    const config: PropositionalConfig = {
      mode: "to-symbol",
      numVars: 2,
      depth: 1,
      connectors: ["&", "|"],
      seed: 11,
    };
    const item = generateItem(config);
    const sym = toSymbol(item.truth);
    expect(sym).toMatch(/[&|]/);
    expect(sym).not.toContain("->");
    expect(sym).not.toContain("^");
    expect(sym).not.toContain("<->");
  });

  it("ambos modos producen ítems válidos para todas las profundidades", () => {
    for (const mode of MODES) {
      for (const depth of [1, 2, 3]) {
        const config: PropositionalConfig = {
          mode,
          numVars: 3,
          depth,
          seed: 99,
        };
        const item = generateItem(config);
        expect(item.options.length).toBeGreaterThan(0);
        expect(item.options[item.correctIndex].symbol).toBeTruthy();
      }
    }
  });
});

describe("ALL_CONNECTOR_LIST y MODES", () => {
  it("ALL_CONNECTOR_LIST contiene los 6 conectores", () => {
    expect(ALL_CONNECTOR_LIST).toHaveLength(6);
    expect(ALL_CONNECTOR_LIST).toContain("&");
    expect(ALL_CONNECTOR_LIST).toContain("|");
    expect(ALL_CONNECTOR_LIST).toContain("^");
    expect(ALL_CONNECTOR_LIST).toContain("->");
    expect(ALL_CONNECTOR_LIST).toContain("<->");
    expect(ALL_CONNECTOR_LIST).toContain("~");
  });

  it("MODES contiene ambas direcciones", () => {
    expect(MODES).toContain("to-symbol");
    expect(MODES).toContain("to-phrase");
  });
});

describe("mulberry32", () => {
  it("misma seed produce misma secuencia", () => {
    const r1 = mulberry32(123);
    const r2 = mulberry32(123);
    expect(r1()).toBe(r2());
    expect(r1()).toBe(r2());
  });
});