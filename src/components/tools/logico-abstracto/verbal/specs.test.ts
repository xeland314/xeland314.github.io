import { describe, it, expect } from "vitest";

// Smoke test: importa todos los spec files para que vitest valide que
// TypeScript los transforma sin errores. Como son solo `types.ts` (definiciones)
// no hay runtime behavior que verificar, pero confirma que el spec compila.

import * as verbalCommon from "./types";
import * as sinonimos from "./sinonimos-antonimos/types";
import * as termino from "./termino-excluido/types";
import * as analogia from "./analogia-verbal/types";
import * as conectores from "./conectores/types";
import * as ordenar from "./ordenar-palabras/types";
import * as comprension from "./comprension-lectora/types";

describe("specs verbal — compilan", () => {
  it("verbal/types exporta tipos compartidos", () => {
    expect(verbalCommon).toBeDefined();
  });

  it("sinonimos-antonimos compila", () => {
    expect(sinonimos).toBeDefined();
  });

  it("termino-excluido compila", () => {
    expect(termino).toBeDefined();
  });

  it("analogia-verbal compila", () => {
    expect(analogia).toBeDefined();
  });

  it("conectores compila", () => {
    expect(conectores).toBeDefined();
  });

  it("ordenar-palabras compila", () => {
    expect(ordenar).toBeDefined();
  });

  it("comprensión-lectora compila", () => {
    expect(comprension).toBeDefined();
  });
});