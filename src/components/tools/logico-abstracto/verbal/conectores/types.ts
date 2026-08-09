/**
 * Spec — Conectores Lógicos ("Complete la oración con los conectores").
 *
 * El banco presenta una oración con 2-6 huecos que deben rellenarse con
 * conectores lógicos. Las opciones son combinaciones completas de todos los
 * huecos ("para - pues - o", "sino - debido a - por lo cual", etc.).
 *
 * La estructura es similar a lógica proposicional pero en español natural:
 * cada conector tiene valor semántico (causa, oposición, condición, tiempo,
 * consecuencia, finalidad) y su combinación debe respetar la coherencia del
 * enunciado.
 */

import type { VerbalConfigBase } from "../types";

/** Tipo semántico del conector. */
export type ConnectorSemantics =
  | "causa"          // porque, ya que, pues, debido a
  | "oposicion"      // pero, sino (que), sin embargo, no obstante
  | "condicion"      // si, solo si, con tal que
  | "tiempo"         // cuando, mientras, antes, después, luego
  | "consecuencia"   // por lo tanto, por consiguiente, así que
  | "finalidad"      // para que, con el fin de, a fin de
  | "adicion"        // además, asimismo, también
  | "disyuncion"    // o, ya... ya
  | "ejemplificacion"// como, tales como, por ejemplo
  | "concesion"      // aunque, a pesar de
  | "comparacion"    // así como, de igual modo
  | "resumen";       // en síntesis, en resumen, es decir

/** Conector individual con su categoría semántica. */
export interface ConnectorLexeme {
  /** Texto en español. */
  text: string;
  /** Tipo semántico. */
  semantics: ConnectorSemantics;
}

/** Hueco dentro de la oración. */
export interface ConnectorSlot {
  /** Posición 0-indexed dentro del enunciado (tras split). */
  index: number;
  /** Categoría semántica requerida en este hueco. */
  requiredSemantics: ConnectorSemantics;
}

export interface ConnectorConfig extends VerbalConfigBase {
  /** Oración plantilla con marcadores de huecos (`___`). */
  template: string;
  /** Huecos con su semántica requerida. */
  slots: ConnectorSlot[];
  /** Nº de huecos en la oración. */
  numSlots: number;
}

/**
 * Solución del ítem: combinación de conectores que rellena los huecos de forma
 * coherente. Es el ground truth del solucionario.
 */
export interface ConnectorSolution {
  /** Conector asignado a cada hueco (alineado con `slots`). */
  filled: ConnectorLexeme[];
}

/**
 * Cada opción de respuesta es una combinación completa de conectores (uno por
 * hueco). El solucionario se deriva de la coherencia semántica entre los
 * huecos y entre el conector y su contexto oracional.
 */
export interface ConnectorItem {
  /** Enunciado con huecos. */
  prompt: string;
  /** Opciones, cada una combina conectores para todos los huecos. */
  options: { label: string; value: string[] }[];
  /** Índice correcto. */
  correctIndex: number;
  /** Justificación semántica. */
  rationale: string;
  /** Justificación de cada distractor: "mezcla causa con oposición", etc. */
  distractorExplanations: Record<string, string>;
  /** Dificultad. */
  difficulty: "Bajo" | "Medio" | "Alto";
  /** Consejo pedagógico recurrente. */
  tip: string;
}

/**
 * Generación procedural (futuro `generador.ts`):
 *  - Plantilla de oración con N huecos.
 *  - Cada hueco pide una semántica (e.g. el hueco 2 pide "causa").
 *  - La opción correcta asigna a cada hueco un conector de la semántica
 *    requerida.
 *  - Distractores: perturban uno o más huecos con semántica equivocada
 *    (e.g. un hueco de "oposición" relleno con "causa").
 *  - Mantener la coherencia global: si el primer conector es "sino", el
 *    contexto previo debe negar ("no solo... sino").
 */