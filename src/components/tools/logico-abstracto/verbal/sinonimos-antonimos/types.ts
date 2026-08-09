/**
 * Spec — Sinónimos y Antónimos (Verbal).
 *
 * El banco muestra dos variantes estructuralmente idénticas:
 *  - "El sinónimo de <palabra> es"
 *  - "El antónimo de <palabra> es"
 *
 * A veces la palabra va dentro de una frase ("Le reconocí a primera mirada:
 * [...] Seleccione el sinónimo de la palabra juerguista"), lo que añade
 * dependencia contextual al ítem.
 */

import type {
  Difficulty,
  VerbalItem,
  VerbalConfigBase,
} from "../types";

/** Tipo de relación léxica. */
export type LexicalRelation = "synonym" | "antonym";

/** Subtema / palabra presentada sola o en contexto. */
export interface PromptWord {
  /** Palabra objetivo. */
  word: string;
  /** Frase contextual opcional (definir la palabra dentro de la oración). */
  contextSentence?: string;
  /** Indica si la palabra aparece también en la frase (true) o aislada (false). */
  inContext: boolean;
}

export interface SynonymAntonymConfig extends VerbalConfigBase {
  /** Synonym o antonym. */
  relation: LexicalRelation;
  /** Palabra objetivo (ya aislada o con contexto). */
  target: PromptWord;
  /** Banco léxico al que pertenece el target (para filtrar distractores). */
  domain?: string;
}

/**
 * Esquema del ítem futuro. El generador recibirá `SynonymAntonymConfig` y un
 * léxico (palabra → sinonimos → antónimos) accedido por `seed`; devolverá:
 *
 * ```ts
 * {
 *   prompt: "El sinónimo de panegírico es",
 *   options: [
 *     { label: "A", value: "ditirambo" },
 *     { label: "B", value: "tribu"   },
 *     ...
 *   ],
 *   correctIndex: 0,
 *   rationale: "Ambas comparten el significado de alabanza exagerada.",
 *   distractorExplanations: {
 *     "tribu": "grupo social, sin relación con discursos o alabanzas.",
 *     ...
 *   },
 *   difficulty: "Alto",
 *   tip: "Identifica el tono (positivo/negativo) para descartar.",
 * }
 * ```
 *
 * reutilizable: el léxico es un `Record<string, WordEntry & { synonyms: string[]; antonyms: string[] }>`
 * provisto por el módulo llamador (no incluido en este spec para no acoplar
 * datos del banco). Los distractores se generan a partir de:
 *  - antónimos cuando se pide sinónimo (y viceversa) — trampa típica,
 *  - sinónimos de menor proximidad (no del mismo campo semántico),
 *  - palabras del mismo `register` pero distinto significado.
 */
export type SynonymAntonymItem = VerbalItem<string>;