import type { Figure, ShapeKind, FillPattern } from "../figuras/types";
import { createSimpleFigure } from "../figuras/figuras";
import { rotate, cloneFig } from "../figuras/primitivas";
import type {
  MentalRotationConfig,
  MentalRotationItem,
  RotationDirection,
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

function normalizeAngle(deg: number): number {
  const n = ((deg % 360) + 360) % 360;
  return n;
}

/**
 * Convierte un ángulo objetivo en su equivalente en sentido antihorario
 * (siguiendo la simplificación que usa el banco: 210° horario = 150° antihorario).
 */
export function simplifyAngle(
  angle: number,
  direction: RotationDirection,
): { effective: number; effectiveDirection: RotationDirection } {
  const norm = normalizeAngle(angle);
  if (direction === "counterclockwise") {
    return { effective: norm, effectiveDirection: "counterclockwise" };
  }
  // horario: si >180°, equivalente antihorario es 360 - angle (más corto)
  if (norm > 180) {
    return { effective: 360 - norm, effectiveDirection: "counterclockwise" };
  }
  return { effective: norm, effectiveDirection: "clockwise" };
}

/**
 * Genera un ítem de rotación mental: dada una figura base + ángulo objetivo,
 * produce 4 (o N) opciones de respuesta, una con la rotación correcta y el
 * resto con rotaciones plausibles pero incorrectas.
 */
export function generateItem(config: MentalRotationConfig): MentalRotationItem {
  const numOptions = config.numOptions ?? 4;
  const fill: FillPattern = config.baseFill ?? "solid";
  const rng = mulberry32(
    config.seed ??
      seedFromString(`${config.baseShape}-${config.angleDegrees}-${config.direction}`),
  );

  const base = createSimpleFigure(config.baseShape, fill);
  const { effective } = simplifyAngle(config.angleDegrees, config.direction);
  const signedAngle =
    config.direction === "clockwise" ? effective : -effective;
  const correct = rotate(base, signedAngle);

  const options: Figure[] = [correct];
  const distractorAngles = pickDistractorAngles(effective, numOptions - 1, rng);

  for (const ang of distractorAngles) {
    // distraedores con dirección mezclada → plausibles pero incorrectos
    const useClockwise = rng() > 0.5;
    const signed = useClockwise ? ang : -ang;
    const opt = rotate(base, signed);
    if (!figuresEqual(opt, correct)) {
      options.push(opt);
    } else {
      options.push(rotate(base, signed + 5));
    }
  }

  const correctIndex = shuffleKeepingTrack(options, correct, rng);
  const distractors = options.map((_, i) => i).filter((i) => i !== correctIndex);

  return {
    base,
    angleDegrees: config.angleDegrees,
    direction: config.direction,
    options,
    correctIndex,
    distractors,
    config,
  };
}

/** Ángulos distractores plausibles: cercanos a la rotación correcta. */
function pickDistractorAngles(
  correctAngle: number,
  count: number,
  rng: () => number,
): number[] {
  const offsets = [-30, -15, 15, 30, 45, -45, 90, -90];
  const picks: number[] = [];
  const used = new Set<number>([correctAngle]);
  let attempts = 0;
  while (picks.length < count && attempts < count * 10) {
    attempts++;
    const off = offsets[Math.floor(rng() * offsets.length)];
    const candidate = normalizeAngle(correctAngle + off);
    if (!used.has(candidate)) {
      used.add(candidate);
      picks.push(candidate);
    }
  }
  while (picks.length < count) {
    const ang = normalizeAngle(Math.floor(rng() * 360));
    if (!used.has(ang)) {
      used.add(ang);
      picks.push(ang);
    }
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

/** Re-exporta utilidad de clonado. */
export function cloneFigure(f: Figure): Figure {
  return cloneFig(f);
}

/** Dificultad según ángulo: valores fuera del múltiplo de 90° suben la carga. */
export function estimateDifficulty(angle: number): "baja" | "media" | "alta" {
  const norm = normalizeAngle(angle);
  const isRoundMultiple = [0, 45, 90, 180, 270, 360].some((m) => Math.abs(norm - m) < 1);
  if (isRoundMultiple) return "baja";
  const isQuarter = [30, 60, 120, 150, 210, 240, 300, 330].some((m) =>
    Math.abs(norm - m) < 1,
  );
  if (isQuarter) return "media";
  return "alta";
}

/** Lista de direcciones para selectores de UI. */
export const DIRECTIONS: RotationDirection[] = ["clockwise", "counterclockwise"];