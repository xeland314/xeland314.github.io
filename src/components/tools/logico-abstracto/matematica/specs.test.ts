import { describe, it, expect } from "vitest";

// Smoke test: importa todos los spec files de matematica para que vitest
// valide que TypeScript los transforma sin errores.

import * as matematicaCommon from "./types";
import * as series from "./series-numericas/types";
import * as proporciones from "./proporciones/types";
import * as polinomios from "./polinomios/types";
import * as probabilidad from "./probabilidad/types";
import * as sistemas from "./sistemas-ecuaciones/types";
import * as geometria from "./geometria-basica/types";

describe("specs matematica — compilan", () => {
  it("matematica/types exporta tipos compartidos", () => {
    expect(matematicaCommon).toBeDefined();
  });

  it("series-numericas compila", () => {
    expect(series).toBeDefined();
  });

  it("proporciones compila", () => {
    expect(proporciones).toBeDefined();
  });

  it("polinomios compila", () => {
    expect(polinomios).toBeDefined();
  });

  it("probabilidad compila", () => {
    expect(probabilidad).toBeDefined();
  });

  it("sistemas-ecuaciones compila", () => {
    expect(sistemas).toBeDefined();
  });

  it("geometria-basica compila", () => {
    expect(geometria).toBeDefined();
  });
});