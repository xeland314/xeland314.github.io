import type {
  Figure,
  ShapeKind,
  FillPattern,
} from "../figuras/types";
import { createSimpleFigure, createRowFigure } from "../figuras/figuras";
import {
  rotate,
  scale,
  shade,
  addElement,
  removeElement,
  cloneFig,
} from "../figuras/primitivas";
import type {
  AnalogyConfig,
  AnalogyItem,
  AnalogyRelation,
  AnalogyAttribute,
} from "./types";

/** PRNG determinista (mulberry32). */
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

/**
 * Aplica la transformación A→B a `figure`. Es la clave de la analogía:
 * el mismo Step que produjo B desde A se reproduce para producir D desde C.
 */
export function applyRelation(
  figure: Figure,
  relation: AnalogyRelation,
  attribute: AnalogyAttribute | undefined,
  amount: number,
): Figure {
  if (relation === "single-attribute") {
    switch (attribute) {
      case "rotation": return rotate(figure, amount);
      case "scale": return scale(figure, amount);
      case "fill": return shade(figure, intToPattern(amount));
      case "count": return amount > 0 ? addElement(figure, "dot") : removeElement(figure);
      case "shape": return rotate(figure, 0);
      default: return rotate(figure, amount);
    }
  }
  if (relation === "composition") {
    return addElement(figure, "dot");
  }
  if (relation === "rotation-overlay") {
    return rotate(figure, amount);
  }
  return cloneFig(figure);
}

/**
 * Genera un ítem de analogía gráfica: par A→B + figura C + opciones para D.
 * D es la transformación `relation(A→B)` aplicada a C; los distractores
 * aplican transformaciones *casi* correctas (paso o atributo equivocado).
 */
export function generateItem(config: AnalogyConfig): AnalogyItem {
  const fill: FillPattern = config.baseFill ?? "solid";
  const amount = config.amount ?? 90;
  const numOptions = config.numOptions ?? 4;
  const rng = mulberry32(
    config.seed ??
      seedFromString(
        `${config.relation}-${config.baseShape}-${config.attribute ?? ""}-${amount}`,
      ),
  );

  const shapeA = config.baseShape;
  const shapeC: ShapeKind = config.lowSimilarity
    ? pickDifferentShape(shapeA, rng)
    : shapeA;

  const a = createSimpleFigure(shapeA, fill);
  const c = createSimpleFigure(shapeC, fill);

  const b = applyRelation(a, config.relation, config.attribute, amount);
  const correct = applyRelation(c, config.relation, config.attribute, amount);

  const options: Figure[] = [correct];
  const distractorsAmounts = pickDistractorAmounts(amount, numOptions - 1, rng);
  const distractorAttrs = pickDistractorAttributes(config.attribute, numOptions - 1, rng);
  for (let i = 0; i < numOptions - 1; i++) {
    let wrong = applyRelation(
      c,
      config.relation,
      i % 2 === 0 ? distractorAttrs[i] : config.attribute,
      distractorsAmounts[i],
    );
    // Evitar distractores idénticos a la correcta: forzar rotación extra
    if (figuresEqual(wrong, correct)) {
      wrong = rotate(wrong, 13 + i * 7);
    }
    options.push(wrong);
  }

  const correctIndex = shuffleKeepingTrack(options, correct, rng);
  const distractors = options.map((_, i) => i).filter((i) => i !== correctIndex);

  return {
    pair: [a, b],
    c,
    options,
    correctIndex,
    distractors,
    relation: config.relation,
    attribute: config.attribute,
    config,
  };
}

function intToPattern(n: number): FillPattern {
  const patterns: FillPattern[] = ["none", "solid", "hatched", "dotted", "cross"];
  return patterns[((Math.round(n) % patterns.length) + patterns.length) % patterns.length];
}

function pickDifferentShape(excluded: ShapeKind, rng: () => number): ShapeKind {
  const all: ShapeKind[] = [
    "circle", "square", "triangle", "pentagon", "hexagon", "star",
  ];
  const candidates = all.filter((s) => s !== excluded);
  return candidates[Math.floor(rng() * candidates.length)];
}

function pickDistractorAmounts(
  correctAmount: number,
  count: number,
  rng: () => number,
): number[] {
  // Offsets relativos al correcto — para escalado se aplican como multiplicador
  // (factor > 0) y para rotación como suma de grados. Se eligen entre dos ramas
  // según signo del monto para evitar factores <= 0.
  const angOffsets = [-30, 30, 15, -15, 45, -45];
  const scaleMultipliers = [0.75, 1.25, 1.5, 0.9];
  const picks: number[] = [];
  for (let i = 0; i < count; i++) {
    if (correctAmount > 0 && correctAmount < 10) {
      // scale
      const m = scaleMultipliers[Math.floor(rng() * scaleMultipliers.length)];
      picks.push(Math.max(0.1, +(correctAmount * m).toFixed(2)));
    } else {
      // rotation/grados
      const off = angOffsets[Math.floor(rng() * angOffsets.length)];
      picks.push((correctAmount || 90) + off);
    }
  }
  return picks;
}

function pickDistractorAttributes(
  correct: AnalogyAttribute | undefined,
  count: number,
  rng: () => number,
): AnalogyAttribute[] {
  const all: AnalogyAttribute[] = ["rotation", "fill", "scale", "count", "shape"];
  const picks: AnalogyAttribute[] = [];
  for (let i = 0; i < count; i++) {
    let candidate = all[Math.floor(rng() * all.length)];
    // 50% de las veces, deliberadamente distinto al correcto
    if (correct && rng() > 0.5) {
      const candidates = all.filter((a) => a !== correct);
      candidate = candidates[Math.floor(rng() * candidates.length)];
    }
    picks.push(candidate);
  }
  return picks;
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

export const RELATIONS: AnalogyRelation[] = [
  "single-attribute",
  "composition",
  "rotation-overlay",
];

export const ATTRIBUTES: AnalogyAttribute[] = [
  "rotation",
  "fill",
  "scale",
  "count",
  "shape",
];