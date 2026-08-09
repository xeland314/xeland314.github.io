import type { PipCount, DominoTile, PatternRule } from "../../dominos/types";

/**
 * Capa de "ítem de examen" sobre el motor `dominos/pattern.ts` existente.
 *
 * El motor base produce una secuencia de fichas siguiendo una regla. Esta
 * capa se encarga de:
 *  - marcar una ficha como "incógnita" para el estudiante,
 *  - generar N opciones de respuesta (1 correcta + distractores),
 *  - barajar las opciones y devolver el correctIndex.
 *
 * Sigue el patrón de los demás subtemas de logico-abstracto: PRNG `mulberry32`,
 * determinismo via `seed`, sin dependencias del DOM.
 */

export interface DominoSequenceItem {
  /** Secuencia de fichas mostrada al estudiante (la última es la incógnita). */
  shown: DominoTile[];
  /** Opciones de respuesta (PipCounts "top,bottom"). */
  options: DominoTile[];
  /** Índice correcto dentro de `options`. */
  correctIndex: number;
  /** Índices distractores. */
  distractors: number[];
  /** Regla usada (velada para el solucionario). */
  rule: PatternRule;
  /** Posición de la incógnita dentro de `shown` (típicamente el último). */
  hiddenIndex: number;
}

export interface DominoSequenceConfig {
  /** Regla del patrón (idéntica a PatternGenerationConfig.rule). */
  rule: PatternRule;
  /** Longitud total (incluyendo la incógnita). */
  length: number;
  /** Posición de la incógnita (default = length - 1). */
  hiddenIndex?: number;
  /** Inicio superior. */
  startTop?: PipCount;
  /** Inicio inferior. */
  startBottom?: PipCount;
  /** Nº de opciones de respuesta. */
  numOptions?: number;
  /** Semilla para reproducibilidad. */
  seed?: number;
}