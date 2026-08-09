import type {
  Figure,
  TransformationStep,
  ShapeKind,
  FillPattern,
  FigureSamples,
} from "../figuras/types";

/** Tipo de patrón que define una secuencia gráfica. */
export type SeriesPatternType =
  | "rotation"
  | "addition"
  | "removal"
  | "translation"
  | "scale"
  | "fill"
  | "combined";

/** Configuración de generación para un ítem de series gráficas. */
export interface SeriesConfig {
  /** Forma base de la primera figura. */
  baseShape: ShapeKind;
  /** Patrón de relleno inicial. */
  baseFill?: FillPattern;
  /** Tipo de transformación dominante. */
  pattern: SeriesPatternType;
  /** Número de figuras visibles (3-5 típicamente). */
  numVisible: number;
  /** Cantidad de pasos "redondos" (90°, +1) para reducir dificultad. */
  roundSteps?: boolean;
  /** Número de reglas simultáneas (1 o 2). */
  numRules?: 1 | 2;
  /** Número de opciones de respuesta. */
  numOptions?: number;
}

/** Resultado de generar un ítem de series gráficas. */
export interface SeriesItem extends FigureSamples {
  /** Pasos aplicados en cada salto (para diagnóstico/solucionario). */
  steps: TransformationStep[];
  /** Configuración usada. */
  config: SeriesConfig;
}