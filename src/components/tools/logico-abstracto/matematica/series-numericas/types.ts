/**
 * Spec — Series Numéricas.
 *
 * El banco incluye variantes:
 *  - "Completa la serie: C4, C5, C7, C10, ..."
 *  - "Complete la serie: B2E, D4G, F6I, ..."
 *  - "Halla el término que continúa: 2, 6, 12, 20, ..."
 *  - "Insertar 3 términos entre 5 y 47 para que sea aritmética"
 *  - "El primer término de una progresión geométrica es..."
 *
 * Es el subtema más proceduralizable: la generación se reduce a elegir un
 * patrón y computar los términos siguientes.
 */

import type { MathItem, MathConfigBase } from "../types";

/** Tipo de patrón numérico / alfanumérico. */
export type NumericPatternKind =
  | "arithmetic"           // a_n = a_1 + (n-1)·d
  | "geometric"            // a_n = a_1 · r^(n-1)
  | "quadratic"            // a_n = A·n² + B·n + C (segundas diferencias const.)
  | "fibonacci-like"       // a_n = a_{n-1} + a_{n-2}
  | "alternating"          // dos subseries intercaladas
  | "letter-encoded"      // C4, D6, F8... (letra avanza, número progresa)
  | "triple-letter"       // B2E, D4G, F6I, ... (par de letras + número)
  | "insert-terms"        // "insertar N términos entre A y B para que sea aritmética"
  | "modular";            // sucesión cíclica módulo k

export interface NumericPatternConfig extends MathConfigBase {
  /** Patrón a generar. */
  kind: NumericPatternKind;
  /** Nº de términos visibles (típicamente 4-5). */
  numVisible: number;
  /** Se pide el siguiente (1) o varios (k) términos. */
  askTerms: number;
  /** Parámetros del patrón (dependen de `kind`). */
  params: NumericPatternParams;
  /** Indica si se pregunta por "insertar" N términos entre dos dados. */
  insertMode?: boolean;
}

/** Parámetros variantes según `kind`. */
export type NumericPatternParams =
  | { kind: "arithmetic"; a1: number; d: number }
  | { kind: "geometric"; a1: number; r: number }
  | { kind: "quadratic"; a: number; b: number; c: number }
  | { kind: "fibonacci-like"; a1: number; a2: number }
  | { kind: "alternating"; a1: number; dA: number; b1: number; dB: number }
  | { kind: "letter-encoded"; startLetterCode: number; startNum: number; letterStep: number; numStep: number; letterOffsetStrategy: "ascii" | "spanish-alphabet" }
  | { kind: "triple-letter"; startLeft: number; startMid: number; startRight: number; letterStep: number; numStep: number }
  | { kind: "insert-terms"; firstTerm: number; lastTerm: number; numToInsert: number; sequenceType: "arithmetic" | "geometric" }
  | { kind: "modular"; a1: number; step: number; mod: number };

/** Resultado del ítem. La `value` de cada opción es un string ("14", "D8", ...). */
export type NumericSeriesItem = MathItem<string>;

/**
 * Generación procedural (futuro `generador.ts`):
 *  - Calcular los términos según `params.kind` y `numVisible`.
 *  - correctTerm = término siguiente tras los visibles.
 *  - distractores = términos calculados con d/r errados (±1) o saltando un
 *    paso; para variantes alfanuméricas, alterar la letra o el número por
 *    separado (mantiene apariencia plausible).
 *  - `insertMode=true` cambia el prompt a "Insertar N términos entre A y B":
 *    se calcula d aritmético entre los extremos; el distractor usa una razón
 *    geométrica en lugar de aritmética (trampa frecuente en el banco).
 */