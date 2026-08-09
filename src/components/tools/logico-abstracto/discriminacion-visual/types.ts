/** Tipo de diferencia que puede haber entre dos cadenas (subtema 2). */
export type DifferenceKind =
  | "substitution"
  | "insertion"
  | "deletion"
  | "swap-adjacent"
  | "confusable";

/** Tipo de alfabeto disponible. */
export type AlphabetKind =
  | "letters"
  | "letters-digits"
  | "letters-special"
  | "upper-lower";

/** Posición donde aplicar la diferencia dentro de la cadena. */
export type DifferencePosition = "start" | "middle" | "end" | "random";

/** Estructura de la cadena (subtema 5 — cadenas largas). */
export type LongStringStructure =
  | "random"
  | "repeated-block"
  | "repeated-block-separated";

/** Configuración para generar un par de discriminación visual. */
export interface DiscriminationConfig {
  /** Longitud total de la cadena (10–40 típico; 20–80 para cadenas largas). */
  length: number;
  /** Alfabeto a usar. */
  alphabet: AlphabetKind;
  /** Nº de diferencias a introducir (0, 1 ó 2). */
  numDifferences: number;
  /** Tipo de diferencia a aplicar. */
  differenceType: DifferenceKind;
  /** Posición de la diferencia. */
  position: DifferencePosition;
  /** Estructura (solo relevante para cadenas largas). */
  structure?: LongStringStructure;
  /** Tamaño del bloque repetido (si structure lo requiere). */
  blockSize?: number;
  /** Separador entre bloques (default ""). */
  separator?: string;
  /** Semilla para reproducibilidad. */
  seed?: number;
}

/** Resultado de generar un par de discriminación visual. */
export interface DiscriminationItem {
  /** Cadena A (modelo). */
  cadenaA: string;
  /** Cadena B (comparación). */
  cadenaB: string;
  /** true si las cadenas son iguales. */
  esIgual: boolean;
  /** Índices donde A y B difieren (vacío si esIgual). */
  posicionDiferencia: number[];
  /** Configuración usada. */
  config: DiscriminationConfig;
}

/** Dificultad estimada del ítem, etiqueta automática para clasificación. */
export type DifficultyLabel = "baja" | "media" | "alta";

/** Tabla de pares de caracteres visualmente similares. */
export const CONFUSABLE_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["0", "O"],
  ["1", "l"],
  ["1", "I"],
  ["5", "S"],
  ["8", "B"],
  ["2", "Z"],
  ["rn", "m"],
  ["cl", "d"],
  ["vv", "w"],
] as const;

export const ALPHABETS: Record<AlphabetKind, string> = {
  letters: "abcdefghijklmnopqrstuvwxyz",
  "letters-digits": "abcdefghijklmnopqrstuvwxyz0123456789",
  "letters-special": "abcdefghijklmnopqrstuvwxyz0123456789*#%&@+=",
  "upper-lower": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
};