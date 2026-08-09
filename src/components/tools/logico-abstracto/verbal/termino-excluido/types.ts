/**
 * Spec — Término Excluido / "palabra que no pertenece al grupo" (Verbal).
 *
 * Se presenta una "palabra guía" + 4 alternativas. 3 comparten una relación
 * semántica con la guía y 1 la rompe. El estudiante debe identificar el intruso.
 *
 * Ejemplos del banco:
 *  - Guía "Océano"; intruso "estanque" (artificial vs natural).
 *  - Guía "Joven"; intruso "viejo" (antónimo vs sinónimos/derivados).
 *  - Guía "Amor"; intruso "odio" (carga afectiva invertida).
 */

import type {
  VerbalItem,
  VerbalConfigBase,
} from "../types";

/** Criterio que define al grupo ("porqué" los 3 cumplen y el intruso no). */
export interface ExclusionCriterion {
  /** Descripción humana: "masas de agua naturales", "etapas tempranas", etc. */
  label: string;
  /** Tipo de relación: sinonimia, antinomia, categórica, funcional... */
  kind:
    | "category"
    | "synonym"
    | "antonym"
    | "part-of"
    | "function"
    | "formal";
}

export interface TermExcludedConfig extends VerbalConfigBase {
  /** Palabra guía presentada en el enunciado. */
  guideWord: string;
  /** Criterio que define al grupo (los N-1 comparten, el intruso no). */
  criterion: ExclusionCriterion;
}

/**
 * Item futuro. Reutiliza `VerbalItem<string>` ya que las opciones son palabras.
 *
 * Patrón de generación procedural:
 *  1. Elegir `guideWord` de un léxico categorizado.
 *  2. Tomar 3 palabras del mismo dominio/categoría que la guía (criterio).
 *  3. Tomar 1 palabra de un dominio distinto (o antónimo) — el intruso.
 *  4. Barajar las 4 opciones.
 *  5. `distractorExplanations` se llena con la justificación porqué cada
 *     opción NO es intruso (cumple el criterio); el correcto (intruso) no.
 *
 * Distractor 5: el banco permite 5 opciones (A-E); el `numOptions` controla.
 */
export type TermExcludedItem = VerbalItem<string>;