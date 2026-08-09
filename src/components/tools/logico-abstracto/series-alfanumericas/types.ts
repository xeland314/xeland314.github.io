/** Catálogo de tipos de patrón de series alfanuméricas (subtema 1). */
export type SeriesAlfabeticaPattern =
  | "acumulativo"
  | "fijo"
  | "salto"
  | "alternado"
  | "espejo"
  | "intruso";

/** Alfabeto disponible para generar series. */
export type Alphabet =
  | "letras"
  | "letras-extendidas"
  | "letras-numeros"
  | "simbolos";

export interface SeriesConfig {
  /** Tipo de patrón a generar. */
  pattern: SeriesAlfabeticaPattern;
  /** Longitud del ciclo (2-6). */
  longitudCiclo: number;
  /** Alfabeto base. */
  alfabeto: Alphabet;
  /** Posición donde truncar la serie mostrada (índice dentro de la serie). */
  puntoDeCorte: number;
  /** Nº de caracteres visibles antes de preguntar. */
  longitudVisible: number;
  /** Si true, generar validador que detecte la posición del intruso. */
  conDistractor?: boolean;
  /** Salto fijo en pasos del alfabeto (para pattern="salto"). */
  salto?: number;
  /** Nº de distractores plausibles a generar. */
  numDistractores?: number;
  /** Semilla opcional para reproducibilidad. */
  seed?: number;
}

export interface SeriesItem {
  /** Serie mostrada al estudiante (truncada). */
  shown: string;
  /** Caracteres correctos que vienen después del corte. */
  respuesta: string;
  /** Caracteres distractores plausibles. */
  distractores: string[];
  /** Serie completa generada (sin truncar) — útil para el solucionario. */
  serieCompleta: string;
  /** Alfabeto usado. */
  alfabeto: string;
  /** Configuración aplicada. */
  config: SeriesConfig;
}

export const ALPHABETS: Record<Alphabet, string> = {
  letras: "abcdefghijklmnñopqrstuvwxyz",
  "letras-extendidas": "abcdefghijklmnñopqrstuvwxyzáéíóúü",
  "letras-numeros": "a1b2c3d4e5f6g7h8i9j0",
  simbolos: "*#%&@+=$?¿¡!/\\",
};