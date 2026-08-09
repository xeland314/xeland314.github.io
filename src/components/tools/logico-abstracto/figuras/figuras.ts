import type { ShapeElement as El } from "./types";
import type { ShapeKind, FillPattern } from "./types";

const VIEWBOX = 100;

const KIND_DEFAULTS: Record<ShapeKind, { r: number; fill: FillPattern }> = {
  circle: { r: 22, fill: "solid" },
  square: { r: 22, fill: "solid" },
  triangle: { r: 24, fill: "solid" },
  pentagon: { r: 22, fill: "solid" },
  hexagon: { r: 22, fill: "solid" },
  star: { r: 24, fill: "solid" },
  line: { r: 30, fill: "solid" },
  dot: { r: 6, fill: "solid" },
};

const DEFAULT_FILL: Record<ShapeKind, FillPattern> = {
  circle: "solid",
  square: "solid",
  triangle: "solid",
  pentagon: "solid",
  hexagon: "solid",
  star: "solid",
  line: "solid",
  dot: "solid",
};

export function createElement(
  kind: ShapeKind,
  partial: Partial<El> = {},
): El {
  const def = KIND_DEFAULTS[kind];
  return {
    kind,
    x: VIEWBOX / 2,
    y: VIEWBOX / 2,
    rotation: 0,
    scale: 1,
    fill: partial.fill ?? DEFAULT_FILL[kind],
    ...partial,
  };
}

/**
 * Crea una figura simple (un solo elemento del tipo indicado) centrada en el
 * marco. Es el punto de partida habitual para generar secuencias.
 */
export function createSimpleFigure(
  kind: ShapeKind,
  fill: FillPattern = "solid",
): { width: number; height: number; elements: El[] } {
  return {
    width: VIEWBOX,
    height: VIEWBOX,
    elements: [createElement(kind, { fill })],
  };
}

/**
 * Crea una figura compuesta: N elementos del mismo tipo distribuidos en fila
 * horizontal. Útil para patrones de "adición/eliminación progresiva".
 */
export function createRowFigure(
  kind: ShapeKind,
  count: number,
  fill: FillPattern = "solid",
): { width: number; height: number; elements: El[] } {
  const n = Math.max(1, count);
  const spacing = VIEWBOX / (n + 1);
  const elements: El[] = [];
  for (let i = 0; i < n; i++) {
    elements.push(
      createElement(kind, {
        x: spacing * (i + 1),
        y: VIEWBOX / 2,
        fill,
      }),
    );
  }
  return { width: VIEWBOX, height: VIEWBOX, elements };
}

export const VIEWBOX_SIZE = VIEWBOX;