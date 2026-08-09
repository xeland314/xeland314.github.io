import { generatePattern } from "../../dominos/pattern";
import { createTile } from "../../dominos/core";
import type { PipCount, DominoTile, PatternRule } from "../../dominos/types";
import type { DominoSequenceConfig, DominoSequenceItem } from "./types";

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

function seedFromRule(rule: PatternRule, seed?: number): number {
  const key = `${rule.type}-${JSON.stringify(rule)}-${seed ?? 0}`;
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Genera un ítem "Encontrar la ficha que continua la secuencia":
 *  - `length` es el nº de fichas VISUALMENTE mostradas (incluido el "?").
 *  - `hiddenIndex` (default = length-1) marca qué ficha se oculta.
 *  - La incógnita se rellena con el patrón (ground truth) y forma parte de las
 *    opciones; el resto son distractores plausibles (offsets ±1, ±2).
 */
export function generateItem(config: DominoSequenceConfig): DominoSequenceItem {
  const numOptions = config.numOptions ?? 4;
  const rng = mulberry32(seedFromRule(config.rule, config.seed));

  // Genera exactamente `length` fichas siguiendo el patrón; una será ocultada.
  const full = generatePattern({
    rule: config.rule,
    length: config.length,
    startTop: config.startTop,
    startBottom: config.startBottom,
  });

  const hiddenIndex = config.hiddenIndex ?? config.length - 1;
  const correctTile = full[hiddenIndex];
  if (!correctTile) throw new Error("hiddenIndex fuera de rango");

  // Secuencia visible: marca la incógnita con isHidden=true.
  const shown = full.map((t, i) => ({
    ...t,
    isHidden: i === hiddenIndex,
  }));

  // Opciones: una correcta + distractores.
  const options: DominoTile[] = [cloneTile(correctTile)];
  const seen = new Set<string>([tileKey(correctTile)]);
  const offsets: Array<[number, number]> = [
    [1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2],
    [1, 1], [-1, -1], [1, -1], [-1, 1],
  ];
  let attempts = 0;
  while (options.length < numOptions && attempts < 40) {
    attempts++;
    const [dt, db] = offsets[Math.floor(rng() * offsets.length)];
    const top = mod7((correctTile.top as number) + dt);
    const bottom = mod7((correctTile.bottom as number) + db);
    const key = `${top}|${bottom}`;
    if (seen.has(key)) continue;
    seen.add(key);
    options.push(createTile(top, bottom, "vertical", "medium"));
  }
  // Relleno con variaciones random si faltan
  while (options.length < numOptions) {
    const top = mod7(Math.floor(rng() * 7));
    const bottom = mod7(Math.floor(rng() * 7));
    const key = `${top}|${bottom}`;
    if (!seen.has(key)) {
      seen.add(key);
      options.push(createTile(top, bottom, "vertical", "medium"));
    }
  }

  const correctIndex = shuffleKeepingTrack(options, options[0], rng);
  const distractors = options.map((_, i) => i).filter((i) => i !== correctIndex);

  return {
    shown,
    options,
    correctIndex,
    distractors,
    rule: config.rule,
    hiddenIndex,
  };
}

function mod7(n: number): PipCount {
  return (((n % 7) + 7) % 7) as PipCount;
}

function tileKey(t: DominoTile): string {
  return `${t.top}|${t.bottom}`;
}

function cloneTile(t: DominoTile): DominoTile {
  return { ...t };
}

function shuffleKeepingTrack<T>(
  arr: T[],
  keepRef: T,
  rng: () => number,
): number {
  // Mantiene `keepRef` en `arr[0]` antes de mezclar para rastrearlo.
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.indexOf(keepRef);
}

/** Lista de reglas recomendadas para "Encontrar la ficha que continua". */
export const RECOMMENDED_RULES: PatternRule[] = [
  { type: "suma-constante", delta: 1 },
  { type: "fraccion", topDelta: 1, bottomDelta: -1 },
  { type: "series-alternadas", deltaA: 1, deltaB: 2 },
  { type: "encadenado-clasico" },
  { type: "progresion-geometrica", factor: 2 },
];