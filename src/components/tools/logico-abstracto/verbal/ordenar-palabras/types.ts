/**
 * Spec — Ordenar Palabras / "orden lógico".
 *
 * El banco presenta 8-11 palabras sueltas y pide identificar la letra inicial
 * de la N-ésima palabra cuando se reordenan en una oración con sentido.
 *
 * Variantes:
 *  - "Con qué letra comienza LA CUARTA PALABRA?"
 *  - "Con qué letra comienza LA ÚLTIMA PALABRA?"
 *  - "Elija la opción que complete la oración de acuerdo al orden sintáctico
 *     lógico" (variante con números 1..N referidos a las posiciones).
 *
 * El solucionario requiere reconstruir la oración: este spec delega la
 * verificación semántica al llamador (sin modelo lingüístico completo, el
 * generador futuro se basa en plantillas de oraciones validas + permutación
 * de sus constituyentes ordenados según el orden sintáctico castellano:
 * Sujeto + Verbo + CD + CI + CC).
 */

import type { VerbalConfigBase } from "../types";

/** Oración canónica de referencia. */
export interface CanonicalSentence {
  /** Oración completa con sentido. */
  sentence: string;
  /** Tokens en el orden correcto (palabras/sustantivos sueltos, sin signos). */
  tokens: string[];
  /** Categoría sintáctica de cada token. */
  syntax: SentenceSyntax[];
}

export interface SentenceSyntax {
  role:
    | "sujeto-nucleo"     // sustantivo principal
    | "sujeto-mod"        // adjetivo, complemento del nombre
    | "verbo"
    | "cd"                // complemento directo
    | "ci"                // complemento indirecto
    | "cc-tiempo"
    | "cc-lugar"
    | "cc-modo"
    | "cc-causa"
    | "nexo"
    | "articulo"
    | "preposicion";
}

export interface OrderWordsConfig extends VerbalConfigBase {
  /** Oración base. */
  sentence: CanonicalSentence;
  /** Posición de la palabra que se pregunta (1-indexed como en el banco). */
  askedPosition: number;
}

export interface OrderWordsItem {
  /** Enunciado: lista de palabras en orden aleatorio (separadas por " - "). */
  prompt: string;
  /** Pregunta sobre la posición pedida. */
  question: string;
  /** Opciones (cada una es una letra inicial: A, B, C, D, E). */
  options: { label: string; value: string }[];
  /** Índice correcto. */
  correctIndex: number;
  /** Oración reconstruida en orden correcto. */
  solution: string;
  /** Justificación sintáctica (qué rol cumple cada palabra). */
  rationale: string;
  /** Dificultad. */
  difficulty: "Bajo" | "Medio" | "Alto";
  /** Consejo pedagógico. */
  tip: string;
}

/**
 * Generación procedural (futuro `generador.ts`):
 *  1. Tomar una `CanonicalSentence` (banco de oraciones validadas).
 *  2. Permutar los `tokens` aleatoriamente con la `seed`.
 *  3. El índice correcto = letra inicial del token en posición `askedPosition`
 *     del `sentence.tokens` ordenado correcto.
 *  4. Distractores = letras iniciales de OTROS tokens de la misma oración.
 *
 * Solo 1 opción "peligrosa": letras repetidas entre tokens se descartan para
 * no dar dos correctos. `numOptions=5` es el default del banco.
 */