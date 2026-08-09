import type { Figure, ShapeKind, FillPattern } from "../figuras/types";

/** Tipo de relación analógica (siguiendo catálogo del subtema 9). */
export type AnalogyRelation =
  | "single-attribute"
  | "composition"
  | "rotation-overlay";

/** Atributo transformado en una analogía de un solo atributo. */
export type AnalogyAttribute =
  | "rotation"
  | "fill"
  | "scale"
  | "count"
  | "shape";

export interface AnalogyConfig {
  /** Forma base para A y C. */
  baseShape: ShapeKind;
  /** Relleno base. */
  baseFill?: FillPattern;
  /** Tipo de relación A→B que C→D debe reproducir. */
  relation: AnalogyRelation;
  /** Atributo específico si relation="single-attribute". */
  attribute?: AnalogyAttribute;
  /** Magnitud de transformación (grados, factor, etc.). */
  amount?: number;
  /** Forma distinta para C (baja similitud con A = más difícil). */
  lowSimilarity?: boolean;
  /** Nº de opciones de respuesta. */
  numOptions?: number;
  /** Semilla para reproducibilidad. */
  seed?: number;
}

export interface AnalogyItem {
  /** Par A → B. */
  pair: [Figure, Figure];
  /** Figura C (origen del segundo par). */
  c: Figure;
  /** Opciones para la figura D. */
  options: Figure[];
  /** Índice dentro de `options` de la respuesta correcta. */
  correctIndex: number;
  /** Índices distractores. */
  distractors: number[];
  /** Relación aplicada (para diagnóstico/solucionario). */
  relation: AnalogyRelation;
  /** Atributo transformado (single-attribute). */
  attribute?: AnalogyAttribute;
  /** Configuración usada. */
  config: AnalogyConfig;
}