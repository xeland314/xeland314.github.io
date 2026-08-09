/**
 * Tipos base del módulo de Lógica Propositional.
 *
 * El banco de preguntas contiene dos variantes recíprocas:
 * 1. "Simbolice la siguiente afirmación"  (frase en español → expresión simbólica)
 * 2. "Seleccione la afirmación que corresponde a la proposición [MATH]..."  (expresión → frase)
 *
 * El generador debe ser capaz de producir ítems para ambas direcciones usando
 * un mismo AST intermedio, de modo que el solucionario nunca se contradiga
 * consigo mismo (el ground truth se deriva del AST, no se hardcodea).
 */

/** Conectores lógicos según el catálogo del subtema. */
export type Connector =
  | "&"   // conjunción: y / además / pero / sin embargo
  | "|"   // disyunción inclusiva: o
  | "^"   // disyunción exclusiva: o... o... / pero no ambos
  | "->"  // implicación: si... entonces / solo si
  | "<->" // bicondicional: si y solo si
  | "~";  // negación: no

/** Átomo: variable proposicional simple. */
export interface Atom {
  type: "atom";
  variable: string;
}

/** Aplicación de un conector a 1 (negación) ó 2 (resto) sub-expr. */
export interface Application {
  type: "application";
  connector: Connector;
  operands: Proposition[];
}

/** Árbol de proposición: átomo o aplicación. */
export type Proposition = Atom | Application;

/** Traducción 'frase naturista' para un conector dado. */
export interface ConnectorDict {
  symbol: Connector;
  /** Frases en español que introducen este conector (regex parcial). */
  phrases: string[];
  /** Template "x <conn> y" en español, ej. "x entonces y". */
  template: (a: string, b: string) => string;
}

/** Modo de la pregunta (dirección de traducción). */
export type TranslationMode =
  /** frase → expresión simbólica */
  | "to-symbol"
  /** expresión simbólica → frase */
  | "to-phrase";

export interface PropositionalConfig {
  /** Modo de la pregunta. */
  mode: TranslationMode;
  /** Nº de variables atómicas (1-3). */
  numVars?: number;
  /** Profundidad máx del AST (1-3). */
  depth?: number;
  /** Conectores permitidos en el ítem. */
  connectors?: Connector[];
  /** Nº de opciones de respuesta. */
  numOptions?: number;
  /** Semilla para reproducibilidad. */
  seed?: number;
}

/** Opción de respuesta: una proposición con su representación textual. */
export interface SymbolOption {
  /** Texto en español (frase) — paired con `symbol`. */
  phrase: string;
  /** Expresión simbólica. */
  symbol: string;
}

export interface PropositionalItem {
  /** Enunciado: frase si mode="to-symbol", símbolo si mode="to-phrase". */
  prompt: string;
  /** Opciones de respuesta. */
  options: SymbolOption[];
  /** Índice correcto en `options`. */
  correctIndex: number;
  /** Árbol proposicional del ground truth (para solucionario). */
  truth: Proposition;
  /** Configuración usada. */
  config: PropositionalConfig;
}