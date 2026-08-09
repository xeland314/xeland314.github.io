import type { Figure, ShapeKind, FillPattern } from "../figuras/types";

/** Dirección de rotación. */
export type RotationDirection = "clockwise" | "counterclockwise";

/** Configuración para generar un ítem de rotación mental. */
export interface MentalRotationConfig {
  /** Forma base a rotar. */
  baseShape: ShapeKind;
  /** Patrón de relleno de la figura. */
  baseFill?: FillPattern;
  /** Ángulo objetivo en grados (positivo). */
  angleDegrees: number;
  /** Dirección de rotación. */
  direction: RotationDirection;
  /** Nº de opciones de respuesta. */
  numOptions?: number;
  /** Semilla para reproducibilidad. */
  seed?: number;
}

/** Resultado de generar un ítem de rotación mental. */
export interface MentalRotationItem {
  /** Figura base que se muestra al estudiante. */
  base: Figure;
  /** Ángulo objetivo en grados. */
  angleDegrees: number;
  /** Dirección de rotación. */
  direction: RotationDirection;
  /** Opciones de respuesta (figuras rotadas). */
  options: Figure[];
  /** Índice dentro de `options` de la respuesta correcta. */
  correctIndex: number;
  /** Índices distractores. */
  distractors: number[];
  /** Configuración usada. */
  config: MentalRotationConfig;
}