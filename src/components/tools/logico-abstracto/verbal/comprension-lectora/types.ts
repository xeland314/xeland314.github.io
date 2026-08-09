/**
 * Spec — Comprensión Lectora.
 *
 * El banco presenta un texto de 2-8 párrafos seguido de 1-6 preguntas de
 * comprensión (literal, inferencial, valorativa, de vocabulario-contexto).
 *
 * A diferencia de los demás subtemas verbales, aquí la "fuente de verdad" es
 * el propio texto: el generador NO produce el texto, sino que recibe un texto
 * + un código de preguntas predefinidas y se limita a:
 *  - extraer afirmaciones correctas del texto,
 *  - generar distractores semánticamente plausibles pero contradichos.
 *
 * Por eso este spec es más descriptivo (configuración + contrato) y menos
 * procedimental: la implementación futura requerirá NLP ligero (regex,
 * matching de frases) o un mini banco de plantillas de preguntas por tipo.
 */

import type { VerbalConfigBase, Difficulty } from "../types";

/** Tipo de pregunta de comprensión (catálogo del banco). */
export type ComprehensionQuestionType =
  | "literal"        // hecho explícito en el texto
  | "inferential"    // deducido del texto
  | "evaluative"    // juicio crítico ( pertinente / inadecuado )
  | "vocabulary"    // significado de una palabra en contexto
  | "main-idea"      // idea central del texto
  | "title"         // título más adecuado
  | "paraphrase";   // reformular una afirmación

/** Texto fuente. */
export interface ReadingPassage {
  /** Identificador (slug) del pasaje. */
  id: string;
  /** Contenido del texto (puede tener saltos de línea). */
  text: string;
  /** Tema / área del conocimiento. */
  topic: string;
  /** Longitud aproximada en palabras. */
  wordCount: number;
}

/** Pregunta individual sobre el pasaje. */
export interface ReadingQuestionConfig {
  /** Tipo de pregunta. */
  type: ComprehensionQuestionType;
  /** Enunciado. */
  question: string;
  /** Fragmento del texto que respalda la respuesta correcta (para el solucionario). */
  evidence?: string;
  /** Dificultad de esta pregunta concreta. */
  difficulty: Difficulty;
}

export interface ReadingComprehensionConfig extends VerbalConfigBase {
  /** Pasaje de lectura. */
  passage: ReadingPassage;
  /** Preguntas que se harán sobre el pasaje. */
  questions: ReadingQuestionConfig[];
}

/** Resultado: una sola pregunta con sus opciones generadas. */
export interface ReadingQuestionItem {
  /** Enunciado de la pregunta. */
  prompt: string;
  /** Tipo de pregunta (para el UI). */
  type: ComprehensionQuestionType;
  /** Opciones de respuesta. */
  options: { label: string; value: string }[];
  /** Índice correcto. */
  correctIndex: number;
  /** Justificación con cita al texto. */
  rationale: string;
  /** Dificultad. */
  difficulty: Difficulty;
  /** Consejo pedagógico. */
  tip: string;
}

/** Unidad completa: texto + preguntas generadas. */
export interface ReadingComprehensionItem {
  /** Pasaje.texto que se muestra al estudiante. */
  passage: ReadingPassage;
  /** Preguntas generadas/compuestas a partir de `questions`. */
  items: ReadingQuestionItem[];
}

/**
 * Generación procedural (futuro `generador.ts`):
 *  - `passage` y `questions` vienen dados (no se generan aquí).
 *  - El generador simplemente empaqueta cada pregunta con sus opciones y
 *    correctIndex a partir de un diccionario externo "pregunta→opciones→correcta".
 *  - Para variantes más automatizadas se aplicaría:
 *     * type="literal": las opciones son 3 afirmaciones contradictorias con
 *       el texto + 1 afirmación respaldada por `evidence`.
 *     * type="vocabulary": las opciones son sinónimos/antónimos de una palabra
 *       del texto, mezclados con la "acepción contextual correcta".
 *
 * Por su dependencia textual, este subtema es el MENOS proceduralizable de
 * todo el bloque verbal. El spec queda aquí únicamente como contrato para el
 * frontend y para futuras integraciones con un banco myor de pasajes. */
