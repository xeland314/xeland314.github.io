/**
 * Spec — Probabilidad.
 *
 * Variantes del banco:
 *  - "En una urna hay N bolas (R rojas, N negras, ...). ¿Prob. de sacar
 *    una bola roja? ¿Y dos seguidas sin reposición?"
 *  - Variante de urna con orden y combinaciones.
 *  - Eventos independientes (dados, monedas) con conjuntos más amplios.
 *
 * El bloque es proceduralizable mediante parámetros discretos:
 *  - tipos de objetos (bolas numeradas/coloreadas)
 *  - tamaño del conjunto
 *  - condición de éxito
 *  - con/sin reposición
 */

import type { MathItem, MathConfigBase } from "../types";

/** Tipo de experimento probabilístico. */
export type ProbabilityKind =
  | "urn-without-replacement"  // bolas sin reemplazo
  | "urn-with-replacement"    // bolas con reemplazo
  | "dice"                    // dados
  | "coins"                   // monedas
  | "combined-events";        // multiplicación de prob. independientes

/** Composición de la urna: tipos + conteos. */
export interface UrnComposition {
  /** Tipos de objetos (p. ej. ["roja", "negra", "verde"]). */
  types: string[];
  /** Cantidad de cada tipo, alineado con `types`. */
  counts: number[];
}

/** Condición de éxito: cuántos y de qué tipo sacar. */
export interface SuccessCondition {
  /** Nº de extracciones. */
  draws: number;
  /** Eventos de éxito: cada uno nombra un tipo y una cantidad. */
  targets: { type: string; count: number }[];
  /** ¿Importa el orden? (true si sí — usa permutaciones, false usa combinatoria). */
  ordered: boolean;
}

export interface ProbabilityConfig extends MathConfigBase {
  kind: ProbabilityKind;
  /** Composición de la urna (para variantes urn-*). */
  urn?: UrnComposition;
  /** Condición de éxito. */
  success: SuccessCondition;
  /** Para dados: Nº de dados, caras y suma objetivo. */
  dice?: { numDice: number; faces: number; targetSum?: number };
}

/** Resultado del ítem: respuesta fraccionaria o porcentual ("1/12", "8.3%"). */
export type ProbabilityItem = MathItem<string>;

/**
 * Gener procedural (futuro `generador.ts`):
 *  - Caso favorable / casos posibles con combinaciones/permutaciones.
 *  - Para urna sin reemplazo: producto de fracciones decrecientes.
 *  - Para urna con reemplazo: probabilidad binomial.
 *  - Distractores:
 *     * Aplicar "con reemplazo" cuando se pidió "sin" (y viceversa).
 *     * Olvidar el coeficiente combinatorio C(n,k) (solo enumerar orden).
 *     * Confundir probabilidad con casos favorables sin dividir.
 *  - El solucionario mostrará la fracción NO simplificada primero, luego la
 *    reducción (p. ej. 12/52 → 3/13). Esto facilita seguir el @R del banco. */
