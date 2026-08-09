/**
 * Tipos compartidos por los specs de Razonamiento Matemático.
 *
 * El banco muestra 6 subtemas numéricos recurrentes: series numéricas,
 * proporciones / regla de 3 (incluyendo trabajo/reciprocidad de grifos),
 * polinomios / operaciones algebraicas, probabilidad, sistemas de ecuaciones
 * y geometría básica (áreas, perímetros, proporciones).
 *
 * Estos specs definen el contrato (estructuras + parámetros). La generación
 * procedural es viable en todos los subtemas — al contrario que el bloque
 * verbal — porque la matemática es combinatoria pura (no requiere léxico
 * curado). Los `generador.ts` se añadirán en iteraciones posteriores.
 */

/** Nivel de dificultad del banco. */
export type Difficulty = "Bajo" | "Medio" | "Alto";

/** Opción de respuesta numérica o simbólica. */
export interface MathOption<T = string> {
  label: string;
  value: T;
}

/** Resultado genérico de un ítem matemático. */
export interface MathItem<T = string> {
  /** Enunciado mostrado al estudiante (puede contener `[MATH]...[/MATH]`). */
  prompt: string;
  /** Opciones de respuesta. */
  options: MathOption<T>[];
  /** Índice correcto. */
  correctIndex: number;
  /** Solución paso a paso (se renderiza con MathML/KaTeX). */
  solution: string;
  /** Justificación de cada distractor. */
  distractorExplanations: Record<string, string>;
  /** Dificultad. */
  difficulty: Difficulty;
  /** Consejo pedagógico. */
  tip: string;
}

/** Config base común a los subtemas matemáticos. */
export interface MathConfigBase {
  difficulty: Difficulty;
  /** Nº de opciones (4 casi siempre en el banco). */
  numOptions?: number;
  /** Semilla para reproducibilidad. */
  seed?: number;
}

/**
 * Notación matemática estandarizada para todos los specs:
 *  - Fracciones: `a/b` o `[MATH]\\frac{a}{b}[/MATH]`
 *  - Exponentes: `x^n` o `[MATH]x^{n}[/MATH]`
 *  - Operaciones: `+`, `-`, `*`, `/`, `^`, `mod`
 *
 * Los generadores futuros devolverán el `prompt` y el `solution` ya con
 * marcas `[MATH]...[/MATH]` en los fragmentos simbólicos, tal cual el banco.
 */