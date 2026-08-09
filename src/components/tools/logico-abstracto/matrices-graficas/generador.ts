import type {
  Figure,
  ShapeKind,
  FillPattern,
} from "../figuras/types";
import { createSimpleFigure, createRowFigure } from "../figuras/figuras";
import { rotate, scale, shade, addElement, removeElement, cloneFig } from "../figuras/primitivas";
import type {
  MatrixConfig,
  MatrixItem,
  MatrixRuleType,
  MatrixAttribute,
} from "./types";

/** PRNG determinista. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const SHAPES: ShapeKind[] = [
  "circle", "square", "triangle", "pentagon", "hexagon", "star",
];

const PATTERNS: FillPattern[] = ["solid", "hatched", "dotted", "cross", "none"];

/**
 * Genera una matriz de permutación tipo Sudoku: cada tipo aparece una vez por
 * fila y por columna. Útil cuando `attribute="shape"`.
 */
function buildPermutation(
  n: number,
  types: ShapeKind[],
  rng: () => number,
): ShapeKind[][] {
  // Genera un cuadrado latino: fila i es types rotado por i + offset ShuffleRow.
  const offset = Math.floor(rng() * n);
  const grid: ShapeKind[][] = [];
  for (let i = 0; i < n; i++) {
    const row: ShapeKind[] = [];
    for (let j = 0; j < n; j++) {
      row.push(types[(i + j + offset) % types.length]);
    }
    grid.push(row);
  }
  // Mezcla columnas para mayor variabilidad
  for (let c = 0; c < n; c++) {
    const c1 = Math.floor(rng() * n);
    const c2 = Math.floor(rng() * n);
    if (c1 !== c2) {
      for (let r = 0; r < n; r++) {
        [grid[r][c1], grid[r][c2]] = [grid[r][c2], grid[r][c1]];
      }
    }
  }
  return grid;
}

/**
 * Aplica la regla de matriz a una figura base avanzando `step` veces.
 */
function applyRuleAdvance(
  base: Figure,
  attribute: MatrixAttribute,
  amount: number,
  step: number,
): Figure {
  switch (attribute) {
    case "rotation": return rotate(base, amount * step);
    case "scale": return scale(base, Math.max(0.1, +(1 + (amount - 1) * step).toFixed(2)));
    case "fill": return shade(base, PATTERNS[step % PATTERNS.length]);
    case "count": {
      let f = base;
      const dir = amount >= 1 ? 1 : -1;
      const n = Math.abs(Math.round(amount)) || 1;
      for (let k = 0; k < n * step; k++) {
        f = dir > 0 ? addElement(f, "dot") : removeLast(f);
      }
      return f;
    }
    case "shape":
    default: return base;
  }
}

function buildProgression(
  base: Figure,
  attribute: MatrixAttribute,
  amount: number,
  n: number,
  axis: "row" | "col",
  rng: () => number,
): Figure[][] {
  const grid: Figure[][] = [];
  for (let i = 0; i < n; i++) {
    const row: Figure[] = [];
    for (let j = 0; j < n; j++) {
      const step = axis === "row" ? j : i;
      const fig = applyRuleAdvance(base, attribute, amount, step);
      row.push(fig);
    }
    grid.push(row);
  }
  return grid;
}

function removeLast(f: Figure): Figure {
  return removeElement(f);
}

/**
 * Genera un ítem de matriz gráfica con la celda vacía y opciones de respuesta.
 */
export function generateItem(config: MatrixConfig): MatrixItem {
  const n = config.dimension;
  const numOptions = config.numOptions ?? 4;
  const attribute: MatrixAttribute = config.attribute ?? "shape";
  const amount = config.amount ?? 1;
  const rng = mulberry32(
    config.seed ??
      seedFromString(`${config.ruleType}-${attribute}-${n}-${amount}`),
  );
  const numTypes = config.numTypes ?? n;

  let grid: Figure[][];
  if (config.ruleType === "permutation") {
    const types = SHAPES.slice(0, numTypes);
    const typeGrid = buildPermutation(n, types, rng);
    grid = typeGrid.map((row) => row.map((kind) => createSimpleFigure(kind)));
  } else if (config.ruleType === "progression") {
    const base = createSimpleFigure(SHAPES[0], "solid");
    grid = buildProgression(base, attribute, amount, n, "row", rng);
  } else if (config.ruleType === "arithmetic") {
    // count progression por fila, con un desplazamiento distinto por fila
    const base = createRowFigure("dot", 1, "solid");
    grid = [];
    for (let i = 0; i < n; i++) {
      const row: Figure[] = [];
      for (let j = 0; j < n; j++) {
        const total = 1 + i + j + Math.round(amount);
        row.push(createRowFigure("dot", Math.max(1, total), "solid"));
      }
      grid.push(row);
    }
  } else {
    // combined: regla distinta en fila que en columna
    const base = createSimpleFigure(SHAPES[0], "solid");
    const byRow = buildProgression(base, attribute, amount, n, "row", rng);
    const byCol = buildProgression(base, "rotation", 30, n, "col", rng);
    grid = [];
    for (let i = 0; i < n; i++) {
      const row: Figure[] = [];
      for (let j = 0; j < n; j++) {
        // combina ambas reglas: rotación por columna + fill por fila
        const f = rotate(byRow[i][j], 30 * i);
        row.push(f);
      }
      grid.push(row);
    }
  }

  // Celda vacía
  const empty = config.emptyCell ?? { row: n - 1, col: n - 1 };
  const correct = grid[empty.row][empty.col];
  const gridWithNull: (Figure | null)[][] = grid.map((row, i) =>
    row.map((fig, j) => (i === empty.row && j === empty.col ? null : fig)),
  );

  const options: Figure[] = [correct];
  // Distractores: figuras tomadas de otras celdas + variantes por atributo
  const candidates: Figure[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === empty.row && j === empty.col) continue;
      candidates.push(grid[i][j]);
    }
  }
  shuffle(candidates, rng);
  while (options.length < numOptions) {
    const cand = candidates.pop();
    if (cand && !options.some((o) => figuresEqual(o, cand))) {
      options.push(cand);
    } else {
      const variant = rotate(correct, 13 + options.length * 7);
      options.push(variant);
    }
  }

  const correctIndex = shuffleKeepingTrack(options, correct, rng);
  const distractors = options.map((_, i) => i).filter((i) => i !== correctIndex);

  return {
    grid: gridWithNull,
    options,
    correctIndex,
    distractors,
    emptyCell: empty,
    config,
  };
}

function shuffle<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function shuffleKeepingTrack<T>(
  arr: T[],
  keepRef: T,
  rng: () => number,
): number {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.indexOf(keepRef);
}

/** Comparación estructural ligera entre dos figuras. */
export function figuresEqual(a: Figure, b: Figure): boolean {
  if (a.elements.length !== b.elements.length) return false;
  for (let i = 0; i < a.elements.length; i++) {
    const ea = a.elements[i];
    const eb = b.elements[i];
    if (
      ea.kind !== eb.kind ||
      ea.rotation !== eb.rotation ||
      ea.scale !== eb.scale ||
      ea.x !== eb.x ||
      ea.y !== eb.y ||
      ea.fill !== eb.fill
    )
      return false;
  }
  return true;
}

/** Re-export de utilidad de clonado. */
export function cloneFigure(f: Figure): Figure {
  return cloneFig(f);
}

export const RULE_TYPES: MatrixRuleType[] = [
  "permutation",
  "progression",
  "arithmetic",
  "combined",
];

export const ATTRIBUTES: MatrixAttribute[] = [
  "shape",
  "rotation",
  "fill",
  "count",
];