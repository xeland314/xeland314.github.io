import type {
  Figure,
  TransformationStep,
  ShapeKind,
  FillPattern,
} from "../figuras/types";
import { createSimpleFigure, createRowFigure } from "../figuras/figuras";
import {
  generateSequence,
  generateDistractor,
  applyStep,
  cloneFig,
} from "../figuras/primitivas";
import type {
  SeriesConfig,
  SeriesItem,
  SeriesPatternType,
} from "./types";

/** PRNG determinista (mulberry32) para ítems reproducibles. */
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

const ROUND_ROTATIONS = [45, 90, 180];
const ROUND_SCALES = [1.5, 2];

/**
 * Construye los pasos de transformación correspondientes a un patrón.
 * `numRules=2` añade una segunda regla independiente (más dificultad).
 */
function buildSteps(
  pattern: SeriesPatternType,
  roundSteps: boolean,
  numRules: 1 | 2,
  rng: () => number,
): TransformationStep[] {
  const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
  const rot = roundSteps ? pick(ROUND_ROTATIONS) : 30 + Math.floor(rng() * 60);
  const scaleAmt = roundSteps ? pick(ROUND_SCALES) : 0.75 + rng() * 0.75;

  let primary: TransformationStep;
  switch (pattern) {
    case "rotation": primary = { kind: "rotation", amount: rot }; break;
    case "scale": primary = { kind: "scale", amount: scaleAmt }; break;
    case "fill": primary = { kind: "fill", amount: 1 }; break;
    case "addition": primary = { kind: "addition", amount: 0 }; break;
    case "removal": primary = { kind: "removal", amount: 0 }; break;
    case "translation": primary = { kind: "translation", amount: 10 }; break;
    case "combined": primary = { kind: "rotation", amount: rot }; break;
    default: primary = { kind: "rotation", amount: rot };
  }

  if (numRules === 2 && pattern !== "combined") {
    const secondary: TransformationStep =
      primary.kind === "rotation"
        ? { kind: "scale", amount: scaleAmt }
        : { kind: "rotation", amount: Math.max(30, Math.round(rot / 2)) };
    return [primary, secondary];
  }
  return [primary];
}

function baseFigureFor(
  pattern: SeriesPatternType,
  shape: ShapeKind,
  fill: FillPattern,
): Figure {
  if (pattern === "addition" || pattern === "removal") {
    return createRowFigure(shape, 3, fill);
  }
  return createSimpleFigure(shape, fill);
}

/**
 * Mezcla un array in-place y devuelve el índice final del elemento previamente
 * en `keepIndex`.
 */
function shuffleKeepingTrack<T>(arr: T[], keepRef: T, rng: () => number): number {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.indexOf(keepRef);
}

/**
 * Genera un ítem completo de series gráficas: figuras visibles + opciones de
 * respuesta (una correcta, el resto distractores).
 */
export function generateSeriesItem(config: SeriesConfig): SeriesItem {
  const roundSteps = config.roundSteps ?? true;
  const numRules = config.numRules ?? 1;
  const numOptions = config.numOptions ?? 4;
  const fill = config.baseFill ?? "solid";

  const rng = mulberry32(
    seedFromString(
      `${config.pattern}-${config.baseShape}-${numRules}-${numOptions}`,
    ),
  );
  const steps = buildSteps(config.pattern, roundSteps, numRules, rng);
  const base = baseFigureFor(config.pattern, config.baseShape, fill);
  const shown = generateSequence(base, steps, config.numVisible);

  const correctNext = applyStep(
    shown[shown.length - 1],
    steps[(shown.length - 1) % steps.length],
  );

  const options: Figure[] = [correctNext];
  const distractorAmounts = [2, 1.5, 0.5, 3];
  for (let i = 0; i < numOptions - 1; i++) {
    const wrong = generateDistractor(
      shown[shown.length - 1],
      steps,
      1,
      distractorAmounts[i % distractorAmounts.length],
    );
    if (!figuresEqual(wrong, correctNext)) {
      options.push(wrong);
    } else {
      options.push(applyStep(shown[shown.length - 1], { kind: "rotation", amount: 179 }));
    }
  }

  const correctIndex = shuffleKeepingTrack(options, correctNext, rng);
  const distractors = options.map((_, i) => i).filter((i) => i !== correctIndex);

  return { shown, options, correctIndex, distractors, steps, config };
}

/** Comparación estructural ligera entre dos figuras (mismos elementos). */
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

/** Re-export de utilidad para clonar figuras desde el motor base. */
export function cloneFigure(f: Figure): Figure {
  return cloneFig(f);
}

/** Lista de tipos de patrón disponibles para el selector de la UI. */
export const PATTERN_TYPES: SeriesPatternType[] = [
  "rotation",
  "addition",
  "removal",
  "translation",
  "scale",
  "fill",
  "combined",
];