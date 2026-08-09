/**
 * Spec — Analogía Verbal ("X es a Y como ...").
 *
 * Ejemplos del banco:
 *  - "____ es a palmera como uva es a ____"  (analogía incompleta doble)
 *  - "Peluca es a cabeza como ..."           (par base → opción)
 *  - "Fábula es a sábado como ..."           (relación formal/acentual)
 *
 * La riqueza del subtema está en que la relación A→B puede ser de varios tipos
 * (sinonimia, función, forma acentual, parte-todo, antonimia, etc.).
 */

import type {
  VerbalItem,
  VerbalConfigBase,
} from "../types";

/** Tipo de relación analógica (catálogo de los ejemplos del banco). */
export type AnalogyRelationKind =
  | "function"        // accesorio-parte (peluca-cabeza)
  | "synonym"         // aval-garantía → veraz-sincero
  | "antonym"         // el par base es antónimo, C→D también lo es
  | "part-of"         // producto-planta (dátil-palmera, uva-vid)
  | "agent-action"    // indagar-detective → prever-vidente
  | "formal-accentual"// fábula-sábado → maíz-raíz (acento/ritmo)
  | "category"
  | "ordinal-temporal";

/** Par A→B con metadatos de relación. */
export interface AnalogyPair {
  /** Elemento A (origen). */
  a: string;
  /** Elemento B (destino). */
  b: string;
  /** Tipo de relación analógica. */
  relation: AnalogyRelationKind;
}

/** Formato del enunciado. */
export type AnalogyPromptFormat =
  // "X es a Y como [opción]"
  | "base-to-option"
  // "____ es a Y como U es a ____" (doble blanco, rellenada por opción A,B)
  | "double-blank";

export interface AnalogyConfig extends VerbalConfigBase {
  /** Par A→B base. */
  pair: AnalogyPair;
  /** Modo de presentación. */
  format: AnalogyPromptFormat;
  /** En formato double-blank: la parte C del enunciado. */
  c?: string;
}

/**
 * Item futuro. La `value` de cada opción es:
 *  - "base-to-option": una sola palabra (p. ej. "zapato es a pie").
 *  - "double-blank":   un par "A - B" (p. ej. "dátil - vid").
 *
 * Distractores procedurales:
 *  - Pares con una relación *cercana* pero no la misma (sinonimia ↔ función).
 *  - Pares donde solo uno de los dos términos cumple (trampa freq en el banco).
 *  - Pares con la misma palabra pero relación distinta (verificación cruzada).
 */
export type AnalogyItem = VerbalItem<string>;