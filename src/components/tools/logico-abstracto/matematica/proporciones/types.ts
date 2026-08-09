/**
 * Spec — Proporciones y Regla de 3 (incluyendo problemas de trabajo).
 *
 * El banco tiene muchas variantes:
 *  - Regla de 3 simple directa: "Si 15 obreros tardan 10 días, ¿cuánto
 *    tardan 12 obreros?" (inversa: tiempo crece al disminuir obreros).
 *  - Reciprocidad de grifos: "Si A tarda 2k horas y B tarda 3k, juntos
 *    llenan el tanque en 12h. ¿A solo?" (velocidades suman = 1/t_total).
 *  - Тrаbаjo con N agentes y N任务: "X grifos llenan en Y horas, ¿Z grifos?"
 *  - Distribuciones proporcionales: "Fausto repartió 1,200 en razón 2:3:5"
 *  - Porcentajes e interés compuesto.
 *
 * El patrón común es *razón entre dos magnitudes + factor*; el generador
 * debe distinguir directa vs inversa y aplicar la fórmula correcta.
 */

import type { MathItem, MathConfigBase } from "../types";

/** Subtipo de problema proporcional. */
export type ProportionKind =
  | "rule-of-3-direct"      // y = k·x
  | "rule-of-3-inverse"     // y = k/x (obreros→tiempo, máquinas→tiempo)
  | "work-rate"             // 1/T = 1/a + 1/b + ...
  | "compound-work"         // grifos/trabajadores en paralelo
  | "split-ratio"           // distribuir total N en razones r1:r2:...:rn
  | "percentage"            // subir/bajar un porcentaje, sucesivo
  | "compound-interest"     // A = P·(1+r)^t
  | "mixture";              // mezclas con concentraciones

export interface ProportionConfig extends MathConfigBase {
  kind: ProportionKind;
  /** Datos del enunciado (números "bonitos" para que la respuesta sea entera). */
  data: ProportionData;
  /** Unidad de medida (horas, días, litros, dólares, ...). */
  unit?: string;
}

/** Datos variants según `kind`. */
export type ProportionData =
  // Regla de 3 simple: "a SIEMPRE b, c ¿?" → busca x
  | {
      kind: "rule-of-3-direct" | "rule-of-3-inverse";
      a: number;   // magnitud 1 conocida
      b: number;   // magnitud 2 conocida correspondiente a `a`
      c: number;   // nueva magnitud 1
    }
  // Trabajo en paralelo: "A tarda t_A solo, B tarda t_B solo, juntos tardan?"
  | {
      kind: "work-rate";
      times: number[];   // tiempos individuales
    }
  // Trabajo compuesto: "tiempos están en razón p:q, juntos= t ambos"
  | {
      kind: "compound-work";
      ratio: [number, number];
      togetherTime: number;
    }
  // Distribuir total entre razones dadas
  | {
      kind: "split-ratio";
      total: number;
      ratios: number[];
    }
  // Porcentaje
  | {
      kind: "percentage";
      base: number;
      changes: number[];   // [10, -5, 25] = +10%, -5%, +25% sucesivo
    }
  // Interés compuesto
  | {
      kind: "compound-interest";
      principal: number;
      rate: number;   // mensual/anual en tanto por uno
      periods: number;
    }
  // Mezclas
  | {
      kind: "mixture";
      solutions: { volume: number; concentration: number }[];
      targetVolume?: number;
      targetConcentration?: number;
    };

/** Resultado del ítem: respuesta numérica con unidad. */
export type ProportionItem = MathItem<string>;

/**
 * Gener procedural (futuro `generador.ts`):
 *  - Para "rule-of-3-*": x = b·c/a (directa) ó x = a·b/c (inversa).
 *  - Para "work-rate": 1/T = Σ(1/t_i), despeja T ó un tiempo individual.
 *  - Para "split-ratio": distribución proporcional pura.
 *  - Distractores: aplicar fórmula inversa en problema directo (trampa
 *    frecuente del banco), confundir suma con multiplicación, etc.
 *  - Para "compound-interest": aplicar interés simple (olvido compuesto) es
 *    el distractor clásico. */
