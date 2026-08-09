/**
 * Spec — Sistemas de Ecuaciones.
 *
 * Variantes del banco:
 *  - "Resolver el siguiente sistema: { 2x + 3y = 12; x - y = 1 }"
 *  - "Para resolver un sistema, ¿qué método conviene si..."
 *  - "Al multiplicar por 28, el resultado es..."
 *  - Sistema lineal 2x2 con soluciones enteras razonables.
 *
 * Completamente proceduralizable: generar coeficientes enteros aleatorios
 * tales que el determinante sea no nulo y la solución sea entera. La misma
 * técnica vale para sistemas 3x3 (aunque el banco suele quedarse en 2x2).
 */

import type { MathItem, MathConfigBase } from "../types";

/** Tipo de sistema. */
export type SystemKind =
  | "linear-2x2"     // dos ecuaciones lineales con dos incógnitas
  | "linear-3x3"    // tres ecuaciones lineales con tres incógnitas
  | "non-linear";   // x²+y²=r², lineal-cuadrático, etc.

/** Coeficientes y términos independientes. */
export interface LinearSystem2x2 {
  /** Ecuación 1: a·x + b·y = e */
  a: number; b: number; e: number;
  /** Ecuación 2: c·x + d·y = f */
  c: number; d: number; f: number;
}

export interface SystemConfig extends MathConfigBase {
  kind: SystemKind;
  /** Sistema concreto (si se omite, el generador lo construirá aleatoriamente). */
  system?: LinearSystem2x2;
}

/** Resultado del ítem. La `value` se presenta como "(x, y) = (3, 2)". */
export type SystemItem = MathItem<string>;

/**
 * Generación procedural (futuro `generador.ts`):
 *  1. Elegir soluciones enteras (x*, y*) en rango 2..10.
 *  2. Elegir coeficientes a, b, c, d también enteros en rango -5..5.
 *  3. Calcular `e = a·x* + b·y*`, `f = c·x* + d·y*`.
 *  4. Verificar det(a·d - b·c) ≠ 0; si no, ajustar `d` en +1.
 *  5. Asignar el sistema y mostrar las 2 ecuaciones.
 *  6. La respuesta correcta es `(x*, y*)`. Distractores:
 *     * Inverso: `(y*, x*)`.
 *     * Solver con solo la primera ecuación (ignorar la 2da).
 *     * Solver con signo cambiado en `e` (resta mal hecha).
 *
 * Para "non-linear": sistema lineal + cuadrático; aquí basta un par de
 * soluciones "bonitas" (e.g. intersección de una recta y una circunferencia
 * que produzca un radio entero). El spec lo admite pero el generador inicial
 * solo cubrirá `linear-2x2`. */
