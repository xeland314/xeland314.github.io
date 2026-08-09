/**
 * Spec — Polinomios y operaciones algebraicas.
 *
 * Variantes del banco:
 *  - "Ordenar las expresiones algebraicas de menor a mayor según su grado"
 *    (numeración según suma de exponentes).
 *  - "Simplificar: (3x²y - 5xy² + ...) - (...)"
 *  - "Racionalizar la siguiente expresión"
 *  - "El producto de dos números es... y la suma de sus inversos es..."
 *  - "El resultado de (x+y)² + ..." — expansión y reducción.
 *
 * Proceduralizable: generación de polinomios y simplificación simbólica con
 * coeficientes enteros.
 */

import type { MathItem, MathConfigBase } from "../types";

/** Tipo de operación algebraica. */
export type PolynomialOperationKind =
  | "order-by-degree"     // ordenar polinomios por grado absoluto
  | "simplify-sum"       // sumar/restar polinomios
  | "simplify-product"   // multiplicar polinomios (distributiva)
  | "expand-binomial"    // (a+b)², (a-b)², (a+b)(a-b)
  | "rationalize"        // 1/(√x+√y) → conjugado
  | "factor"             // factorización
  | "evaluate"           // sustituir x por un valor numérico
  | "common-factor";     // sacar factor común

/** Término de un monomio. */
export interface Monomial {
  /** Coeficiente. */
  coeff: number;
  /** Variables y exponentes (p. ej. `[[x,2],[y,5]]` para 5x²y⁵). */
  variables: [string, number][];
}

/** Polinomio: lista de monomios (suma). */
export type Polynomial = Monomial[];

export interface PolynomialConfig extends MathConfigBase {
  kind: PolynomialOperationKind;
  /** Nº de polinomios implicados (1 para simplify, 2 para producto, etc.). */
  polynomials: Polynomial[];
  /** Variables en uso. */
  variables: string[];
  /** Longitud máx. de cada polinomio (en monomios). */
  maxTerms?: number;
}

/** Resultado del ítem: respuesta simbólica ("3x²y", "x⁴+2x³+..."). */
export type PolynomialItem = MathItem<string>;

/**
 * Generación procedural (futuro `generador.ts`):
 *  - "order-by-degree": generar N polinomios con grados distintos; el
 *    correcto es el orden de menor a mayor.
 *  - "expand-binomial": (a+b)² = a² + 2ab + b². Calcular paso a paso.
 *  - "rationalize": implementar el conjugado (a-b)(a+b)/(a²-b²).
 *  - Para simplificación se necesitará un mini-motor de álgebra simbólica
 *    (suma de términos semejantes). Esto se puede implementar desde cero con
 *    `Monomial + Polynomial` (sin dependencia externa) o reutilizar una
 *    librería. La base del repo no incluye `sympy`, así que se sugiere un
 *    mini-motor propio en `polinomios/algebra.ts` (futuro).
 *
 * Distractores:
 *  - En "order-by-degree": permutación del orden correcto (invierte par).
 *  - En "expand-binomial": aplicación incompleta de la fórmula (falta 2ab).
 *  - En "rationalize": signo incorrecto del conjugado. */
