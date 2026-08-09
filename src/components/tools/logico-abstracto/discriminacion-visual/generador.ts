import type {
  DiscriminationConfig,
  DiscriminationItem,
  AlphabetKind,
  DifferenceKind,
  DifferencePosition,
  LongStringStructure,
  DifficultyLabel,
} from "./types";
import { ALPHABETS, CONFUSABLE_PAIRS } from "./types";

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

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function resolvePosition(
  pos: DifferencePosition,
  length: number,
  rng: () => number,
): number {
  if (length === 0) return 0;
  switch (pos) {
    case "start": return 0;
    case "end": return length - 1;
    case "middle": return Math.floor(length / 2);
    case "random": return Math.floor(rng() * length);
  }
}

function randomChar(alphabet: string, rng: () => number, exclude?: string): string {
  let ch: string;
  do {
    ch = alphabet[Math.floor(rng() * alphabet.length)];
  } while (exclude !== undefined && ch === exclude);
  return ch;
}

/**
 * Genera una cadena aleatoria de `length` caracteres usando `alphabet`. Para
 * `structure="repeated-block"` repite un bloque base; con `*-separated`
 * inserta `separator` entre bloques.
 */
export function buildString(
  length: number,
  alphabet: string,
  rng: () => number,
  structure: LongStringStructure = "random",
  blockSize = 4,
  separator = "",
): string {
  if (length <= 0) return "";
  if (structure === "random") {
    let s = "";
    while (s.length < length) s += randomChar(alphabet, rng);
    return s.slice(0, length);
  }
  const blkSize = Math.max(2, blockSize);
  const block: string = Array.from({ length: blkSize }, () =>
    randomChar(alphabet, rng),
  ).join("");
  const sep = separator ?? "";
  let s = "";
  let blockIdx = 0;
  while (s.length < length) {
    s += block;
    if (structure === "repeated-block-separated" && blockIdx === 0) {
      // primer bloque sin separador, siguientes con separador
    }
    if (structure === "repeated-block-separated") {
      s += sep;
    }
    blockIdx++;
  }
  return s.slice(0, length).replace(new RegExp(`${escapeRegex(sep)}$`), "");
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Aplica una diferencia del tipo indicado a `cadena` en la posición `pos`.
 * Devuelve la nueva cadena y el índice de la diferencia.
 */
export function applyDifference(
  cadena: string,
  pos: number,
  type: DifferenceKind,
  alphabet: string,
  rng: () => number,
): { result: string; diffIndex: number } {
  const chars = [...cadena];
  if (chars.length === 0) return { result: cadena, diffIndex: -1 };
  const i = clamp(pos, 0, chars.length - 1);

  switch (type) {
    case "substitution": {
      const original = chars[i];
      const nuevo = randomChar(alphabet, rng, original);
      chars[i] = nuevo;
      return { result: chars.join(""), diffIndex: i };
    }
    case "insertion": {
      const nuevo = randomChar(alphabet, rng);
      chars.splice(i, 0, nuevo);
      return { result: chars.join(""), diffIndex: i };
    }
    case "deletion": {
      chars.splice(i, 1);
      return { result: chars.join(""), diffIndex: i };
    }
    case "swap-adjacent": {
      const j = Math.min(i + 1, chars.length - 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
      return { result: chars.join(""), diffIndex: i };
    }
    case "confusable": {
      const original = chars[i];
      const pair = findConfusable(original, rng);
      if (!pair) {
        chars[i] = randomChar(alphabet, rng, original);
        return { result: chars.join(""), diffIndex: i };
      }
      chars[i] = pair;
      return { result: chars.join(""), diffIndex: i };
    }
    default:
      return { result: cadena, diffIndex: -1 };
  }
}

/** Busca un carácter confusable del `original` en la tabla de pares. */
export function findConfusable(
  original: string,
  rng: () => number,
): string | null {
  const candidates = CONFUSABLE_PAIRS.filter(
    ([a, b]) => a === original || b === original,
  );
  if (candidates.length === 0) return null;
  const [a, b] = pick(candidates, rng);
  return a === original ? b : a;
}

/**
 * Genera un ítem de discriminación visual completo, según la configuración.
 * `numDifferences=0` produce un par idéntico (esIgual=true).
 */
export function generateItem(config: DiscriminationConfig): DiscriminationItem {
  const rng = mulberry32(config.seed ?? 1);
  const alphabet = ALPHABETS[config.alphabet];
  const structure = config.structure ?? "random";
  const blockSize = config.blockSize ?? 4;
  const separator = config.separator ?? (structure === "repeated-block-separated" ? "-" : "");

  const cadenaA = buildString(
    config.length,
    alphabet,
    rng,
    structure,
    blockSize,
    separator,
  );

  if (config.numDifferences === 0) {
    return {
      cadenaA,
      cadenaB: cadenaA,
      esIgual: true,
      posicionDiferencia: [],
      config,
    };
  }

  let cadenaB = cadenaA;
  const diffPositions: number[] = [];
  for (let n = 0; n < config.numDifferences; n++) {
    const pos = resolvePosition(config.position, cadenaB.length, rng);
    const { result, diffIndex } = applyDifference(
      cadenaB,
      pos,
      config.differenceType,
      alphabet,
      rng,
    );
    cadenaB = result;
    if (diffIndex >= 0) diffPositions.push(diffIndex);
  }

  return {
    cadenaA,
    cadenaB,
    esIgual: false,
    posicionDiferencia: diffPositions,
    config,
  };
}

/**
 * Etiqueta automáticamente la dificultad estimada de un ítem a partir de su
 * longitud y posición del error (subtema 5 — cadenas largas).
 */
export function estimateDifficulty(
  length: number,
  position: DifferencePosition,
): DifficultyLabel {
  const centerBias = position === "middle" ? 1 : 0;
  const score = length / 20 + centerBias;
  if (score < 1.5) return "baja";
  if (score < 3) return "media";
  return "alta";
}

/** Diferencias reales entre dos cadenas (para verificación / solucionario). */
export function findDifferences(a: string, b: string): number[] {
  const charsA = [...a];
  const charsB = [...b];
  const n = Math.min(charsA.length, charsB.length);
  const diffs: number[] = [];
  for (let i = 0; i < n; i++) {
    if (charsA[i] !== charsB[i]) diffs.push(i);
  }
  if (charsA.length !== charsB.length) {
    diffs.push(n);
  }
  return diffs;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Listas exportadas para selectores de UI. */
export const DIFFERENCE_KINDS: DifferenceKind[] = [
  "substitution",
  "insertion",
  "deletion",
  "swap-adjacent",
  "confusable",
];

export const ALPHABET_KINDS: AlphabetKind[] = [
  "letters",
  "letters-digits",
  "letters-special",
  "upper-lower",
];

export const STRUCTURES: LongStringStructure[] = [
  "random",
  "repeated-block",
  "repeated-block-separated",
];