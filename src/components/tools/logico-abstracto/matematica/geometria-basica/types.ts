/**
 * Spec — Geometría Básica.
 *
 * Variantes del banco:
 *  - Áreas de polígonos (cuadrado, rectángulo, triángulo, círculo).
 *  - Perímetros y diagonales.
 *  - Proporciones entre dimensiones (terreno rectangular).
 *  - Teorema de Pitágoras (triángulos rectángulos con catetos enteros).
 *  - Ángulos en triángulos y polígonos regulares.
 *
 * Completamente proceduralizable: generar dimensiones enteras "bonitas",
 * computar área/perímetro, y plantear distractores con fórmulas erradas
 * (confundir área con perímetro, sumar catetos en vez de elevar al cuadrado).
 */

import type { MathItem, MathConfigBase } from "../types";

/** Tipo de figura geométrica y operación. */
export type GeometryKind =
  | "area-square"
  | "area-rectangle"
  | "area-triangle"
  | "area-circle"
  | "area-trapezoid"
  | "perimeter-polygon"
  | "circumference"
  | "pythagorean-theorem"
  | "angle-sum-triangle"
  | "interior-angles-polygon"
  | "scale-factor";        // área escala k², perímetro escala k

export interface GeometryConfig extends MathConfigBase {
  kind: GeometryKind;
  datos: GeometryData;
  /** Unidad (cm, m, ...). */
  unit?: string;
}

/** Datos variantes según `kind`. */
export type GeometryData =
  | { kind: "area-square"; lado: number }
  | { kind: "area-rectangle"; base: number; altura: number }
  | { kind: "area-triangle"; base: number; altura: number }
  | { kind: "area-circle"; radio: number }
  | { kind: "area-trapezoid"; base1: number; base2: number; altura: number }
  | { kind: "perimeter-polygon"; lados: number[] }
  | { kind: "circumference"; radio: number }
  | { kind: "pythagorean-theorem"; catetoA: number; catetoB: number }
  | { kind: "angle-sum-triangle"; angulosDados: number[] }       // calcula el tercero
  | { kind: "interior-angles-polygon"; numLados: number }        // suma = (n-2)·180
  | { kind: "scale-factor"; figuraOriginal: string; factor: number };

export type GeometryItem = MathItem<string>;

/**
 * Generación procedural (futuro `generador.ts`):
 *  - Para "pythagorean-theorem": generar catetos como una terna pitagórica
 *    conocida (3,4,5), (5,12,13), (8,15,17), (7,24,25)... La hipotenusa sale
 *    entera.
 *  - Para "area-*": dimensiones enteras en rango 2..20. El área debe ser
 *    entera (factorizar antes si la fórmula introduce √).
 *  - Distractores típicos:
 *     * Confundir área con perímetro (lado·lado vs 4·lado): trampa universal.
 *     * Olvidar dividir por 2 en el área del triángulo.
 *     * Usar el radio como diámetro en la circunferencia (2πr vs πr).
 *     * Sumar los catetos en Pitágoras en lugar de elevarlos al cuadrado.
 *  - El solucionario debe mostrar la fórmula simbólica, la sustitución y la
 *    reducción (formato `[MATH]A = L^2 = 5^2 = 25 \\, cm^2[/MATH]`). */
