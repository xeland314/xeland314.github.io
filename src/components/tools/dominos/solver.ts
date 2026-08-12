export type Domino = [number, number];

export interface Prediction {
  nextDomino: Domino;
  formatted: string;
  strategyName: string;
  confidence: number;
}

export const mod7 = (n: number): number => ((n % 7) + 7) % 7;

const MAX_PIP = 6;

export function parseDominoes(input: string): Domino[] {
  const matches = [...input.matchAll(/d(\d)(\d)/g)];
  return matches
    .map((m) => [parseInt(m[1], 10), parseInt(m[2], 10)] as Domino)
    .filter(([a, b]) => a <= MAX_PIP && b <= MAX_PIP);
}

export function formatDomino(domino: Domino): string {
  return `d${domino[0]}${domino[1]}`;
}

export function checkHorizontalConstant(dominoes: Domino[]): Prediction | null {
  if (dominoes.length < 2) return null;

  const diffA = mod7(dominoes[1][0] - dominoes[0][0]);
  const diffB = mod7(dominoes[1][1] - dominoes[0][1]);

  for (let i = 1; i < dominoes.length - 1; i++) {
    if (mod7(dominoes[i + 1][0] - dominoes[i][0]) !== diffA) return null;
    if (mod7(dominoes[i + 1][1] - dominoes[i][1]) !== diffB) return null;
  }

  const last = dominoes[dominoes.length - 1];
  const next: Domino = [mod7(last[0] + diffA), mod7(last[1] + diffB)];

  return {
    nextDomino: next,
    formatted: formatDomino(next),
    strategyName: "Horizontal Constant Shift",
    confidence: 0.95,
  };
}

export function checkSnakePattern(dominoes: Domino[]): Prediction | null {
  if (dominoes.length < 2) return null;

  const flat = dominoes.flatMap((d) => [d[0], d[1]]);
  const step = mod7(flat[1] - flat[0]);

  for (let i = 1; i < flat.length - 1; i++) {
    if (mod7(flat[i + 1] - flat[i]) !== step) return null;
  }

  const lastVal = flat[flat.length - 1];
  const nextA = mod7(lastVal + step);
  const nextB = mod7(nextA + step);
  const next: Domino = [nextA, nextB];

  return {
    nextDomino: next,
    formatted: formatDomino(next),
    strategyName: "Snake / Zig-Zag Continuous",
    confidence: 0.9,
  };
}

export function checkAlternatingShift(dominoes: Domino[]): Prediction | null {
  const n = dominoes.length;
  if (n < 4) return null;

  const evenDeltaA = mod7(dominoes[1][0] - dominoes[0][0]);
  const oddDeltaA = mod7(dominoes[2][0] - dominoes[1][0]);
  const evenDeltaB = mod7(dominoes[1][1] - dominoes[0][1]);
  const oddDeltaB = mod7(dominoes[2][1] - dominoes[1][1]);

  if (evenDeltaA === oddDeltaA && evenDeltaB === oddDeltaB) return null;

  for (let k = 1; k < n - 1; k++) {
    const expA = k % 2 === 0 ? evenDeltaA : oddDeltaA;
    const expB = k % 2 === 0 ? evenDeltaB : oddDeltaB;
    if (mod7(dominoes[k + 1][0] - dominoes[k][0]) !== expA) return null;
    if (mod7(dominoes[k + 1][1] - dominoes[k][1]) !== expB) return null;
  }

  const last = dominoes[n - 1];
  const nextDeltaA = (n - 1) % 2 === 0 ? evenDeltaA : oddDeltaA;
  const nextDeltaB = (n - 1) % 2 === 0 ? evenDeltaB : oddDeltaB;
  const next: Domino = [mod7(last[0] + nextDeltaA), mod7(last[1] + nextDeltaB)];

  return {
    nextDomino: next,
    formatted: formatDomino(next),
    strategyName: "Alternating Shift",
    confidence: 0.88,
  };
}

export function checkFibonacciPattern(dominoes: Domino[]): Prediction | null {
  if (dominoes.length < 3) return null;

  for (let i = 2; i < dominoes.length; i++) {
    const expectedA = mod7(dominoes[i - 1][0] + dominoes[i - 2][0]);
    const expectedB = mod7(dominoes[i - 1][1] + dominoes[i - 2][1]);
    if (dominoes[i][0] !== expectedA || dominoes[i][1] !== expectedB) return null;
  }

  const len = dominoes.length;
  const nextA = mod7(dominoes[len - 1][0] + dominoes[len - 2][0]);
  const nextB = mod7(dominoes[len - 1][1] + dominoes[len - 2][1]);
  const next: Domino = [nextA, nextB];

  return {
    nextDomino: next,
    formatted: formatDomino(next),
    strategyName: "Additive / Fibonacci",
    confidence: 0.85,
  };
}

export function checkBlockRepeat(dominoes: Domino[]): Prediction | null {
  const n = dominoes.length;
  if (n < 4) return null;

  const maxPeriod = Math.floor(n / 2);

  for (let p = 1; p <= maxPeriod; p++) {
    let ok = true;
    for (let i = 0; i + p < n; i++) {
      if (dominoes[i][0] !== dominoes[i + p][0] || dominoes[i][1] !== dominoes[i + p][1]) {
        ok = false;
        break;
      }
    }
    if (ok) {
      const next = dominoes[n - p];
      return {
        nextDomino: next,
        formatted: formatDomino(next),
        strategyName: `Periodic Block (p=${p})`,
        confidence: 0.9,
      };
    }
  }

  return null;
}

const STRATEGIES = [
  checkHorizontalConstant,
  checkSnakePattern,
  checkAlternatingShift,
  checkFibonacciPattern,
  checkBlockRepeat,
];

export function solveDominoSequence(sequenceStr: string): Prediction | null {
  const dominoes = parseDominoes(sequenceStr);
  if (dominoes.length === 0) return null;

  for (const strategy of STRATEGIES) {
    const result = strategy(dominoes);
    if (result) return result;
  }

  return null;
}

export function listMatches(sequenceStr: string): Prediction[] {
  const dominoes = parseDominoes(sequenceStr);
  if (dominoes.length === 0) return [];

  const results: Prediction[] = [];
  for (const strategy of STRATEGIES) {
    const result = strategy(dominoes);
    if (result) results.push(result);
  }
  return results;
}
