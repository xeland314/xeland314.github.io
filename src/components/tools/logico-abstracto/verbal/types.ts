/**
 * Tipos compartidos por los specs de Razonamiento Verbal.
 *
 * El banco real muestra 6 subtemas verbales recurrentes: sinónimos/antónimos,
 * término excluido, analogía verbal, conectores lógicos, ordenar palabras y
 * comprensión lectora. Estos specs definen únicamente el contrato (estructuras
 * de datos + parámetros), sin datos del banco ni lógica de generación: el
 * `generador.ts` de cada subtema se Ravensará en una iteración posterior.
 *
 * Convenciones del repositorio:
 * - Cada subtema es una carpeta con `types.ts` + `README.md` (especificación).
 * - Los generadores serán puros y deterministas vía `seed` (igual que el resto
 *   de la suite logico-abstracto).
 * - El solucionario se deriva de las definiciones (seeding), no se hardcodea.
 */

/** Nivel de dificultad documentado en el banco. */
export type Difficulty = "Bajo" | "Medio" | "Alto";

/** Entrada léxica: palabra + metadatos. */
export interface WordEntry {
  /** Palabra en español (forma canónica). */
  word: string;
  /** Categoría gramatical. */
  pos: "sustantivo" | "adjetivo" | "verbo" | "adverbio";
  /** Nivel de registro (influye en dificultad). */
  register: "coloquial" | "estándar" | "culto";
  /** Tema/área semántica (geografía, música, matemática, etc.). */
  domain?: string;
}

/** Opción de respuesta múltiple (A/B/C/D). */
export interface MCQOption<T = string> {
  /** Etiqueta fija A/B/C/D o 1/2/3/4. */
  label: string;
  /** Contenido de la opción. */
  value: T;
}

/** Resultado genérico de un ítem verbal. */
export interface VerbalItem<T = string> {
  /** Enunciado que se muestra al estudiante. */
  prompt: string;
  /** Opciones de respuesta (1 correcta + N distractores). */
  options: MCQOption<T>[];
  /** Índice correcto dentro de `options`. */
  correctIndex: number;
  /** Explicación breve del solucionario. */
  rationale: string;
  /** Explicación por distractor (clave: valor de la opción). */
  distractorExplanations: Record<string, string>;
  /** Dificultad estipulada. */
  difficulty: Difficulty;
  /** "Consejo" pedagógico recurrente en el banco (campo @T). */
  tip: string;
}

/** PCG compartido: configuración base de cualquier subtema verbal. */
export interface VerbalConfigBase {
  difficulty: Difficulty;
  /** Nº de opciones (4 o 5; el banco muestra 4 a veces y 5 a veces). */
  numOptions?: number;
  /** Semilla para reproducibilidad (generador futuro). */
  seed?: number;
}