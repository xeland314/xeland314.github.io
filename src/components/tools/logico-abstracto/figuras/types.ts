/**
 * Tipos base del motor de figuras para la suite de Razonamiento Abstracto.
 * Reutilizado por: series gráficas, analogías, conjuntos, figuras excluidas,
 * matrices, búsqueda de similares, rapidez perceptiva y memoria visual.
 *
 * Modelo: una "figura" es un sub-árbol SVG descrito como un objeto plano. Esto
 * evita depender de un parser DOM y permite aplicar transformaciones como
 * simples funciones puras (rotar / escalar / trasladar / sombrear / agregar
 * elementos) que devuelven una nueva figura inmutable.
 */

export type FillPattern =
  | "none"
  | "solid"
  | "hatched"
  | "dotted"
  | "cross";

export type ShapeKind =
  | "circle"
  | "square"
  | "triangle"
  | "pentagon"
  | "hexagon"
  | "star"
  | "line"
  | "dot";

/** Atributo unitario que una transformación o un criterio puede alterar/verificar. */
export type Attribute =
  | "rotation"
  | "scale"
  | "fill"
  | "count"
  | "position";

/** Elemento primitivo contenido dentro de una figura compuesta. */
export interface ShapeElement {
  kind: ShapeKind;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  fill: FillPattern;
}

/** Figura: un marco rectangular que contiene 1..N elementos. */
export interface Figure {
  width: number;
  height: number;
  elements: ShapeElement[];
}

/** Sombreado resuelto a un valor de opacidad/patrón para un elemento. */
export interface ResolvedFill {
  pattern: FillPattern;
  color: string;
}

export interface FigureSamples {
  /** Figuras del ítem (las visibles al estudiante). */
  shown: Figure[];
  /** Opciones de respuesta (una es la correcta). */
  options: Figure[];
  /** Índice dentro de `options` de la respuesta correcta. */
  correctIndex: number;
  /** Distractores: índices dentro de `options` distintos de `correctIndex`. */
  distractors: number[];
}

/** Modo de operación para Conjuntos vs Figuras excluidas (comparten motor). */
export type SetMode = "include" | "exclude";

/** Tipo de transformación disponible en el motor de secuencias. */
export type TransformationKind =
  | "rotation"
  | "addition"
  | "removal"
  | "translation"
  | "scale"
  | "fill";

/** Paso aplicado por una transformación entre dos figuras consecutivas. */
export interface TransformationStep {
  kind: TransformationKind;
  /** Magnitud del cambio (grados para rotación, factor para escala, etc.). */
  amount: number;
  /** Índice del elemento afectado dentro de la figura (opcional). */
  elementIndex?: number;
}

/** Eje por el que avanza una transformación (filas o columnas de matrices). */
export type Axis = "row" | "column";