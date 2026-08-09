import type { Figure, ShapeKind, FillPattern } from "../figuras/types";

/** Tipo de regla que gobierna una matriz gráfica (subtema 12). */
export type MatrixRuleType =
  /** En cada fila/columna aparece cada tipo exactamente una vez (estilo Sudoku). */
  | "permutation"
  /** La regla avanza (rota/escala/suma elementos) en una sola dirección. */
  | "progression"
  /** Secuencia aritmética disfrazada de figura. */
  | "arithmetic"
  /** Regla de fila distinta a la regla de columna (mayor dificultad). */
  | "combined";

/** Atributo que la regla transforma. */
export type MatrixAttribute =
  | "shape"
  | "rotation"
  | "fill"
  | "count";

export interface MatrixConfig {
  /** Dimensión de la matriz (3 = 3x3, casi universal). */
  dimension: number;
  /** Tipo de regla. */
  ruleType: MatrixRuleType;
  /** Atributo afectado por la regla. */
  attribute?: MatrixAttribute;
  /** Nº de tipos usados en la permutación (suele ser == dimension). */
  numTypes?: number;
  /** Magnitud de la transformación (grados, factor, etc.). */
  amount?: number;
  /** Posición {row,col} de la celda vacía (índices base 0). */
  emptyCell?: { row: number; col: number };
  /** Nº de opciones de respuesta. */
  numOptions?: number;
  /** Semilla para reproducibilidad. */
  seed?: number;
}

export interface MatrixItem {
  /** Grid NxN de figuras; la celda vacía es `null`. */
  grid: (Figure | null)[][];
  /** Opciones para rellenar la celda vacía. */
  options: Figure[];
  /** Índice dentro de `options` de la respuesta correcta. */
  correctIndex: number;
  /** Índices distractores. */
  distractors: number[];
  /** Posición de la celda vacía. */
  emptyCell: { row: number; col: number };
  /** Configuración usada. */
  config: MatrixConfig;
}